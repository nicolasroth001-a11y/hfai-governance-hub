const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

// CREATE HUMAN REVIEW (reviewer or admin only)
router.post('/', authenticateToken, requireRole('reviewer', 'admin'), async (req, res) => {
  try {
    const { violation_id, decision, comments } = req.body;
    const reviewer_name = req.user.name;

    const result = await pool.query(
      `INSERT INTO human_reviews (violation_id, reviewer_name, decision, comments)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [violation_id, reviewer_name, decision, comments]
    );

    await pool.query(
      `INSERT INTO audit_logs (action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4)`,
      ['review_submitted', 'human_review', result.rows[0].id, `${decision} by ${reviewer_name}`]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating human review:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET ALL REVIEWS (admin sees all, reviewer sees own)
router.get('/', authenticateToken, requireRole('reviewer', 'admin'), async (req, res) => {
  try {
    let result;
    if (req.user.role === 'admin') {
      result = await pool.query('SELECT * FROM human_reviews ORDER BY reviewed_at DESC');
    } else {
      result = await pool.query(
        'SELECT * FROM human_reviews WHERE reviewer_name = $1 ORDER BY reviewed_at DESC',
        [req.user.name]
      );
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET ONE REVIEW
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM human_reviews WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Review not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// UPDATE REVIEW
router.put('/:id', authenticateToken, requireRole('reviewer', 'admin'), async (req, res) => {
  try {
    const { decision, comments } = req.body;
    const result = await pool.query(
      `UPDATE human_reviews SET decision=$1, comments=$2, updated_at=NOW() WHERE id=$3 RETURNING *`,
      [decision, comments, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Review not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE REVIEW
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM human_reviews WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Review not found' });
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
