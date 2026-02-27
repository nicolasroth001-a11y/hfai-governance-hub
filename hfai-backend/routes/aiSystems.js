const { generateApiKey, hashApiKey } = require('../utils/apiKeys');
const express = require('express');
const router = express.Router();
const pool = require('../db');

// CREATE AI SYSTEM (with API key)
router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      model_type,
      provider,
      version,
      risk_level
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    // 1. Generate and hash API key
    const apiKey = generateApiKey();
    const apiKeyHash = hashApiKey(apiKey);

    // 2. Insert into DB
    const result = await pool.query(
      `INSERT INTO ai_systems
       (name, description, model_type, provider, version, risk_level, api_key_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, description, model_type, provider, version, risk_level, created_at`,
      [name, description, model_type, provider, version, risk_level, apiKeyHash]
    );

    // 3. Return system + plain API key ONCE
    res.status(201).json({
      ...result.rows[0],
      api_key: apiKey
    });

  } catch (err) {
    console.error('Error creating AI system:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET ALL AI SYSTEMS
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM ai_systems ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching AI systems:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET ONE AI SYSTEM
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM ai_systems WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'AI system not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching AI system:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// UPDATE AI SYSTEM
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      model_type,
      provider,
      version,
      risk_level
    } = req.body;

    const result = await pool.query(
      `UPDATE ai_systems
       SET name = $1,
           description = $2,
           model_type = $3,
           provider = $4,
           version = $5,
           risk_level = $6,
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [name, description, model_type, provider, version, risk_level, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'AI system not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating AI system:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE AI SYSTEM
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM ai_systems WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'AI system not found' });
    }

    res.json({ message: 'AI system deleted' });
  } catch (err) {
    console.error('Error deleting AI system:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
