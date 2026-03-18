import express from 'express';
import db from '../db/connection.js';
import { ApiResponse, TeacherDashboardStats } from '../types/index.js';

const router = express.Router();

// Get teacher dashboard stats
router.get('/:teacherId/dashboard', async (req, res) => {
  try {
    const { teacherId } = req.params;

    // Get all students under this teacher's classes
    const students = db.prepare(`
      SELECT DISTINCT s.id, s.name, s.gender
      FROM students s
      JOIN classes c ON s.class_id = c.id
      WHERE c.teacher_id = ?
    `).all(teacherId);

    const studentIds = students.map(s => s.id);
    const totalStudents = studentIds.length;

    if (totalStudents === 0) {
      return res.json({
        success: true,
        data: {
          totalStudents: 0,
          activeStudents: 0,
          lessonsCompleted: 0,
          averageProgress: 0,
          assessmentsCompleted: 0,
          avgStudyTime: 0,
          activeToday: 0,
          avgAssessmentScore: 0
        }
      } as ApiResponse<TeacherDashboardStats>);
    }

    // Get total lessons
    const totalLessonsResult = db.prepare('SELECT COUNT(*) as count FROM lessons').get() as { count: number };
    const totalLessons = totalLessonsResult?.count || 0;

    // Get completed lessons count per student (using IN clause for SQLite)
    const placeholders = studentIds.map(() => '?').join(',');
    
    // Count how many students completed each lesson fully
    const completedLessonsResult = db.prepare(`
      SELECT COUNT(*) as count
      FROM (
        SELECT sp.student_id, sp.lesson_id
        FROM student_progress sp
        JOIN subtopics st ON sp.subtopic_id = st.id
        WHERE sp.student_id IN (${placeholders}) AND sp.completed = 1
        GROUP BY sp.student_id, sp.lesson_id
        HAVING COUNT(*) = (
          SELECT COUNT(*) FROM subtopics WHERE lesson_id = sp.lesson_id
        )
      )
    `).get(...studentIds) as { count: number };
    const lessonsCompleted = completedLessonsResult?.count || 0;

    // Get assessments completed
    const assessmentsResult = db.prepare(`
      SELECT COUNT(*) as count
      FROM assessment_scores
      WHERE student_id IN (${placeholders})
    `).get(...studentIds) as { count: number };
    const assessmentsCompleted = assessmentsResult?.count || 0;

    // Get average assessment score
    const avgScoreResult = db.prepare(`
      SELECT AVG((score * 1.0 / max_score) * 100) as avg_score
      FROM assessment_scores
      WHERE student_id IN (${placeholders})
    `).get(...studentIds) as { avg_score: number | null };
    const avgAssessmentScore = Math.round(avgScoreResult?.avg_score || 0);

    // Get active students today
    const today = new Date().toISOString().split('T')[0];
    const activeTodayResult = db.prepare(`
      SELECT COUNT(DISTINCT student_id) as count
      FROM engagement_logs
      WHERE student_id IN (${placeholders}) AND session_date = ?
    `).get(...studentIds, today) as { count: number };
    const activeToday = activeTodayResult?.count || 0;

    // Get average study time
    const avgTimeResult = db.prepare(`
      SELECT AVG(session_duration) as avg_time
      FROM engagement_logs
      WHERE student_id IN (${placeholders})
    `).get(...studentIds) as { avg_time: number | null };
    const avgStudyTime = Math.round(avgTimeResult?.avg_time || 0);

    // Calculate average progress
    const averageProgress = totalLessons > 0 
      ? Math.round((lessonsCompleted / (totalLessons * totalStudents)) * 100)
      : 0;

    const stats: TeacherDashboardStats = {
      totalStudents,
      activeStudents: totalStudents, // Simplified - all enrolled students
      lessonsCompleted,
      averageProgress,
      assessmentsCompleted,
      avgStudyTime,
      activeToday,
      avgAssessmentScore
    };

    res.json({
      success: true,
      data: stats
    } as ApiResponse<TeacherDashboardStats>);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics'
    } as ApiResponse);
  }
});

