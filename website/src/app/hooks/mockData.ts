import { Student, Lesson, Subtopic, StudentProgress, Assessment, AssessmentScore, EngagementLog, Teacher, AIInsight, School, Class } from './types';

// Mock Lessons
export const mockLessons: Lesson[] = [
  {
    id: 'lesson-1',
    title: 'Number Values',
    description: 'Understanding different types of numbers and their values',
    hasAssessment: true,
    subtopics: [
      { id: 'sub-1-1', lessonId: 'lesson-1', title: 'Whole Numbers', order: 1 },
      { id: 'sub-1-2', lessonId: 'lesson-1', title: 'Comparison', order: 2 },
      { id: 'sub-1-3', lessonId: 'lesson-1', title: 'Ordinal Numbers', order: 3 },
      { id: 'sub-1-4', lessonId: 'lesson-1', title: 'Money Value', order: 4 },
    ],
  },
  {
    id: 'lesson-2',
    title: 'Fundamental Operations',
    description: 'Basic mathematical operations',
    hasAssessment: true,
    subtopics: [
      { id: 'sub-2-1', lessonId: 'lesson-2', title: 'Addition', order: 1 },
      { id: 'sub-2-2', lessonId: 'lesson-2', title: 'Subtraction', order: 2 },
      { id: 'sub-2-3', lessonId: 'lesson-2', title: 'Multiplication', order: 3 },
      { id: 'sub-2-4', lessonId: 'lesson-2', title: 'Division', order: 4 },
    ],
  },
  {
    id: 'lesson-3',
    title: 'Fraction',
    description: 'Understanding fractions and their operations',
    hasAssessment: true,
    subtopics: [
      { id: 'sub-3-1', lessonId: 'lesson-3', title: 'Introduction to Fractions', order: 1 },
      { id: 'sub-3-2', lessonId: 'lesson-3', title: 'Adding and Subtracting Fractions', order: 2 },
      { id: 'sub-3-3', lessonId: 'lesson-3', title: 'Multiplying and Dividing Fractions', order: 3 },
    ],
  },
  {
    id: 'lesson-4',
    title: 'Decimal Numbers',
    description: 'Working with decimal numbers',
    hasAssessment: true,
    subtopics: [
      { id: 'sub-4-1', lessonId: 'lesson-4', title: 'Understanding Decimals', order: 1 },
      { id: 'sub-4-2', lessonId: 'lesson-4', title: 'Operations with Decimals', order: 2 },
    ],
  },
  {
    id: 'lesson-5',
    title: 'Percentage',
    description: 'Understanding and calculating percentages',
    hasAssessment: true,
    subtopics: [
      { id: 'sub-5-1', lessonId: 'lesson-5', title: 'What is Percentage', order: 1 },
      { id: 'sub-5-2', lessonId: 'lesson-5', title: 'Calculating Percentages', order: 2 },
      { id: 'sub-5-3', lessonId: 'lesson-5', title: 'Percentage Applications', order: 3 },
    ],
  },
  {
    id: 'lesson-6',
    title: 'Mensuration',
    description: 'Measuring time and understanding calendar concepts',
    hasAssessment: true,
    subtopics: [
      { id: 'sub-6-1', lessonId: 'lesson-6', title: 'Time', order: 1 },
      { id: 'sub-6-2', lessonId: 'lesson-6', title: 'Days, Weeks, and Months', order: 2 },
    ],
  },
];

// Mock Students
export const mockStudents: Student[] = [
  {
    id: 'student-1',
    name: 'Maria Santos',
    gender: 'female',
    grade: 'Grade 3',
    section: 'Section A',
    teacherId: 'teacher-1',
    enrollmentDate: '2025-08-15',
  },
  {
    id: 'student-2',
    name: 'Juan Dela Cruz',
    gender: 'male',
    grade: 'Grade 3',
    section: 'Section A',
    teacherId: 'teacher-1',
    enrollmentDate: '2025-08-15',
  },
  {
    id: 'student-3',
    name: 'Sofia Reyes',
    gender: 'female',
    grade: 'Grade 4',
    section: 'Section B',
    teacherId: 'teacher-1',
    enrollmentDate: '2025-08-20',
  },
  {
    id: 'student-4',
    name: 'Carlos Lopez',
    gender: 'male',
    grade: 'Grade 3',
    section: 'Section A',
    teacherId: 'teacher-1',
    enrollmentDate: '2025-08-15',
  },
  {
    id: 'student-5',
    name: 'Alex Rivera',
    gender: 'nonbinary',
    grade: 'Grade 4',
    section: 'Section B',
    teacherId: 'teacher-1',
    enrollmentDate: '2025-08-20',
  },
  {
    id: 'student-6',
    name: 'Isabella Torres',
    gender: 'female',
    grade: 'Grade 3',
    section: 'Section A',
    teacherId: 'teacher-1',
    enrollmentDate: '2025-08-15',
  },
];

