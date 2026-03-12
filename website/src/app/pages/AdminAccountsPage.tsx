import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Users, Plus, Search, Edit, XCircle, Mail, IdCard, Briefcase, ChevronDown, ChevronUp, Eye, EyeOff, KeyRound, CheckCircle2 } from 'lucide-react';
import { useDataContext } from '@/app/contexts/DataContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { GenderIcon } from '@/app/components/GenderIcon';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/app/components/ui/alert-dialog';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/components/ui/tooltip';
import { Gender } from '@/app/hooks/types';

export function AdminAccountsPage() {
  const { teachers, classes, addTeacher, updateTeacher, deleteTeacher } = useDataContext();
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // Add/Edit Modal State
  const [isAddEditModalOpen, setIsAddEditModalOpen] = React.useState(false);
  const [editingTeacher, setEditingTeacher] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    middleName: '',
    suffix: '',
    employeeId: '',
    email: '',
    gender: 'male' as Gender,
    classesHandled: [] as string[],
  });
  
  // Password reset state
  const [enablePasswordReset, setEnablePasswordReset] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  
  // Success modal state
  const [isSuccessModalOpen, setIsSuccessModalOpen] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState({ password: '', wasPasswordReset: false });
  
  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [deletingTeacherId, setDeletingTeacherId] = React.useState<string | null>(null);
  
  // Class assignment dropdown state
  const [isClassDropdownOpen, setIsClassDropdownOpen] = React.useState(false);
  
  // Auto-generate password based on lastName and employeeId
  const generatePassword = () => {
    if (!formData.lastName || !formData.employeeId) return '';
    const lastThreeChars = formData.employeeId.slice(-3);
    return `${formData.lastName.toLowerCase()}_${lastThreeChars}`;
  };

  const filteredTeachers = React.useMemo(() => {
    return teachers.filter((t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [teachers, searchQuery]);

  const handleAddAccount = () => {
    setFormData({
      firstName: '',
      lastName: '',
      middleName: '',
      suffix: '',
      employeeId: '',
      email: '',
      gender: 'male' as Gender,
      classesHandled: [] as string[],
    });
    setEditingTeacher(null);
    setIsAddEditModalOpen(true);
  };

  const handleEditAccount = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    if (teacher) {
      setFormData({
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        middleName: teacher.middleName,
        suffix: teacher.suffix,
        employeeId: teacher.employeeId,
        email: teacher.email,
        gender: teacher.gender,
        classesHandled: teacher.classesHandled,
      });
      setEditingTeacher(teacherId);
      // Reset password states when opening edit modal
      setEnablePasswordReset(false);
      setShowPassword(false);
      setIsAddEditModalOpen(true);
    }
  };

  const handleDisableAccount = (teacherId: string) => {
    setDeletingTeacherId(teacherId);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct full name from name parts
    const nameParts = [
      formData.firstName,
      formData.middleName,
      formData.lastName,
      formData.suffix
    ].filter(part => part.trim() !== '');
    const fullName = nameParts.join(' ');
    
    if (editingTeacher) {
      updateTeacher(editingTeacher, {
        ...formData,
        name: fullName,
      });
      
      // Show password reset confirmation if enabled
      if (enablePasswordReset) {
        // In a real app, this would call an API to reset the password
        console.log(`Password reset for teacher ${editingTeacher}: ${generatePassword()}`);
        setSuccessMessage({ password: generatePassword(), wasPasswordReset: true });
        setIsSuccessModalOpen(true);
      } else {
        setSuccessMessage({ password: '', wasPasswordReset: false });
        setIsSuccessModalOpen(true);
      }
    } else {
      // Generate a unique ID for the new teacher
      const newTeacher = {
        ...formData,
        name: fullName,
        id: `teacher-${Date.now()}`,
        subjects: ['Functional Mathematics'], // Default subject
      };
      addTeacher(newTeacher);
    }
    
    // Reset all states
    setEnablePasswordReset(false);
    setShowPassword(false);
    setIsAddEditModalOpen(false);
  };

  const handleDelete = () => {
    if (deletingTeacherId) {
      deleteTeacher(deletingTeacherId);
    }
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="space-y-4">
        <div>
          <h1 className="heading-font text-4xl text-[var(--primary)] mb-2 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--primary)] shadow-md">
              <Users className="h-8 w-8 text-[var(--accent)]" />
            </div>
            Accounts
          </h1>
          <p className="text-muted-foreground text-lg">Manage teacher accounts and permissions</p>
        </div>
        <Button 
          onClick={handleAddAccount}
          className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Teacher
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-2 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Total Teachers</p>
              <p className="text-3xl font-bold text-[var(--primary)]">{teachers.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Active Accounts</p>
              <p className="text-3xl font-bold text-green-600">{teachers.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Total Classes</p>
              <p className="text-3xl font-bold text-[var(--primary)]">{classes.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="border-2 shadow-sm">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name or employee ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Teacher Accounts Table */}
      <Card className="border-2 shadow-sm">
        <CardHeader>
          <CardTitle className="text-[var(--primary)] flex items-center gap-2">
            <Users className="h-5 w-5" />
            Teacher Accounts ({filteredTeachers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead className="text-center">Gender</TableHead>
                <TableHead>Classes Handled</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeachers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No teachers found matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTeachers.map((teacher) => {
                  const teacherClasses = classes.filter(c => c.teacherId === teacher.id);
                  
                  return (
                    <TableRow key={teacher.id} className="hover:bg-[var(--accent)]/5 transition-colors">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{teacher.name}</span>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <Mail className="h-3 w-3" />
                            {teacher.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <IdCard className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground font-mono">
                            {teacher.employeeId}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <Tooltip>
                            <TooltipTrigger>
                              <GenderIcon gender={teacher.gender} className="h-5 w-5" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="capitalize">{teacher.gender}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {teacherClasses.length === 0 ? (
                            <span className="text-sm text-muted-foreground italic">No classes assigned</span>
                          ) : (
                            teacherClasses.map((cls) => (
                              <Tooltip key={cls.id}>
                                <TooltipTrigger>
                                  <Badge variant="outline" className="text-xs hover:bg-[var(--accent)]/10 transition-colors cursor-help">
                                    {cls.grade} {cls.section}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent className="bg-[var(--primary)] border-2 border-[var(--primary)]">
                                  <div className="text-xs">
                                    <p className="font-medium text-white">{cls.schoolName}</p>
                                    <p className="text-white/80">{cls.studentCount} students</p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            ))
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditAccount(teacher.id)}
                                className="text-[var(--primary)] hover:text-[var(--primary)]/80 hover:bg-[var(--primary)]/10"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit Teacher</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDisableAccount(teacher.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete Teacher</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Teacher Modal */}
      <Dialog open={isAddEditModalOpen} onOpenChange={setIsAddEditModalOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-[var(--primary)]">{editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}</DialogTitle>
            <DialogDescription>
              {editingTeacher ? 'Update the teacher information below.' : 'Fill in the details to add a new teacher account.'}
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 pr-2">
            <form onSubmit={handleFormSubmit} className="space-y-4" id="teacher-form">
              {/* First Name and Last Name - Same Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="First name"
                    required
                    className="border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Last name"
                    required
                    className="border-2"
                  />
                </div>
              </div>
              
              {/* Middle Name and Suffix - Same Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="middleName">Middle Name <span className="text-xs text-muted-foreground">(Optional)</span></Label>
                  <Input
                    id="middleName"
                    value={formData.middleName}
                    onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                    placeholder="Middle name"
                    className="border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="suffix">Suffix <span className="text-xs text-muted-foreground">(Optional)</span></Label>
                  <Input
                    id="suffix"
                    value={formData.suffix}
                    onChange={(e) => setFormData({ ...formData, suffix: e.target.value })}
                    placeholder="Jr., Sr., III, etc."
                    className="border-2"
                  />
                </div>
              </div>
              
              {/* Employee ID and Gender - Same Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="employeeId">Employee ID <span className="text-red-500">*</span></Label>
                  <Input
                    id="employeeId"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    placeholder="e.g., EMP-001"
                    required
                    className="border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender <span className="text-red-500">*</span></Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value as Gender })}
                  >
                    <SelectTrigger className="border-2">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="nonbinary">Non-binary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Email Address - Full Width */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="teacher@example.com"
                  required
                  className="border-2"
                />
              </div>
              
              {/* Password Reset Section - Only show when editing */}
              {editingTeacher && (
                <div className="space-y-3 p-4 border-2 border-dashed border-[var(--primary)]/30 rounded-lg bg-[var(--accent)]/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <KeyRound className="h-4 w-4 text-[var(--primary)]" />
                      <Label htmlFor="reset-password" className="text-[var(--primary)] font-semibold cursor-pointer">
                        Reset Password
                      </Label>
                    </div>
                    <Checkbox
                      id="reset-password"
                      checked={enablePasswordReset}
                      onCheckedChange={(checked) => {
                        setEnablePasswordReset(checked as boolean);
                        if (!checked) {
                          setShowPassword(false);
                        }
                      }}
                    />
                  </div>
                  
                  {enablePasswordReset && (
                    <div className="space-y-2 pt-2">
                      <Label className="text-sm">
                        Auto-Generated Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showPassword ? 'text' : 'password'}
                          value={generatePassword()}
                          readOnly
                          className="border-2 pr-10 bg-white cursor-default font-mono text-[var(--primary)] font-semibold"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Format: <span className="font-mono">lastname_lastThreeCharsOfEmployeeID</span>
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Class Assignment Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Assign Classes</Label>
                  <div className="flex items-center gap-2">
                    {formData.classesHandled.length > 0 && (
                      <>
                        <span className="text-xs font-medium text-muted-foreground">
                          {formData.classesHandled.length} class(es) selected
                        </span>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, classesHandled: [] })}
                          className="text-xs text-red-600 hover:text-red-700 underline"
                        >
                          Clear All
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="border-2 rounded-md bg-background">
                  <button
                    type="button"
                    onClick={() => setIsClassDropdownOpen(!isClassDropdownOpen)}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-accent/30 transition-colors rounded-t-md"
                  >
                    <span className={formData.classesHandled.length > 0 ? "text-foreground font-medium" : "text-muted-foreground"}>
                      {formData.classesHandled.length > 0
                        ? `${formData.classesHandled.length} class(es) selected`
                        : 'Select classes...'}
                    </span>
                    {isClassDropdownOpen ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                  {isClassDropdownOpen && (
                    <div className="border-t-2 max-h-56 overflow-y-auto">
                      {classes.length === 0 ? (
                        <div className="p-4 text-sm text-muted-foreground text-center">
                          No classes available
                        </div>
                      ) : (
                        // Group classes by school
                        (() => {
                          const schoolGroups = classes.reduce((acc, cls) => {
                            if (!acc[cls.schoolId]) {
                              acc[cls.schoolId] = {
                                schoolName: cls.schoolName,
                                classes: []
                              };
                            }
                            acc[cls.schoolId].classes.push(cls);
                            return acc;
                          }, {} as Record<string, { schoolName: string; classes: typeof classes }>);

                          return Object.entries(schoolGroups).map(([schoolId, group], index) => (
                            <div key={schoolId}>
                              {/* School Header */}
                              <div className="px-3 py-2 bg-[var(--accent)]/10 border-b-2 sticky top-0 backdrop-blur-sm">
                                <div className="flex items-center gap-2">
                                  <Briefcase className="h-3.5 w-3.5 text-[var(--primary)]" />
                                  <span className="text-xs font-semibold text-[var(--primary)] uppercase tracking-wide">
                                    {group.schoolName}
                                  </span>
                                </div>
                              </div>
                              {/* Classes under this school */}
                              {group.classes.map((cls) => {
                                const isSelected = formData.classesHandled.includes(cls.id);
                                
                                return (
                                  <label
                                    key={cls.id}
                                    className="flex items-center gap-3 px-3 py-3 pl-6 border-b last:border-b-0 hover:bg-accent/30 cursor-pointer transition-colors"
                                  >
                                    <Checkbox
                                      checked={isSelected}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          setFormData({
                                            ...formData,
                                            classesHandled: [...formData.classesHandled, cls.id],
                                          });
                                        } else {
                                          setFormData({
                                            ...formData,
                                            classesHandled: formData.classesHandled.filter(id => id !== cls.id),
                                          });
                                        }
                                      }}
                                    />
                                    <div className="flex-1">
                                      <div className="text-sm font-medium">
                                        {cls.grade} {cls.section}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {cls.studentCount} {cls.studentCount === 1 ? 'student' : 'students'}
                                      </div>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          ));
                        })()
                      )}
                    </div>
                  )}
                </div>
                {formData.classesHandled.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {formData.classesHandled.map((classId) => {
                      const cls = classes.find(c => c.id === classId);
                      if (!cls) return null;
                      return (
                        <Badge
                          key={classId}
                          variant="outline"
                          className="text-xs bg-[var(--accent)]/20 border-[var(--primary)] text-[var(--primary)] px-2 py-1"
                        >
                          {cls.grade} {cls.section}
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>
            </form>
          </div>
          <DialogFooter className="pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddEditModalOpen(false)}
              className="border-2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="teacher-form"
              className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white"
            >
              {editingTeacher ? 'Save Changes' : 'Add Teacher'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Teacher Modal */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the teacher account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success Modal */}
      <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-full bg-green-100">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <DialogTitle className="text-[var(--primary)]">Success!</DialogTitle>
            </div>
            <DialogDescription>
              {successMessage.wasPasswordReset 
                ? 'Teacher information and password have been updated successfully.' 
                : 'Teacher information has been updated successfully.'}
            </DialogDescription>
          </DialogHeader>
          
          {successMessage.wasPasswordReset && (
            <div className="space-y-3 p-4 border-2 border-[var(--primary)] rounded-lg bg-[var(--accent)]/20">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-[var(--primary)]" />
                <Label className="text-[var(--primary)] font-semibold text-base">
                  New Password Generated
                </Label>
              </div>
              
              <div className="space-y-2 pt-2">
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={successMessage.password}
                    readOnly
                    className="border-2 pr-10 bg-white cursor-default font-mono text-[var(--primary)] font-bold text-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <div className="bg-[var(--accent)]/30 p-3 rounded-md border border-[var(--primary)]/20">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-[var(--primary)]">Format:</span>{' '}
                    <span className="font-mono">lastname_lastThreeCharsOfEmployeeID</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Please share this password with the teacher securely.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="mt-6">
            <Button
              type="button"
              onClick={() => {
                setIsSuccessModalOpen(false);
                setShowPassword(false);
              }}
              className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white w-full"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}