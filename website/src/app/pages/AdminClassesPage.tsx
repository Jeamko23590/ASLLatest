import React from 'react';
import { Card, CardContent, CardHeader } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { useDataContext } from '@/app/contexts/DataContext';
import { School as SchoolIcon, Plus, Edit, Trash2, ChevronDown, ChevronRight, Users, Search, X, BookOpen } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/app/components/ui/alert-dialog';
import { toast } from 'sonner';

type ModalType = 'addSchool' | 'addClass' | 'editClass' | null;

interface ClassFormData {
  id?: string;
  schoolId: string;
  grade: string;
  section: string;
  teacherId: string | null;
  studentCount: number;
}

export function AdminClassesPage() {
  const { schools, classes, teachers, addSchool, addClass, updateClass, deleteClass, deleteSchool } = useDataContext();
  const [expandedSchools, setExpandedSchools] = React.useState<string[]>([schools[0]?.id || '']);
  const [modalType, setModalType] = React.useState<ModalType>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [deleteTarget, setDeleteTarget] = React.useState<{ type: 'school' | 'class'; id: string; name: string } | null>(null);
  
  // Form states
  const [schoolName, setSchoolName] = React.useState('');
  const [selectedSchoolId, setSelectedSchoolId] = React.useState('');
  const [classFormData, setClassFormData] = React.useState<ClassFormData>({
    schoolId: '',
    grade: '',
    section: '',
    teacherId: null,
    studentCount: 0,
  });

  const toggleSchool = (schoolId: string) => {
    setExpandedSchools(prev =>
      prev.includes(schoolId)
        ? prev.filter(id => id !== schoolId)
        : [...prev, schoolId]
    );
  };

  const getTeacherName = (teacherId: string | null) => {
    if (!teacherId) return 'Unassigned';
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.name : 'Unknown';
  };

  const generateId = (prefix: string) => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${prefix}-${timestamp}-${random}`;
  };

  const handleAddSchool = () => {
    setSchoolName('');
    setModalType('addSchool');
  };

  const handleSaveSchool = () => {
    if (!schoolName.trim()) {
      toast.error('Please enter a school name');
      return;
    }

    const newSchool = {
      id: generateId('school'),
      name: schoolName.trim(),
    };

    try {
      addSchool(newSchool);
      toast.success(`School "${schoolName}" added successfully!`);
      setModalType(null);
      setSchoolName('');
      // Auto-expand the newly added school
      setExpandedSchools(prev => [...prev, newSchool.id]);
    } catch (error) {
      toast.error('Failed to add school');
    }
  };

  const handleAddClass = (schoolId: string) => {
    const school = schools.find(s => s.id === schoolId);
    setClassFormData({
      schoolId,
      grade: '',
      section: '',
      teacherId: null,
      studentCount: 0,
    });
    setSelectedSchoolId(schoolId);
    setModalType('addClass');
  };

  const handleEditClass = (classId: string) => {
    const cls = classes.find(c => c.id === classId);
    if (!cls) return;

    setClassFormData({
      id: cls.id,
      schoolId: cls.schoolId,
      grade: cls.grade,
      section: cls.section,
      teacherId: cls.teacherId,
      studentCount: cls.studentCount,
    });
    setSelectedSchoolId(cls.schoolId);
    setModalType('editClass');
  };

  const handleSaveClass = () => {
    if (!classFormData.grade.trim() || !classFormData.section.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const school = schools.find(s => s.id === classFormData.schoolId);
    if (!school) {
      toast.error('School not found');
      return;
    }

    try {
      if (modalType === 'editClass' && classFormData.id) {
        // Update existing class
        updateClass(classFormData.id, {
          grade: classFormData.grade.trim(),
          section: classFormData.section.trim(),
          teacherId: classFormData.teacherId,
          studentCount: classFormData.studentCount,
        });
        toast.success('Class updated successfully!');
      } else {
        // Add new class
        const newClass = {
          id: generateId('class'),
          schoolId: classFormData.schoolId,
          schoolName: school.name,
          grade: classFormData.grade.trim(),
          section: classFormData.section.trim(),
          teacherId: classFormData.teacherId,
          studentCount: classFormData.studentCount,
        };
        addClass(newClass);
        toast.success('Class added successfully!');
      }
      setModalType(null);
      resetClassForm();
    } catch (error) {
      toast.error('Failed to save class');
    }
  };

  const handleDeleteClass = (classId: string) => {
    const cls = classes.find(c => c.id === classId);
    if (!cls) return;
    
    setDeleteTarget({
      type: 'class',
      id: classId,
      name: `${cls.grade} - ${cls.section}`,
    });
  };

  const handleDeleteSchool = (schoolId: string) => {
    const school = schools.find(s => s.id === schoolId);
    if (!school) return;

    const schoolClasses = classes.filter(c => c.schoolId === schoolId);
    if (schoolClasses.length > 0) {
      toast.error('Cannot delete school with existing classes. Please delete all classes first.');
      return;
    }

    setDeleteTarget({
      type: 'school',
      id: schoolId,
      name: school.name,
    });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;

    try {
      if (deleteTarget.type === 'class') {
        deleteClass(deleteTarget.id);
        toast.success(`Class "${deleteTarget.name}" deleted successfully`);
      } else {
        deleteSchool(deleteTarget.id);
        toast.success(`School "${deleteTarget.name}" deleted successfully`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete');
    } finally {
      setDeleteTarget(null);
    }
  };

  const resetClassForm = () => {
    setClassFormData({
      schoolId: '',
      grade: '',
      section: '',
      teacherId: null,
      studentCount: 0,
    });
    setSelectedSchoolId('');
  };

  // Filter schools based on search
  const filteredSchools = schools.filter(school => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const schoolMatches = school.name.toLowerCase().includes(query);
    
    // Also search in classes
    const schoolClasses = classes.filter(c => c.schoolId === school.id);
    const classMatches = schoolClasses.some(cls => 
      cls.grade.toLowerCase().includes(query) ||
      cls.section.toLowerCase().includes(query) ||
      getTeacherName(cls.teacherId).toLowerCase().includes(query)
    );
    
    return schoolMatches || classMatches;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="space-y-4">
        <div>
          <h1 className="heading-font text-4xl text-[var(--primary)] mb-2 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--primary)] shadow-md">
              <SchoolIcon className="h-8 w-8 text-[var(--accent)]" />
            </div>
            Classes
          </h1>
          <p className="text-muted-foreground text-lg">Manage schools, classes, and sections</p>
        </div>
        <Button 
          onClick={handleAddSchool}
          className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add School
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Total Schools</p>
                <p className="text-3xl font-bold text-[var(--primary)]">{schools.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-[var(--accent)]/20">
                <SchoolIcon className="h-10 w-10 text-[var(--primary)]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Total Classes</p>
                <p className="text-3xl font-bold text-[var(--primary)]">{classes.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-[var(--accent)]/20">
                <BookOpen className="h-10 w-10 text-[var(--primary)]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Total Students</p>
                <p className="text-3xl font-bold text-[var(--primary)]">
                  {classes.reduce((sum, cls) => sum + cls.studentCount, 0)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[var(--accent)]/20">
                <Users className="h-10 w-10 text-[var(--primary)]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card className="border-2 shadow-sm">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search schools, classes, sections, or teachers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Schools and Classes */}
      <div className="space-y-4">
        {filteredSchools.length === 0 ? (
          <Card className="border-2 border-dashed shadow-sm">
            <CardContent className="py-12 text-center">
              <SchoolIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg mb-2">
                {searchQuery ? 'No schools or classes match your search' : 'No schools yet'}
              </p>
              {!searchQuery && (
                <Button 
                  onClick={handleAddSchool}
                  className="mt-4 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-[var(--foreground)]"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First School
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredSchools.map((school) => {
            const schoolClasses = classes.filter(c => c.schoolId === school.id);
            const isExpanded = expandedSchools.includes(school.id);

            return (
              <Card key={school.id} className="border-2 shadow-sm hover:shadow-md transition-all">
                <CardHeader className="cursor-pointer hover:bg-[var(--accent)]/5 transition-colors pt-5 pb-4" onClick={() => toggleSchool(school.id)}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0 flex-1">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--primary)] transition-transform flex-shrink-0 mt-1" />
                      ) : (
                        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--primary)] transition-transform flex-shrink-0 mt-1" />
                      )}
                      <SchoolIcon className="h-5 w-5 sm:h-6 sm:w-6 text-[var(--primary)] flex-shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <span className="text-base sm:text-xl font-semibold text-[var(--primary)] block break-words line-clamp-2">{school.name}</span>
                        <Badge variant="outline" className="border-[var(--primary)] text-[var(--primary)] text-xs mt-1 inline-block sm:hidden">
                          {schoolClasses.length} {schoolClasses.length === 1 ? 'class' : 'classes'}
                        </Badge>
                      </div>
                      <Badge variant="outline" className="border-[var(--primary)] text-[var(--primary)] text-xs sm:text-sm hidden sm:inline-flex flex-shrink-0">
                        {schoolClasses.length} {schoolClasses.length === 1 ? 'class' : 'classes'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddClass(school.id);
                        }}
                        size="sm"
                        className="bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-[var(--foreground)] shadow-sm hover:shadow-md transition-all"
                      >
                        <Plus className="h-4 w-4 sm:h-3 sm:w-3 sm:mr-1" />
                        <span className="hidden sm:inline">Add Class</span>
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSchool(school.id);
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                {isExpanded && (
                  <CardContent className="pt-0">
                    {schoolClasses.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed rounded-lg bg-[var(--accent)]/5">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                        <p className="text-muted-foreground italic mb-3">
                          No classes in this school yet
                        </p>
                        <Button
                          onClick={() => handleAddClass(school.id)}
                          size="sm"
                          className="bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-[var(--foreground)]"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add First Class
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {schoolClasses.map((cls) => (
                          <div 
                            key={cls.id} 
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border-2 border-[var(--border)] rounded-lg hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 transition-all gap-3"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-[var(--foreground)] text-base sm:text-lg">
                                {cls.grade} - {cls.section}
                              </p>
                              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                                Teacher: <span className="font-medium">{getTeacherName(cls.teacherId)}</span>
                              </p>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                              <Badge className="bg-[var(--accent)]/20 text-[var(--foreground)] border border-[var(--accent)]/40 text-xs">
                                {cls.studentCount} {cls.studentCount === 1 ? 'student' : 'students'}
                              </Badge>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditClass(cls.id)}
                                  className="text-[var(--primary)] hover:text-[var(--primary)]/80 hover:bg-[var(--accent)]/20 h-8 w-8 p-0"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClass(cls.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Add School Modal */}
      <Dialog open={modalType === 'addSchool'} onOpenChange={(open) => !open && setModalType(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[var(--primary)] flex items-center gap-2">
              <SchoolIcon className="h-6 w-6" />
              Add New School
            </DialogTitle>
            <DialogDescription>
              Create a new school to organize your classes. You can add classes to this school afterwards.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="school-name">School Name *</Label>
              <Input
                id="school-name"
                placeholder="e.g., San Jose Elementary School"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveSchool()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModalType(null)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveSchool}
              className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add School
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Class Modal */}
      <Dialog open={modalType === 'addClass' || modalType === 'editClass'} onOpenChange={(open) => !open && setModalType(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[var(--primary)] flex items-center gap-2">
              <Users className="h-6 w-6" />
              {modalType === 'editClass' ? 'Edit Class' : 'Add New Class'}
            </DialogTitle>
            <DialogDescription>
              {modalType === 'editClass' 
                ? 'Update the class information below.'
                : `Add a new class to ${schools.find(s => s.id === selectedSchoolId)?.name || 'this school'}.`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grade">Grade Level *</Label>
                <Input
                  id="grade"
                  placeholder="e.g., Grade 3"
                  value={classFormData.grade}
                  onChange={(e) => setClassFormData(prev => ({ ...prev, grade: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="section">Section *</Label>
                <Input
                  id="section"
                  placeholder="e.g., Section A"
                  value={classFormData.section}
                  onChange={(e) => setClassFormData(prev => ({ ...prev, section: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacher">Assigned Teacher</Label>
              <Select 
                value={classFormData.teacherId || 'unassigned'} 
                onValueChange={(value) => setClassFormData(prev => ({ 
                  ...prev, 
                  teacherId: value === 'unassigned' ? null : value 
                }))}
              >
                <SelectTrigger id="teacher">
                  <SelectValue placeholder="Select a teacher" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {teachers.map(teacher => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="studentCount">Number of Students</Label>
              <Input
                id="studentCount"
                type="number"
                min="0"
                placeholder="0"
                value={classFormData.studentCount || ''}
                onChange={(e) => setClassFormData(prev => ({ 
                  ...prev, 
                  studentCount: e.target.value === '' ? 0 : parseInt(e.target.value, 10) 
                }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setModalType(null);
                resetClassForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveClass}
              className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white"
            >
              {modalType === 'editClass' ? (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Update Class
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Class
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-red-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Are you sure you want to delete {deleteTarget?.type === 'school' ? 'the school' : 'the class'}{' '}
              <span className="font-semibold text-[var(--foreground)]">"{deleteTarget?.name}"</span>?
              <br />
              <br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}