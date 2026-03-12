import express from 'express';
import db from '../db/connection.js';
import { ApiResponse } from '../types/index.js';

const router = express.Router();

// Record student progress (called from APK)
router.post('/progress', async (req, res) => {
  try {
    const { studentId, lessonId, subtopicId, completed } = req.body;

    if (!studentId || !lessonId || !subtopicId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      } as ApiResponse);
    }

    const stmt = db.prepare(`
      INSERT INTO student_progress (student_id, lesson_id, subtopic_id, completed, completed_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT (student_id, subtopic_id)
      DO UPDATE SET 
        completed = ?,
        completed_at = CASE WHEN ? = 1 THEN ? ELSE student_progress.completed_at END,
        updated_at = datetime('now')
    `);

    const now = new Date().toISOString();
    stmt.run(
      studentId, 
      lessonId, 
      subtopicId, 
      completed ? 1 : 0, 
      completed ? now : null,
      completed ? 1 : 0,
      completed ? 1 : 0,
      completed ? now : null
    );

    const result = db.prepare('SELECT * FROM student_progress WHERE student_id = ? AND subtopic_id = ?')
      .get(studentId, subtopicId);

    res.json({
      success: true,
      data: result,
      message: 'Progress updated successfully'
    } as ApiResponse);
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update progress'
    } as ApiResponse);
  }
});

// Record assessment score (called from APK)
router.post('/assessments/score', async (req, res) => {
  try {
    const { studentId, assessmentId, score, maxScore } = req.body;

    if (!studentId || !assessmentId || score === undefined || !maxScore) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      } as ApiResponse);
    }

    const stmt = db.prepare(`
      INSERT INTO assessment_scores (student_id, assessment_id, score, max_score, completed_at)
      VALUES (?, ?, ?, ?, datetime('now'))
      ON CONFLICT (student_id, assessment_id)
      DO UPDATE SET 
        score = ?,
        max_score = ?,
        completed_at = datetime('now'),
        updated_at = datetime('now')
    `);

    stmt.run(studentId, assessmentId, score, maxScore, score, maxScore);

    const result = db.prepare('SELECT * FROM assessment_scores WHERE student_id = ? AND assessment_id = ?')
      .get(studentId, assessmentId);

    res.json({
      success: true,
      data: result,
      message: 'Assessment score recorded successfully'
    } as ApiResponse);
  } catch (error) {
    console.error('Error recording assessment score:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record assessment score'
    } as ApiResponse);
  }
});

// Log student engagement (called from APK)
router.post('/engagement', async (req, res) => {
  try {
    const { studentId, sessionDuration, lessonsAccessed, activityType } = req.body;

    if (!studentId || !sessionDuration || !activityType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      } as ApiResponse);
    }

    const stmt = db.prepare(`
      INSERT INTO engagement_logs (student_id, session_date, session_duration, lessons_accessed, activity_type)
      VALUES (?, date('now'), ?, ?, ?)
    `);

    stmt.run(studentId, sessionDuration, lessonsAccessed || 0, activityType);

    const result = db.prepare('SELECT * FROM engagement_logs WHERE id = last_insert_rowid()').get();

    res.json({
      success: true,
      data: result,
      message: 'Engagement logged successfully'
    } as ApiResponse);
  } catch (error) {
    console.error('Error logging engagement:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to log engagement'
    } as ApiResponse);
  }
});

// Get student by ID (for APK login/sync)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = db.prepare(`
      SELECT 
        s.id,
        s.name,
        s.gender,
        s.enrollment_date,
        c.grade,
        c.section,
        sc.name as school_name
      FROM students s
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN schools sc ON c.school_id = sc.id
      WHERE s.id = ?
    `).get(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: result
    } as ApiResponse);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch student'
    } as ApiResponse);
  }
});

// Get student progress (for APK sync)
router.get('/:id/progress', async (req, res) => {
  try {
    const { id } = req.params;

    const results = db.prepare(`
      SELECT 
        sp.lesson_id,
        sp.subtopic_id,
        sp.completed,
        sp.completed_at
      FROM student_progress sp
      WHERE sp.student_id = ?
    `).all(id);

    res.json({
      success: true,
      data: results
    } as ApiResponse);
  } catch (error) {
    console.error('Error fetching student progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch student progress'
    } as ApiResponse);
  }
});

export default router;
