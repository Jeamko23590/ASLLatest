import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
} from '@/app/hooks/mockData';
import { Teacher, Class, Student, School } from '@/app/hooks/types';
import apiService from '@/app/services/apiService';

interface DataContextType {
  teachers: typeof mockTeachers;
  classes: typeof mockClasses;
  students: typeof mockStudents;
  schools: typeof mockSchools;
  loading: boolean;
  error: string | null;
  addTeacher: (teacher: typeof mockTeachers[0]) => Promise<void>;
  updateTeacher: (id: string, updates: Partial<typeof mockTeachers[0]>) => Promise<void>;
  deleteTeacher: (id: string) => Promise<void>;
  addClass: (classData: typeof mockClasses[0]) => void;
  updateClass: (id: string, updates: Partial<typeof mockClasses[0]>) => void;
  deleteClass: (id: string) => void;
  addSchool: (school: typeof mockSchools[0]) => Promise<void>;
  updateSchool: (id: string, updates: Partial<typeof mockSchools[0]>) => Promise<void>;
  deleteSchool: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [teachers, setTeachers] = useState(mockTeachers);
  const [classes, setClasses] = useState(mockClasses);
  const [students] = useState(mockStudents);
  const [schools, setSchools] = useState(mockSchools);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Try to fetch real data from API, fallback to mock data if API is not available
  const refreshData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [teachersRes, classesRes, schoolsRes] = await Promise.all([
        apiService.getTeachers(),
        apiService.getClasses(),
        apiService.getSchools(),
      ]);

      if (teachersRes.success && teachersRes.data) {
        // Transform API data to match frontend format
        const transformedTeachers = teachersRes.data.map((t: any) => ({
          id: t.id,
          name: `${t.first_name} ${t.middle_name ? t.middle_name + ' ' : ''}${t.last_name}${t.suffix ? ' ' + t.suffix : ''}`,
          firstName: t.first_name,
          lastName: t.last_name,
          middleName: t.middle_name || '',
          suffix: t.suffix || '',
          email: t.email,
          subjects: ['Functional Mathematics'],
          employeeId: t.employee_id,
          gender: t.gender,
          classesHandled: t.class_ids || [],
        }));
        setTeachers(transformedTeachers);
        console.log('✅ Loaded teachers from API:', transformedTeachers.length);
      }

      if (classesRes.success && classesRes.data) {
        const transformedClasses = classesRes.data.map((c: any) => ({
          id: c.id,
          schoolId: c.school_id,
          schoolName: c.school_name,
          grade: c.grade,
          section: c.section,
          teacherId: c.teacher_id,
          studentCount: c.student_count || 0,
        }));
        setClasses(transformedClasses);
        console.log('✅ Loaded classes from API:', transformedClasses.length);
      }

