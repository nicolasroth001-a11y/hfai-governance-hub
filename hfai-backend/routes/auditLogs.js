const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

// GET AUDIT LOGS (admin sees all, others see limited)
router.get('/', authenticateToken, async (req, res) => {
  try {
    let result;
    if (req.user.role === 'admin') {
      result = await pool.query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 200');
    } else if (req.user.role === 'reviewer') {
      result = await pool.query(
        `SELECT * FROM audit_logs WHERE action IN ('review_submitted', 'violation_approved', 'violation_rejected')
         ORDER BY created_at DESC LIMIT 100`
      );
    } else {
      // Customer: logs related to their violations only
      result = await pool.query(
        `SELECT al.* FROM audit_logs al
         JOIN violations v ON al.entity_id::text = v.id::text AND al.entity_type = 'violation'
         WHERE v.org_id = $1
         ORDER BY al.created_at DESC LIMIT 100`,
        [req.user.org_id]
      );
    }
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching audit logs:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// CREATE AUDIT LOG (internal use)
router.post('/', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { action, entity_type, entity_id, details } = req.body;
    const result = await pool.query(
      `INSERT INTO audit_logs (action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4) RETURNING *`,
      [action, entity_type, entity_id, details]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