// Mock Progress
export const mockProgress: StudentProgress[] = [
  // Student 1 - Maria Santos (3 lessons completed: lessons 1, 2, 3)
  // Lesson 1 - ALL subtopics completed
  { studentId: 'student-1', lessonId: 'lesson-1', subtopicId: 'sub-1-1', completed: true, completedAt: '2026-01-02' },
  { studentId: 'student-1', lessonId: 'lesson-1', subtopicId: 'sub-1-2', completed: true, completedAt: '2026-01-04' },
  { studentId: 'student-1', lessonId: 'lesson-1', subtopicId: 'sub-1-3', completed: true, completedAt: '2026-01-06' },
  { studentId: 'student-1', lessonId: 'lesson-1', subtopicId: 'sub-1-4', completed: true, completedAt: '2026-01-08' },
  // Lesson 2 - ALL subtopics completed
  { studentId: 'student-1', lessonId: 'lesson-2', subtopicId: 'sub-2-1', completed: true, completedAt: '2026-01-09' },
  { studentId: 'student-1', lessonId: 'lesson-2', subtopicId: 'sub-2-2', completed: true, completedAt: '2026-01-10' },
  { studentId: 'student-1', lessonId: 'lesson-2', subtopicId: 'sub-2-3', completed: true, completedAt: '2026-01-11' },
  { studentId: 'student-1', lessonId: 'lesson-2', subtopicId: 'sub-2-4', completed: true, completedAt: '2026-01-12' },
  // Lesson 3 - ALL subtopics completed
  { studentId: 'student-1', lessonId: 'lesson-3', subtopicId: 'sub-3-1', completed: true, completedAt: '2026-01-13' },
  { studentId: 'student-1', lessonId: 'lesson-3', subtopicId: 'sub-3-2', completed: true, completedAt: '2026-01-14' },
  { studentId: 'student-1', lessonId: 'lesson-3', subtopicId: 'sub-3-3', completed: true, completedAt: '2026-01-15' },
  // Lesson 4 - Some progress but not completed
  { studentId: 'student-1', lessonId: 'lesson-4', subtopicId: 'sub-4-1', completed: true, completedAt: '2026-01-16' },
  { studentId: 'student-1', lessonId: 'lesson-4', subtopicId: 'sub-4-2', completed: false, completedAt: '' },
  // Lesson 5 - Some progress but not completed
  { studentId: 'student-1', lessonId: 'lesson-5', subtopicId: 'sub-5-1', completed: true, completedAt: '2026-01-17' },
  { studentId: 'student-1', lessonId: 'lesson-5', subtopicId: 'sub-5-2', completed: false, completedAt: '' },
  { studentId: 'student-1', lessonId: 'lesson-5', subtopicId: 'sub-5-3', completed: false, completedAt: '' },
  // Lesson 6 - Not started
  { studentId: 'student-1', lessonId: 'lesson-6', subtopicId: 'sub-6-1', completed: false, completedAt: '' },
  { studentId: 'student-1', lessonId: 'lesson-6', subtopicId: 'sub-6-2', completed: false, completedAt: '' },
  
  // Student 2 - Juan Dela Cruz (1 lesson completed: lesson 1)
  // Lesson 1 - ALL subtopics completed
  { studentId: 'student-2', lessonId: 'lesson-1', subtopicId: 'sub-1-1', completed: true, completedAt: '2026-01-04' },
  { studentId: 'student-2', lessonId: 'lesson-1', subtopicId: 'sub-1-2', completed: true, completedAt: '2026-01-06' },
  { studentId: 'student-2', lessonId: 'lesson-1', subtopicId: 'sub-1-3', completed: true, completedAt: '2026-01-08' },
  { studentId: 'student-2', lessonId: 'lesson-1', subtopicId: 'sub-1-4', completed: true, completedAt: '2026-01-10' },
  // Lesson 2 - Partial progress (not completed)
  { studentId: 'student-2', lessonId: 'lesson-2', subtopicId: 'sub-2-1', completed: true, completedAt: '2026-01-12' },
  { studentId: 'student-2', lessonId: 'lesson-2', subtopicId: 'sub-2-2', completed: false, completedAt: '' },
  { studentId: 'student-2', lessonId: 'lesson-2', subtopicId: 'sub-2-3', completed: false, completedAt: '' },
  { studentId: 'student-2', lessonId: 'lesson-2', subtopicId: 'sub-2-4', completed: false, completedAt: '' },
  // Lesson 3 - Not started
  { studentId: 'student-2', lessonId: 'lesson-3', subtopicId: 'sub-3-1', completed: false, completedAt: '' },
  { studentId: 'student-2', lessonId: 'lesson-3', subtopicId: 'sub-3-2', completed: false, completedAt: '' },
  { studentId: 'student-2', lessonId: 'lesson-3', subtopicId: 'sub-3-3', completed: false, completedAt: '' },
  // Lesson 4 - Not started
  { studentId: 'student-2', lessonId: 'lesson-4', subtopicId: 'sub-4-1', completed: false, completedAt: '' },
  { studentId: 'student-2', lessonId: 'lesson-4', subtopicId: 'sub-4-2', completed: false, completedAt: '' },
  // Lesson 5 - Not started
  { studentId: 'student-2', lessonId: 'lesson-5', subtopicId: 'sub-5-1', completed: false, completedAt: '' },
  { studentId: 'student-2', lessonId: 'lesson-5', subtopicId: 'sub-5-2', completed: false, completedAt: '' },
  { studentId: 'student-2', lessonId: 'lesson-5', subtopicId: 'sub-5-3', completed: false, completedAt: '' },
  // Lesson 6 - Not started
  { studentId: 'student-2', lessonId: 'lesson-6', subtopicId: 'sub-6-1', completed: false, completedAt: '' },
  { studentId: 'student-2', lessonId: 'lesson-6', subtopicId: 'sub-6-2', completed: false, completedAt: '' },
  
  // Student 3 - Sofia Reyes (6/6 lessons completed - ALL lessons)
  // Lesson 1 - ALL subtopics completed
  { studentId: 'student-3', lessonId: 'lesson-1', subtopicId: 'sub-1-1', completed: true, completedAt: '2026-01-02' },
  { studentId: 'student-3', lessonId: 'lesson-1', subtopicId: 'sub-1-2', completed: true, completedAt: '2026-01-03' },
  { studentId: 'student-3', lessonId: 'lesson-1', subtopicId: 'sub-1-3', completed: true, completedAt: '2026-01-04' },
  { studentId: 'student-3', lessonId: 'lesson-1', subtopicId: 'sub-1-4', completed: true, completedAt: '2026-01-05' },
  // Lesson 2 - ALL subtopics completed
  { studentId: 'student-3', lessonId: 'lesson-2', subtopicId: 'sub-2-1', completed: true, completedAt: '2026-01-06' },
  { studentId: 'student-3', lessonId: 'lesson-2', subtopicId: 'sub-2-2', completed: true, completedAt: '2026-01-07' },
  { studentId: 'student-3', lessonId: 'lesson-2', subtopicId: 'sub-2-3', completed: true, completedAt: '2026-01-08' },
  { studentId: 'student-3', lessonId: 'lesson-2', subtopicId: 'sub-2-4', completed: true, completedAt: '2026-01-09' },
  // Lesson 3 - ALL subtopics completed
  { studentId: 'student-3', lessonId: 'lesson-3', subtopicId: 'sub-3-1', completed: true, completedAt: '2026-01-10' },
  { studentId: 'student-3', lessonId: 'lesson-3', subtopicId: 'sub-3-2', completed: true, completedAt: '2026-01-11' },
  { studentId: 'student-3', lessonId: 'lesson-3', subtopicId: 'sub-3-3', completed: true, completedAt: '2026-01-12' },
  // Lesson 4 - ALL subtopics completed
  { studentId: 'student-3', lessonId: 'lesson-4', subtopicId: 'sub-4-1', completed: true, completedAt: '2026-01-13' },
  { studentId: 'student-3', lessonId: 'lesson-4', subtopicId: 'sub-4-2', completed: true, completedAt: '2026-01-14' },
  // Lesson 5 - ALL subtopics completed
  { studentId: 'student-3', lessonId: 'lesson-5', subtopicId: 'sub-5-1', completed: true, completedAt: '2026-01-15' },
  { studentId: 'student-3', lessonId: 'lesson-5', subtopicId: 'sub-5-2', completed: true, completedAt: '2026-01-16' },
  { studentId: 'student-3', lessonId: 'lesson-5', subtopicId: 'sub-5-3', completed: true, completedAt: '2026-01-17' },
  // Lesson 6 - ALL subtopics completed
  { studentId: 'student-3', lessonId: 'lesson-6', subtopicId: 'sub-6-1', completed: true, completedAt: '2026-01-18' },
  { studentId: 'student-3', lessonId: 'lesson-6', subtopicId: 'sub-6-2', completed: true, completedAt: '2026-01-19' },
  
  // Student 4 - Carlos Lopez (0 lessons completed - some progress but nothing finished)
  // Lesson 1 - Partial progress (not completed)
  { studentId: 'student-4', lessonId: 'lesson-1', subtopicId: 'sub-1-1', completed: true, completedAt: '2026-01-10' },
  { studentId: 'student-4', lessonId: 'lesson-1', subtopicId: 'sub-1-2', completed: true, completedAt: '2026-01-12' },
  { studentId: 'student-4', lessonId: 'lesson-1', subtopicId: 'sub-1-3', completed: false, completedAt: '' },
  { studentId: 'student-4', lessonId: 'lesson-1', subtopicId: 'sub-1-4', completed: false, completedAt: '' },
  // Lesson 2 - Partial progress (not completed)
  { studentId: 'student-4', lessonId: 'lesson-2', subtopicId: 'sub-2-1', completed: true, completedAt: '2026-01-14' },
  { studentId: 'student-4', lessonId: 'lesson-2', subtopicId: 'sub-2-2', completed: false, completedAt: '' },
  { studentId: 'student-4', lessonId: 'lesson-2', subtopicId: 'sub-2-3', completed: false, completedAt: '' },
  { studentId: 'student-4', lessonId: 'lesson-2', subtopicId: 'sub-2-4', completed: false, completedAt: '' },
  // Lesson 3 - Not started
  { studentId: 'student-4', lessonId: 'lesson-3', subtopicId: 'sub-3-1', completed: false, completedAt: '' },
  { studentId: 'student-4', lessonId: 'lesson-3', subtopicId: 'sub-3-2', completed: false, completedAt: '' },
  { studentId: 'student-4', lessonId: 'lesson-3', subtopicId: 'sub-3-3', completed: false, completedAt: '' },
  // Lesson 4 - Not started
  { studentId: 'student-4', lessonId: 'lesson-4', subtopicId: 'sub-4-1', completed: false, completedAt: '' },
  { studentId: 'student-4', lessonId: 'lesson-4', subtopicId: 'sub-4-2', completed: false, completedAt: '' },
  // Lesson 5 - Not started
  { studentId: 'student-4', lessonId: 'lesson-5', subtopicId: 'sub-5-1', completed: false, completedAt: '' },
  { studentId: 'student-4', lessonId: 'lesson-5', subtopicId: 'sub-5-2', completed: false, completedAt: '' },
  { studentId: 'student-4', lessonId: 'lesson-5', subtopicId: 'sub-5-3', completed: false, completedAt: '' },
  // Lesson 6 - Not started
  { studentId: 'student-4', lessonId: 'lesson-6', subtopicId: 'sub-6-1', completed: false, completedAt: '' },
  { studentId: 'student-4', lessonId: 'lesson-6', subtopicId: 'sub-6-2', completed: false, completedAt: '' },
  
  // Student 5 - Alex Rivera (3 lessons completed: lessons 1, 2, 3)
  // Lesson 1 - ALL subtopics completed
  { studentId: 'student-5', lessonId: 'lesson-1', subtopicId: 'sub-1-1', completed: true, completedAt: '2026-01-03' },
  { studentId: 'student-5', lessonId: 'lesson-1', subtopicId: 'sub-1-2', completed: true, completedAt: '2026-01-04' },
  { studentId: 'student-5', lessonId: 'lesson-1', subtopicId: 'sub-1-3', completed: true, completedAt: '2026-01-05' },
  { studentId: 'student-5', lessonId: 'lesson-1', subtopicId: 'sub-1-4', completed: true, completedAt: '2026-01-06' },
  // Lesson 2 - ALL subtopics completed
  { studentId: 'student-5', lessonId: 'lesson-2', subtopicId: 'sub-2-1', completed: true, completedAt: '2026-01-07' },
  { studentId: 'student-5', lessonId: 'lesson-2', subtopicId: 'sub-2-2', completed: true, completedAt: '2026-01-08' },
  { studentId: 'student-5', lessonId: 'lesson-2', subtopicId: 'sub-2-3', completed: true, completedAt: '2026-01-09' },
  { studentId: 'student-5', lessonId: 'lesson-2', subtopicId: 'sub-2-4', completed: true, completedAt: '2026-01-10' },
  // Lesson 3 - ALL subtopics completed
  { studentId: 'student-5', lessonId: 'lesson-3', subtopicId: 'sub-3-1', completed: true, completedAt: '2026-01-11' },
  { studentId: 'student-5', lessonId: 'lesson-3', subtopicId: 'sub-3-2', completed: true, completedAt: '2026-01-12' },
  { studentId: 'student-5', lessonId: 'lesson-3', subtopicId: 'sub-3-3', completed: true, completedAt: '2026-01-13' },
  // Lesson 4 - Partial progress (not completed)
  { studentId: 'student-5', lessonId: 'lesson-4', subtopicId: 'sub-4-1', completed: true, completedAt: '2026-01-14' },
  { studentId: 'student-5', lessonId: 'lesson-4', subtopicId: 'sub-4-2', completed: false, completedAt: '' },
  // Lesson 5 - Not started
  { studentId: 'student-5', lessonId: 'lesson-5', subtopicId: 'sub-5-1', completed: false, completedAt: '' },
  { studentId: 'student-5', lessonId: 'lesson-5', subtopicId: 'sub-5-2', completed: false, completedAt: '' },
  { studentId: 'student-5', lessonId: 'lesson-5', subtopicId: 'sub-5-3', completed: false, completedAt: '' },
  // Lesson 6 - Not started
  { studentId: 'student-5', lessonId: 'lesson-6', subtopicId: 'sub-6-1', completed: false, completedAt: '' },
  { studentId: 'student-5', lessonId: 'lesson-6', subtopicId: 'sub-6-2', completed: false, completedAt: '' },
  
  // Student 6 - Isabella Torres (1 lesson completed: lesson 1)
  // Lesson 1 - ALL subtopics completed
  { studentId: 'student-6', lessonId: 'lesson-1', subtopicId: 'sub-1-1', completed: true, completedAt: '2026-01-07' },
  { studentId: 'student-6', lessonId: 'lesson-1', subtopicId: 'sub-1-2', completed: true, completedAt: '2026-01-09' },
  { studentId: 'student-6', lessonId: 'lesson-1', subtopicId: 'sub-1-3', completed: true, completedAt: '2026-01-11' },
  { studentId: 'student-6', lessonId: 'lesson-1', subtopicId: 'sub-1-4', completed: true, completedAt: '2026-01-13' },
  // Lesson 2 - Partial progress (not completed)
  { studentId: 'student-6', lessonId: 'lesson-2', subtopicId: 'sub-2-1', completed: true, completedAt: '2026-01-15' },
  { studentId: 'student-6', lessonId: 'lesson-2', subtopicId: 'sub-2-2', completed: true, completedAt: '2026-01-17' },
  { studentId: 'student-6', lessonId: 'lesson-2', subtopicId: 'sub-2-3', completed: false, completedAt: '' },
  { studentId: 'student-6', lessonId: 'lesson-2', subtopicId: 'sub-2-4', completed: false, completedAt: '' },
  // Lesson 3 - Not started
  { studentId: 'student-6', lessonId: 'lesson-3', subtopicId: 'sub-3-1', completed: false, completedAt: '' },
  { studentId: 'student-6', lessonId: 'lesson-3', subtopicId: 'sub-3-2', completed: false, completedAt: '' },
  { studentId: 'student-6', lessonId: 'lesson-3', subtopicId: 'sub-3-3', completed: false, completedAt: '' },
  // Lesson 4 - Not started
  { studentId: 'student-6', lessonId: 'lesson-4', subtopicId: 'sub-4-1', completed: false, completedAt: '' },
  { studentId: 'student-6', lessonId: 'lesson-4', subtopicId: 'sub-4-2', completed: false, completedAt: '' },
  // Lesson 5 - Not started
  { studentId: 'student-6', lessonId: 'lesson-5', subtopicId: 'sub-5-1', completed: false, completedAt: '' },
  { studentId: 'student-6', lessonId: 'lesson-5', subtopicId: 'sub-5-2', completed: false, completedAt: '' },
  { studentId: 'student-6', lessonId: 'lesson-5', subtopicId: 'sub-5-3', completed: false, completedAt: '' },
  // Lesson 6 - Not started
  { studentId: 'student-6', lessonId: 'lesson-6', subtopicId: 'sub-6-1', completed: false, completedAt: '' },
  { studentId: 'student-6', lessonId: 'lesson-6', subtopicId: 'sub-6-2', completed: false, completedAt: '' },
];