      if (schoolsRes.success && schoolsRes.data) {
        const transformedSchools = schoolsRes.data.map((s: any) => ({
          id: s.id,
          name: s.name,
        }));
        setSchools(transformedSchools);
        console.log('✅ Loaded schools from API:', transformedSchools.length);
      }
    } catch (err: any) {
      console.warn('⚠️ API not available, using mock data:', err.message);
      setError('Using offline data');
      // Keep using mock data
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    refreshData();
  }, []);

  const addTeacher = async (teacher: typeof mockTeachers[0]) => {
    try {
      const response = await apiService.createTeacher({
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        middleName: teacher.middleName,
        suffix: teacher.suffix,
        email: teacher.email,
        employeeId: teacher.employeeId,
        gender: teacher.gender,
        classIds: teacher.classesHandled,
      });

      if (response.success) {
        console.log('✅ Teacher created:', response.data);
        await refreshData();
        return response.data; // Return the generated password
      } else {
        throw new Error(response.error || 'Failed to add teacher');
      }
    } catch (err: any) {
      console.error('❌ Failed to add teacher:', err);
      // Fallback to local state
      setTeachers(prev => [...prev, teacher]);
      
      if (teacher.classesHandled && teacher.classesHandled.length > 0) {
        setClasses(prev => prev.map(c => {
          if (teacher.classesHandled.includes(c.id)) {
            return { ...c, teacherId: teacher.id };
          }
          return c;
        }));
      }
      throw err;
    }
  };

  const updateTeacher = async (id: string, updates: Partial<typeof mockTeachers[0]>) => {
    try {
      const response = await apiService.updateTeacher(id, {
        firstName: updates.firstName,
        lastName: updates.lastName,
        middleName: updates.middleName,
        suffix: updates.suffix,
        email: updates.email,
        employeeId: updates.employeeId,
        gender: updates.gender,
        classIds: updates.classesHandled,
        resetPassword: (updates as any).resetPassword,
      });

      if (response.success) {
        console.log('✅ Teacher updated');
        await refreshData();
        return response.data; // Return new password if reset
      } else {
        throw new Error(response.error || 'Failed to update teacher');
      }
    } catch (err: any) {
      console.error('❌ Failed to update teacher:', err);
      // Fallback to local state
      setTeachers(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
      
      if (updates.classesHandled) {
        setClasses(prev => prev.map(c => {
          if (updates.classesHandled?.includes(c.id)) {
            return { ...c, teacherId: id };
          } else if (c.teacherId === id && !updates.classesHandled?.includes(c.id)) {
            return { ...c, teacherId: null };
          }
          return c;
        }));
      }
      throw err;
    }
  };

  const deleteTeacher = async (id: string) => {
    try {
      const response = await apiService.deleteTeacher(id);
      
      if (response.success) {
        console.log('✅ Teacher deleted');
        await refreshData();
      } else {
        throw new Error(response.error || 'Failed to delete teacher');
      }
    } catch (err: any) {
      console.error('❌ Failed to delete teacher:', err);
      // Fallback to local state
      setTeachers(prev => prev.filter(t => t.id !== id));
      setClasses(prev => prev.map(c => c.teacherId === id ? { ...c, teacherId: null } : c));
      throw err;
    }
  };

  const addClass = (classData: typeof mockClasses[0]) => {
    setClasses(prev => [...prev, classData]);
    
    // If a teacher is assigned, update their classesHandled
    if (classData.teacherId) {
      setTeachers(prev => prev.map(t => {
        if (t.id === classData.teacherId) {
          return { ...t, classesHandled: [...t.classesHandled, classData.id] };
        }
        return t;
      }));
    }
  };

  const updateClass = (id: string, updates: Partial<typeof mockClasses[0]>) => {
    const oldClass = classes.find(c => c.id === id);
    setClasses(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    
    // Handle teacher assignment changes
    if (updates.teacherId !== undefined && oldClass) {
      // Remove from old teacher
      if (oldClass.teacherId && oldClass.teacherId !== updates.teacherId) {
        setTeachers(prev => prev.map(t => {
          if (t.id === oldClass.teacherId) {
            return { ...t, classesHandled: t.classesHandled.filter(cId => cId !== id) };
          }
          return t;
        }));
      }
      
      // Add to new teacher
      if (updates.teacherId) {
        setTeachers(prev => prev.map(t => {
          if (t.id === updates.teacherId && !t.classesHandled.includes(id)) {
            return { ...t, classesHandled: [...t.classesHandled, id] };
          }
          return t;
        }));
      }
    }
  };

  const deleteClass = (id: string) => {
    const classToDelete = classes.find(c => c.id === id);
    setClasses(prev => prev.filter(c => c.id !== id));
    
    // Remove from teacher's classesHandled
    if (classToDelete?.teacherId) {
      setTeachers(prev => prev.map(t => {
        if (t.id === classToDelete.teacherId) {
          return { ...t, classesHandled: t.classesHandled.filter(cId => cId !== id) };
        }
        return t;
      }));
    }
  };

  const addSchool = async (school: typeof mockSchools[0]) => {
    try {
      const response = await apiService.createSchool({
        name: school.name,
      });

      if (response.success) {
        console.log('✅ School created');
        await refreshData();
      } else {
        throw new Error(response.error || 'Failed to add school');
      }
    } catch (err: any) {
      console.error('❌ Failed to add school:', err);
      // Fallback to local state
      setSchools(prev => [...prev, school]);
      throw err;
    }
  };

  const updateSchool = async (id: string, updates: Partial<typeof mockSchools[0]>) => {
    try {
      const response = await apiService.updateSchool(id, {
        name: updates.name,
      });

      if (response.success) {
        console.log('✅ School updated');
        await refreshData();
      } else {
        throw new Error(response.error || 'Failed to update school');
      }
    } catch (err: any) {
      console.error('❌ Failed to update school:', err);
      // Fallback to local state
      setSchools(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
      
      if (updates.name) {
        setClasses(prev => prev.map(c => 
          c.schoolId === id ? { ...c, schoolName: updates.name! } : c
        ));
      }
      throw err;
    }
  };

  const deleteSchool = async (id: string) => {
    try {
      const response = await apiService.deleteSchool(id);
      
      if (response.success) {
        console.log('✅ School deleted');
        await refreshData();
      } else {
        throw new Error(response.error || 'Failed to delete school');
      }
    } catch (err: any) {
      console.error('❌ Failed to delete school:', err);
      
      // Check if school has classes
      const schoolClasses = classes.filter(c => c.schoolId === id);
      if (schoolClasses.length > 0) {
        throw new Error('Cannot delete school with existing classes. Please delete all classes first.');
      }
      
      // Fallback to local state
      setSchools(prev => prev.filter(s => s.id !== id));
      throw err;
    }
  };

  return (
    <DataContext.Provider
      value={{
        teachers,
        classes,
        students,
        schools,
        loading,
        error,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        addClass,
        updateClass,
        deleteClass,
        addSchool,
        updateSchool,
        deleteSchool,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useDataContext() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
}