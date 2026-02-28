const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken, requireRole, scopeByOrg } = require('../middleware/auth');

// GET ALL VIOLATIONS (scoped by role)
router.get('/', authenticateToken, scopeByOrg, async (req, res) => {
  try {
    let result;
    if (req.user.role === 'admin') {
      result = await pool.query('SELECT * FROM violations ORDER BY detected_at DESC');
    } else if (req.user.role === 'customer') {
      result = await pool.query('SELECT * FROM violations WHERE org_id = $1 ORDER BY detected_at DESC', [req.orgScope]);
    } else if (req.user.role === 'reviewer') {
      // Reviewers see all violations in the review queue (unreviewed or assigned)
      result = await pool.query(`
        SELECT v.* FROM violations v
        LEFT JOIN human_reviews hr ON hr.violation_id = v.id
        WHERE hr.id IS NULL OR hr.reviewer_name = $1
        ORDER BY v.detected_at DESC
      `, [req.user.name]);
    }
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching violations:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET ONE VIOLATION (scoped)
router.get('/:id', authenticateToken, scopeByOrg, async (req, res) => {
  try {
    const { id } = req.params;
    let result;
    if (req.user.role === 'admin') {
      result = await pool.query('SELECT * FROM violations WHERE id = $1', [id]);
    } else if (req.user.role === 'customer') {
      result = await pool.query('SELECT * FROM violations WHERE id = $1 AND org_id = $2', [id, req.orgScope]);
    } else {
      result = await pool.query('SELECT * FROM violations WHERE id = $1', [id]);
    }
    if (result.rows.length === 0) return res.status(404).json({ error: 'Violation not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// CREATE VIOLATION
router.post('/', async (req, res) => {
  try {
    const { ai_system_id, rule_id, description, severity, ai_event_id, org_id } = req.body;
    const result = await pool.query(
      `INSERT INTO violations (ai_system_id, rule_id, description, severity, ai_event_id, org_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [ai_system_id, rule_id, description, severity, ai_event_id, org_id || null]
    );
    await pool.query(
      `INSERT INTO audit_logs (action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4)`,
      ['violation_created', 'violation', result.rows[0].id, `Severity: ${severity}`]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating violation:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// UPDATE VIOLATION
router.put('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { ai_system_id, rule_id, description, severity, ai_event_id } = req.body;
    const result = await pool.query(
      `UPDATE violations SET ai_system_id=$1, rule_id=$2, description=$3, severity=$4, ai_event_id=$5, updated_at=NOW()
       WHERE id=$6 RETURNING *`,
      [ai_system_id, rule_id, description, severity, ai_event_id, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Violation not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE VIOLATION
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM violations WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Violation not found' });
    res.json({ message: 'Violation deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