// Get students under teacher with progress
router.get('/:teacherId/students', async (req, res) => {
  try {
    const { teacherId } = req.params;

    const students = db.prepare(`
      SELECT 
        s.id,
        s.name,
        s.gender,
        c.grade,
        c.section,
        s.enrollment_date,
        (SELECT COUNT(*) FROM lessons) as total_lessons,
        COALESCE(AVG((asc.score * 1.0 / asc.max_score) * 100), 0) as avg_score
      FROM students s
      JOIN classes c ON s.class_id = c.id
      LEFT JOIN assessment_scores asc ON s.id = asc.student_id
      WHERE c.teacher_id = ?
      GROUP BY s.id, s.name, s.gender, c.grade, c.section, s.enrollment_date
      ORDER BY s.name
    `).all(teacherId);

    const studentsData = students.map(row => {
      // Count completed lessons (where ALL subtopics are done)
      // First, get all lessons with their subtopic counts
      const completedLessonsResult = db.prepare(`
        SELECT COUNT(*) as count
        FROM (
          SELECT sp.lesson_id
          FROM student_progress sp
          WHERE sp.student_id = ? AND sp.completed = 1
          GROUP BY sp.lesson_id
          HAVING COUNT(DISTINCT sp.subtopic_id) = (
            SELECT COUNT(*) FROM subtopics WHERE lesson_id = sp.lesson_id
          )
        )
      `).get(row.id) as { count: number } | undefined;
      
      const completedLessons = completedLessonsResult?.count || 0;
      
      const completionRate = (row.total_lessons as number) > 0 
        ? Math.round((completedLessons / (row.total_lessons as number)) * 100)
        : 0;
      
      console.log(`Student ${row.name}: ${completedLessons}/${row.total_lessons} lessons = ${completionRate}%`);
      
      return {
        id: row.id,
        name: row.name,
        gender: row.gender,
        grade: row.grade,
        section: row.section,
        enrollmentDate: row.enrollment_date,
        completedLessons: completedLessons,
        totalLessons: row.total_lessons as number,
        completionRate: completionRate,
        avgScore: Math.round(row.avg_score as number)
      };
    });

    res.json({
      success: true,
      data: studentsData
    } as ApiResponse);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch students'
    } as ApiResponse);
  }
});

// Get student detailed progress
router.get('/:teacherId/students/:studentId/progress', async (req, res) => {
  try {
    const { studentId } = req.params;

    // Get lesson progress
    const lessonProgress = db.prepare(`
      SELECT 
        l.id as lesson_id,
        l.title as lesson_title,
        l.has_assessment,
        COUNT(st.id) as total_subtopics,
        COUNT(CASE WHEN sp.completed = 1 THEN 1 END) as completed_subtopics
      FROM lessons l
      LEFT JOIN subtopics st ON l.id = st.lesson_id
      LEFT JOIN student_progress sp ON st.id = sp.subtopic_id AND sp.student_id = ?
      GROUP BY l.id, l.title, l.has_assessment, l.order_num
      ORDER BY l.order_num
    `).all(studentId);

    // Get assessment scores
    const assessmentScores = db.prepare(`
      SELECT 
        a.id as assessment_id,
        a.title as assessment_title,
        l.title as lesson_title,
        asc.score,
        asc.max_score,
        asc.completed_at
      FROM assessment_scores asc
      JOIN assessments a ON asc.assessment_id = a.id
      JOIN lessons l ON a.lesson_id = l.id
      WHERE asc.student_id = ?
      ORDER BY asc.completed_at DESC
    `).all(studentId);

    const lessonProgressData = lessonProgress.map(row => ({
      lessonId: row.lesson_id,
      lessonTitle: row.lesson_title,
      hasAssessment: row.has_assessment,
      totalSubtopics: row.total_subtopics,
      completedSubtopics: row.completed_subtopics,
      percentage: row.total_subtopics > 0 
        ? Math.round((row.completed_subtopics / row.total_subtopics) * 100)
        : 0,
      isCompleted: row.completed_subtopics === row.total_subtopics
    }));

    const assessments = assessmentScores.map(row => ({
      assessmentId: row.assessment_id,
      assessmentTitle: row.assessment_title,
      lessonTitle: row.lesson_title,
      score: row.score,
      maxScore: row.max_score,
      percentage: Math.round((row.score / row.max_score) * 100),
      completedAt: row.completed_at
    }));

    res.json({
      success: true,
      data: {
        lessonProgress: lessonProgressData,
        assessments
      }
    } as ApiResponse);
  } catch (error) {
    console.error('Error fetching student progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch student progress'
    } as ApiResponse);
  }
});

