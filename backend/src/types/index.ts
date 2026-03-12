// Type definitions for SenyamatiKard Backend

export type Gender = 'male' | 'female' | 'nonbinary';
export type UserRole = 'teacher' | 'admin';
export type ActivityType = 'lesson' | 'assessment' | 'practice';

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  suffix?: string;
  email: string;
  employeeId: string;
  password: string;
  gender: Gender;
  createdAt: Date;
  updatedAt: Date;
}

export interface School {
  id: string;
  name: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Class {
  id: string;
  schoolId: string;
  grade: string;
  section: string;
  teacherId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Student {
  id: string;
  name: string;
  email?: string;
  password?: string;
  gender: Gender;
  classId: string | null;
  enrollmentDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  category: string;
  order: number;
  hasAssessment: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subtopic {
  id: string;
  lessonId: string;
  title: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentProgress {
  id: string;
  studentId: string;
  lessonId: string;
  subtopicId: string;
  completed: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Assessment {
  id: string;
  lessonId: string;
  title: string;
  maxScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssessmentScore {
  id: string;
  studentId: string;
  assessmentId: string;
  score: number;
  maxScore: number;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface EngagementLog {
  id: string;
  studentId: string;
  sessionDate: Date;
  sessionDuration: number; // in minutes
  lessonsAccessed: number;
  activityType: ActivityType;
  createdAt: Date;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Request types
export interface LoginRequest {
  employeeId: string;
  password: string;
}

export interface CreateTeacherRequest {
  firstName: string;
  lastName: string;
  middleName?: string;
  suffix?: string;
  email: string;
  employeeId: string;
  gender: Gender;
  classIds?: string[];
}

export interface UpdateTeacherRequest extends Partial<CreateTeacherRequest> {
  resetPassword?: boolean;
}

export interface CreateSchoolRequest {
  name: string;
  address?: string;
}

export interface CreateClassRequest {
  schoolId: string;
  grade: string;
  section: string;
  teacherId?: string;
}

// Dashboard Stats
export interface TeacherDashboardStats {
  totalStudents: number;
  activeStudents: number;
  lessonsCompleted: number;
  averageProgress: number;
  assessmentsCompleted: number;
  avgStudyTime: number;
  activeToday: number;
  avgAssessmentScore: number;
}

export interface AdminDashboardStats {
  totalTeachers: number;
  totalClasses: number;
  totalLessons: number;
  totalStudents: number;
  totalSchools: number;
}

// Student with progress details
export interface StudentWithProgress extends Student {
  completedLessons: number;
  totalLessons: number;
  completionRate: number;
  avgScore: number;
  recentActivity?: string;
}

// Lesson with completion status
export interface LessonWithProgress extends Lesson {
  completedBy: number;
  inProgressBy: number;
  totalStudents: number;
}