// Mock Assessments
export const mockAssessments: Assessment[] = [
  { id: 'assess-1', lessonId: 'lesson-1', title: 'Number Values Assessment', maxScore: 10 },
  { id: 'assess-2', lessonId: 'lesson-2', title: 'Fundamental Operations Assessment', maxScore: 10 },
  { id: 'assess-3', lessonId: 'lesson-3', title: 'Fraction Assessment', maxScore: 10 },
  { id: 'assess-4', lessonId: 'lesson-4', title: 'Decimal Numbers Assessment', maxScore: 10 },
  { id: 'assess-5', lessonId: 'lesson-5', title: 'Percentage Assessment', maxScore: 10 },
  { id: 'assess-6', lessonId: 'lesson-6', title: 'Mensuration Assessment', maxScore: 10 },
];

// Mock Assessment Scores
export const mockAssessmentScores: AssessmentScore[] = [
  // Student 1 - Maria Santos (completed lessons 1, 2, 3)
  { id: 'score-1', studentId: 'student-1', assessmentId: 'assess-1', score: 9, maxScore: 10, completedAt: '2026-01-08' },
  { id: 'score-2', studentId: 'student-1', assessmentId: 'assess-2', score: 8, maxScore: 10, completedAt: '2026-01-12' },
  { id: 'score-3', studentId: 'student-1', assessmentId: 'assess-3', score: 9, maxScore: 10, completedAt: '2026-01-15' },
  
  // Student 2 - Juan Dela Cruz (completed lesson 1 only)
  { id: 'score-4', studentId: 'student-2', assessmentId: 'assess-1', score: 7, maxScore: 10, completedAt: '2026-01-10' },
  
  // Student 3 - Sofia Reyes (completed ALL 6 lessons)
  { id: 'score-5', studentId: 'student-3', assessmentId: 'assess-1', score: 10, maxScore: 10, completedAt: '2026-01-05' },
  { id: 'score-6', studentId: 'student-3', assessmentId: 'assess-2', score: 10, maxScore: 10, completedAt: '2026-01-09' },
  { id: 'score-7', studentId: 'student-3', assessmentId: 'assess-3', score: 9, maxScore: 10, completedAt: '2026-01-12' },
  { id: 'score-8', studentId: 'student-3', assessmentId: 'assess-4', score: 10, maxScore: 10, completedAt: '2026-01-14' },
  { id: 'score-9', studentId: 'student-3', assessmentId: 'assess-5', score: 9, maxScore: 10, completedAt: '2026-01-17' },
  { id: 'score-10', studentId: 'student-3', assessmentId: 'assess-6', score: 10, maxScore: 10, completedAt: '2026-01-19' },
  
  // Student 4 - Carlos Lopez (0 lessons completed - NO assessment scores)
  // No scores because no lessons are fully completed
  
  // Student 5 - Alex Rivera (completed lessons 1, 2, 3)
  { id: 'score-11', studentId: 'student-5', assessmentId: 'assess-1', score: 10, maxScore: 10, completedAt: '2026-01-06' },
  { id: 'score-12', studentId: 'student-5', assessmentId: 'assess-2', score: 9, maxScore: 10, completedAt: '2026-01-10' },
  { id: 'score-13', studentId: 'student-5', assessmentId: 'assess-3', score: 8, maxScore: 10, completedAt: '2026-01-13' },
  
  // Student 6 - Isabella Torres (completed lesson 1 only)
  { id: 'score-14', studentId: 'student-6', assessmentId: 'assess-1', score: 8, maxScore: 10, completedAt: '2026-01-13' },
];

