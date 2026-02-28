const express = require('express');
const router = express.Router();
const pool = require('../db');
const crypto = require('crypto');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Helper: hash password (same as auth.js)
function hashPassword(password, salt) {
  salt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

// ─── Admin: Create Reviewer ───
router.post('/reviewers', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { email, name, password } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, name, and password required' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const { hash, salt } = hashPassword(password);
    const result = await pool.query(
      `INSERT INTO users (email, name, password_hash, password_salt, role)
       VALUES ($1, $2, $3, $4, 'reviewer')
       RETURNING id, email, name, role, created_at`,
      [email.toLowerCase().trim(), name, hash, salt]
    );

    await pool.query(
      `INSERT INTO audit_logs (action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4)`,
      ['reviewer_created', 'user', result.rows[0].id, `Reviewer created: ${name} (${email})`]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating reviewer:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Admin: List Reviewers ───
router.get('/reviewers', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, name, role, created_at FROM users WHERE role = 'reviewer' ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching reviewers:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Admin: Get Reviewer Detail ───
router.get('/reviewers/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, name, role, created_at FROM users WHERE id = $1 AND role = 'reviewer'`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Reviewer not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Admin: Delete Reviewer ───
router.delete('/reviewers/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM users WHERE id = $1 AND role = 'reviewer' RETURNING id, name`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Reviewer not found' });

    await pool.query(
      `INSERT INTO audit_logs (action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4)`,
      ['reviewer_deleted', 'user', req.params.id, `Reviewer deleted: ${result.rows[0].name}`]
    );

    res.json({ message: 'Reviewer deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Admin: Create Organization ───
router.post('/organizations', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { name, contact_email } = req.body;
    if (!name) return res.status(400).json({ error: 'Organization name required' });

    const apiKey = crypto.randomBytes(32).toString('hex');
    const apiKeyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

    const result = await pool.query(
      `INSERT INTO organizations (name, contact_email, api_key_hash)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, contact_email || null, apiKeyHash]
    );

    await pool.query(
      `INSERT INTO audit_logs (action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4)`,
      ['org_created', 'organization', result.rows[0].id, `Organization created: ${name}`]
    );

    res.status(201).json({ ...result.rows[0], api_key: apiKey });
  } catch (err) {
    console.error('Error creating organization:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Admin: List Organizations ───
router.get('/organizations', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, contact_email, created_at FROM organizations ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Admin: Get Organization Detail ───
router.get('/organizations/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM organizations WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Organization not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Admin: Delete Organization ───
router.delete('/organizations/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM organizations WHERE id = $1 RETURNING id, name', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Organization not found' });

    await pool.query(
      `INSERT INTO audit_logs (action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4)`,
      ['org_deleted', 'organization', req.params.id, `Organization deleted: ${result.rows[0].name}`]
    );

    res.json({ message: 'Organization deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Admin: List All Users ───
router.get('/users', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.email, u.name, u.role, u.org_id, u.created_at, o.name as org_name
       FROM users u
       LEFT JOIN organizations o ON u.org_id = o.id
       ORDER BY u.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Admin: Dashboard Stats ───
router.get('/stats', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const [orgs, users, violations, reviews] = await Promise.all([
      pool.query('SELECT count(*)::int AS count FROM organizations'),
      pool.query(`SELECT role, count(*)::int AS count FROM users GROUP BY role`),
      pool.query('SELECT count(*)::int AS count FROM violations'),
      pool.query('SELECT count(*)::int AS count FROM human_reviews'),
    ]);

    const usersByRole = {};
    users.rows.forEach(r => { usersByRole[r.role] = r.count; });

    res.json({
      organizations: orgs.rows[0].count,
      customers: usersByRole.customer || 0,
      reviewers: usersByRole.reviewer || 0,
      admins: usersByRole.admin || 0,
      violations: violations.rows[0].count,
      reviews: reviews.rows[0].count,
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
