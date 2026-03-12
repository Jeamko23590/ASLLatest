import { useState, useMemo, useEffect } from 'react';
import {
  mockLessons,
  mockStudents,
  mockProgress,
  mockAssessments,
  mockAssessmentScores,
  mockEngagementLogs,
  mockTeachers,
  mockAIInsights,
  mockSchools,
  mockClasses,
} from './mockData';
import { Student, Lesson, StudentProgress, AssessmentScore, EngagementLog, ReportData, School, Class } from './types';
import apiService from '@/app/services/apiService';

export function useStudents(teacherId?: string) {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (teacherId) {
      setLoading(true);
      apiService.getTeacherStudents(teacherId)
        .then(response => {
          if (response.success && response.data) {
            // Transform API data to match frontend format
            const transformedStudents = response.data.map((s: any) => ({
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
          console.warn('⚠️ Failed to load students, using mock data:', err);
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
  const [lessons, setLessons] = useState<Lesson[]>(mockLessons);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiService.getLessons()
      .then(response => {
        if (response.success && response.data) {
          // Transform API data to match frontend format
          const transformedLessons = response.data.map((l: any) => ({
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
        console.warn('⚠️ Failed to load lessons, using mock data:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  return { lessons, loading };
}

export function useProgress() {
  const [progress] = useState<StudentProgress[]>(mockProgress);
  return { progress };
}

export function useAssessmentScores() {
  const [scores] = useState<AssessmentScore[]>(mockAssessmentScores);
  return { scores };
}

export function useEngagementLogs() {
  const [logs] = useState<EngagementLog[]>(mockEngagementLogs);
  return { logs };
}

export function useTeachers() {
  const [teachers, setTeachers] = useState(mockTeachers);
  
  const addTeacher = (teacher: typeof mockTeachers[0]) => {
    setTeachers(prev => [...prev, teacher]);
  };
  
  const updateTeacher = (id: string, updates: Partial<typeof mockTeachers[0]>) => {
    setTeachers(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };
  
  const deleteTeacher = (id: string) => {
    setTeachers(prev => prev.filter(t => t.id !== id));
  };
  
  return { teachers, addTeacher, updateTeacher, deleteTeacher };
}

export function useSchools() {
  const [schools, setSchools] = useState(mockSchools);
  
  const addSchool = (school: typeof mockSchools[0]) => {
    setSchools(prev => [...prev, school]);
  };
  
  const updateSchool = (id: string, updates: Partial<typeof mockSchools[0]>) => {
    setSchools(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };
  
  const deleteSchool = (id: string) => {
    setSchools(prev => prev.filter(s => s.id !== id));
  };
  
  return { schools, addSchool, updateSchool, deleteSchool };
}

export function useClasses() {
  const [classes] = useState(mockClasses);
  return { classes };
}

export function useAIInsights() {
  const [insights] = useState(mockAIInsights);
  return { insights };
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
export function useReportData(): ReportData[] {
  const { students } = useStudents();
  const { lessons } = useLessons();
  const { progress } = useProgress();
  const { scores } = useAssessmentScores();
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
        const assessment = mockAssessments.find((a) => a.lessonId === lesson.id);
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
  }, [students, lessons, progress, scores, logs]);

  return reportData;
}

// Get dashboard statistics
export function useDashboardStats(teacherId?: string) {
  const { students } = useStudents(teacherId);
  const { lessons } = useLessons();
  const { progress } = useProgress();
  const { scores } = useAssessmentScores();
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

    // Fallback to calculated stats from mock data
    const totalSubtopics = lessons.reduce((sum, lesson) => sum + lesson.subtopics.length, 0);
    const totalPossibleProgress = students.length * totalSubtopics;
    const totalCompletedProgress = progress.filter((p) => p.completed).length;
    const overallCompletionRate = totalPossibleProgress > 0
      ? (totalCompletedProgress / totalPossibleProgress) * 100
      : 0;

    const avgAssessmentScore = scores.length > 0
      ? (scores.reduce((sum, s) => sum + (s.score / s.maxScore) * 100, 0) / scores.length)
      : 0;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activeStudentIds = new Set(
      logs.filter((log) => new Date(log.date) >= sevenDaysAgo).map((log) => log.studentId)
    );
    const activeStudents = activeStudentIds.size;

    const recentSessions = logs.filter((log) => new Date(log.date) >= sevenDaysAgo).length;

    const avgEngagementTime = logs.length > 0
      ? logs.reduce((sum, log) => sum + log.sessionDuration, 0) / logs.length
      : 0;

    return {
      totalStudents: students.length,
      totalLessons: lessons.length,
      overallCompletionRate: Math.round(overallCompletionRate),
      avgAssessmentScore: Math.round(avgAssessmentScore),
      activeStudents,
      recentSessions,
      avgEngagementTime: Math.round(avgEngagementTime),
    };
  }, [students, lessons, progress, scores, logs, apiStats]);

  return { ...stats, loading };
}