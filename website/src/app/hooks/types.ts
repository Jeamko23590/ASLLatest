// Data models for SenyamatiKard

export type Gender = 'male' | 'female' | 'nonbinary';

export interface Student {
  id: string;
  name: string;
  gender: Gender;
  grade: string;
  section: string;
  teacherId: string;
  enrollmentDate: string;
  // API-provided fields
  completedLessons?: number;
  totalLessons?: number;
  completionRate?: number;
  avgScore?: number;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  subtopics: Subtopic[];
  hasAssessment: boolean;
}

export interface Subtopic {
  id: string;
  lessonId: string;
  title: string;
  order: number;
}

export interface StudentProgress {
  studentId: string;
  lessonId: string;
  subtopicId: string;
  completedAt: string;
  completed: boolean;
}

export interface Assessment {
  id: string;
  lessonId: string;
  title: string;
  maxScore: number;
}

export interface AssessmentScore {
  id: string;
  studentId: string;
  assessmentId: string;
  score: number;
  maxScore: number;
  completedAt: string;
}

export interface EngagementLog {
  id: string;
  studentId: string;
  date: string;
  sessionDuration: number; // in minutes
  lessonsAccessed: number;
  activityType: 'lesson' | 'assessment' | 'practice';
}

export interface Teacher {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  middleName: string;
  suffix: string;
  email: string;
  subjects: string[];
  employeeId: string;
  gender: Gender;
  classesHandled: string[]; // Array of class IDs
}

export interface School {
  id: string;
  name: string;
}

export interface Class {
  id: string;
  schoolId: string;
  schoolName: string;
  grade: string;
  section: string;
  teacherId: string | null;
  studentCount: number;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
}

export interface AIInsight {
  id: string;
  type: 'success' | 'warning' | 'info';
  title: string;
  description: string;
  generatedAt: string;
}

export interface ReportData {
  studentName: string;
  lessonTitle: string;
  completionRate: number;
  assessmentScore: number | null;
  lastAccessed: string;
  engagementScore: number;
}

export type UserRole = 'teacher' | 'admin';