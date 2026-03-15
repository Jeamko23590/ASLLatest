import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { useLessons, useStudents, useProgress, useAssessmentScores } from '@/app/hooks/useData';
import { Download, FileText, TrendingUp, TrendingDown, BarChart3, Calendar, BookOpen, Users, Target, Award, Filter } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AIInsightsAccordion } from '@/app/components/AIInsightsAccordion';
import { mockAssessments } from '@/app/hooks/mockData';

export function TeacherReportsPage() {
  const { setPageContext } = useOutletContext<{ setPageContext: (context: any) => void }>();
  const { lessons } = useLessons();
  const { students } = useStudents();
  const { progress } = useProgress();
  const { scores: assessmentScores } = useAssessmentScores();
  const [selectedLesson, setSelectedLesson] = useState<string>('all');

  // Calculate realistic lesson completion data
  const lessonCompletionData = React.useMemo(() => {
    return lessons.map((lesson) => {
      let completed = 0;
      let inProgress = 0;
      let notStarted = 0;
      let totalProgress = 0;

      students.forEach((student) => {
        if (lesson.subtopics && lesson.subtopics.length > 0) {
          const studentSubtopicsForLesson = progress.filter(
            (p) => p.studentId === student.id && p.lessonId === lesson.id && p.subtopicId
          );

          const completedSubtopics = studentSubtopicsForLesson.filter((p) => p.completed).length;
          const progressPercent = (completedSubtopics / lesson.subtopics.length) * 100;
          totalProgress += progressPercent;

          if (completedSubtopics === lesson.subtopics.length) {
            completed++;
          } else if (completedSubtopics > 0) {
            inProgress++;
          } else {
            notStarted++;
          }
        }
      });

      const avgProgress = students.length > 0 ? Math.round(totalProgress / students.length) : 0;

      return {
        id: lesson.id,
        title: lesson.title,
        totalStudents: students.length,
        completed,
        inProgress,
        notStarted,
        avgProgress,
      };
    });
  }, [lessons, students, progress]);

  // Calculate realistic assessment scores data
  const assessmentScoresData = React.useMemo(() => {
    return lessons
      .filter((lesson) => lesson.hasAssessment)
      .map((lesson) => {
        // Find the assessment for this lesson
        const assessment = mockAssessments.find((a) => a.lessonId === lesson.id);
        if (!assessment) {
          return {
            id: lesson.id,
            title: lesson.title,
            totalAttempts: 0,
            avgScore: 0,
            highestScore: 0,
            lowestScore: 0,
            passRate: 0,
          };
        }

        // Get all assessment scores for this assessment
        const lessonAssessmentScores = assessmentScores.filter(
          (score) => score.assessmentId === assessment.id
        );
        
        if (lessonAssessmentScores.length === 0) {
          return {
            id: lesson.id,
            title: lesson.title,
            totalAttempts: 0,
            avgScore: 0,
            highestScore: 0,
            lowestScore: 0,
            passRate: 0,
          };
        }

        const scoresPercentages = lessonAssessmentScores.map((a) => Math.round((a.score / a.maxScore) * 100));
        const avgScore = Math.round(scoresPercentages.reduce((sum, s) => sum + s, 0) / scoresPercentages.length);
        const highestScore = Math.max(...scoresPercentages);
        const lowestScore = Math.min(...scoresPercentages);
        const passRate = Math.round((scoresPercentages.filter((s) => s >= 75).length / scoresPercentages.length) * 100);

        return {
          id: lesson.id,
          title: lesson.title,
          totalAttempts: lessonAssessmentScores.length,
          avgScore: isNaN(avgScore) ? 0 : avgScore,
          highestScore: isNaN(highestScore) ? 0 : highestScore,
          lowestScore: isNaN(lowestScore) ? 0 : lowestScore,
          passRate: isNaN(passRate) ? 0 : passRate,
        };
      });
  }, [lessons, assessmentScores, mockAssessments]);

  // Calculate overall statistics
  const overallStats = React.useMemo(() => {
    const totalPossibleCompletions = lessons.length * students.length;
    const totalCompletions = lessonCompletionData.reduce((sum, l) => sum + l.completed, 0);
    const totalInProgress = lessonCompletionData.reduce((sum, l) => sum + l.inProgress, 0);
    const avgCompletion = totalPossibleCompletions > 0 
      ? Math.round((totalCompletions / totalPossibleCompletions) * 100) 
      : 0;
    
    const allScores = assessmentScores.map((a) => (a.score / a.maxScore) * 100);
    const overallAvgScore = allScores.length > 0 
      ? Math.round(allScores.reduce((sum, s) => sum + s, 0) / allScores.length) 
      : 0;

    const studentsWithProgress = students.filter((student) => {
      const studentProgress = progress.filter((p) => p.studentId === student.id);
      return studentProgress.some((p) => p.completed);
    }).length;

    return {
      totalLessons: lessons.length,
      totalStudents: students.length,
      completedLessons: totalCompletions,
      inProgressLessons: totalInProgress,
      avgCompletion,
      overallAvgScore,
      totalAssessments: assessmentScores.length,
      activeStudents: studentsWithProgress,
    };
  }, [lessons, students, lessonCompletionData, assessmentScores, progress]);

  const filteredLessons = selectedLesson === 'all' 
    ? lessonCompletionData 
    : lessonCompletionData.filter((l) => l.id === selectedLesson);

  const filteredAssessments = selectedLesson === 'all'
    ? assessmentScoresData
    : assessmentScoresData.filter((a) => a.id === selectedLesson);

  // Generate AI insights based on actual data
  const aiInsights = React.useMemo(() => {
    const insights: Array<{ type: 'success' | 'warning' | 'info'; text: string }> = [];

    // Insight 1: Completion rate
    if (overallStats.avgCompletion >= 50) {
      insights.push({
        type: 'success',
        text: `Strong overall progress with ${overallStats.avgCompletion}% average lesson completion rate across all students.`,
      });
    } else if (overallStats.avgCompletion >= 30) {
      insights.push({
        type: 'info',
        text: `Moderate progress at ${overallStats.avgCompletion}% average completion. Consider sending encouragement messages to students.`,
      });
    } else {
      insights.push({
        type: 'warning',
        text: `Low completion rate at ${overallStats.avgCompletion}%. Students may need additional support or lesson adjustments.`,
      });
    }

    // Insight 2: Assessment performance
    if (overallStats.totalAssessments > 0) {
      if (overallStats.overallAvgScore >= 85) {
        insights.push({
          type: 'success',
          text: `Excellent assessment performance! Students are averaging ${overallStats.overallAvgScore}% across all assessments.`,
        });
      } else if (overallStats.overallAvgScore >= 75) {
        insights.push({
          type: 'success',
          text: `Good assessment results with ${overallStats.overallAvgScore}% average score. Students demonstrate solid understanding.`,
        });
      } else if (overallStats.overallAvgScore >= 60) {
        insights.push({
          type: 'warning',
          text: `Assessment scores averaging ${overallStats.overallAvgScore}%. Consider reviewing difficult topics with students.`,
        });
      } else if (overallStats.overallAvgScore > 0) {
        insights.push({
          type: 'warning',
          text: `Assessment performance needs attention at ${overallStats.overallAvgScore}% average. Additional practice recommended.`,
        });
      }
    }

    // Insight 3: Student engagement
    const engagementRate = Math.round((overallStats.activeStudents / overallStats.totalStudents) * 100);
    if (engagementRate >= 80) {
      insights.push({
        type: 'success',
        text: `${overallStats.activeStudents} out of ${overallStats.totalStudents} students are actively engaged (${engagementRate}% engagement rate).`,
      });
    } else if (engagementRate >= 50) {
      insights.push({
        type: 'info',
        text: `${overallStats.activeStudents} out of ${overallStats.totalStudents} students have started lessons. Reach out to inactive students for better engagement.`,
      });
    } else {
      insights.push({
        type: 'warning',
        text: `Only ${overallStats.activeStudents} out of ${overallStats.totalStudents} students are engaged. Consider personalized outreach strategies.`,
      });
    }

    // Insight 4: Best performing lesson
    if (lessonCompletionData.length > 0) {
      const bestLesson = lessonCompletionData.reduce((best, current) => 
        current.avgProgress > best.avgProgress ? current : best
      );
      
      if (bestLesson && bestLesson.avgProgress > 0) {
        insights.push({
          type: 'success',
          text: `"${bestLesson.title}" is the top-performing lesson with ${bestLesson.avgProgress}% average progress.`,
        });
      }
    }

    // Insight 5: Lessons needing attention
    const strugglingLessons = lessonCompletionData.filter((l) => l.avgProgress < 30 && l.avgProgress > 0);
    if (strugglingLessons.length > 0) {
      insights.push({
        type: 'warning',
        text: `${strugglingLessons.length} ${strugglingLessons.length === 1 ? 'lesson needs' : 'lessons need'} attention with low completion rates. Consider additional support materials.`,
      });
    }

    return insights;
  }, [overallStats, lessonCompletionData]);

  const getProgressColor = (progress: number) => {
    if (progress === 100) return '#22c55e';
    if (progress >= 75) return '#D4A017';
    if (progress >= 50) return '#FEDA5E';
    return '#ef4444';
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    
    // Set consistent font
    doc.setFont('helvetica', 'normal');
    
    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Reports & Analytics', 14, 20);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`As of ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`, 14, 30);

    // Overview Stats
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Overview Stats', 14, 45);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Lessons: ${overallStats.totalLessons}`, 14, 55);
    doc.text(`Active Students: ${overallStats.activeStudents}/${overallStats.totalStudents}`, 14, 63);
    doc.text(`Avg Completion: ${overallStats.avgCompletion}%`, 14, 71);
    doc.text(`Avg Assessment Score: ${overallStats.overallAvgScore}%`, 14, 79);
    doc.text(`Total Assessments: ${overallStats.totalAssessments}`, 14, 87);

    // Lesson Completion Summary
    doc.addPage();
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Lesson Completion Summary', 14, 20);
    
    autoTable(doc, {
      head: [
        ['Lesson', 'Total Students', 'Completed', 'Ongoing', 'Not Started', 'Avg Progress'],
      ],
      body: filteredLessons.map((lesson) => [
        lesson.title,
        lesson.totalStudents.toString(),
        lesson.completed.toString(),
        lesson.inProgress.toString(),
        lesson.notStarted.toString(),
        `${lesson.avgProgress}%`,
      ]),
      startY: 30,
      theme: 'grid',
      headStyles: {
        fillColor: [254, 218, 94], // Yellow color #FEDA5E
        textColor: [0, 0, 0], // Black text
        fontStyle: 'bold',
        fontSize: 11,
      },
      styles: {
        fontSize: 10,
        cellPadding: 4,
        font: 'helvetica',
      },
    });

    // Assessment Scores Summary
    doc.addPage();
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Assessment Scores Summary', 14, 20);
    
    autoTable(doc, {
      head: [
        ['Lesson', 'Total Attempts', 'Avg Score', 'Highest', 'Lowest', 'Pass Rate (≥75%)'],
      ],
      body: filteredAssessments.map((assessment) => [
        assessment.title,
        assessment.totalAttempts.toString(),
        `${assessment.avgScore}%`,
        `${assessment.highestScore}%`,
        `${assessment.lowestScore}%`,
        `${assessment.passRate}%`,
      ]),
      startY: 30,
      theme: 'grid',
      headStyles: {
        fillColor: [254, 218, 94], // Yellow color #FEDA5E
        textColor: [0, 0, 0], // Black text
        fontStyle: 'bold',
        fontSize: 11,
      },
      styles: {
        fontSize: 10,
        cellPadding: 4,
        font: 'helvetica',
      },
    });

    // AI-Assisted Insights
    doc.addPage();
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('AI-Assisted Insights', 14, 20);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    let yPosition = 30;
    aiInsights.forEach((insight, index) => {
      const text = `${index + 1}. ${insight.text}`;
      const lines = doc.splitTextToSize(text, 180);
      doc.text(lines, 14, yPosition);
      yPosition += lines.length * 6 + 4;
      
      // Add new page if needed
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
    });

    doc.save('teacher_reports.pdf');
  };

  const exportCSV = () => {
    const csvContent = [
      'Lesson,Total Students,Completed,In Progress,Not Started,Avg Progress',
      ...filteredLessons.map((lesson) => [
        lesson.title,
        lesson.totalStudents,
        lesson.completed,
        lesson.inProgress,
        lesson.notStarted,
        `${lesson.avgProgress}%`,
      ].join(',')),
      '',
      'Lesson,Total Attempts,Avg Score,Highest,Lowest,Pass Rate (≥75%)',
      ...filteredAssessments.map((assessment) => [
        assessment.title,
        assessment.totalAttempts,
        `${assessment.avgScore}%`,
        `${assessment.highestScore}%`,
        `${assessment.lowestScore}%`,
        `${assessment.passRate}%`,
      ].join(',')),
      '',
      'AI-Assisted Insights',
      ...aiInsights.map((insight) => insight.text),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'teacher_reports.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Update page context for AI - Enhanced with detailed student data
  React.useEffect(() => {
    if (setPageContext) {
      // Build detailed student performance data for AI context
      const detailedStudentData = students.map(student => {
        // Get all lessons progress for this student
        const studentLessonProgress = lessons.map(lesson => {
          const lessonProgress = progress.filter(
            p => p.studentId === student.id && p.lessonId === lesson.id
          );
          
          let completionStatus = 'Not Started';
          let progressPercent = 0;
          
          if (lesson.subtopics && lesson.subtopics.length > 0) {
            const completedSubtopics = lessonProgress.filter(p => p.completed).length;
            progressPercent = Math.round((completedSubtopics / lesson.subtopics.length) * 100);
            
            if (completedSubtopics === lesson.subtopics.length) {
              completionStatus = 'Completed';
            } else if (completedSubtopics > 0) {
              completionStatus = 'In Progress';
            }
          }
          
          return {
            lessonTitle: lesson.title,
            status: completionStatus,
            progress: progressPercent,
          };
        });
        
        // Get all assessment scores for this student
        const studentAssessments = assessmentScores
          .filter(score => score.studentId === student.id)
          .map(score => {
            const assessment = mockAssessments.find(a => a.id === score.assessmentId);
            const lesson = lessons.find(l => l.id === assessment?.lessonId);
            const scorePercent = Math.round((score.score / score.maxScore) * 100);
            
            return {
              assessmentName: assessment?.title || 'Unknown Assessment',
              lessonTitle: lesson?.title || 'Unknown Lesson',
              score: scorePercent,
              passed: scorePercent >= 75,
            };
          });
        
        return {
          name: student.name,
          lessonProgress: studentLessonProgress,
          assessments: studentAssessments,
          totalLessonsCompleted: studentLessonProgress.filter(l => l.status === 'Completed').length,
          totalAssessmentsTaken: studentAssessments.length,
          averageAssessmentScore: studentAssessments.length > 0
            ? Math.round(studentAssessments.reduce((sum, a) => sum + a.score, 0) / studentAssessments.length)
            : 0,
        };
      });

      setPageContext({
        overallStats: overallStats,
        lessonCompletionData: lessonCompletionData,
        assessmentScoresData: assessmentScoresData,
        aiInsights: aiInsights,
        selectedLesson: selectedLesson,
        filteredLessonsCount: filteredLessons.length,
        filteredAssessmentsCount: filteredAssessments.length,
        // Enhanced detailed data for AI
        detailedStudentData: detailedStudentData,
        students: students,
        lessons: lessons,
        assessments: mockAssessments,
      });
    }
  }, [overallStats, lessonCompletionData, assessmentScoresData, aiInsights, selectedLesson, filteredLessons, filteredAssessments, students, lessons, progress, assessmentScores, mockAssessments, setPageContext]);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Enhanced Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="heading-font text-3xl sm:text-4xl text-[var(--primary)] mb-2 flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-[var(--primary)] shadow-md">
              <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-[var(--accent)]" />
            </div>
            <span className="leading-tight">Reports & Analytics</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-lg">Comprehensive summaries and data insights</p>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground bg-[var(--accent)]/10 px-3 py-2 rounded-lg border border-[var(--border)] w-fit">
          <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
          <span className="whitespace-nowrap">As of {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-[var(--accent)]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-[var(--accent)]/30">
                <BookOpen className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground mb-1">Total Lessons</p>
            <p className="text-2xl font-bold text-[var(--primary)]">{overallStats.totalLessons}</p>
            <p className="text-xs text-muted-foreground mt-2">{overallStats.completedLessons} completions</p>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-[var(--accent)]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Users className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-1">Active Students</p>
            <p className="text-2xl font-bold text-[var(--primary)]">{overallStats.activeStudents}/{overallStats.totalStudents}</p>
            <p className="text-xs text-muted-foreground mt-2">{Math.round((overallStats.activeStudents / overallStats.totalStudents) * 100)}% engagement</p>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-[var(--accent)]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-1">Avg Completion</p>
            <p className="text-2xl font-bold text-[var(--primary)]">{overallStats.avgCompletion}%</p>
            <p className="text-xs text-muted-foreground mt-2">{overallStats.inProgressLessons} in progress</p>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-[var(--accent)]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <Award className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-1">Avg Assessment Score</p>
            <p className="text-2xl font-bold text-[var(--primary)]">{overallStats.overallAvgScore}%</p>
            <p className="text-xs text-muted-foreground mt-2">{overallStats.totalAssessments} total attempts</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Export */}
      <Card className="border-2 shadow-sm bg-gradient-to-r from-[var(--accent)]/10 to-transparent">
        <CardContent className="pt-6 pb-6">
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-4">
            {/* Filters */}
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-[var(--primary)]" />
              <span className="font-medium text-[var(--foreground)]">Filters:</span>
            </div>
            
            <select
              value={selectedLesson}
              onChange={(e) => {
                setSelectedLesson(e.target.value);
              }}
              className="px-4 py-2 border-2 border-[var(--border)] rounded-lg bg-white text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] transition-all hover:border-[var(--accent)] cursor-pointer font-medium flex-1 sm:flex-initial"
            >
              <option value="all">All Lessons</option>
              {lessons.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.title}
                </option>
              ))}
            </select>

            {/* Export Buttons */}
            <div className="sm:ml-auto flex items-center gap-2 w-full sm:w-auto">
              <button
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:scale-105 transition-all shadow-md hover:shadow-lg"
                onClick={exportPDF}
              >
                <Download className="h-4 w-4" />
                <span className="font-medium text-sm sm:text-base">Export PDF</span>
              </button>
              <button
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-[var(--accent)] text-[var(--foreground)] rounded-lg hover:scale-105 transition-all shadow-md hover:shadow-lg border-2 border-[var(--accent)]"
                onClick={exportCSV}
              >
                <Download className="h-4 w-4" />
                <span className="font-medium text-sm sm:text-base">Export CSV</span>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lesson Completion Summary */}
      <Card className="border-2 shadow-sm hover:shadow-lg transition-all">
        <CardHeader className="bg-gradient-to-r from-[var(--accent)]/10 to-transparent pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle className="text-[var(--primary)] flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <span className="text-base sm:text-lg">Lesson Completion Summary</span>
            </CardTitle>
            <Badge className="bg-[var(--accent)]/50 text-[var(--foreground)] border-[var(--accent)] w-fit">
              {filteredLessons.length} {filteredLessons.length === 1 ? 'Lesson' : 'Lessons'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6 px-2 sm:px-6">
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b-2 border-[var(--border)]">
                  <th className="text-left p-2 sm:p-3 font-semibold text-[var(--foreground)] text-xs sm:text-sm">Lesson</th>
                  <th className="text-center p-2 sm:p-3 font-semibold text-[var(--foreground)] text-xs sm:text-sm">Total</th>
                  <th className="text-center p-2 sm:p-3 font-semibold text-[var(--foreground)] text-xs sm:text-sm">Completed</th>
                  <th className="text-center p-2 sm:p-3 font-semibold text-[var(--foreground)] text-xs sm:text-sm">Ongoing</th>
                  <th className="text-center p-2 sm:p-3 font-semibold text-[var(--foreground)] text-xs sm:text-sm">Not Started</th>
                  <th className="text-center p-2 sm:p-3 font-semibold text-[var(--foreground)] text-xs sm:text-sm">Avg Progress</th>
                </tr>
              </thead>
              <tbody>
                {filteredLessons.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No data available for selected filters
                    </td>
                  </tr>
                ) : (
                  filteredLessons.map((lesson, index) => (
                    <tr 
                      key={lesson.id} 
                      className={`border-b border-[var(--border)] hover:bg-[var(--accent)]/10 transition-all ${
                        index % 2 === 0 ? 'bg-white' : 'bg-[var(--accent)]/5'
                      }`}
                    >
                      <td className="p-2 sm:p-3 font-medium text-[var(--foreground)] text-xs sm:text-sm">{lesson.title}</td>
                      <td className="p-2 sm:p-3 text-center text-[var(--foreground)] font-semibold text-xs sm:text-sm">{lesson.totalStudents}</td>
                      <td className="p-2 sm:p-3 text-center">
                        <span className="bg-green-100 text-green-800 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold shadow-sm">
                          {lesson.completed}
                        </span>
                      </td>
                      <td className="p-2 sm:p-3 text-center">
                        <span className="bg-yellow-100 text-yellow-800 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold shadow-sm">
                          {lesson.inProgress}
                        </span>
                      </td>
                      <td className="p-2 sm:p-3 text-center">
                        <span className="bg-gray-100 text-gray-800 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold shadow-sm">
                          {lesson.notStarted}
                        </span>
                      </td>
                      <td className="p-2 sm:p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-20 sm:w-32 h-2 sm:h-3 bg-[var(--muted)] rounded-full overflow-hidden shadow-inner">
                            <div
                              className="h-full transition-all duration-500 rounded-full"
                              style={{ 
                                width: `${lesson.avgProgress}%`,
                                backgroundColor: getProgressColor(lesson.avgProgress)
                              }}
                            />
                          </div>
                          <span className="text-xs sm:text-sm font-bold text-[var(--foreground)] min-w-[2rem] sm:min-w-[2.5rem]">{lesson.avgProgress}%</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Assessment Scores Summary */}
      <Card className="border-2 shadow-sm hover:shadow-lg transition-all">
        <CardHeader className="bg-gradient-to-r from-[var(--accent)]/10 to-transparent pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle className="text-[var(--primary)] flex items-center gap-2">
              <Award className="h-5 w-5" />
              <span className="text-base sm:text-lg">Assessment Scores Summary</span>
            </CardTitle>
            <Badge className="bg-orange-100 text-orange-800 border-orange-300 w-fit">
              {filteredAssessments.length} {filteredAssessments.length === 1 ? 'Assessment' : 'Assessments'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6 px-2 sm:px-6">
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b-2 border-[var(--border)]">
                  <th className="text-left p-2 sm:p-3 font-semibold text-[var(--foreground)] text-xs sm:text-sm">Lesson</th>
                  <th className="text-center p-2 sm:p-3 font-semibold text-[var(--foreground)] text-xs sm:text-sm">Total Attempts</th>
                  <th className="text-center p-2 sm:p-3 font-semibold text-[var(--foreground)] text-xs sm:text-sm">Avg Score</th>
                  <th className="text-center p-2 sm:p-3 font-semibold text-[var(--foreground)] text-xs sm:text-sm">
                    <div className="flex items-center justify-center gap-1">
                      <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                      <span className="hidden sm:inline">Highest</span>
                      <span className="sm:hidden">High</span>
                    </div>
                  </th>
                  <th className="text-center p-2 sm:p-3 font-semibold text-[var(--foreground)] text-xs sm:text-sm">
                    <div className="flex items-center justify-center gap-1">
                      <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                      <span className="hidden sm:inline">Lowest</span>
                      <span className="sm:hidden">Low</span>
                    </div>
                  </th>
                  <th className="text-center p-2 sm:p-3 font-semibold text-[var(--foreground)] text-xs sm:text-sm">
                    <span className="hidden sm:inline">Pass Rate (≥75%)</span>
                    <span className="sm:hidden">Pass Rate</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAssessments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No assessments available for selected filters
                    </td>
                  </tr>
                ) : (
                  filteredAssessments.map((assessment, index) => (
                    <tr 
                      key={assessment.id} 
                      className={`border-b border-[var(--border)] hover:bg-[var(--accent)]/10 transition-all ${
                        index % 2 === 0 ? 'bg-white' : 'bg-[var(--accent)]/5'
                      }`}
                    >
                      <td className="p-2 sm:p-3 font-medium text-[var(--foreground)] text-xs sm:text-sm">{assessment.title}</td>
                      <td className="p-2 sm:p-3 text-center text-[var(--foreground)] font-semibold text-xs sm:text-sm">{assessment.totalAttempts}</td>
                      <td className="p-2 sm:p-3 text-center">
                        <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold shadow-sm ${
                          assessment.avgScore >= 85 
                            ? 'bg-green-100 text-green-800'
                            : assessment.avgScore >= 75
                            ? 'bg-[var(--accent)]/50 text-[var(--foreground)]'
                            : assessment.avgScore >= 60
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {assessment.avgScore}%
                        </span>
                      </td>
                      <td className="p-2 sm:p-3 text-center">
                        <span className="font-semibold text-green-700 text-xs sm:text-sm">{assessment.highestScore}%</span>
                      </td>
                      <td className="p-2 sm:p-3 text-center">
                        <span className="font-semibold text-red-700 text-xs sm:text-sm">{assessment.lowestScore}%</span>
                      </td>
                      <td className="p-2 sm:p-3 text-center">
                        <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold shadow-sm ${
                          assessment.passRate >= 80
                            ? 'bg-green-100 text-green-800'
                            : assessment.passRate >= 60
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {assessment.passRate}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* AI-Assisted Insights */}
      <AIInsightsAccordion 
        title="AI-Assisted Insights"
        description="Data-driven recommendations based on student performance"
        context="reports"
        pageContext={{
          overallStats: overallStats,
          lessonCompletionData: lessonCompletionData,
          assessmentScoresData: assessmentScoresData,
        }}
        className="bg-[var(--accent)]/10"
      />
    </div>
  );
}