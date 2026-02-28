const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET ALL RULES
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rules ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching rules:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET ONE RULE
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM rules WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rule not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching rule:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// CREATE RULE
router.post('/', async (req, res) => {
  try {
    const { name, description, category, severity, condition, enabled } = req.body;
    const result = await pool.query(
      `INSERT INTO rules (name, description, category, severity, condition, enabled)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, description, category || 'general', severity || 'medium', condition || '{}', enabled !== false]
    );

    await pool.query(
      `INSERT INTO audit_logs (action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4)`,
      ['rule_created', 'rule', result.rows[0].id, `Rule "${name}" created`]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating rule:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// UPDATE RULE
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, severity, condition, enabled } = req.body;
    const result = await pool.query(
      `UPDATE rules
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           category = COALESCE($3, category),
           severity = COALESCE($4, severity),
           condition = COALESCE($5, condition),
           enabled = COALESCE($6, enabled),
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [name, description, category, severity, condition, enabled, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rule not found' });
    }

    await pool.query(
      `INSERT INTO audit_logs (action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4)`,
      ['rule_updated', 'rule', id, `Rule "${result.rows[0].name}" updated`]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating rule:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE RULE
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM rules WHERE id = $1 RETURNING id, name', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rule not found' });
    }

    await pool.query(
      `INSERT INTO audit_logs (action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4)`,
      ['rule_deleted', 'rule', id, `Rule "${result.rows[0].name}" deleted`]
    );

    res.json({ message: 'Rule deleted' });
  } catch (err) {
    console.error('Error deleting rule:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