// Mock Engagement Logs
export const mockEngagementLogs: EngagementLog[] = [
  // Last 7 days of data for various students (Updated to current dates)
  // Student 1 - Maria Santos
  { id: 'eng-1', studentId: 'student-1', date: '2026-01-20', sessionDuration: 35, lessonsAccessed: 2, activityType: 'lesson' },
  { id: 'eng-2', studentId: 'student-1', date: '2026-01-21', sessionDuration: 28, lessonsAccessed: 1, activityType: 'practice' },
  { id: 'eng-3', studentId: 'student-1', date: '2026-01-22', sessionDuration: 42, lessonsAccessed: 2, activityType: 'assessment' },
  { id: 'eng-4', studentId: 'student-1', date: '2026-01-23', sessionDuration: 31, lessonsAccessed: 1, activityType: 'lesson' },
  { id: 'eng-5', studentId: 'student-1', date: '2026-01-24', sessionDuration: 25, lessonsAccessed: 1, activityType: 'practice' },
  
  // Student 2 - Juan Dela Cruz
  { id: 'eng-6', studentId: 'student-2', date: '2026-01-19', sessionDuration: 20, lessonsAccessed: 1, activityType: 'lesson' },
  { id: 'eng-7', studentId: 'student-2', date: '2026-01-21', sessionDuration: 18, lessonsAccessed: 1, activityType: 'assessment' },
  { id: 'eng-8', studentId: 'student-2', date: '2026-01-23', sessionDuration: 15, lessonsAccessed: 1, activityType: 'practice' },
  
  // Student 3 - Sofia Reyes
  { id: 'eng-9', studentId: 'student-3', date: '2026-01-20', sessionDuration: 45, lessonsAccessed: 3, activityType: 'lesson' },
  { id: 'eng-10', studentId: 'student-3', date: '2026-01-21', sessionDuration: 38, lessonsAccessed: 2, activityType: 'assessment' },
  { id: 'eng-11', studentId: 'student-3', date: '2026-01-22', sessionDuration: 40, lessonsAccessed: 2, activityType: 'lesson' },
  { id: 'eng-12', studentId: 'student-3', date: '2026-01-23', sessionDuration: 35, lessonsAccessed: 2, activityType: 'assessment' },
  { id: 'eng-13', studentId: 'student-3', date: '2026-01-24', sessionDuration: 42, lessonsAccessed: 3, activityType: 'practice' },
  
  // Student 5 - Alex Rivera (Added)
  { id: 'eng-14', studentId: 'student-5', date: '2026-01-18', sessionDuration: 30, lessonsAccessed: 2, activityType: 'lesson' },
  { id: 'eng-15', studentId: 'student-5', date: '2026-01-20', sessionDuration: 33, lessonsAccessed: 1, activityType: 'assessment' },
  { id: 'eng-16', studentId: 'student-5', date: '2026-01-22', sessionDuration: 27, lessonsAccessed: 2, activityType: 'practice' },
  { id: 'eng-17', studentId: 'student-5', date: '2026-01-24', sessionDuration: 38, lessonsAccessed: 2, activityType: 'lesson' },
];

