import { useState, useMemo, useEffect } from 'react';
import { Student, Lesson, StudentProgress, AssessmentScore, EngagementLog, ReportData, Assessment } from './types';
import apiService from '@/app/services/apiService';

export function useStudents(teacherId?: string) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (teacherId) {
      setLoading(true);
      apiService.getTeacherStudents(teacherId)
        .then(response => {
          if (response.success && response.data && Array.isArray(response.data)) {
            // Transform API data to match frontend format
          const transformedStudents = (response.data as any[]).map((s: any) => ({
              id: s.id,
              name: s.name,
              grade: s.grade,
              section: s.section,
              gender: s.gender,
              enrollmentDate: s.enrollmentDate,
              teacherId: teacherId,
              completedLessons: s.completedLessons || 0,
              totalLessons: s.totalLessons || 0,
              avgScore: s.avgScore || 0,
            }));
            setStudents(transformedStudents);
            console.log('✅ Loaded students from API:', transformedStudents.length);
          }
        })
        .catch(err => {
          console.warn('⚠️ Failed to load students:', err);
        })
        .finally(() => setLoading(false));
    }
  }, [teacherId]);

  const filteredStudents = useMemo(() => {
    if (teacherId) {
      return students.filter((s) => s.teacherId === teacherId);
    }
    return students;
  }, [students, teacherId]);

  return { students: filteredStudents, loading };
}

export function useLessons() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiService.getLessons()
      .then(response => {
        if (response.success && response.data && Array.isArray(response.data)) {
          // Transform API data to match frontend format
          const transformedLessons = (response.data as any[]).map((l: any) => ({
            id: l.id,
            title: l.title,
            description: l.description,
            category: l.category,
            order: l.order_num,
            hasAssessment: l.has_assessment === 1 || l.has_assessment === true,
            subtopics: l.subtopics || [],
          }));
          setLessons(transformedLessons);
          console.log('✅ Loaded lessons from API:', transformedLessons.length);
        }
      })
      .catch(err => {
        console.warn('⚠️ Failed to load lessons:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  return { lessons, loading };
}

export function useProgress(teacherId?: string) {
  const [progress, setProgress] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (teacherId) {
      setLoading(true);
      apiService.getTeacherProgress(teacherId)
        .then(response => {
          if (response.success && response.data && Array.isArray(response.data)) {
            setProgress(response.data as StudentProgress[]);
            console.log('✅ Loaded progress from API:', response.data.length);
          }
        })
        .catch(err => {
          console.warn('⚠️ Failed to load progress:', err);
        })
        .finally(() => setLoading(false));
    }
  }, [teacherId]);

  return { progress, loading };
}

export function useAssessmentScores(teacherId?: string) {
  const [scores, setScores] = useState<AssessmentScore[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (teacherId) {
      setLoading(true);
      apiService.getTeacherAssessmentScores(teacherId)
        .then(response => {
          if (response.success && response.data && Array.isArray(response.data)) {
            // Transform API data to match frontend format
            const transformedScores = response.data.map((s: any) => ({
              id: `score-${s.student_id}-${s.assessment_id}`,
              studentId: s.student_id,
              assessmentId: s.assessment_id,
              score: s.score,
              maxScore: s.max_score,
              completedAt: s.completed_at,
            }));
            setScores(transformedScores);
            console.log('✅ Loaded assessment scores from API:', transformedScores.length);
          }
        })
        .catch(err => {
          console.warn('⚠️ Failed to load assessment scores:', err);
        })
        .finally(() => setLoading(false));
    }
  }, [teacherId]);

  return { scores, loading };
}

