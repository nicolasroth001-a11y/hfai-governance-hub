const { generateApiKey, hashApiKey } = require('../utils/apiKeys');
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken, requireRole, scopeByOrg } = require('../middleware/auth');

// GET ALL AI SYSTEMS (scoped)
router.get('/', authenticateToken, scopeByOrg, async (req, res) => {
  try {
    let result;
    if (req.user.role === 'admin') {
      result = await pool.query('SELECT * FROM ai_systems ORDER BY created_at DESC');
    } else if (req.user.role === 'customer') {
      result = await pool.query('SELECT * FROM ai_systems WHERE org_id = $1 ORDER BY created_at DESC', [req.orgScope]);
    } else {
      return res.status(403).json({ error: 'Reviewers cannot access AI systems' });
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET ONE AI SYSTEM (scoped)
router.get('/:id', authenticateToken, scopeByOrg, async (req, res) => {
  try {
    let result;
    if (req.user.role === 'admin') {
      result = await pool.query('SELECT * FROM ai_systems WHERE id = $1', [req.params.id]);
    } else if (req.user.role === 'customer') {
      result = await pool.query('SELECT * FROM ai_systems WHERE id = $1 AND org_id = $2', [req.params.id, req.orgScope]);
    } else {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (result.rows.length === 0) return res.status(404).json({ error: 'AI system not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// CREATE AI SYSTEM (customer creates for their org)
router.post('/', authenticateToken, requireRole('admin', 'customer'), scopeByOrg, async (req, res) => {
  try {
    const { name, description, model_type, provider, version, risk_level } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const apiKey = generateApiKey();
    const apiKeyHash = hashApiKey(apiKey);
    const orgId = req.user.role === 'customer' ? req.orgScope : (req.body.org_id || null);

    const result = await pool.query(
      `INSERT INTO ai_systems (name, description, model_type, provider, version, risk_level, api_key_hash, org_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, name, description, model_type, provider, version, risk_level, created_at, org_id`,
      [name, description, model_type, provider, version, risk_level, apiKeyHash, orgId]
    );

    res.status(201).json({ ...result.rows[0], api_key: apiKey });
  } catch (err) {
    console.error('Error creating AI system:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// UPDATE AI SYSTEM
router.put('/:id', authenticateToken, requireRole('admin', 'customer'), async (req, res) => {
  try {
    const { name, description, model_type, provider, version, risk_level } = req.body;
    const result = await pool.query(
      `UPDATE ai_systems SET name=$1, description=$2, model_type=$3, provider=$4, version=$5, risk_level=$6, updated_at=NOW()
       WHERE id=$7 RETURNING *`,
      [name, description, model_type, provider, version, risk_level, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'AI system not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE AI SYSTEM
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM ai_systems WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'AI system not found' });
    res.json({ message: 'AI system deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
