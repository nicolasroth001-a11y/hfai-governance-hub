const express = require('express');
const router = express.Router();
const pool = require('../db');
const crypto = require('crypto');
const { signToken } = require('../middleware/auth');

// Simple password hashing (bcrypt alternative without native deps)
function hashPassword(password, salt) {
  salt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

function verifyPassword(password, hash, salt) {
  const result = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return result === hash;
}

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    if (!verifyPassword(password, user.password_hash, user.password_salt)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      org_id: user.org_id || null,
      name: user.name,
    });

    // Audit log
    await pool.query(
      `INSERT INTO audit_logs (action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4)`,
      ['user_login', 'user', user.id, `${user.role} login: ${user.email}`]
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        org_id: user.org_id || null,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/signup (customer only)
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, company_name } = req.body;
    if (!email || !password || !company_name) {
      return res.status(400).json({ error: 'Email, password, and company name required' });
    }

    // Check existing user
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create organization
      const org = await client.query(
        `INSERT INTO organizations (name) VALUES ($1) RETURNING *`,
        [company_name]
      );

      // Create user
      const { hash, salt } = hashPassword(password);
      const user = await client.query(
        `INSERT INTO users (email, name, password_hash, password_salt, role, org_id)
         VALUES ($1, $2, $3, $4, 'customer', $5)
         RETURNING id, email, name, role, org_id`,
        [email.toLowerCase().trim(), name || company_name, hash, salt, org.rows[0].id]
      );

      // Generate API key for the organization
      const apiKey = crypto.randomBytes(32).toString('hex');
      const apiKeyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
      await client.query(
        `UPDATE organizations SET api_key_hash = $1 WHERE id = $2`,
        [apiKeyHash, org.rows[0].id]
      );

      await client.query('COMMIT');

      const token = signToken({
        id: user.rows[0].id,
        email: user.rows[0].email,
        role: 'customer',
        org_id: org.rows[0].id,
        name: user.rows[0].name,
      });

      // Audit log
      await pool.query(
        `INSERT INTO audit_logs (action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4)`,
        ['user_signup', 'user', user.rows[0].id, `Customer signup: ${email} (${company_name})`]
      );

      res.status(201).json({
        token,
        user: user.rows[0],
        organization: { ...org.rows[0], api_key: apiKey },
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Signup error:', err);
    if (err.message?.includes('already registered')) {
      return res.status(409).json({ error: err.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /auth/me (verify token + get user info)
router.get('/me', async (req, res) => {
  const { authenticateToken } = require('../middleware/auth');
  authenticateToken(req, res, () => {
    res.json({ user: req.user });
  });
});

// Export helpers for seed
router.hashPassword = hashPassword;

module.exports = router;