// Get lessons with completion stats for teacher's students
router.get('/:teacherId/lessons', async (req, res) => {
  try {
    const { teacherId } = req.params;

    // Get teacher's students first
    const students = db.prepare(`
      SELECT DISTINCT s.id
      FROM students s
      JOIN classes c ON s.class_id = c.id
      WHERE c.teacher_id = ?
    `).all(teacherId);

    const studentIds = students.map(s => s.id);
    const totalStudents = studentIds.length;

    // Get lessons with stats
    const lessons = db.prepare(`
      SELECT 
        l.id,
        l.title,
        l.description,
        l.category,
        l.has_assessment,
        l.order_num
      FROM lessons l
      ORDER BY l.order_num
    `).all();

    const lessonsData = lessons.map(lesson => {
      let completedBy = 0;
      let inProgressBy = 0;

      if (studentIds.length > 0) {
        const placeholders = studentIds.map(() => '?').join(',');
        
        // Count students who completed all subtopics for this lesson
        const completedResult = db.prepare(`
          SELECT COUNT(DISTINCT sp.student_id) as count
          FROM student_progress sp
          JOIN subtopics st ON sp.subtopic_id = st.id
          WHERE st.lesson_id = ? AND sp.student_id IN (${placeholders}) AND sp.completed = 1
          AND sp.student_id IN (
            SELECT sp2.student_id
            FROM student_progress sp2
            JOIN subtopics st2 ON sp2.subtopic_id = st2.id
            WHERE st2.lesson_id = ? AND sp2.completed = 1
            GROUP BY sp2.student_id
            HAVING COUNT(*) = (SELECT COUNT(*) FROM subtopics WHERE lesson_id = ?)
          )
        `).get(lesson.id, ...studentIds, lesson.id, lesson.id) as { count: number } | undefined;
        
        completedBy = completedResult?.count || 0;

        // Count students who have any progress on this lesson
        const inProgressResult = db.prepare(`
          SELECT COUNT(DISTINCT sp.student_id) as count
          FROM student_progress sp
          JOIN subtopics st ON sp.subtopic_id = st.id
          WHERE st.lesson_id = ? AND sp.student_id IN (${placeholders})
        `).get(lesson.id, ...studentIds) as { count: number } | undefined;
        
        inProgressBy = inProgressResult?.count || 0;
      }

      return {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        category: lesson.category,
        hasAssessment: lesson.has_assessment,
        totalStudents,
        completedBy,
        inProgressBy
      };
    });

    res.json({
      success: true,
      data: lessonsData
    } as ApiResponse);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch lessons'
    } as ApiResponse);
  }
});

// Get recent activity for teacher's students
router.get('/:teacherId/activity', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;

    const activity = db.prepare(`
      SELECT 
        s.name as student_name,
        el.activity_type,
        el.session_date,
        el.session_duration,
        el.lessons_accessed,
        el.created_at
      FROM engagement_logs el
      JOIN students s ON el.student_id = s.id
      JOIN classes c ON s.class_id = c.id
      WHERE c.teacher_id = ?
      ORDER BY el.created_at DESC
      LIMIT ?
    `).all(teacherId, limit);

    res.json({
      success: true,
      data: activity
    } as ApiResponse);
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch activity'
    } as ApiResponse);
  }
});

