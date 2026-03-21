import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Teacher, Class, Student, School } from '@/app/hooks/types';
import apiService from '@/app/services/apiService';

interface DataContextType {
  teachers: Teacher[];
  classes: Class[];
  students: Student[];
  schools: School[];
  loading: boolean;
  error: string | null;
  addTeacher: (teacher: Teacher) => Promise<any>;
  updateTeacher: (id: string, updates: Partial<Teacher>) => Promise<any>;
  deleteTeacher: (id: string) => Promise<void>;
  addClass: (classData: Class) => void;
  updateClass: (id: string, updates: Partial<Class>) => void;
  deleteClass: (id: string) => void;
  addSchool: (school: School) => Promise<void>;
  updateSchool: (id: string, updates: Partial<School>) => Promise<void>;
  deleteSchool: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students] = useState<Student[]>([]); // Students come from teacher-specific endpoints
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true); // Start with loading true
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

      if (teachersRes.success && teachersRes.data && Array.isArray(teachersRes.data)) {
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

      if (classesRes.success && classesRes.data && Array.isArray(classesRes.data)) {
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

      if (schoolsRes.success && schoolsRes.data && Array.isArray(schoolsRes.data)) {
        const transformedSchools = schoolsRes.data.map((s: any) => ({
          id: s.id,
          name: s.name,
        }));
        setSchools(transformedSchools);
        console.log('✅ Loaded schools from API:', transformedSchools.length);
      }
    } catch (err: any) {
      console.error('❌ API not available:', err.message);
      setError('Backend API is not available. Please ensure the server is running.');
      // Clear data to show empty state instead of mock data
      setTeachers([]);
      setClasses([]);
      setSchools([]);
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    refreshData();
  }, []);

  const addTeacher = async (teacher: Teacher) => {
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
      throw err;
    }
  };

  const updateTeacher = async (id: string, updates: Partial<Teacher>) => {
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
      throw err;
    }
  };

  const addClass = (classData: Class) => {
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

  const updateClass = (id: string, updates: Partial<Class>) => {
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

  const addSchool = async (school: School) => {
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
      throw err;
    }
  };

  const updateSchool = async (id: string, updates: Partial<School>) => {
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