-- Sample Data for SenyamatiKard Database
-- Run this after schema.sql to populate with test data

-- Insert Admin Account
-- Password: admin123
INSERT INTO admins (name, email, password) VALUES
('System Administrator', 'admin@senyamatika.com', '$2b$10$rBV2kHYW5nF5xGvqYqYqYeF5xGvqYqYqYeF5xGvqYqYqYeF5xGvqY');

-- Insert Schools
INSERT INTO schools (id, name, address) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Manila Elementary School', '123 Rizal St, Manila'),
('550e8400-e29b-41d4-a716-446655440002', 'Quezon City High School', '456 Commonwealth Ave, QC'),
('550e8400-e29b-41d4-a716-446655440003', 'Makati Learning Center', '789 Ayala Ave, Makati');

-- Insert Teachers
-- Password format: lastname_lastThreeCharsOfEmployeeID
-- Teacher 1: cruz_001 (Juan Dela Cruz, EMP-001)
-- Teacher 2: santos_002 (Maria Santos, EMP-002)
-- Teacher 3: reyes_003 (Pedro Reyes, EMP-003)
INSERT INTO teachers (id, first_name, last_name, middle_name, suffix, email, employee_id, password, gender) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Juan', 'Cruz', 'Dela', NULL, 'juan.cruz@school.com', 'EMP-001', '$2b$10$YourHashedPasswordHere1', 'male'),
('660e8400-e29b-41d4-a716-446655440002', 'Maria', 'Santos', 'Garcia', NULL, 'maria.santos@school.com', 'EMP-002', '$2b$10$YourHashedPasswordHere2', 'female'),
('660e8400-e29b-41d4-a716-446655440003', 'Pedro', 'Reyes', 'Lopez', 'Jr.', 'pedro.reyes@school.com', 'EMP-003', '$2b$10$YourHashedPasswordHere3', 'male');

-- Insert Classes
INSERT INTO classes (id, school_id, grade, section, teacher_id) VALUES
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Grade 1', 'Section A', '660e8400-e29b-41d4-a716-446655440001'),
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Grade 1', 'Section B', '660e8400-e29b-41d4-a716-446655440001'),
('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Grade 2', 'Section A', '660e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', 'Grade 3', 'Section A', '660e8400-e29b-41d4-a716-446655440003');

-- Insert Students
INSERT INTO students (id, name, gender, class_id, enrollment_date) VALUES
-- Class 1 (Grade 1 Section A)
('880e8400-e29b-41d4-a716-446655440001', 'Ana Martinez', 'female', '770e8400-e29b-41d4-a716-446655440001', '2024-06-01'),
('880e8400-e29b-41d4-a716-446655440002', 'Carlos Gomez', 'male', '770e8400-e29b-41d4-a716-446655440001', '2024-06-01'),
('880e8400-e29b-41d4-a716-446655440003', 'Diana Lopez', 'female', '770e8400-e29b-41d4-a716-446655440001', '2024-06-01'),
('880e8400-e29b-41d4-a716-446655440004', 'Eduardo Ramos', 'male', '770e8400-e29b-41d4-a716-446655440001', '2024-06-01'),
('880e8400-e29b-41d4-a716-446655440005', 'Fatima Torres', 'female', '770e8400-e29b-41d4-a716-446655440001', '2024-06-01'),
-- Class 2 (Grade 1 Section B)
('880e8400-e29b-41d4-a716-446655440006', 'Gabriel Silva', 'male', '770e8400-e29b-41d4-a716-446655440002', '2024-06-01'),
('880e8400-e29b-41d4-a716-446655440007', 'Hannah Cruz', 'female', '770e8400-e29b-41d4-a716-446655440002', '2024-06-01'),
('880e8400-e29b-41d4-a716-446655440008', 'Ivan Mendoza', 'male', '770e8400-e29b-41d4-a716-446655440002', '2024-06-01'),
-- Class 3 (Grade 2 Section A)
('880e8400-e29b-41d4-a716-446655440009', 'Julia Fernandez', 'female', '770e8400-e29b-41d4-a716-446655440003', '2024-06-01'),
('880e8400-e29b-41d4-a716-446655440010', 'Kevin Morales', 'male', '770e8400-e29b-41d4-a716-446655440003', '2024-06-01');

-- Insert Lessons
INSERT INTO lessons (id, title, description, category, order_num, has_assessment) VALUES
('990e8400-e29b-41d4-a716-446655440001', 'Whole Numbers', 'Understanding whole numbers and counting', 'Number Values', 1, true),
('990e8400-e29b-41d4-a716-446655440002', 'Addition Basics', 'Learning basic addition', 'Operations', 2, true),
('990e8400-e29b-41d4-a716-446655440003', 'Subtraction Basics', 'Learning basic subtraction', 'Operations', 3, true),
('990e8400-e29b-41d4-a716-446655440004', 'Introduction to Fractions', 'Understanding fractions', 'Fractions', 4, true),
('990e8400-e29b-41d4-a716-446655440005', 'Money Value', 'Understanding money and value', 'Practical Math', 5, false);

