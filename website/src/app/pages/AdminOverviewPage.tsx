import React, { useState, useEffect } from 'react';
import { StatCard } from '@/app/components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Users, BookOpen, School, BarChart3, TrendingUp, Activity, Sparkles, ArrowUpRight, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { useDashboardStats, useLessons } from '@/app/hooks/useData';
import { useDataContext } from '@/app/contexts/DataContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell } from 'recharts';
import { Badge } from '@/app/components/ui/badge';
import apiService from '@/app/services/apiService';

export function AdminOverviewPage() {
  const [apiStats, setApiStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const stats = useDashboardStats();
  const { teachers, classes, schools } = useDataContext();
  const { lessons } = useLessons();

  // Fetch admin dashboard stats and chart data from API
  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiService.getAdminDashboard(),
      apiService.getAdminCharts()
    ])
      .then(([dashboardRes, chartsRes]) => {
        if (dashboardRes.success && dashboardRes.data) {
          setApiStats(dashboardRes.data);
          console.log('✅ Loaded admin dashboard stats from API:', dashboardRes.data);
        }
        if (chartsRes.success && chartsRes.data) {
          setChartData(chartsRes.data);
          console.log('✅ Loaded admin chart data from API:', chartsRes.data);
        }
      })
      .catch(err => {
        console.warn('⚠️ Failed to load admin data, using calculated data:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Use API stats if available, otherwise use calculated stats
  const displayStats = apiStats || {
    totalTeachers: teachers.length,
    totalClasses: classes.length,
    totalLessons: lessons.length,
    totalStudents: stats.totalStudents,
    totalSchools: schools.length,
  };

  // Platform usage data for chart - use API data or fallback
  const platformUsageData = React.useMemo(() => {
    if (chartData?.platformUsage && chartData.platformUsage.length > 0) {
      return chartData.platformUsage;
    }
    // Fallback
    return [
      { name: 'Mon', sessions: 0, users: 0 },
      { name: 'Tue', sessions: 0, users: 0 },
      { name: 'Wed', sessions: 0, users: 0 },
      { name: 'Thu', sessions: 0, users: 0 },
      { name: 'Fri', sessions: 0, users: 0 },
      { name: 'Sat', sessions: 0, users: 0 },
      { name: 'Sun', sessions: 0, users: 0 },
    ];
  }, [chartData]);

  // System health metrics - use API data or fallback
  const systemHealth = React.useMemo(() => {
    if (chartData?.systemHealth && chartData.systemHealth.length > 0) {
      return chartData.systemHealth;
    }
    return [
      { metric: 'Active Users', value: 0, color: '#22c55e' },
      { metric: 'Lesson Completion', value: stats.overallCompletionRate || 0, color: '#FEDA5E' },
      { metric: 'Assessment Pass Rate', value: stats.avgAssessmentScore || 0, color: '#8B6F47' },
      { metric: 'Teacher Engagement', value: teachers.length > 0 ? 100 : 0, color: '#D4A017' },
    ];
  }, [chartData, stats, teachers]);

  // School distribution data - use API data or calculate from context
  const schoolDistribution = React.useMemo(() => {
    if (chartData?.schoolDistribution && chartData.schoolDistribution.length > 0) {
      return chartData.schoolDistribution;
    }
    // Calculate from classes
    const colors = ['#8B6F47', '#FEDA5E', '#D4A017', '#22c55e', '#3b82f6'];
    return schools.map((school, i) => {
      const schoolClasses = classes.filter(c => c.schoolId === school.id);
      const studentCount = schoolClasses.reduce((sum, c) => sum + (c.studentCount || 0), 0);
      return {
        name: school.name,
        students: studentCount,
        color: colors[i % colors.length]
      };
    });
  }, [chartData, schools, classes]);

  // Recent activity - use API data or fallback
  const recentSystemActivity = React.useMemo(() => {
    if (chartData?.recentActivity && chartData.recentActivity.length > 0) {
      return chartData.recentActivity;
    }
    return [
      { type: 'success', title: 'System ready', description: 'All services operational', time: 'Just now' },
      { type: 'info', title: 'Data loaded', description: `${teachers.length} teachers, ${classes.length} classes`, time: '1 min ago' },
    ];
  }, [chartData, teachers, classes]);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-font text-4xl text-[var(--primary)] mb-2 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--primary)] shadow-md">
              <Sparkles className="h-8 w-8 text-[var(--accent)]" />
            </div>
            System Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">Real-time platform overview and analytics</p>
        </div>
        <div className="hidden lg:flex flex-col gap-2">
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-transparent rounded-lg border-2 border-green-200">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-green-700">All Systems Operational</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)]/10 rounded-lg border border-[var(--border)]">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Last updated: Just now</span>
          </div>
        </div>
      </div>

      {/* Key System Metrics - Enhanced Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-2 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-[var(--accent)] cursor-pointer group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[var(--accent)]/20 to-transparent rounded-full -translate-y-16 translate-x-16" />
          <CardContent className="pt-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                Active
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Total Teachers</p>
            <p className="text-3xl font-bold text-[var(--primary)] group-hover:scale-105 transition-transform">{teachers.length}</p>
            <p className="text-xs text-muted-foreground mt-2">Educators in system</p>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-[var(--accent)] cursor-pointer group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[var(--accent)]/20 to-transparent rounded-full -translate-y-16 translate-x-16" />
          <CardContent className="pt-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-purple-100">
                <School className="h-6 w-6 text-purple-600" />
              </div>
              <Badge className="bg-blue-100 text-blue-700">{classes.length} active</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Total Classes</p>
            <p className="text-3xl font-bold text-[var(--primary)] group-hover:scale-105 transition-transform">{classes.length}</p>
            <p className="text-xs text-muted-foreground mt-2">Across 3 schools</p>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-[var(--accent)] cursor-pointer group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[var(--accent)]/20 to-transparent rounded-full -translate-y-16 translate-x-16" />
          <CardContent className="pt-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-[var(--accent)]/30">
                <BookOpen className="h-6 w-6 text-[var(--primary)]" />
              </div>
              <Badge className="bg-green-100 text-green-700">{lessons.filter(l => l.hasAssessment).length} assessed</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Total Lessons</p>
            <p className="text-3xl font-bold text-[var(--primary)] group-hover:scale-105 transition-transform">{lessons.length}</p>
            <p className="text-xs text-muted-foreground mt-2">In curriculum</p>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-[var(--accent)] cursor-pointer group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[var(--accent)]/20 to-transparent rounded-full -translate-y-16 translate-x-16" />
          <CardContent className="pt-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-green-100">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <Badge className="bg-green-100 text-green-700">{stats.activeStudents} active</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Total Students</p>
            <p className="text-3xl font-bold text-[var(--primary)] group-hover:scale-105 transition-transform">{stats.totalStudents}</p>
            <p className="text-xs text-muted-foreground mt-2">Enrolled learners</p>
          </CardContent>
        </Card>
      </div>

      {/* System Health Overview */}
      <Card className="border-2 shadow-sm hover:shadow-lg transition-all">
        <CardHeader className="bg-gradient-to-r from-[var(--accent)]/10 to-transparent items-center pb-3">
          <CardTitle className="text-[var(--primary)] flex items-center gap-2 my-0">
            <Activity className="h-5 w-5" />
            System Health Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {systemHealth.map((item, index) => (
              <div key={index} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[var(--foreground)]">{item.metric}</span>
                  <span className="text-lg font-bold text-[var(--primary)]">{item.value}%</span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${item.value}%`,
                      backgroundColor: item.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Platform Usage Chart - Takes 2 columns */}
        <Card className="border-2 shadow-sm hover:shadow-lg transition-all lg:col-span-2">
          <CardHeader className="bg-gradient-to-r from-[var(--accent)]/10 to-transparent items-center pb-3">
            <CardTitle className="text-[var(--primary)] flex items-center gap-2 my-0">
              <TrendingUp className="h-5 w-5" />
              Platform Usage - Last 7 Days
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={platformUsageData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--foreground)" fontSize={12} />
                <YAxis stroke="var(--foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                    borderRadius: '8px',
                    border: '2px solid'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sessions"
                  stroke="#D4A017"
                  strokeWidth={3}
                  name="Sessions"
                  dot={{ fill: '#D4A017', r: 5 }}
                  activeDot={{ r: 7 }}
                />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#8B6F47"
                  strokeWidth={3}
                  name="Active Users"
                  dot={{ fill: '#8B6F47', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Student Distribution by School */}
        <Card className="border-2 shadow-sm hover:shadow-lg transition-all">
          <CardHeader className="bg-gradient-to-r from-[var(--accent)]/10 to-transparent items-center pb-3">
            <CardTitle className="text-[var(--primary)] flex items-center gap-2 my-0">
              <School className="h-5 w-5" />
              Student Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={schoolDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  fill="#8884d8"
                  dataKey="students"
                  paddingAngle={3}
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {schoolDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {schoolDistribution.map((school, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: school.color }} />
                    <span className="text-muted-foreground">{school.name}</span>
                  </div>
                  <span className="font-semibold text-[var(--foreground)]">{school.students}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Performance Stats */}
        <Card className="border-2 shadow-sm hover:shadow-lg transition-all">
          <CardHeader className="bg-gradient-to-r from-[var(--accent)]/10 to-transparent items-center pb-3">
            <CardTitle className="text-[var(--primary)] flex items-center gap-2 my-0">
              <BarChart3 className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-transparent rounded-lg border-l-4 border-green-500">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Overall Completion</p>
                  <p className="text-2xl font-bold text-[var(--primary)]">{stats.overallCompletionRate}%</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[var(--accent)]/20 to-transparent rounded-lg border-l-4 border-[var(--accent)]">
              <div className="flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-[var(--primary)]" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Assessment Score</p>
                  <p className="text-2xl font-bold text-[var(--primary)]">{stats.avgAssessmentScore}%</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-transparent rounded-lg border-l-4 border-blue-500">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Engagement Time</p>
                  <p className="text-2xl font-bold text-[var(--primary)]">{stats.avgEngagementTime} min</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent System Activity */}
        <Card className="border-2 shadow-sm hover:shadow-lg transition-all">
          <CardHeader className="bg-gradient-to-r from-[var(--accent)]/10 to-transparent items-center pb-3">
            <CardTitle className="text-[var(--primary)] flex items-center gap-2 my-0">
              <Activity className="h-5 w-5" />
              Recent System Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {recentSystemActivity.map((activity: any, index: number) => (
                <div 
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-lg border hover:shadow-md transition-all ${
                    activity.type === 'success' ? 'bg-green-50 border-green-200' :
                    activity.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    activity.type === 'success' ? 'bg-green-500' :
                    activity.type === 'warning' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}