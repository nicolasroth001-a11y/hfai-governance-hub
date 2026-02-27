const express = require('express');
const router = express.Router();
const pool = require('../db');

// CREATE AUDIT LOG ENTRY
router.post('/', async (req, res) => {
  try {
    const { action, entity_type, entity_id, details } = req.body;

    const result = await pool.query(
      `INSERT INTO audit_logs (action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [action, entity_type, entity_id, details]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating audit log:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET ALL AUDIT LOGS
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM audit_logs ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching audit logs:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
