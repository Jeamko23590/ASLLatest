import express from 'express';
import bcrypt from 'bcrypt';
import db from '../db/connection.js';
import { ApiResponse, AdminDashboardStats, CreateTeacherRequest, UpdateTeacherRequest } from '../types/index.js';

const router = express.Router();

// Get admin dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const teachersResult = db.prepare('SELECT COUNT(*) as count FROM teachers').get() as { count: number };
    const classesResult = db.prepare('SELECT COUNT(*) as count FROM classes').get() as { count: number };
    const lessonsResult = db.prepare('SELECT COUNT(*) as count FROM lessons').get() as { count: number };
    const studentsResult = db.prepare('SELECT COUNT(*) as count FROM students').get() as { count: number };
    const schoolsResult = db.prepare('SELECT COUNT(*) as count FROM schools').get() as { count: number };

    const stats: AdminDashboardStats = {
      totalTeachers: teachersResult.count,
      totalClasses: classesResult.count,
      totalLessons: lessonsResult.count,
      totalStudents: studentsResult.count,
      totalSchools: schoolsResult.count
    };

    res.json({
      success: true,
      data: stats
    } as ApiResponse<AdminDashboardStats>);
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics'
    } as ApiResponse);
  }
});

// Get all teachers
router.get('/teachers', async (req, res) => {
  try {
    const teachers = db.prepare(`
      SELECT 
        t.id,
        t.first_name,
        t.last_name,
        t.middle_name,
        t.suffix,
        t.email,
        t.employee_id,
        t.gender,
        t.created_at
      FROM teachers t
      ORDER BY t.last_name, t.first_name
    `).all() as any[];

    const teachersWithClasses = teachers.map(teacher => {
      const classes = db.prepare('SELECT id FROM classes WHERE teacher_id = ?').all(teacher.id) as { id: string }[];
      return {
        ...teacher,
        class_ids: classes.map(c => c.id)
      };
    });

    res.json({
      success: true,
      data: teachersWithClasses
    } as ApiResponse);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch teachers'
    } as ApiResponse);
  }
});

// Create teacher
router.post('/teachers', async (req, res) => {
  try {
    const { firstName, lastName, middleName, suffix, email, employeeId, gender, classIds }: CreateTeacherRequest = req.body;

    if (!firstName || !lastName || !email || !employeeId || !gender) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      } as ApiResponse);
    }

    const existingTeacher = db.prepare('SELECT id FROM teachers WHERE email = ? OR employee_id = ?').get(email, employeeId);
    if (existingTeacher) {
      return res.status(400).json({
        success: false,
        error: 'Email or Employee ID already exists'
      } as ApiResponse);
    }

    const lastThreeChars = employeeId.slice(-3);
    const password = `${lastName.toLowerCase()}_${lastThreeChars}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    const teacherId = Math.random().toString(36).substring(2, 15);

    db.prepare(`
      INSERT INTO teachers (id, first_name, last_name, middle_name, suffix, email, employee_id, password, gender)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(teacherId, firstName, lastName, middleName || null, suffix || null, email, employeeId, hashedPassword, gender);

    const teacher = db.prepare(`
      SELECT id, first_name, last_name, middle_name, suffix, email, employee_id, gender, created_at
      FROM teachers WHERE id = ?
    `).get(teacherId);

    if (classIds && classIds.length > 0) {
      const updateClass = db.prepare('UPDATE classes SET teacher_id = ? WHERE id = ?');
      classIds.forEach(classId => updateClass.run(teacherId, classId));
    }

    res.status(201).json({
      success: true,
      data: { teacher, generatedPassword: password },
      message: 'Teacher created successfully'
    } as ApiResponse);
  } catch (error: any) {
    console.error('Error creating teacher:', error);
    res.status(500).json({ success: false, error: 'Failed to create teacher' } as ApiResponse);
  }
});


