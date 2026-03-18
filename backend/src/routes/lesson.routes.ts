import express from 'express';
import db from '../db/connection.js';
import { ApiResponse } from '../types/index.js';

const router = express.Router();

// Get all lessons with subtopics
router.get('/', async (req, res) => {
  try {
    const lessons = db.prepare('SELECT * FROM lessons ORDER BY order_num').all();

    const lessonsWithSubtopics = lessons.map(lesson => {
      const subtopics = db.prepare('SELECT * FROM subtopics WHERE lesson_id = ? ORDER BY order_num').all(lesson.id);
      return {
        ...lesson,
        subtopics
      };
    });

    res.json({
      success: true,
      data: lessonsWithSubtopics
    } as ApiResponse);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch lessons'
    } as ApiResponse);
  }
});

// Get lesson by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const lesson = db.prepare('SELECT * FROM lessons WHERE id = ?').get(id);
    
    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: 'Lesson not found'
      } as ApiResponse);
    }

    const subtopics = db.prepare('SELECT * FROM subtopics WHERE lesson_id = ? ORDER BY order_num').all(id);

    const lessonWithSubtopics = {
      ...lesson,
      subtopics
    };

    res.json({
      success: true,
      data: lessonWithSubtopics
    } as ApiResponse);
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch lesson'
    } as ApiResponse);
  }
});

// Get assessments for a lesson
router.get('/:id/assessments', async (req, res) => {
  try {
    const { id } = req.params;

    const assessments = db.prepare('SELECT * FROM assessments WHERE lesson_id = ?').all(id);

    res.json({
      success: true,
      data: assessments
    } as ApiResponse);
  } catch (error) {
    console.error('Error fetching assessments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assessments'
    } as ApiResponse);
  }
});

// Get all assessments
router.get('/assessments/all', async (req, res) => {
  try {
    const assessments = db.prepare('SELECT * FROM assessments ORDER BY lesson_id').all();

    res.json({
      success: true,
      data: assessments
    } as ApiResponse);
  } catch (error) {
    console.error('Error fetching all assessments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assessments'
    } as ApiResponse);
  }
});

export default router;
