const express = require('express');
const router = express.Router();
const pool = require('../db');

// CREATE HUMAN REVIEW
router.post('/', async (req, res) => {
  try {
    const { violation_id, reviewer_name, decision, comments } = req.body;

    const result = await pool.query(
      `INSERT INTO human_reviews (violation_id, reviewer_name, decision, comments)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [violation_id, reviewer_name, decision, comments]
    );

    // AUTO‑CREATE AUDIT LOG
    await pool.query(
      `INSERT INTO audit_logs (action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4)`,
      [
        'review_submitted',
        'human_review',
        result.rows[0].id,
        `Review decision: ${decision}`
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating human review:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET ALL REVIEWS
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM human_reviews ORDER BY reviewed_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET ONE REVIEW
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM human_reviews WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching review:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// UPDATE REVIEW
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { violation_id, reviewer_name, decision, comments } = req.body;

    const result = await pool.query(
      `UPDATE human_reviews
       SET violation_id = $1,
           reviewer_name = $2,
           decision = $3,
           comments = $4,
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [violation_id, reviewer_name, decision, comments, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating review:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE REVIEW
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM human_reviews WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({ message: 'Review deleted' });
  } catch (err) {
    console.error('Error deleting review:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