-- Insert Subtopics
INSERT INTO subtopics (lesson_id, title, order_num) VALUES
-- Whole Numbers
('990e8400-e29b-41d4-a716-446655440001', 'Counting 1-10', 1),
('990e8400-e29b-41d4-a716-446655440001', 'Counting 11-20', 2),
('990e8400-e29b-41d4-a716-446655440001', 'Counting 21-50', 3),
-- Addition Basics
('990e8400-e29b-41d4-a716-446655440002', 'Adding Single Digits', 1),
('990e8400-e29b-41d4-a716-446655440002', 'Adding with Objects', 2),
('990e8400-e29b-41d4-a716-446655440002', 'Addition Properties', 3),
-- Subtraction Basics
('990e8400-e29b-41d4-a716-446655440003', 'Subtracting Single Digits', 1),
('990e8400-e29b-41d4-a716-446655440003', 'Subtracting with Objects', 2),
-- Fractions
('990e8400-e29b-41d4-a716-446655440004', 'What is a Fraction', 1),
('990e8400-e29b-41d4-a716-446655440004', 'Reading Fractions', 2),
('990e8400-e29b-41d4-a716-446655440004', 'Comparing Fractions', 3),
-- Money Value
('990e8400-e29b-41d4-a716-446655440005', 'Coins and Bills', 1),
('990e8400-e29b-41d4-a716-446655440005', 'Counting Money', 2);

-- Insert Assessments
INSERT INTO assessments (lesson_id, title, max_score) VALUES
('990e8400-e29b-41d4-a716-446655440001', 'Whole Numbers Quiz', 10),
('990e8400-e29b-41d4-a716-446655440002', 'Addition Test', 10),
('990e8400-e29b-41d4-a716-446655440003', 'Subtraction Test', 10),
('990e8400-e29b-41d4-a716-446655440004', 'Fractions Quiz', 10);

-- Insert Sample Student Progress
-- Student 1 (Ana Martinez) - High performer
INSERT INTO student_progress (student_id, lesson_id, subtopic_id, completed, completed_at)
SELECT 
  '880e8400-e29b-41d4-a716-446655440001',
  lesson_id,
  id,
  true,
  CURRENT_TIMESTAMP - (random() * interval '30 days')
FROM subtopics
WHERE lesson_id IN ('990e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440002');

-- Student 2 (Carlos Gomez) - Average performer
INSERT INTO student_progress (student_id, lesson_id, subtopic_id, completed, completed_at)
SELECT 
  '880e8400-e29b-41d4-a716-446655440002',
  lesson_id,
  id,
  true,
  CURRENT_TIMESTAMP - (random() * interval '30 days')
FROM subtopics
WHERE lesson_id = '990e8400-e29b-41d4-a716-446655440001';

-- Insert Sample Assessment Scores
INSERT INTO assessment_scores (student_id, assessment_id, score, max_score, completed_at)
SELECT 
  '880e8400-e29b-41d4-a716-446655440001',
  id,
  8 + floor(random() * 3)::int,
  max_score,
  CURRENT_TIMESTAMP - (random() * interval '30 days')
FROM assessments
WHERE lesson_id IN ('990e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440002');

INSERT INTO assessment_scores (student_id, assessment_id, score, max_score, completed_at)
SELECT 
  '880e8400-e29b-41d4-a716-446655440002',
  id,
  6 + floor(random() * 3)::int,
  max_score,
  CURRENT_TIMESTAMP - (random() * interval '30 days')
FROM assessments
WHERE lesson_id = '990e8400-e29b-41d4-a716-446655440001';

-- Insert Sample Engagement Logs
INSERT INTO engagement_logs (student_id, session_date, session_duration, lessons_accessed, activity_type)
SELECT 
  '880e8400-e29b-41d4-a716-446655440001',
  CURRENT_DATE - (random() * 30)::int,
  15 + floor(random() * 30)::int,
  1 + floor(random() * 3)::int,
  (ARRAY['lesson', 'assessment', 'practice'])[floor(random() * 3 + 1)]
FROM generate_series(1, 20);

INSERT INTO engagement_logs (student_id, session_date, session_duration, lessons_accessed, activity_type)
SELECT 
  '880e8400-e29b-41d4-a716-446655440002',
  CURRENT_DATE - (random() * 30)::int,
  10 + floor(random() * 25)::int,
  1 + floor(random() * 2)::int,
  (ARRAY['lesson', 'assessment', 'practice'])[floor(random() * 3 + 1)]
FROM generate_series(1, 15);

-- Verify data
SELECT 'Schools' as table_name, COUNT(*) as count FROM schools
UNION ALL
SELECT 'Teachers', COUNT(*) FROM teachers
UNION ALL
SELECT 'Classes', COUNT(*) FROM classes
UNION ALL
SELECT 'Students', COUNT(*) FROM students
UNION ALL
SELECT 'Lessons', COUNT(*) FROM lessons
UNION ALL
SELECT 'Subtopics', COUNT(*) FROM subtopics
UNION ALL
SELECT 'Assessments', COUNT(*) FROM assessments
UNION ALL
SELECT 'Student Progress', COUNT(*) FROM student_progress
UNION ALL
SELECT 'Assessment Scores', COUNT(*) FROM assessment_scores
UNION ALL
SELECT 'Engagement Logs', COUNT(*) FROM engagement_logs
UNION ALL
SELECT 'Admins', COUNT(*) FROM admins;

-- Display sample credentials
SELECT 
  '=== LOGIN CREDENTIALS ===' as info
UNION ALL
SELECT ''
UNION ALL
SELECT 'ADMIN:'
UNION ALL
SELECT '  Email: admin@senyamatika.com'
UNION ALL
SELECT '  Password: admin123'
UNION ALL
SELECT ''
UNION ALL
SELECT 'TEACHERS:'
UNION ALL
SELECT '  Employee ID: EMP-001, Password: cruz_001 (Juan Dela Cruz)'
UNION ALL
SELECT '  Employee ID: EMP-002, Password: santos_002 (Maria Santos)'
UNION ALL
SELECT '  Employee ID: EMP-003, Password: reyes_003 (Pedro Reyes)';
