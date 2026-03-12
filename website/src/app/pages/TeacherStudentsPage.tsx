import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { User, Award, Clock, TrendingUp, BookOpen, Search, Star, Target, Users as UsersIcon, ChevronDown, ChevronRight, CheckCircle, X, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useStudents, useAssessmentScores, useLessons } from '@/app/hooks/useData';
import { mockAssessments, mockProgress } from '@/app/hooks/mockData';
import { Badge } from '@/app/components/ui/badge';
import apiService from '@/app/services/apiService';

interface StudentProgress {
  studentId: string;
  lessonId: string;
  subtopicId?: string;
  completed: boolean;
  progress: number;
  score?: number;
}

interface TeacherStudentsPageProps {
  setPageContext?: (context: any) => void;
}

export function TeacherStudentsPage({ setPageContext }: TeacherStudentsPageProps) {
  // Get teacher ID from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const teacherId = user.id;

  const { students } = useStudents(teacherId);
  const { scores } = useAssessmentScores();
  const { lessons } = useLessons();
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'firstName' | 'lastName' | 'completionRate' | 'avgScore'>('firstName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [studentProgressData, setStudentProgressData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  // Fetch detailed progress for each student when they expand
  useEffect(() => {
    if (expandedStudent && teacherId && !studentProgressData[expandedStudent]) {
      setLoading(true);
      apiService.getStudentProgress(teacherId, expandedStudent)
        .then(response => {
          if (response.success && response.data) {
            setStudentProgressData((prev: any) => ({
              ...prev,
              [expandedStudent]: response.data
            }));
            console.log('✅ Loaded student progress from API:', expandedStudent);
          }
        })
        .catch(err => {
          console.warn('⚠️ Failed to load student progress:', err);
        })
        .finally(() => setLoading(false));
    }
  }, [expandedStudent, teacherId, studentProgressData]);

  const getProgressColor = (progress: number) => {
    if (progress >= 85) return '#22c55e';  // Green for excellent
    if (progress >= 70) return '#D4A017';  // Dark yellow for good
    if (progress >= 60) return '#FEDA5E';  // Light yellow for fair
    return '#ef4444';  // Red for needs help
  };

  const getProgressBarColor = (completionRate: number) => {
    if (completionRate === 100) return '#22c55e';  // Green for fully completed
    return '#D4A017';  // Darker yellow for in progress
  };

  const getProgressBadge = (progress: number) => {
    if (progress >= 85) return { text: 'Excellent', color: 'bg-green-100 text-green-700 border-green-300' };
    if (progress >= 70) return { text: 'Good', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' };
    if (progress >= 60) return { text: 'Fair', color: 'bg-orange-100 text-orange-700 border-orange-300' };
    return { text: 'Needs Help', color: 'bg-red-100 text-red-700 border-red-300' };
  };

  // Calculate student statistics - use API data if available
  const calculateStudentStats = (studentId: string) => {
    // Find student in the API-fetched students array
    const student = students.find(s => s.id === studentId);
    
    if (student && student.completedLessons !== undefined) {
      // Use data from API
      return {
        avgProgress: student.avgScore || 0,
        completedLessons: student.completedLessons || 0,
        totalLessons: student.totalLessons || lessons.length,
        completionRate: student.completionRate || 0,
        avgScore: student.avgScore || 0,
      };
    }

    // Fallback to mock data calculation if API data not available
    let completedLessons = 0;
    let totalProgress = 0;
    
    lessons.forEach((lesson) => {
      if (lesson.subtopics && lesson.subtopics.length > 0) {
        const subtopicsForLesson = mockProgress.filter(
          (p) => p.studentId === studentId && p.lessonId === lesson.id
        );
        const completedSubtopics = subtopicsForLesson.filter((p) => p.completed).length;
        const lessonProgressPercent = (completedSubtopics / lesson.subtopics.length) * 100;
        totalProgress += lessonProgressPercent;
        
        if (completedSubtopics === lesson.subtopics.length) {
          completedLessons++;
        }
      }
    });
    
    const avgProgress = lessons.length > 0 ? totalProgress / lessons.length : 0;
    const totalLessons = lessons.length;
    
    const studentScores = scores.filter((s) => s.studentId === studentId);
    const avgScore = studentScores.length > 0
      ? Math.round(studentScores.reduce((sum, s) => sum + (s.score / s.maxScore) * 100, 0) / studentScores.length)
      : 0;
    
    return {
      avgProgress: Math.round(avgProgress),
      completedLessons,
      totalLessons,
      completionRate: Math.round((completedLessons / totalLessons) * 100),
      avgScore,
    };
  };

  // Filter and sort students
  const filteredStudents = React.useMemo(() => {
    // First, filter by search term
    let filtered = students.filter((student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Then sort based on selected criteria
    filtered.sort((a, b) => {
      const aStats = calculateStudentStats(a.id);
      const bStats = calculateStudentStats(b.id);

      let compareValue = 0;

      switch (sortBy) {
        case 'firstName': {
          const aFirstName = a.name.split(' ')[0];
          const bFirstName = b.name.split(' ')[0];
          compareValue = aFirstName.localeCompare(bFirstName);
          break;
        }
        case 'lastName': {
          const aLastName = a.name.split(' ').slice(-1)[0];
          const bLastName = b.name.split(' ').slice(-1)[0];
          compareValue = aLastName.localeCompare(bLastName);
          break;
        }
        case 'completionRate':
          compareValue = aStats.completionRate - bStats.completionRate;
          break;
        case 'avgScore':
          compareValue = aStats.avgScore - bStats.avgScore;
          break;
        default:
          compareValue = 0;
      }

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  }, [students, searchTerm, sortBy, sortOrder]);

  // Update page context for AI when data changes
  React.useEffect(() => {
    if (setPageContext) {
      const studentsWithStats = students.map(student => {
        const stats = calculateStudentStats(student.id);
        const badge = getProgressBadge(stats.avgProgress);
        
        // Get detailed assessment information for this student
        const studentAssessments = scores
          .filter(s => s.studentId === student.id)
          .map(s => {
            const assessment = mockAssessments.find(a => a.id === s.assessmentId);
            const lesson = lessons.find(l => l.id === assessment?.lessonId);
            return {
              assessmentId: s.assessmentId,
              assessmentTitle: assessment?.title || 'Unknown',
              lessonTitle: lesson?.title || 'Unknown',
              score: s.score,
              maxScore: s.maxScore,
              percentage: Math.round((s.score / s.maxScore) * 100),
              completedAt: s.completedAt,
            };
          });
        
        // Get detailed lesson progress for this student
        const lessonProgress = lessons.map(lesson => {
          const subtopicsForLesson = mockProgress.filter(
            p => p.studentId === student.id && p.lessonId === lesson.id
          );
          const completedSubtopics = subtopicsForLesson.filter(p => p.completed).length;
          const totalSubtopics = lesson.subtopics.length;
          const lessonPercentage = totalSubtopics > 0 ? Math.round((completedSubtopics / totalSubtopics) * 100) : 0;
          const isCompleted = completedSubtopics === totalSubtopics;
          
          return {
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            completedSubtopics,
            totalSubtopics,
            percentage: lessonPercentage,
            isCompleted,
            hasAssessment: lesson.hasAssessment,
          };
        });
        
        return {
          id: student.id,
          name: student.name,
          gender: student.gender,
          grade: student.grade,
          section: student.section,
          progress: stats.avgProgress,
          completionRate: stats.completionRate,
          lessonsCompleted: stats.completedLessons,
          totalLessons: stats.totalLessons,
          avgScore: stats.avgScore,
          assessmentsTaken: scores.filter(s => s.studentId === student.id).length,
          performanceLevel: badge.text,
          assessments: studentAssessments,
          lessonProgress: lessonProgress,
        };
      });
      
      // Calculate overall class average score (same as card display)
      const overallAvgScore = scores.length > 0 
        ? Math.round(scores.reduce((sum, s) => sum + (s.score / s.maxScore) * 100, 0) / scores.length)
        : 0;
      
      setPageContext({
        students: studentsWithStats,
        totalStudents: students.length,
        filteredCount: filteredStudents.length,
        searchTerm: searchTerm,
        sortBy: sortBy,
        sortOrder: sortOrder,
        averageProgress: Math.round(studentsWithStats.reduce((sum, s) => sum + s.progress, 0) / students.length),
        averageScore: overallAvgScore, // Fixed: Now matches the card calculation
        totalAssessmentsTaken: scores.length,
        lessons: lessons.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          hasAssessment: lesson.hasAssessment,
          subtopicsCount: lesson.subtopics.length,
        })),
        assessments: mockAssessments.map(a => ({
          id: a.id,
          title: a.title,
          lessonTitle: lessons.find(l => l.id === a.lessonId)?.title || 'Unknown',
          maxScore: a.maxScore,
        })),
        performanceSummary: {
          excellent: studentsWithStats.filter(s => s.performanceLevel === 'Excellent').length,
          good: studentsWithStats.filter(s => s.performanceLevel === 'Good').length,
          fair: studentsWithStats.filter(s => s.performanceLevel === 'Fair').length,
          needsHelp: studentsWithStats.filter(s => s.performanceLevel === 'Needs Help').length,
        },
      });
    }
  }, [students, filteredStudents, searchTerm, sortBy, sortOrder, scores, setPageContext]);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Enhanced Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-font text-4xl text-[var(--primary)] mb-2 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--primary)] shadow-md">
              <UsersIcon className="h-8 w-8 text-[var(--accent)]" />
            </div>
            Students
          </h1>
          <p className="text-muted-foreground text-lg">Monitor individual student progress and assessment scores</p>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-2 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-[var(--accent)] cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <UsersIcon className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-1">Total Students</p>
            <p className="text-2xl font-bold text-[var(--primary)]">{students.length}</p>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-[var(--accent)] cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Star className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-1">High Performers</p>
            <p className="text-2xl font-bold text-[var(--primary)]">
              {students.filter(s => {
                const stats = calculateStudentStats(s.id);
                return stats.completionRate >= 70;
              }).length}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-[var(--accent)] cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Award className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-1">Total Assessments Taken</p>
            <p className="text-2xl font-bold text-[var(--primary)]">{scores.length}</p>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-[var(--accent)] cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-[var(--accent)]/30">
                <TrendingUp className="h-5 w-5 text-[var(--primary)]" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-1">Avg Class Score</p>
            <p className="text-2xl font-bold text-[var(--primary)]">
              {scores.length > 0 
                ? `${Math.round(scores.reduce((sum, s) => sum + (s.score / s.maxScore) * 100, 0) / scores.length)}%`
                : 'N/A'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search and Sort Bar */}
          <Card className="border-2 shadow-sm bg-gradient-to-r from-[var(--accent)]/10 to-transparent">
            <CardContent className="pt-6 pb-6">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search students by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] transition-colors bg-white"
                  />
                </div>

                {/* Sort By Dropdown */}
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 border-2 border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] transition-colors bg-white text-sm font-medium text-[var(--foreground)] cursor-pointer hover:border-[var(--accent)]"
                  >
                    <option value="firstName">First Name</option>
                    <option value="lastName">Last Name</option>
                    <option value="completionRate">Completion Rate</option>
                    <option value="avgScore">Average Score</option>
                  </select>

                  {/* Sort Order Toggle */}
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-3 py-2 border-2 border-[var(--border)] rounded-lg bg-white hover:bg-[var(--accent)]/10 hover:border-[var(--accent)] transition-all flex items-center gap-2 text-sm font-medium text-[var(--foreground)]"
                    title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                  >
                    {sortOrder === 'asc' ? (
                      <>
                        <ArrowUp className="h-4 w-4" />
                        <span className="hidden sm:inline">Asc</span>
                      </>
                    ) : (
                      <>
                        <ArrowDown className="h-4 w-4" />
                        <span className="hidden sm:inline">Desc</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-sm hover:shadow-lg transition-all">
            <CardHeader className="bg-gradient-to-r from-[var(--accent)]/10 to-transparent items-center pb-3">
              <CardTitle className="text-[var(--primary)] flex items-center gap-2 my-0">
                <UsersIcon className="h-5 w-5" />
                All Students
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Showing {filteredStudents.length} of {students.length} students
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredStudents.map((student) => {
                const stats = calculateStudentStats(student.id);
                const progressBadge = stats.avgScore > 0 
                  ? getProgressBadge(stats.avgScore) 
                  : { text: 'No Assessments', color: 'bg-gray-100 text-gray-600 border-gray-300' };
                const progressBarColor = getProgressBarColor(stats.completionRate);
                const isExpanded = expandedStudent === student.id;
                const lessonsWithAssessments = lessons.filter((l) => l.hasAssessment);

                return (
                  <div
                    key={student.id}
                    className={`rounded-lg border-2 transition-all overflow-hidden ${
                      isExpanded
                        ? 'border-[var(--primary)] bg-[var(--primary)]/5 shadow-lg'
                        : 'border-[var(--border)] hover:border-[var(--primary)]/50 hover:shadow-md'
                    }`}
                  >
                    {/* Student Header - Clickable */}
                    <button
                      onClick={() => setExpandedStudent(isExpanded ? null : student.id)}
                      className="w-full p-4 text-left transition-all hover:bg-[var(--accent)]/10"
                    >
                      <div className="flex items-center gap-4">
                        {/* Expand/Collapse Icon */}
                        <div className="flex-shrink-0">
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5 text-[var(--primary)]" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-[var(--primary)]" />
                          )}
                        </div>

                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent)]/70 flex items-center justify-center shadow-sm flex-shrink-0">
                          <User className="h-6 w-6 text-[var(--primary)]" />
                        </div>

                        {/* Student Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-bold text-[var(--foreground)]">{student.name}</p>
                            <Badge className={`text-xs border ${progressBadge.color}`}>
                              {progressBadge.text}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-3 mb-2">
                            <div>
                              <p className="text-xs text-muted-foreground">Completion Rate</p>
                              <p className="text-sm font-bold text-[var(--foreground)]">{stats.completionRate}%</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Lessons Done</p>
                              <p className="text-sm font-bold text-[var(--foreground)]">{stats.completedLessons}/{stats.totalLessons}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Average Score</p>
                              <p className="text-sm font-bold text-[var(--foreground)]">{stats.avgScore > 0 ? `${stats.avgScore}%` : 'N/A'}</p>
                            </div>
                          </div>
                          <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden shadow-inner">
                            <div
                              className="h-full transition-all duration-500 ease-out rounded-full"
                              style={{ 
                                width: `${stats.completionRate}%`,
                                backgroundColor: progressBarColor
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Expanded Assessment Details */}
                    {isExpanded && (
                      <div className="border-t-2 border-[var(--border)] bg-gradient-to-b from-[var(--accent)]/10 to-transparent">
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-sm text-[var(--foreground)] flex items-center gap-2">
                              <Award className="h-4 w-4 text-[var(--primary)]" />
                              Assessment Scores
                            </h4>
                            <Badge className="text-xs bg-[var(--accent)]/30 text-[var(--primary)] border-[var(--accent)]/50">
                              {lessonsWithAssessments.length} Assessments
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            {lessonsWithAssessments.map((lesson) => {
                              // Check if student has taken this assessment
                              const studentScore = scores.find(
                                (s) => s.studentId === student.id && 
                                       mockAssessments.find((a) => a.id === s.assessmentId && a.lessonId === lesson.id)
                              );
                              
                              if (studentScore) {
                                const percentage = Math.round((studentScore.score / studentScore.maxScore) * 100);
                                const scoreBadge = getProgressBadge(percentage);
                                
                                return (
                                  <div
                                    key={lesson.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-white border-2 border-[var(--border)] hover:border-[var(--accent)] transition-all"
                                  >
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <p className="text-sm font-semibold text-[var(--foreground)]">{lesson.title}</p>
                                      </div>
                                      <p className="text-xs text-muted-foreground flex items-center gap-1 ml-6">
                                        <Clock className="h-3 w-3" />
                                        Completed: {studentScore.completedAt}
                                      </p>
                                    </div>
                                    <div className="text-right ml-3">
                                      <Badge className={`text-xs border mb-1 ${scoreBadge.color}`}>
                                        {scoreBadge.text}
                                      </Badge>
                                      <p
                                        className="text-sm font-bold"
                                        style={{
                                          color: percentage >= 80 ? '#22c55e' : percentage >= 60 ? '#D4A017' : '#ef4444'
                                        }}
                                      >
                                        {studentScore.score}/{studentScore.maxScore} ({percentage}%)
                                      </p>
                                    </div>
                                  </div>
                                );
                              } else {
                                // Assessment not taken yet
                                return (
                                  <div
                                    key={lesson.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-all"
                                  >
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <X className="h-4 w-4 text-gray-400" />
                                        <p className="text-sm font-semibold text-gray-600">{lesson.title}</p>
                                      </div>
                                      <p className="text-xs text-gray-500 ml-6">Assessment not yet taken</p>
                                    </div>
                                    <Badge className="text-xs bg-gray-200 text-gray-600 border-gray-300">
                                      Not Taken
                                    </Badge>
                                  </div>
                                );
                              }
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Assessment Scores Section */}
        <div className="space-y-4">
          <Card className="border-2 shadow-sm hover:shadow-lg transition-all">
            <CardHeader className="bg-gradient-to-r from-[var(--accent)]/10 to-transparent items-center pb-3">
              <CardTitle className="text-[var(--primary)] flex items-center gap-2 my-0">
                <Award className="h-5 w-5" />
                Recent Assessment Scores
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[700px] overflow-y-auto">
              {students
                .filter((student) => {
                  // Only show students who have taken assessments
                  const studentScores = scores.filter((s) => s.studentId === student.id);
                  return studentScores.length > 0;
                })
                .map((student) => {
                const studentScores = scores
                  .filter((s) => s.studentId === student.id)
                  // Sort by completedAt date - most recent first (within each student)
                  .sort((a, b) => {
                    // Convert date strings to Date objects for comparison
                    const dateA = new Date(a.completedAt);
                    const dateB = new Date(b.completedAt);
                    return dateB.getTime() - dateA.getTime(); // Descending order (newest first)
                  });

                return (
                  <div key={student.id} className="border-2 border-[var(--border)] rounded-lg p-2.5 hover:border-[var(--accent)] transition-all bg-white shadow-sm hover:shadow-md">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent)]/70 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <User className="h-3 w-3 text-[var(--primary)]" />
                      </div>
                      <p className="font-semibold text-xs text-[var(--foreground)]">{student.name}</p>
                      <Badge className="ml-auto text-xs bg-[var(--accent)]/30 text-[var(--primary)] border-[var(--accent)]/50 py-0 h-4">
                        {studentScores.length}
                      </Badge>
                    </div>
                    <div className="space-y-1.5 pl-8">
                      {studentScores.map((scoreData) => {
                        const assessment = mockAssessments.find((a) => a.id === scoreData.assessmentId);
                        const lesson = lessons.find((l) => l.id === assessment?.lessonId);
                        const percentage = Math.round((scoreData.score / scoreData.maxScore) * 100);
                        const scoreBadge = getProgressBadge(percentage);

                        return (
                          <div key={scoreData.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-[var(--accent)]/5 border border-[var(--border)]/50 hover:bg-[var(--accent)]/10 transition-all">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-[var(--foreground)] truncate">{lesson?.title}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-2.5 w-2.5" />
                                {scoreData.completedAt}
                              </p>
                            </div>
                            <div className="text-right ml-2 flex-shrink-0">
                              <Badge className={`text-xs border py-0 h-4 ${scoreBadge.color}`}>
                                {scoreBadge.text}
                              </Badge>
                              <p className="text-xs font-bold mt-0.5" style={{ color: percentage >= 80 ? '#22c55e' : percentage >= 60 ? '#D4A017' : '#ef4444' }}>
                                {scoreData.score}/{scoreData.maxScore}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}