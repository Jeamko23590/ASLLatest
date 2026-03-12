const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { query } = require('../config/database');

// Get all progress for current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM user_progress 
       WHERE user_id = $1 
       ORDER BY updated_at DESC`,
      [req.user.userId]
    );

    res.json({ progress: result.rows });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get progress for specific topic
router.get('/topic/:topic', authenticateToken, async (req, res) => {
  try {
    const { topic } = req.params;
    
    const result = await query(
      `SELECT * FROM user_progress 
       WHERE user_id = $1 AND topic = $2
       ORDER BY lesson_id`,
      [req.user.userId, topic]
    );

    res.json({ progress: result.rows });
  } catch (error) {
    console.error('Get topic progress error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Save or update progress
router.post('/save', authenticateToken, async (req, res) => {
  try {
    const { topic, lessonId, score, maxScore, completed, timeSpent } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    // Upsert progress (insert or update if exists)
    const result = await query(
      `INSERT INTO user_progress 
        (user_id, topic, lesson_id, score, max_score, completed, attempts, time_spent, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, 1, $7, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, topic, lesson_id)
       DO UPDATE SET
         score = GREATEST(user_progress.score, EXCLUDED.score),
         max_score = COALESCE(EXCLUDED.max_score, user_progress.max_score),
         completed = EXCLUDED.completed OR user_progress.completed,
         attempts = user_progress.attempts + 1,
         time_spent = user_progress.time_spent + EXCLUDED.time_spent,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        req.user.userId,
        topic,
        lessonId || null,
        score || 0,
        maxScore || 0,
        completed || false,
        timeSpent || 0
      ]
    );

    res.json({
      message: 'Progress saved successfully',
      progress: result.rows[0]
    });
  } catch (error) {
    console.error('Save progress error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Bulk save progress (for syncing multiple items)
router.post('/sync', authenticateToken, async (req, res) => {
  try {
    const { progressItems } = req.body;

    if (!Array.isArray(progressItems) || progressItems.length === 0) {
      return res.status(400).json({ error: 'Progress items array required' });
    }

    const results = [];
    
    for (const item of progressItems) {
      const result = await query(
        `INSERT INTO user_progress 
          (user_id, topic, lesson_id, score, max_score, completed, attempts, time_spent, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, 1, $7, CURRENT_TIMESTAMP)
         ON CONFLICT (user_id, topic, lesson_id)
         DO UPDATE SET
           score = GREATEST(user_progress.score, EXCLUDED.score),
           max_score = COALESCE(EXCLUDED.max_score, user_progress.max_score),
           completed = EXCLUDED.completed OR user_progress.completed,
           attempts = user_progress.attempts + 1,
           time_spent = user_progress.time_spent + EXCLUDED.time_spent,
           updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [
          req.user.userId,
          item.topic,
          item.lessonId || null,
          item.score || 0,
          item.maxScore || 0,
          item.completed || false,
          item.timeSpent || 0
        ]
      );
      results.push(result.rows[0]);
    }

    res.json({
      message: 'Progress synced successfully',
      synced: results.length,
      progress: results
    });
  } catch (error) {
    console.error('Sync progress error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete progress for a specific lesson
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'DELETE FROM user_progress WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Progress not found' });
    }

    res.json({ 
      message: 'Progress deleted successfully',
      deleted: result.rows[0]
    });
  } catch (error) {
    console.error('Delete progress error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
