import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { useReportData, useAIInsights, useLessons, useStudents } from '@/app/hooks/useData';
import { Download, FileText, Brain, TrendingUp, AlertCircle, CheckCircle, Search, SlidersHorizontal, ArrowUpDown, ArrowUp, ArrowDown, X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';

type SortField = 'studentName' | 'lessonTitle' | 'completionRate' | 'assessmentScore' | 'lastAccessed';
type SortDirection = 'asc' | 'desc';

export function AdminReportsPage() {
  const reportData = useReportData();
  const { insights } = useAIInsights();
  const { lessons } = useLessons();
  const { students } = useStudents();

  // Aggregate lesson completion data
  const lessonCompletionData = React.useMemo(() => {
    return lessons.map(lesson => {
      const lessonReports = reportData.filter(r => r.lessonTitle === lesson.title);
      const avgCompletion = lessonReports.length > 0
        ? lessonReports.reduce((sum, r) => sum + r.completionRate, 0) / lessonReports.length
        : 0;
      
      return {
        name: lesson.title.length > 15 ? lesson.title.substring(0, 15) + '...' : lesson.title,
        completion: Math.round(avgCompletion)
      };
    });
  }, [reportData, lessons]);

  // Aggregate assessment score distribution
  const assessmentDistribution = React.useMemo(() => {
    const distribution = { excellent: 0, good: 0, fair: 0, needsSupport: 0 };
    
    reportData.forEach(r => {
      if (r.assessmentScore !== null) {
        if (r.assessmentScore >= 90) distribution.excellent++;
        else if (r.assessmentScore >= 75) distribution.good++;
        else if (r.assessmentScore >= 60) distribution.fair++;
        else distribution.needsSupport++;
      }
    });

    return [
      { name: 'Excellent (90-100%)', value: distribution.excellent, color: '#22c55e' },
      { name: 'Good (75-89%)', value: distribution.good, color: '#FEDA5E' },
      { name: 'Fair (60-74%)', value: distribution.fair, color: '#fb923c' },
      { name: 'Needs Support (<60%)', value: distribution.needsSupport, color: '#ef4444' },
    ];
  }, [reportData]);

  const handleExportReport = (format: string) => {
    alert(`Export report as ${format.toUpperCase()}\nReport would include:\n- System-wide completion rates\n- Lesson-by-lesson breakdown\n- Assessment score distribution\n- Student engagement metrics\n- AI-generated insights`);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <TrendingUp className="h-5 w-5 text-blue-600" />;
    }
  };

  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortField, setSortField] = React.useState<SortField>('studentName');
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('asc');
  const [filterLesson, setFilterLesson] = React.useState<string>('all');
  const [filterCompletionRange, setFilterCompletionRange] = React.useState<string>('all');
  const [showAllRecords, setShowAllRecords] = React.useState(false);

  const filteredReportData = React.useMemo(() => {
    return reportData
      .filter(row => {
        // Search filter
        const matchesSearch = row.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             row.lessonTitle.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Lesson filter
        const matchesLesson = filterLesson === 'all' || row.lessonTitle === filterLesson;
        
        // Completion range filter
        let matchesCompletion = true;
        if (filterCompletionRange === '0-50') {
          matchesCompletion = row.completionRate < 50;
        } else if (filterCompletionRange === '50-80') {
          matchesCompletion = row.completionRate >= 50 && row.completionRate < 80;
        } else if (filterCompletionRange === '80-100') {
          matchesCompletion = row.completionRate >= 80;
        }
        
        return matchesSearch && matchesLesson && matchesCompletion;
      })
      .sort((a, b) => {
        if (sortField === 'completionRate' || sortField === 'assessmentScore') {
          const aVal = a[sortField] ?? 0;
          const bVal = b[sortField] ?? 0;
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        } else {
          return sortDirection === 'asc' ? a[sortField].localeCompare(b[sortField]) : b[sortField].localeCompare(a[sortField]);
        }
      });
  }, [reportData, searchTerm, sortField, sortDirection, filterLesson, filterCompletionRange]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(139, 111, 71); // Brown color
    doc.text('SenyamatiKard - Admin Reports', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('System-wide analytics and AI-assisted insights', 14, 28);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 34);

    let yPosition = 45;

    // Lesson Completion Rates
    doc.setFontSize(14);
    doc.setTextColor(139, 111, 71);
    doc.text('Lesson Completion Rates', 14, yPosition);
    yPosition += 5;

    const lessonData = lessonCompletionData.map(item => [
      item.name,
      `${item.completion}%`
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Lesson', 'Completion Rate']],
      body: lessonData,
      theme: 'grid',
      headStyles: {
        fillColor: [139, 111, 71],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      alternateRowStyles: {
        fillColor: [245, 251, 230],
      },
    });

    // Assessment Score Distribution
    doc.addPage();
    yPosition = 20;
    doc.setFontSize(14);
    doc.setTextColor(139, 111, 71);
    doc.text('Assessment Score Distribution', 14, yPosition);
    yPosition += 5;

    const assessmentData = assessmentDistribution.map(item => [
      item.name,
      `${item.value} students`
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Score Range', 'Count']],
      body: assessmentData,
      theme: 'grid',
      headStyles: {
        fillColor: [139, 111, 71],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      alternateRowStyles: {
        fillColor: [245, 251, 230],
      },
    });

    // Detailed Student Progress Report
    doc.addPage();
    yPosition = 20;
    doc.setFontSize(14);
    doc.setTextColor(139, 111, 71);
    doc.text('Detailed Student Progress Report', 14, yPosition);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Total Records: ${filteredReportData.length}`, 14, yPosition + 6);
    yPosition += 10;

    const tableData = filteredReportData.map(item => [
      item.studentName,
      item.lessonTitle.length > 20 ? item.lessonTitle.substring(0, 20) + '...' : item.lessonTitle,
      `${Math.round(item.completionRate)}%`,
      item.assessmentScore !== null ? `${item.assessmentScore}%` : 'N/A',
      item.lastAccessed,
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Student', 'Lesson', 'Completion', 'Assessment', 'Last Accessed']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [139, 111, 71],
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      alternateRowStyles: {
        fillColor: [245, 251, 230],
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 40 },
        2: { cellWidth: 22 },
        3: { cellWidth: 22 },
        4: { cellWidth: 30 },
      },
    });

    doc.save('SenyamatiKard_Admin_Reports.pdf');
    toast.success('PDF report exported successfully!');
  };

  const handleExportCSV = () => {
    const csvData = [
      'Student,Lesson,Completion,Assessment,Last Accessed',
      ...filteredReportData.map(item => [
        item.studentName,
        item.lessonTitle,
        `${Math.round(item.completionRate)}%`,
        item.assessmentScore !== null ? `${item.assessmentScore}%` : 'N/A',
        item.lastAccessed,
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'admin_reports.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report exported as CSV');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="space-y-4">
        <div>
          <h1 className="heading-font text-4xl text-[var(--primary)] mb-2 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--primary)] shadow-md">
              <FileText className="h-8 w-8 text-[var(--accent)]" />
            </div>
            Reports
          </h1>
          <p className="text-muted-foreground text-lg">System-wide analytics and AI-assisted insights</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleExportPDF}
            variant="outline"
            className="border-2 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)]/10 flex-1 sm:flex-none"
          >
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button 
            onClick={handleExportCSV}
            className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white flex-1 sm:flex-none"
          >
            <FileText className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lesson Completion Chart */}
        <Card className="border-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-[var(--primary)]">Lesson Completion Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={lessonCompletionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis 
                  dataKey="name" 
                  stroke="var(--muted-foreground)"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    borderColor: 'var(--border)',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => [`${value}%`, 'Completion']}
                />
                <Bar dataKey="completion" fill="#8B6F47" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Assessment Score Distribution */}
        <Card className="border-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-[var(--primary)]">Assessment Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={assessmentDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {assessmentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Report Table */}
      <Card className="border-2 shadow-sm">
        <CardHeader>
          <CardTitle className="text-[var(--primary)]">Detailed Student Progress Report</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filter and Search Bar */}
          <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg border-2">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search student or lesson..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-60"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm('')}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <Select value={filterLesson} onValueChange={setFilterLesson}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Lessons" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Lessons</SelectItem>
                  {lessons.map((lesson) => (
                    <SelectItem key={lesson.id} value={lesson.title}>
                      {lesson.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <Select value={filterCompletionRange} onValueChange={setFilterCompletionRange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Completion Rates" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Completion Rates</SelectItem>
                  <SelectItem value="0-50">Below 50% (Needs Support)</SelectItem>
                  <SelectItem value="50-80">50-79% (Fair)</SelectItem>
                  <SelectItem value="80-100">80-100% (Good/Excellent)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(searchTerm || filterLesson !== 'all' || filterCompletionRange !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setFilterLesson('all');
                  setFilterCompletionRange('all');
                }}
                className="ml-auto"
              >
                <X className="h-4 w-4 mr-1" />
                Clear Filters
              </Button>
            )}
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="border shadow-sm">
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground mb-1">Total Records</div>
                <div className="text-2xl font-bold text-[var(--primary)]">{filteredReportData.length}</div>
              </CardContent>
            </Card>
            <Card className="border shadow-sm">
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground mb-1">Avg Completion</div>
                <div className="text-2xl font-bold text-[var(--primary)]">
                  {filteredReportData.length > 0
                    ? Math.round(filteredReportData.reduce((sum, r) => sum + r.completionRate, 0) / filteredReportData.length)
                    : 0}%
                </div>
              </CardContent>
            </Card>
            <Card className="border shadow-sm">
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground mb-1">Avg Assessment</div>
                <div className="text-2xl font-bold text-[var(--primary)]">
                  {filteredReportData.filter(r => r.assessmentScore !== null).length > 0
                    ? Math.round(
                        filteredReportData
                          .filter(r => r.assessmentScore !== null)
                          .reduce((sum, r) => sum + (r.assessmentScore || 0), 0) /
                          filteredReportData.filter(r => r.assessmentScore !== null).length
                      )
                    : 'N/A'}
                  {filteredReportData.filter(r => r.assessmentScore !== null).length > 0 && '%'}
                </div>
              </CardContent>
            </Card>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-100 transition-colors select-none"
                  onClick={() => handleSort('studentName')}
                >
                  <div className="flex items-center gap-2">
                    Student
                    <div className="flex flex-col">
                      {sortField === 'studentName' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="h-4 w-4 text-[var(--primary)]" />
                        ) : (
                          <ArrowDown className="h-4 w-4 text-[var(--primary)]" />
                        )
                      ) : (
                        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-100 transition-colors select-none"
                  onClick={() => handleSort('lessonTitle')}
                >
                  <div className="flex items-center gap-2">
                    Lesson
                    <div className="flex flex-col">
                      {sortField === 'lessonTitle' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="h-4 w-4 text-[var(--primary)]" />
                        ) : (
                          <ArrowDown className="h-4 w-4 text-[var(--primary)]" />
                        )
                      ) : (
                        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </TableHead>
                <TableHead 
                  className="text-center cursor-pointer hover:bg-gray-100 transition-colors select-none"
                  onClick={() => handleSort('completionRate')}
                >
                  <div className="flex items-center justify-center gap-2">
                    Completion
                    <div className="flex flex-col">
                      {sortField === 'completionRate' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="h-4 w-4 text-[var(--primary)]" />
                        ) : (
                          <ArrowDown className="h-4 w-4 text-[var(--primary)]" />
                        )
                      ) : (
                        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </TableHead>
                <TableHead 
                  className="text-center cursor-pointer hover:bg-gray-100 transition-colors select-none min-w-[200px]"
                  onClick={() => handleSort('assessmentScore')}
                >
                  <div className="flex items-center justify-center gap-2">
                    Assessment
                    <div className="flex flex-col">
                      {sortField === 'assessmentScore' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="h-4 w-4 text-[var(--primary)]" />
                        ) : (
                          <ArrowDown className="h-4 w-4 text-[var(--primary)]" />
                        )
                      ) : (
                        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-100 transition-colors select-none"
                  onClick={() => handleSort('lastAccessed')}
                >
                  <div className="flex items-center gap-2">
                    Last Accessed
                    <div className="flex flex-col">
                      {sortField === 'lastAccessed' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="h-4 w-4 text-[var(--primary)]" />
                        ) : (
                          <ArrowDown className="h-4 w-4 text-[var(--primary)]" />
                        )
                      ) : (
                        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReportData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No records found. Try adjusting your filters.
                  </TableCell>
                </TableRow>
              ) : (
                (showAllRecords ? filteredReportData : filteredReportData.slice(0, 10)).map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{row.studentName}</TableCell>
                    <TableCell className="text-sm">{row.lessonTitle}</TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        className={
                          row.completionRate >= 80 
                            ? 'bg-green-100 text-green-800 border-green-200' 
                            : row.completionRate >= 50 
                            ? 'bg-yellow-100 text-yellow-800 border-yellow-200' 
                            : 'bg-red-100 text-red-800 border-red-200'
                        }
                      >
                        {Math.round(row.completionRate)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {row.assessmentScore !== null ? (
                        <Badge 
                          className={
                            row.assessmentScore >= 80 
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : row.assessmentScore >= 60 
                              ? 'bg-yellow-100 text-yellow-800 border-yellow-200' 
                              : 'bg-red-100 text-red-800 border-red-200'
                          }
                        >
                          {row.assessmentScore}%
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{row.lastAccessed}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {!showAllRecords && filteredReportData.length > 10 && (
            <div className="mt-6 text-center">
              <Button 
                variant="outline" 
                className="border-2 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)]/10"
                onClick={() => setShowAllRecords(true)}
              >
                View All {filteredReportData.length} Records
              </Button>
            </div>
          )}
          {showAllRecords && filteredReportData.length > 10 && (
            <div className="mt-6 text-center">
              <Button 
                variant="outline" 
                className="border-2"
                onClick={() => setShowAllRecords(false)}
              >
                Show Less
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}