export function useAssessments() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiService.getAllAssessments()
      .then(response => {
        if (response.success && response.data && Array.isArray(response.data)) {
          // Transform API data to match frontend format
          const transformedAssessments = response.data.map((a: any) => ({
            id: a.id,
            lessonId: a.lesson_id,
            title: a.title,
            maxScore: a.max_score,
          }));
          setAssessments(transformedAssessments);
          console.log('✅ Loaded assessments from API:', transformedAssessments.length);
        }
      })
      .catch(err => {
        console.warn('⚠️ Failed to load assessments:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  return { assessments, loading };
}

export function useEngagementLogs() {
  const [logs] = useState<EngagementLog[]>([]);
  return { logs };
}

// Calculate completion rate for a student and lesson
export function useStudentLessonCompletion(studentId: string, lessonId: string) {
  const { progress } = useProgress();
  const { lessons } = useLessons();

  const completion = useMemo(() => {
    const lesson = lessons.find((l) => l.id === lessonId);
    if (!lesson) return 0;

    const totalSubtopics = lesson.subtopics.length;
    const completedSubtopics = progress.filter(
      (p) => p.studentId === studentId && p.lessonId === lessonId && p.completed
    ).length;

    return totalSubtopics > 0 ? (completedSubtopics / totalSubtopics) * 100 : 0;
  }, [studentId, lessonId, progress, lessons]);

  return completion;
}

// Get report data for all students
export function useReportData(teacherId?: string): ReportData[] {
  const { students } = useStudents(teacherId);
  const { lessons } = useLessons();
  const { progress } = useProgress(teacherId);
  const { scores } = useAssessmentScores(teacherId);
  const { assessments } = useAssessments();
  const { logs } = useEngagementLogs();

  const reportData = useMemo(() => {
    const data: ReportData[] = [];

    students.forEach((student) => {
      lessons.forEach((lesson) => {
        const totalSubtopics = lesson.subtopics.length;
        const completedSubtopics = progress.filter(
          (p) => p.studentId === student.id && p.lessonId === lesson.id && p.completed
        ).length;
        const completionRate = totalSubtopics > 0 ? (completedSubtopics / totalSubtopics) * 100 : 0;

        // Get assessment score if available
        const assessment = assessments.find((a) => a.lessonId === lesson.id);
        const assessmentScore = assessment
          ? scores.find((s) => s.studentId === student.id && s.assessmentId === assessment.id)
          : null;

        // Calculate last accessed date
        const studentProgress = progress.filter(
          (p) => p.studentId === student.id && p.lessonId === lesson.id && p.completed
        );
        const lastAccessed =
          studentProgress.length > 0
            ? studentProgress.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0]
                .completedAt
            : 'Never';

        // Calculate engagement score (based on session duration and frequency)
        const studentLogs = logs.filter((log) => log.studentId === student.id);
        const avgSessionDuration = studentLogs.length > 0
          ? studentLogs.reduce((sum, log) => sum + log.sessionDuration, 0) / studentLogs.length
          : 0;
        const engagementScore = Math.min(100, Math.round((avgSessionDuration / 45) * 100));

        data.push({
          studentName: student.name,
          lessonTitle: lesson.title,
          completionRate,
          assessmentScore: assessmentScore
            ? Math.round((assessmentScore.score / assessmentScore.maxScore) * 100)
            : null,
          lastAccessed,
          engagementScore,
        });
      });
    });

    return data;
  }, [students, lessons, progress, scores, logs, assessments]);

  return reportData;
}

// Get dashboard statistics
export function useDashboardStats(teacherId?: string) {
  const { students } = useStudents(teacherId);
  const { lessons } = useLessons();
  const { progress } = useProgress(teacherId);
  const { scores } = useAssessmentScores(teacherId);
  const { logs } = useEngagementLogs();
  const [apiStats, setApiStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Try to fetch real stats from API
  useEffect(() => {
    if (teacherId) {
      setLoading(true);
      apiService.getTeacherDashboard(teacherId)
        .then(response => {
          if (response.success && response.data) {
            setApiStats(response.data);
            console.log('✅ Loaded dashboard stats from API:', response.data);
          }
        })
        .catch(err => {
          console.warn('⚠️ Failed to load dashboard stats, using calculated data:', err);
        })
        .finally(() => setLoading(false));
    }
  }, [teacherId]);

  const stats = useMemo(() => {
    // If we have API stats, use them
    if (apiStats) {
      return {
        totalStudents: apiStats.totalStudents || 0,
        totalLessons: lessons.length,
        overallCompletionRate: apiStats.averageProgress || 0,
        avgAssessmentScore: apiStats.avgAssessmentScore || 0,
        activeStudents: apiStats.activeStudents || 0,
        recentSessions: apiStats.activeToday || 0,
        avgEngagementTime: apiStats.avgStudyTime || 0,
        lessonsCompleted: apiStats.lessonsCompleted || 0,
        assessmentsCompleted: apiStats.assessmentsCompleted || 0,
        activeToday: apiStats.activeToday || 0,
      };
    }

    // No API data available - return zeros instead of mock calculations
    console.warn('⚠️ No dashboard stats from API, returning empty data');
    return {
      totalStudents: students.length,
      totalLessons: lessons.length,
      overallCompletionRate: 0,
      avgAssessmentScore: 0,
      activeStudents: 0,
      recentSessions: 0,
      avgEngagementTime: 0,
      lessonsCompleted: 0,
      assessmentsCompleted: 0,
      activeToday: 0,
    };
  }, [students, lessons, progress, scores, logs, apiStats]);

  return { ...stats, loading };
}