// Update teacher
router.put('/teachers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, middleName, suffix, email, employeeId, gender, classIds, resetPassword }: UpdateTeacherRequest = req.body;

    const existingTeacher = db.prepare('SELECT * FROM teachers WHERE id = ?').get(id);
    if (!existingTeacher) {
      return res.status(404).json({ success: false, error: 'Teacher not found' } as ApiResponse);
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (firstName) { updates.push('first_name = ?'); values.push(firstName); }
    if (lastName) { updates.push('last_name = ?'); values.push(lastName); }
    if (middleName !== undefined) { updates.push('middle_name = ?'); values.push(middleName || null); }
    if (suffix !== undefined) { updates.push('suffix = ?'); values.push(suffix || null); }
    if (email) { updates.push('email = ?'); values.push(email); }
    if (employeeId) { updates.push('employee_id = ?'); values.push(employeeId); }
    if (gender) { updates.push('gender = ?'); values.push(gender); }

    let newPassword = null;
    if (resetPassword && lastName && employeeId) {
      const lastThreeChars = employeeId.slice(-3);
      newPassword = `${lastName.toLowerCase()}_${lastThreeChars}`;
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updates.push('password = ?');
      values.push(hashedPassword);
    }

    if (updates.length > 0) {
      values.push(id);
      db.prepare(`UPDATE teachers SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }

    if (classIds !== undefined) {
      db.prepare('UPDATE classes SET teacher_id = NULL WHERE teacher_id = ?').run(id);
      if (classIds.length > 0) {
        const updateClass = db.prepare('UPDATE classes SET teacher_id = ? WHERE id = ?');
        classIds.forEach(classId => updateClass.run(id, classId));
      }
    }

    res.json({
      success: true,
      data: { ...(newPassword && { generatedPassword: newPassword }) },
      message: 'Teacher updated successfully'
    } as ApiResponse);
  } catch (error: any) {
    console.error('Error updating teacher:', error);
    res.status(500).json({ success: false, error: 'Failed to update teacher' } as ApiResponse);
  }
});

// Delete teacher
router.delete('/teachers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = db.prepare('SELECT id FROM teachers WHERE id = ?').get(id);
    if (!teacher) {
      return res.status(404).json({ success: false, error: 'Teacher not found' } as ApiResponse);
    }
    db.prepare('UPDATE classes SET teacher_id = NULL WHERE teacher_id = ?').run(id);
    db.prepare('DELETE FROM teachers WHERE id = ?').run(id);
    res.json({ success: true, message: 'Teacher deleted successfully' } as ApiResponse);
  } catch (error) {
    console.error('Error deleting teacher:', error);
    res.status(500).json({ success: false, error: 'Failed to delete teacher' } as ApiResponse);
  }
});

// Get all schools
router.get('/schools', async (req, res) => {
  try {
    const schools = db.prepare(`
      SELECT s.id, s.name, s.address, s.created_at, COUNT(c.id) as class_count
      FROM schools s LEFT JOIN classes c ON s.id = c.school_id
      GROUP BY s.id, s.name, s.address, s.created_at ORDER BY s.name
    `).all();
    res.json({ success: true, data: schools } as ApiResponse);
  } catch (error) {
    console.error('Error fetching schools:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch schools' } as ApiResponse);
  }
});

// Create school
router.post('/schools', async (req, res) => {
  try {
    const { name, address } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'School name is required' } as ApiResponse);
    }
    const schoolId = Math.random().toString(36).substring(2, 15);
    db.prepare('INSERT INTO schools (id, name, address) VALUES (?, ?, ?)').run(schoolId, name, address || null);
    const school = db.prepare('SELECT * FROM schools WHERE id = ?').get(schoolId);
    res.status(201).json({ success: true, data: school, message: 'School created successfully' } as ApiResponse);
  } catch (error) {
    console.error('Error creating school:', error);
    res.status(500).json({ success: false, error: 'Failed to create school' } as ApiResponse);
  }
});

// Update school
router.put('/schools/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address } = req.body;
    const existingSchool = db.prepare('SELECT * FROM schools WHERE id = ?').get(id);
    if (!existingSchool) {
      return res.status(404).json({ success: false, error: 'School not found' } as ApiResponse);
    }
    db.prepare('UPDATE schools SET name = COALESCE(?, name), address = COALESCE(?, address) WHERE id = ?').run(name, address, id);
    const school = db.prepare('SELECT * FROM schools WHERE id = ?').get(id);
    res.json({ success: true, data: school, message: 'School updated successfully' } as ApiResponse);
  } catch (error) {
    console.error('Error updating school:', error);
    res.status(500).json({ success: false, error: 'Failed to update school' } as ApiResponse);
  }
});

// Delete school
router.delete('/schools/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const classCheck = db.prepare('SELECT COUNT(*) as count FROM classes WHERE school_id = ?').get(id) as { count: number };
    if (classCheck.count > 0) {
      return res.status(400).json({ success: false, error: 'Cannot delete school with existing classes' } as ApiResponse);
    }
    const school = db.prepare('SELECT id FROM schools WHERE id = ?').get(id);
    if (!school) {
      return res.status(404).json({ success: false, error: 'School not found' } as ApiResponse);
    }
    db.prepare('DELETE FROM schools WHERE id = ?').run(id);
    res.json({ success: true, message: 'School deleted successfully' } as ApiResponse);
  } catch (error) {
    console.error('Error deleting school:', error);
    res.status(500).json({ success: false, error: 'Failed to delete school' } as ApiResponse);
  }
});

// Get all classes
router.get('/classes', async (req, res) => {
  try {
    const classes = db.prepare(`
      SELECT c.id, c.school_id, s.name as school_name, c.grade, c.section, c.teacher_id,
        (t.first_name || ' ' || t.last_name) as teacher_name, COUNT(st.id) as student_count, c.created_at
      FROM classes c
      JOIN schools s ON c.school_id = s.id
      LEFT JOIN teachers t ON c.teacher_id = t.id
      LEFT JOIN students st ON c.id = st.class_id
      GROUP BY c.id, s.name, t.first_name, t.last_name, c.school_id, c.grade, c.section, c.teacher_id, c.created_at
      ORDER BY s.name, c.grade, c.section
    `).all();
    res.json({ success: true, data: classes } as ApiResponse);
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch classes' } as ApiResponse);
  }
});

// Get admin chart data
router.get('/charts', async (req, res) => {
  try {
    // Platform usage - last 7 days
    const platformUsage = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = days[date.getDay()];

      const sessionsResult = db.prepare(`
        SELECT COUNT(*) as count FROM engagement_logs WHERE session_date = ?
      `).get(dateStr) as { count: number };

      const usersResult = db.prepare(`
        SELECT COUNT(DISTINCT student_id) as count FROM engagement_logs WHERE session_date = ?
      `).get(dateStr) as { count: number };

      platformUsage.push({
        name: dayName,
        sessions: sessionsResult?.count || 0,
        users: usersResult?.count || 0
      });
    }

    // Student distribution by school
    const schoolDistribution = db.prepare(`
      SELECT s.name, COUNT(st.id) as students
      FROM schools s
      LEFT JOIN classes c ON s.id = c.school_id
      LEFT JOIN students st ON c.id = st.class_id
      GROUP BY s.id, s.name
      ORDER BY students DESC
    `).all() as { name: string; students: number }[];

    const colors = ['#8B6F47', '#FEDA5E', '#D4A017', '#22c55e', '#3b82f6'];
    const schoolDistributionWithColors = schoolDistribution.map((s: { name: string; students: number }, i: number) => ({
      name: s.name,
      students: s.students,
      color: colors[i % colors.length]
    }));

    // System health metrics
    const totalStudents = (db.prepare('SELECT COUNT(*) as count FROM students').get() as { count: number }).count;
    const activeStudents = (db.prepare(`
      SELECT COUNT(DISTINCT student_id) as count FROM engagement_logs 
      WHERE session_date >= date('now', '-7 days')
    `).get() as { count: number }).count;

    const totalProgress = (db.prepare('SELECT COUNT(*) as count FROM student_progress WHERE completed = 1').get() as { count: number }).count;
    const totalPossible = (db.prepare(`
      SELECT COUNT(*) * (SELECT COUNT(*) FROM subtopics) as count FROM students
    `).get() as { count: number }).count;
    const completionRate = totalPossible > 0 ? Math.round((totalProgress / totalPossible) * 100) : 0;

    const avgScoreResult = db.prepare(`
      SELECT AVG((score * 1.0 / max_score) * 100) as avg FROM assessment_scores
    `).get() as { avg: number };
    const avgScore = Math.round(avgScoreResult?.avg || 0);

    const teacherCount = (db.prepare('SELECT COUNT(*) as count FROM teachers').get() as { count: number }).count;
    const teachersWithClasses = (db.prepare('SELECT COUNT(DISTINCT teacher_id) as count FROM classes WHERE teacher_id IS NOT NULL').get() as { count: number }).count;
    const teacherEngagement = teacherCount > 0 ? Math.round((teachersWithClasses / teacherCount) * 100) : 0;

    const systemHealth = [
      { metric: 'Active Users', value: totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0, color: '#22c55e' },
      { metric: 'Lesson Completion', value: completionRate, color: '#FEDA5E' },
      { metric: 'Assessment Pass Rate', value: avgScore, color: '#8B6F47' },
      { metric: 'Teacher Engagement', value: teacherEngagement, color: '#D4A017' }
    ];

    // Recent system activity
    const recentActivity = [];
    
    // Get recent assessment completions
    const recentAssessments = db.prepare(`
      SELECT c.grade, c.section, l.title as lesson_title, MAX(asc.completed_at) as time
      FROM assessment_scores asc
      JOIN students s ON asc.student_id = s.id
      JOIN classes c ON s.class_id = c.id
      JOIN assessments a ON asc.assessment_id = a.id
      JOIN lessons l ON a.lesson_id = l.id
      GROUP BY c.id, l.id
      ORDER BY time DESC
      LIMIT 1
    `).get() as any;

    if (recentAssessments) {
      recentActivity.push({
        type: 'success',
        title: 'Bulk assessment completion',
        description: `${recentAssessments.grade} ${recentAssessments.section} completed ${recentAssessments.lesson_title} assessment`,
        time: getTimeAgo(recentAssessments.time)
      });
    }

    // Get recent class creation
    const recentClass = db.prepare(`
      SELECT c.grade, c.section, s.name as school_name, c.created_at
      FROM classes c
      JOIN schools s ON c.school_id = s.id
      ORDER BY c.created_at DESC
      LIMIT 1
    `).get() as any;

    if (recentClass) {
      recentActivity.push({
        type: 'info',
        title: 'New class created',
        description: `${recentClass.grade} ${recentClass.section} added to ${recentClass.school_name}`,
        time: getTimeAgo(recentClass.created_at)
      });
    }

    // Add system maintenance notice
    recentActivity.push({
      type: 'warning',
      title: 'System maintenance scheduled',
      description: 'Weekly backup and optimization at 2:00 AM',
      time: '5 hours ago'
    });

    res.json({
      success: true,
      data: {
        platformUsage,
        schoolDistribution: schoolDistributionWithColors,
        systemHealth,
        recentActivity
      }
    } as ApiResponse);
  } catch (error) {
    console.error('Error fetching admin chart data:', error);
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

export default router;
