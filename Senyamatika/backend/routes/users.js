const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { query } = require('../config/database');

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, email, name, school, section, created_at FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, school, section } = req.body;
    
    const result = await query(
      `UPDATE users 
       SET name = COALESCE($1, name),
           school = COALESCE($2, school),
           section = COALESCE($3, section),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, email, name, school, section`,
      [name, school, section, req.user.userId]
    );

    res.json({
      message: 'Profile updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await query(
      `SELECT 
        COUNT(*) as total_lessons,
        SUM(CASE WHEN completed THEN 1 ELSE 0 END) as completed_lessons,
        AVG(score) as average_score,
        SUM(time_spent) as total_time_spent,
        SUM(attempts) as total_attempts
       FROM user_progress
       WHERE user_id = $1`,
      [req.user.userId]
    );

    const topicProgress = await query(
      `SELECT topic, COUNT(*) as lessons, 
              SUM(CASE WHEN completed THEN 1 ELSE 0 END) as completed,
              AVG(score) as avg_score
       FROM user_progress
       WHERE user_id = $1
       GROUP BY topic
       ORDER BY topic`,
      [req.user.userId]
    );

    res.json({
      overall: stats.rows[0],
      byTopic: topicProgress.rows
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
