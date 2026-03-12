const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/auth');
const { query } = require('../config/database');

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(isAdmin);

// Get all users
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let queryText = `
      SELECT u.id, u.email, u.name, u.school, u.section, u.created_at,
             COUNT(DISTINCT up.id) as total_progress,
             SUM(CASE WHEN up.completed THEN 1 ELSE 0 END) as completed_lessons
      FROM users u
      LEFT JOIN user_progress up ON u.id = up.user_id
    `;

    const params = [];
    
    if (search) {
      queryText += ` WHERE u.name ILIKE $1 OR u.email ILIKE $1`;
      params.push(`%${search}%`);
    }

    queryText += ` GROUP BY u.id ORDER BY u.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    // Get total count
    const countQuery = search 
      ? `SELECT COUNT(*) FROM users WHERE name ILIKE $1 OR email ILIKE $1`
      : `SELECT COUNT(*) FROM users`;
    const countParams = search ? [`%${search}%`] : [];
    const countResult = await query(countQuery, countParams);

    res.json({
      users: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        totalPages: Math.ceil(countResult.rows[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get specific user details
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const userResult = await query(
      'SELECT id, email, name, school, section, created_at FROM users WHERE id = $1',
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const progressResult = await query(
      'SELECT * FROM user_progress WHERE user_id = $1 ORDER BY updated_at DESC',
      [id]
    );

    const statsResult = await query(
      `SELECT 
        COUNT(*) as total_lessons,
        SUM(CASE WHEN completed THEN 1 ELSE 0 END) as completed_lessons,
        AVG(score) as average_score,
        SUM(time_spent) as total_time_spent
       FROM user_progress WHERE user_id = $1`,
      [id]
    );

    res.json({
      user: userResult.rows[0],
      progress: progressResult.rows,
      stats: statsResult.rows[0]
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get dashboard statistics
router.get('/stats/dashboard', async (req, res) => {
  try {
    const totalUsers = await query('SELECT COUNT(*) FROM users');
    const activeUsers = await query(
      `SELECT COUNT(DISTINCT user_id) FROM user_sessions 
       WHERE last_active > datetime('now', '-7 days')`
    );
    const totalProgress = await query('SELECT COUNT(*) FROM user_progress');
    const completedLessons = await query(
      'SELECT COUNT(*) FROM user_progress WHERE completed = true'
    );

    const topicStats = await query(
      `SELECT topic, COUNT(*) as total, 
              SUM(CASE WHEN completed THEN 1 ELSE 0 END) as completed,
              AVG(score) as avg_score
       FROM user_progress
       GROUP BY topic
       ORDER BY total DESC`
    );

    const recentActivity = await query(
      `SELECT u.name, u.email, up.topic, up.score, up.completed, up.updated_at
       FROM user_progress up
       JOIN users u ON up.user_id = u.id
       ORDER BY up.updated_at DESC
       LIMIT 10`
    );

    res.json({
      overview: {
        totalUsers: parseInt(totalUsers.rows[0].count),
        activeUsers: parseInt(activeUsers.rows[0].count),
        totalProgress: parseInt(totalProgress.rows[0].count),
        completedLessons: parseInt(completedLessons.rows[0].count)
      },
      topicStats: topicStats.rows,
      recentActivity: recentActivity.rows
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user (admin only)
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting yourself
    if (parseInt(id) === req.user.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const result = await query(
      'DELETE FROM users WHERE id = $1 RETURNING email, name',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User deleted successfully',
      deleted: result.rows[0]
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Make user admin
router.post('/users/:id/make-admin', async (req, res) => {
  try {
    const { id } = req.params;

    await query(
      'INSERT INTO admins (user_id, role) VALUES ($1, $2) ON CONFLICT (user_id) DO NOTHING',
      [id, 'admin']
    );

    res.json({ message: 'User promoted to admin successfully' });
  } catch (error) {
    console.error('Make admin error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
