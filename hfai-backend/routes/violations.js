const express = require('express');
const router = express.Router();
const pool = require('../db');

// CREATE VIOLATION
router.post('/', async (req, res) => {
  try {
    const { ai_system_id, rule_id, description, severity, ai_event_id } = req.body;

const result = await pool.query( `INSERT INTO violations (ai_system_id, rule_id, description, severity, ai_event_id) VALUES ($1, $2, $3, $4, $5) RETURNING *`, [ai_system_id, rule_id, description, severity, ai_event_id] );
    // AUTO‑CREATE AUDIT LOG
    await pool.query(
      `INSERT INTO audit_logs (action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4)`,
      [
        'violation_created',
        'violation',
        result.rows[0].id,
        `Violation severity: ${severity}`
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating violation:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET ALL VIOLATIONS
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM violations ORDER BY detected_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching violations:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET ONE VIOLATION
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM violations WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Violation not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching violation:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// UPDATE VIOLATION
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { ai_system_id, rule_id, description, severity, ai_event_id } = req.body;

  const result = await pool.query(
  `UPDATE violations
   SET ai_system_id = $1,
       rule_id = $2,
       description = $3,
       severity = $4,
       ai_event_id = $5,
       updated_at = NOW()
   WHERE id = $6
   RETURNING *`,
  [ai_system_id, rule_id, description, severity, ai_event_id, id]
);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Violation not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating violation:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE VIOLATION
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM violations WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Violation not found' });
    }

    res.json({ message: 'Violation deleted' });
  } catch (err) {
    console.error('Error deleting violation:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
