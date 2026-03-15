import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { ChevronDown, ChevronRight, CheckCircle, BookOpen, Award, Target, Search, AlertCircle } from 'lucide-react';
import { useLessons, useStudents } from '@/app/hooks/useData';
import { mockProgress } from '@/app/hooks/mockData';
import { Badge } from '@/app/components/ui/badge';

interface StudentProgress {
  studentId: string;
  lessonId: string;
  subtopicId?: string;
  completed: boolean;
  progress: number;
  score?: number;
}

export function TeacherProgressPage() {
  const { setPageContext } = useOutletContext<{ setPageContext: (context: any) => void }>();
  const { lessons } = useLessons();
  const { students } = useStudents();
  const [expandedLessons, setExpandedLessons] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'completed' | 'in-progress'>('all');

  const toggleLesson = (lessonId: string) => {
    setExpandedLessons((prev) =>
      prev.includes(lessonId) ? prev.filter((id) => id !== lessonId) : [...prev, lessonId]
    );
  };

  // Calculate lesson progress as average completion across all students
  const getLessonProgress = (lessonId: string) => {
    const lesson = lessons.find((l) => l.id === lessonId);
    if (!lesson || !lesson.subtopics || lesson.subtopics.length === 0) return 0;

    let totalProgress = 0;
    
    students.forEach((student) => {
      // Check how many subtopics this student completed for this lesson
      const studentSubtopicsForLesson = mockProgress.filter(
        (p) => p.studentId === student.id && p.lessonId === lessonId && p.subtopicId
      );
      
      const completedSubtopics = studentSubtopicsForLesson.filter((p) => p.completed).length;
      
      // Calculate this student's progress percentage for this lesson
      const studentProgress = (completedSubtopics / lesson.subtopics.length) * 100;
      totalProgress += studentProgress;
    });

    // Return average progress across all students
    return Math.round(totalProgress / students.length);
  };

  // Calculate subtopic completion rate based on how many students completed it
  const getSubtopicProgress = (lessonId: string, subtopicId: string) => {
    const subtopicProgressData = mockProgress.filter(
      (p) => p.lessonId === lessonId && p.subtopicId === subtopicId
    );
    
    if (subtopicProgressData.length === 0) return 0;
    
    const completedCount = subtopicProgressData.filter((p) => p.completed).length;
    return Math.round((completedCount / subtopicProgressData.length) * 100);
  };

  // Calculate summary statistics based on actual completion data
  const summaryStats = React.useMemo(() => {
    const totalLessons = lessons.length;
    const totalStudents = students.length;
    const totalPossibleCompletions = totalLessons * totalStudents; // 6 lessons × 6 students = 36
    
    // Count how many lesson completions happened across all students
    let totalLessonCompletions = 0;
    let totalProgressSum = 0;
    
    lessons.forEach((lesson) => {
      students.forEach((student) => {
        if (lesson.subtopics && lesson.subtopics.length > 0) {
          const studentSubtopicsForLesson = mockProgress.filter(
            (p) => p.studentId === student.id && p.lessonId === lesson.id && p.subtopicId
          );
          
          const completedSubtopics = studentSubtopicsForLesson.filter((p) => p.completed).length;
          const progressPercent = (completedSubtopics / lesson.subtopics.length) * 100;
          totalProgressSum += progressPercent;
          
          // If student completed all subtopics, count as completed lesson
          if (completedSubtopics === lesson.subtopics.length) {
            totalLessonCompletions++;
          }
        }
      });
    });

    const avgProgress = totalPossibleCompletions > 0 
      ? Math.round(totalProgressSum / totalPossibleCompletions)
      : 0;
    
    const completionRate = totalPossibleCompletions > 0
      ? Math.round((totalLessonCompletions / totalPossibleCompletions) * 100)
      : 0;

    return {
      totalLessons,
      totalStudents,
      completedLessons: totalLessonCompletions, // Total lesson completions across all students
      avgProgress,
      inProgress: totalPossibleCompletions - totalLessonCompletions, // Remaining lesson slots
      completionRate,
    };
  }, [mockProgress, lessons, students]);

  // Filter lessons based on search and filter type
  const filteredLessons = React.useMemo(() => {
    return lessons.filter((lesson) => {
      const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase());
      const lessonProgress = getLessonProgress(lesson.id);
      
      if (filterType === 'completed') {
        return matchesSearch && lessonProgress >= 90;
      } else if (filterType === 'in-progress') {
        return matchesSearch && lessonProgress < 90;
      }
      return matchesSearch;
    });
  }, [lessons, searchTerm, filterType, mockProgress]);

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return '#22c55e';
    if (progress >= 75) return '#D4A017';
    if (progress >= 50) return '#FEDA5E';
    return '#ef4444';
  };

  const getProgressBadge = (progress: number) => {
    if (progress >= 90) return { text: 'Excellent', color: 'bg-green-100 text-green-700 border-green-300' };
    if (progress >= 75) return { text: 'Good', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' };
    if (progress >= 50) return { text: 'Fair', color: 'bg-orange-100 text-orange-700 border-orange-300' };
    return { text: 'Needs Help', color: 'bg-red-100 text-red-700 border-red-300' };
  };

  // Update page context for AI
  React.useEffect(() => {
    if (setPageContext) {
      const lessonsWithProgress = lessons.map(lesson => {
        const lessonProgress = getLessonProgress(lesson.id);
        const badge = getProgressBadge(lessonProgress);
        
        const subtopicsWithProgress = lesson.subtopics?.map(subtopic => ({
          id: subtopic.id,
          title: subtopic.title,
          progress: getSubtopicProgress(lesson.id, subtopic.id),
          studentsCompleted: mockProgress.filter(
            p => p.lessonId === lesson.id && p.subtopicId === subtopic.id && p.completed
          ).length,
        })) || [];
        
        return {
          id: lesson.id,
          title: lesson.title,
          hasAssessment: lesson.hasAssessment,
          progress: lessonProgress,
          performanceLevel: badge.text,
          subtopicsCount: lesson.subtopics?.length || 0,
          subtopics: subtopicsWithProgress,
        };
      });
      
      setPageContext({
        summaryStats: summaryStats,
        lessons: lessonsWithProgress,
        totalLessons: lessons.length,
        filteredCount: filteredLessons.length,
        searchTerm: searchTerm,
        filterType: filterType,
        progressSummary: {
          excellent: lessonsWithProgress.filter(l => l.performanceLevel === 'Excellent').length,
          good: lessonsWithProgress.filter(l => l.performanceLevel === 'Good').length,
          fair: lessonsWithProgress.filter(l => l.performanceLevel === 'Fair').length,
          needsHelp: lessonsWithProgress.filter(l => l.performanceLevel === 'Needs Help').length,
        },
      });
    }
  }, [lessons, students, filteredLessons, searchTerm, filterType, summaryStats, setPageContext]);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Enhanced Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-font text-4xl text-[var(--primary)] mb-2 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--primary)] shadow-md">
              <Target className="h-8 w-8 text-[var(--accent)]" />
            </div>
            Progress Tracking
          </h1>
          <p className="text-muted-foreground text-lg">Monitor lesson and subtopic completion across all students</p>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-2 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-[var(--accent)] cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-[var(--accent)]/30">
                <BookOpen className="h-5 w-5 text-[var(--primary)]" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-1">Total Lessons</p>
            <p className="text-2xl font-bold text-[var(--primary)]">{summaryStats.totalLessons}</p>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-[var(--accent)] cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-1">Lessons Completed</p>
            <p className="text-2xl font-bold text-[var(--primary)]">{summaryStats.completedLessons}</p>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-[var(--accent)] cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-1">Avg Progress</p>
            <p className="text-2xl font-bold text-[var(--primary)]">{summaryStats.avgProgress}%</p>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-[var(--accent)] cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <Award className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-1">In Progress</p>
            <p className="text-2xl font-bold text-[var(--primary)]">{summaryStats.inProgress}</p>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-[var(--accent)] cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-yellow-100">
                <CheckCircle className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-1">Completion Rate</p>
            <p className="text-2xl font-bold text-[var(--primary)]">{summaryStats.completionRate}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Lesson Hierarchy View - Full Width */}
      <div className="space-y-4">
        {/* Search and Filter Bar */}
        <Card className="border-2 shadow-sm bg-gradient-to-r from-[var(--accent)]/10 to-transparent">
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search lessons..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] transition-colors bg-white"
                />
              </div>
              
              {/* Filter Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                    filterType === 'all'
                      ? 'border-[var(--primary)] bg-[var(--primary)] text-white'
                      : 'border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[var(--primary)]/50'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterType('completed')}
                  className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                    filterType === 'completed'
                      ? 'border-[var(--primary)] bg-[var(--primary)] text-white'
                      : 'border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[var(--primary)]/50'
                  }`}
                >
                  Completed
                </button>
                <button
                  onClick={() => setFilterType('in-progress')}
                  className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                    filterType === 'in-progress'
                      ? 'border-[var(--primary)] bg-[var(--primary)] text-white'
                      : 'border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[var(--primary)]/50'
                  }`}
                >
                  In Progress
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-sm hover:shadow-lg transition-all">
          <CardHeader className="bg-gradient-to-r from-[var(--accent)]/10 to-transparent items-center pb-3">
            <CardTitle className="text-[var(--primary)] flex items-center gap-2 my-0">
              <BookOpen className="h-5 w-5" />
              Lessons & Subtopics
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Showing {filteredLessons.length} of {lessons.length} lessons
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredLessons.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">No lessons match your search</p>
                <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or search term</p>
              </div>
            ) : (
              filteredLessons.map((lesson) => {
                const lessonProgress = getLessonProgress(lesson.id);
                const isExpanded = expandedLessons.includes(lesson.id);
                const progressBadge = getProgressBadge(lessonProgress);
                const progressColor = getProgressColor(lessonProgress);

                return (
                  <div key={lesson.id} className="border-2 border-[var(--border)] rounded-lg overflow-hidden hover:border-[var(--accent)] transition-all shadow-sm hover:shadow-md">
                    {/* Lesson Row */}
                    <button
                      onClick={() => toggleLesson(lesson.id)}
                      className="w-full p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:bg-[var(--accent)]/10 transition-all gap-3"
                    >
                      {/* Left Section: Icon + Title */}
                      <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                        {lesson.subtopics && lesson.subtopics.length > 0 ? (
                          isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-[var(--primary)] transition-transform flex-shrink-0" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-[var(--primary)] transition-transform flex-shrink-0" />
                          )
                        ) : (
                          <div className="w-4 flex-shrink-0" />
                        )}
                        <div className="p-1.5 rounded-lg bg-[var(--accent)]/30 flex-shrink-0">
                          <BookOpen className="h-4 w-4 text-[var(--primary)]" />
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <p className="font-semibold text-[var(--foreground)] text-sm sm:truncate">{lesson.title}</p>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            {lesson.hasAssessment && (
                              <Badge className="text-xs bg-[var(--accent)] text-[var(--foreground)] border-[var(--accent)]/50 hover:bg-[var(--accent)] py-0 h-5">
                                <Award className="h-2.5 w-2.5 mr-0.5" />
                                With Assessment
                              </Badge>
                            )}
                            {lesson.subtopics && lesson.subtopics.length > 0 && (
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {lesson.subtopics.length} subtopics
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Right Section: Progress Bar */}
                      <div className="w-full sm:w-48 md:w-64 sm:flex-shrink-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-[var(--muted-foreground)] font-medium">Class Progress</span>
                          <span className="text-sm font-bold text-[var(--foreground)]">
                            {lessonProgress}%
                          </span>
                        </div>
                        <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden shadow-inner">
                          <div
                            className="h-full transition-all duration-500 ease-out rounded-full"
                            style={{ 
                              width: `${lessonProgress}%`,
                              background: `linear-gradient(90deg, ${progressColor}, ${progressColor}dd)`
                            }}
                          />
                        </div>
                      </div>
                    </button>

                    {/* Subtopics */}
                    {isExpanded && lesson.subtopics && lesson.subtopics.length > 0 && (
                      <div className="bg-gradient-to-b from-[var(--accent)]/10 to-[var(--accent)]/5 border-t-2 border-[var(--border)]">
                        {lesson.subtopics.map((subtopic, index) => {
                          const subtopicProgress = getSubtopicProgress(lesson.id, subtopic.id);
                          const subtopicColor = getProgressColor(subtopicProgress);
                          return (
                            <div
                              key={subtopic.id}
                              className={`p-3 pl-6 sm:pl-14 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 hover:bg-[var(--accent)]/20 transition-all ${
                                index !== lesson.subtopics!.length - 1 ? 'border-b border-[var(--border)]/50' : ''
                              }`}
                            >
                              <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                                <div className="w-2 h-2 rounded-full shadow-sm flex-shrink-0" style={{ backgroundColor: subtopicColor }} />
                                <p className="text-sm font-medium text-[var(--foreground)]">{subtopic.title}</p>
                                {subtopicProgress >= 90 && (
                                  <CheckCircle className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                                )}
                              </div>
                              <div className="w-full sm:w-48 md:w-64 sm:flex-shrink-0">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-[var(--muted-foreground)]">Progress</span>
                                  <span className="text-xs font-semibold text-[var(--foreground)]">
                                    {subtopicProgress}%
                                  </span>
                                </div>
                                <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden shadow-inner">
                                  <div
                                    className="h-full transition-all duration-500 ease-out rounded-full"
                                    style={{ 
                                      width: `${subtopicProgress}%`,
                                      backgroundColor: subtopicColor
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}