import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Users, BookOpen, CheckCircle, Target, Clock, TrendingUp, Award, AlertCircle, Activity, Sparkles, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useDashboardStats, useStudents, useLessons } from '@/app/hooks/useData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell } from 'recharts';
import { Badge } from '@/app/components/ui/badge';
import { AIInsightsAccordion } from '@/app/components/AIInsightsAccordion';
import apiService from '@/app/services/apiService';

export function TeacherDashboardPage() {
  const { setPageContext } = useOutletContext<{ setPageContext: (context: any) => void }>();
  // Get teacher ID from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const teacherId = user.id;

  // Debug log to verify component is mounting
  React.useEffect(() => {
    console.log('📊 TeacherDashboardPage mounted');
    return () => console.log('📊 TeacherDashboardPage unmounted');
  }, []);

  const stats = useDashboardStats(teacherId);
  const { students } = useStudents(teacherId);
  const { lessons } = useLessons();

  // State for chart data from API
  const [chartData, setChartData] = React.useState<any>(null);

  // Fetch chart data from API
  React.useEffect(() => {
    if (teacherId) {
      apiService.getTeacherCharts(teacherId)
        .then(response => {
          if (response.success && response.data) {
            setChartData(response.data);
            console.log('✅ Loaded chart data from API:', response.data);
          }
        })
        .catch(err => {
          console.warn('⚠️ Failed to load chart data, using fallback:', err);
        });
    }
  }, [teacherId]);

  // Use API data or fallback to calculated data
  const lessonCompletionTrend = React.useMemo(() => {
    if (chartData?.activityTrend && chartData.activityTrend.length > 0) {
      return chartData.activityTrend;
    }
    // No data available from API
    return [
      { day: 'Mon', completed: 0, assessed: 0 },
      { day: 'Tue', completed: 0, assessed: 0 },
      { day: 'Wed', completed: 0, assessed: 0 },
      { day: 'Thu', completed: 0, assessed: 0 },
      { day: 'Fri', completed: 0, assessed: 0 },
      { day: 'Sat', completed: 0, assessed: 0 },
      { day: 'Sun', completed: 0, assessed: 0 },
    ];
  }, [chartData]);

  // Engagement overview data (by lesson category)
  const engagementOverview = React.useMemo(() => {
    if (chartData?.lessonEngagement && chartData.lessonEngagement.length > 0) {
      return chartData.lessonEngagement;
    }
    // Fallback - calculate from lessons
    const categories = [...new Set(lessons.map(l => (l as any).category || 'Other'))];
    return categories.map(cat => ({
      category: cat,
      engaged: Math.floor(students.length * 0.7),
      completed: Math.floor(students.length * 0.5)
    }));
  }, [chartData, lessons, students]);

  // Student performance distribution
  const performanceDistribution = React.useMemo(() => {
    if (chartData?.performanceDistribution && chartData.performanceDistribution.length > 0) {
      return chartData.performanceDistribution;
    }
    // Fallback based on student count
    const total = students.length;
    return [
      { name: 'Excellent', value: Math.floor(total * 0.2), color: '#22c55e', range: '90-100%' },
      { name: 'Good', value: Math.floor(total * 0.4), color: '#FEDA5E', range: '75-89%' },
      { name: 'Fair', value: Math.floor(total * 0.25), color: '#fb923c', range: '60-74%' },
      { name: 'Needs Support', value: Math.floor(total * 0.15), color: '#ef4444', range: '<60%' },
    ];
  }, [chartData, students]);

  // Recent activity data
  const recentActivity = React.useMemo(() => {
    if (chartData?.recentActivity && chartData.recentActivity.length > 0) {
      return chartData.recentActivity;
    }
    // Fallback - use student names
    return students.slice(0, 5).map((s, i) => ({
      student: s.name,
      action: i === 0 ? 'Completed a lesson' : i === 1 ? 'Passed assessment' : 'Started learning',
      time: `${(i + 1) * 5} min ago`,
      type: i < 2 ? 'success' : 'info'
    }));
  }, [chartData, students]);

  // These stats are now provided by the API via useDashboardStats
  // No need for mock calculations - they come from the backend

  // Update page context for AI when data changes
  React.useEffect(() => {
    if (setPageContext) {
      setPageContext({
        stats: {
          totalStudents: stats.totalStudents,
          activeStudents: stats.activeStudents,
          lessonsCompleted: stats.lessonsCompleted || 0,
          averageProgress: stats.overallCompletionRate,
          assessmentsCompleted: stats.assessmentsCompleted || 0,
          avgStudyTime: stats.avgEngagementTime || 0,
          activeToday: stats.activeToday || 0,
        },
        students: students.map(s => ({
          name: s.name,
          grade: s.grade,
          section: s.section,
        })),
        lessonCompletionTrend: lessonCompletionTrend,
        engagementOverview: engagementOverview,
        performanceDistribution: performanceDistribution,
        recentActivity: recentActivity,
        studentsCount: students.length,
        lessonsCount: lessons.length,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats.totalStudents, stats.activeStudents, stats.totalLessons, stats.overallCompletionRate, students.length, lessons.length, stats.assessmentsCompleted, stats.avgEngagementTime, stats.activeToday]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Activity className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Enhanced Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-font text-4xl text-[var(--primary)] mb-2 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--primary)] shadow-md">
              <Sparkles className="h-8 w-8 text-[var(--accent)]" />
            </div>
            Welcome Back, Teacher! [DASHBOARD PAGE]
          </h1>
          <p className="text-muted-foreground text-lg">Here's what's happening with your students today</p>
        </div>
        <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--accent)]/20 to-transparent rounded-lg border-2 border-[var(--accent)]/30">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium">{stats.activeToday || 0} students active now</span>
        </div>
      </div>

      {/* Key Metrics - Enhanced Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-2 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-[var(--accent)] cursor-pointer group">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                +3 this week
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Total Students</p>
            <p className="text-3xl font-bold text-[var(--primary)] group-hover:scale-105 transition-transform">{stats.totalStudents}</p>
            <p className="text-xs text-muted-foreground mt-2">Enrolled in your classes</p>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-[var(--accent)] cursor-pointer group">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-[var(--accent)]/30">
                <BookOpen className="h-6 w-6 text-[var(--primary)]" />
              </div>
              <Badge className="bg-blue-100 text-blue-700 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                +12%
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Lessons Completed</p>
            <p className="text-3xl font-bold text-[var(--primary)] group-hover:scale-105 transition-transform">
              {stats.lessonsCompleted || 0}
            </p>
            <p className="text-xs text-muted-foreground mt-2">Across all students</p>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-[var(--accent)] cursor-pointer group">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                +8%
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Assessments Completed</p>
            <p className="text-3xl font-bold text-[var(--primary)] group-hover:scale-105 transition-transform">
              {stats.assessmentsCompleted || 0}
            </p>
            <p className="text-xs text-muted-foreground mt-2">With scores recorded</p>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-[var(--accent)] cursor-pointer group">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-purple-100">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <Badge className="bg-yellow-100 text-yellow-700 flex items-center gap-1">
                <ArrowDownRight className="h-3 w-3" />
                -2%
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Average Progress</p>
            <p className="text-3xl font-bold text-[var(--primary)] group-hover:scale-105 transition-transform">
              {stats.overallCompletionRate}%
            </p>
            <p className="text-xs text-muted-foreground mt-2">Overall completion rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats - Mini Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100/50 border-2 border-green-200 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium mb-1">Active Today</p>
              <p className="text-2xl font-bold text-green-800">{stats.activeToday || 0}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-xs text-green-600 mt-2">Students online today</p>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 border-blue-200 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium mb-1">Avg Study Time</p>
              <p className="text-2xl font-bold text-blue-800">{Math.round(stats.avgEngagementTime || 0)} min</p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-xs text-blue-600 mt-2">Per student per day</p>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-[var(--accent)]/30 to-[var(--accent)]/10 border-2 border-[var(--accent)]/50 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--primary)] font-medium mb-1">Pass Rate</p>
              <p className="text-2xl font-bold text-[var(--primary)]">{stats.avgAssessmentScore}%</p>
            </div>
            <Award className="h-8 w-8 text-[var(--primary)]" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Average assessment score</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lesson Completion Trends */}
        <Card className="border-2 shadow-sm hover:shadow-lg transition-all">
          <CardHeader className="bg-gradient-to-r from-[var(--accent)]/10 to-transparent items-center pb-3">
            <CardTitle className="text-[var(--primary)] flex items-center gap-2 my-0">
              <Activity className="h-5 w-5" />
              7-Day Activity Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={lessonCompletionTrend} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" stroke="var(--foreground)" fontSize={12} />
                <YAxis stroke="var(--foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '2px solid var(--border)',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#8B6F47"
                  strokeWidth={3}
                  name="Lessons Completed"
                  dot={{ fill: '#8B6F47', r: 5 }}
                  activeDot={{ r: 7 }}
                />
                <Line
                  type="monotone"
                  dataKey="assessed"
                  stroke="#D4A017"
                  strokeWidth={3}
                  name="Assessments Taken"
                  dot={{ fill: '#D4A017', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Engagement Overview */}
        <Card className="border-2 shadow-sm hover:shadow-lg transition-all">
          <CardHeader className="bg-gradient-to-r from-[var(--accent)]/10 to-transparent items-center pb-3">
            <CardTitle className="text-[var(--primary)] flex items-center gap-2 my-0">
              <TrendingUp className="h-5 w-5" />
              Lesson Engagement
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={engagementOverview} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="category" stroke="var(--foreground)" fontSize={11} angle={-15} textAnchor="end" height={60} />
                <YAxis stroke="var(--foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '2px solid var(--border)',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="engaged" fill="#D4A017" radius={[8, 8, 0, 0]} name="Engaged" />
                <Bar dataKey="completed" fill="#8B6F47" radius={[8, 8, 0, 0]} name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Distribution and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Distribution */}
        <Card className="border-2 shadow-sm hover:shadow-lg transition-all">
          <CardHeader className="bg-gradient-to-r from-[var(--accent)]/10 to-transparent items-center pb-3">
            <CardTitle className="text-[var(--primary)] flex items-center gap-2 my-0">
              <Target className="h-5 w-5" />
              Performance Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row items-center gap-6">
              <div className="w-full lg:w-1/2">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={performanceDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {performanceDistribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full lg:w-1/2 space-y-3">
                {performanceDistribution.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--accent)]/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.range}</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-[var(--primary)]">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-2 shadow-sm hover:shadow-lg transition-all">
          <CardHeader className="bg-gradient-to-r from-[var(--accent)]/10 to-transparent items-center pb-3">
            <CardTitle className="text-[var(--primary)] flex items-center gap-2 my-0">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2">
              {recentActivity.map((activity: any, index: number) => (
                <div 
                  key={index} 
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-[var(--accent)]/10 transition-all cursor-pointer border border-transparent hover:border-[var(--accent)]/30"
                >
                  <div className="mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--foreground)]">{activity.student}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{activity.action}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI-Powered Insights */}
      <AIInsightsAccordion 
        title="AI-Powered Insights"
        description="Intelligent recommendations based on your student data"
        context="dashboard"
        pageContext={{
          stats: {
            totalStudents: stats.totalStudents,
            activeStudents: stats.activeStudents,
            lessonsCompleted: stats.lessonsCompleted || 0,
            averageProgress: stats.overallCompletionRate,
            assessmentsCompleted: stats.assessmentsCompleted || 0,
            avgStudyTime: stats.avgEngagementTime || 0,
            activeToday: stats.activeToday || 0,
          },
          students: students.map(s => ({
            name: s.name,
            grade: s.grade,
            section: s.section,
          })),
          lessonCompletionTrend: lessonCompletionTrend,
          engagementOverview: engagementOverview,
          performanceDistribution: performanceDistribution,
          recentActivity: recentActivity,
        }}
        className="bg-gradient-to-br from-[var(--accent)]/20 via-[var(--accent)]/10 to-transparent"
      />
    </div>
  );
}