// Mock Teachers
export const mockTeachers: Teacher[] = [
  { 
    id: 'teacher-1', 
    name: 'Ana Garcia',
    firstName: 'Ana',
    lastName: 'Garcia',
    middleName: '',
    suffix: '',
    email: 'ana.garcia@school.edu.ph', 
    subjects: ['Mathematics'],
    employeeId: 'EMP-2024-001',
    gender: 'female',
    classesHandled: ['class-1', 'class-2', 'class-3']
  },
  { 
    id: 'teacher-2', 
    name: 'Carlos Mendoza',
    firstName: 'Carlos',
    lastName: 'Mendoza',
    middleName: '',
    suffix: '',
    email: 'carlos.mendoza@school.edu.ph', 
    subjects: ['Mathematics', 'Science'],
    employeeId: 'EMP-2024-002',
    gender: 'male',
    classesHandled: ['class-4', 'class-5']
  },
  { 
    id: 'teacher-3', 
    name: 'Sofia Reyes',
    firstName: 'Sofia',
    lastName: 'Reyes',
    middleName: '',
    suffix: '',
    email: 'sofia.reyes@school.edu.ph', 
    subjects: ['Mathematics'],
    employeeId: 'EMP-2024-003',
    gender: 'female',
    classesHandled: ['class-6', 'class-7', 'class-8']
  },
  { 
    id: 'teacher-4', 
    name: 'Marco Santos',
    firstName: 'Marco',
    lastName: 'Santos',
    middleName: '',
    suffix: '',
    email: 'marco.santos@school.edu.ph', 
    subjects: ['Mathematics', 'SPED'],
    employeeId: 'EMP-2024-004',
    gender: 'male',
    classesHandled: ['class-9']
  },
];