// Get chart data for teacher dashboard
router.get('/:teacherId/charts', async (req, res) => {
  try {
    const { teacherId } = req.params;

    // Get all students under this teacher
    const students = db.prepare(`
      SELECT DISTINCT s.id, s.name
      FROM students s
      JOIN classes c ON s.class_id = c.id
      WHERE c.teacher_id = ?
    `).all(teacherId);

    const studentIds = students.map((s: any) => s.id);

    if (studentIds.length === 0) {
      return res.json({
        success: true,
        data: {
          activityTrend: [],
          lessonEngagement: [],
          performanceDistribution: [],
          recentActivity: []
        }
      } as ApiResponse);
    }

    const placeholders = studentIds.map(() => '?').join(',');

    // 7-day activity trend
    const activityTrend = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = days[date.getDay()];

      const completedResult = db.prepare(`
        SELECT COUNT(*) as count FROM student_progress
        WHERE student_id IN (${placeholders}) AND completed = 1 AND date(completed_at) = ?
      `).get(...studentIds, dateStr) as { count: number };

      const assessedResult = db.prepare(`
        SELECT COUNT(*) as count FROM assessment_scores
        WHERE student_id IN (${placeholders}) AND date(completed_at) = ?
      `).get(...studentIds, dateStr) as { count: number };

      activityTrend.push({
        day: dayName,
        completed: completedResult?.count || 0,
        assessed: assessedResult?.count || 0
      });
    }

    // Lesson engagement by category
    const categories = db.prepare('SELECT DISTINCT category FROM lessons').all() as { category: string }[];
    const lessonEngagement = categories.map((cat: { category: string }) => {
      const lessonsInCategory = db.prepare('SELECT id FROM lessons WHERE category = ?').all(cat.category) as { id: string }[];
      const lessonIds = lessonsInCategory.map((l: { id: string }) => l.id);
      
      if (lessonIds.length === 0) {
        return { category: cat.category, engaged: 0, completed: 0 };
      }

      const lessonPlaceholders = lessonIds.map(() => '?').join(',');
      
      const engagedResult = db.prepare(`
        SELECT COUNT(DISTINCT student_id) as count FROM student_progress
        WHERE student_id IN (${placeholders}) AND lesson_id IN (${lessonPlaceholders})
      `).get(...studentIds, ...lessonIds) as { count: number };

      const completedResult = db.prepare(`
        SELECT COUNT(DISTINCT student_id) as count FROM student_progress
        WHERE student_id IN (${placeholders}) AND lesson_id IN (${lessonPlaceholders}) AND completed = 1
      `).get(...studentIds, ...lessonIds) as { count: number };

      return {
        category: cat.category,
        engaged: engagedResult?.count || 0,
        completed: completedResult?.count || 0
      };
    });

    // Performance distribution based on assessment scores
    const allScores = db.prepare(`
      SELECT student_id, AVG((score * 1.0 / max_score) * 100) as avg_score
      FROM assessment_scores
      WHERE student_id IN (${placeholders})
      GROUP BY student_id
    `).all(...studentIds) as { student_id: string; avg_score: number }[];

    let excellent = 0, good = 0, fair = 0, needsSupport = 0;
    allScores.forEach((s: { avg_score: number }) => {
      if (s.avg_score >= 90) excellent++;
      else if (s.avg_score >= 75) good++;
      else if (s.avg_score >= 60) fair++;
      else needsSupport++;
    });

    // Students without scores count as "needs support"
    const studentsWithoutScores = studentIds.length - allScores.length;
    needsSupport += studentsWithoutScores;

    const performanceDistribution = [
      { name: 'Excellent', value: excellent, color: '#22c55e', range: '90-100%' },
      { name: 'Good', value: good, color: '#FEDA5E', range: '75-89%' },
      { name: 'Fair', value: fair, color: '#fb923c', range: '60-74%' },
      { name: 'Needs Support', value: needsSupport, color: '#ef4444', range: '<60%' }
    ];

    // Recent activity
    const recentActivityRaw = db.prepare(`
      SELECT 
        s.name as student_name,
        'Completed lesson progress' as action,
        sp.completed_at as time,
        'success' as type
      FROM student_progress sp
      JOIN students s ON sp.student_id = s.id
      JOIN classes c ON s.class_id = c.id
      WHERE c.teacher_id = ? AND sp.completed = 1 AND sp.completed_at IS NOT NULL
      ORDER BY sp.completed_at DESC
      LIMIT 5
    `).all(teacherId);

    const recentActivity = recentActivityRaw.map((a: any) => {
      const timeAgo = getTimeAgo(a.time);
      return {
        student: a.student_name,
        action: a.action,
        time: timeAgo,
        type: a.type
      };
    });

    res.json({
      success: true,
      data: {
        activityTrend,
        lessonEngagement,
        performanceDistribution,
        recentActivity
      }
    } as ApiResponse);
  } catch (error) {
    console.error('Error fetching chart data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chart data'
    } as ApiResponse);
  }
});

// Helper function to get time ago string
function getTimeAgo(dateStr: string): string {
  if (!dateStr) return 'Unknown';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

// Get all progress for teacher's students
router.get('/:teacherId/progress/all', async (req, res) => {
  try {
    const { teacherId } = req.params;

    const progress = db.prepare(`
      SELECT 
        sp.student_id,
        sp.lesson_id,
        sp.subtopic_id,
        sp.completed,
        sp.completed_at
      FROM student_progress sp
      JOIN students s ON sp.student_id = s.id
      JOIN classes c ON s.class_id = c.id
      WHERE c.teacher_id = ?
    `).all(teacherId);

    res.json({
      success: true,
      data: progress
    } as ApiResponse);
  } catch (error) {
    console.error('Error fetching all progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch progress'
    } as ApiResponse);
  }
});

// Get all assessment scores for teacher's students
router.get('/:teacherId/assessments/scores', async (req, res) => {
  try {
    const { teacherId } = req.params;

    const scores = db.prepare(`
      SELECT 
        asc.student_id,
        asc.assessment_id,
        asc.score,
        asc.max_score,
        asc.completed_at
      FROM assessment_scores asc
      JOIN students s ON asc.student_id = s.id
      JOIN classes c ON s.class_id = c.id
      WHERE c.teacher_id = ?
      ORDER BY asc.completed_at DESC
    `).all(teacherId);

    res.json({
      success: true,
      data: scores
    } as ApiResponse);
  } catch (error) {
    console.error('Error fetching assessment scores:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assessment scores'
    } as ApiResponse);
  }
});

export default router;