// Mock Schools
export const mockSchools: School[] = [
  { id: 'school-1', name: 'San Jose Elementary School' },
  { id: 'school-2', name: 'Maria Clara SPED Center' },
  { id: 'school-3', name: 'Rizal Integrated School' },
];

// Mock Classes
export const mockClasses: Class[] = [
  { 
    id: 'class-1', 
    schoolId: 'school-1', 
    schoolName: 'San Jose Elementary School',
    grade: 'Grade 3', 
    section: 'Section A',
    teacherId: 'teacher-1',
    studentCount: 5
  },
  { 
    id: 'class-2', 
    schoolId: 'school-1', 
    schoolName: 'San Jose Elementary School',
    grade: 'Grade 4', 
    section: 'Section A',
    teacherId: 'teacher-1',
    studentCount: 4
  },
  { 
    id: 'class-3', 
    schoolId: 'school-1', 
    schoolName: 'San Jose Elementary School',
    grade: 'Grade 4', 
    section: 'Section B',
    teacherId: 'teacher-1',
    studentCount: 5
  },
  { 
    id: 'class-4', 
    schoolId: 'school-2', 
    schoolName: 'Maria Clara SPED Center',
    grade: 'Grade 5', 
    section: 'SPED A',
    teacherId: 'teacher-2',
    studentCount: 3
  },
  { 
    id: 'class-5', 
    schoolId: 'school-2', 
    schoolName: 'Maria Clara SPED Center',
    grade: 'Grade 6', 
    section: 'SPED A',
    teacherId: 'teacher-2',
    studentCount: 4
  },
  { 
    id: 'class-6', 
    schoolId: 'school-3', 
    schoolName: 'Rizal Integrated School',
    grade: 'Grade 3', 
    section: 'Section C',
    teacherId: 'teacher-3',
    studentCount: 5
  },
  { 
    id: 'class-7', 
    schoolId: 'school-3', 
    schoolName: 'Rizal Integrated School',
    grade: 'Grade 5', 
    section: 'Section A',
    teacherId: 'teacher-3',
    studentCount: 5
  },
  { 
    id: 'class-8', 
    schoolId: 'school-1', 
    schoolName: 'San Jose Elementary School',
    grade: 'Grade 5', 
    section: 'Section B',
    teacherId: 'teacher-3',
    studentCount: 4
  },
  { 
    id: 'class-9', 
    schoolId: 'school-2', 
    schoolName: 'Maria Clara SPED Center',
    grade: 'Grade 4', 
    section: 'SPED B',
    teacherId: 'teacher-4',
    studentCount: 2
  },
  { 
    id: 'class-10', 
    schoolId: 'school-3', 
    schoolName: 'Rizal Integrated School',
    grade: 'Grade 6', 
    section: 'Section B',
    teacherId: null,
    studentCount: 5
  },
  { 
    id: 'class-11', 
    schoolId: 'school-1', 
    schoolName: 'San Jose Elementary School',
    grade: 'Grade 3', 
    section: 'Section B',
    teacherId: null,
    studentCount: 3
  },
];

// Mock AI Insights
export const mockAIInsights: AIInsight[] = [
  {
    id: 'insight-1',
    type: 'success',
    title: 'High Engagement Detected',
    description: 'Sofia Reyes has shown exceptional engagement with 40+ minutes average daily session time. Consider providing advanced materials.',
    generatedAt: '2026-01-18',
  },
  {
    id: 'insight-2',
    type: 'warning',
    title: 'Low Completion Rate',
    description: 'Juan Dela Cruz has completed only 33% of Basic Addition subtopics. Consider one-on-one support or modified pacing.',
    generatedAt: '2026-01-18',
  },
  {
    id: 'insight-3',
    type: 'info',
    title: 'Assessment Performance Trend',
    description: 'Overall class average for Basic Addition Quiz is 8.3/10 (83%), indicating strong foundational understanding.',
    generatedAt: '2026-01-17',
  },
  {
    id: 'insight-4',
    type: 'info',
    title: 'Engagement Pattern',
    description: 'Most students show higher engagement during morning sessions (9-11 AM). Consider scheduling challenging topics during this window.',
    generatedAt: '2026-01-16',
  },
];