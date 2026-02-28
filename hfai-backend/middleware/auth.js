const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'hfai-dev-secret-change-in-production';

// Verify JWT and attach user to request
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user; // { id, email, role, org_id }
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

// Require specific role(s)
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Access denied. Required role: ${roles.join(' or ')}` });
    }
    next();
  };
}

// Scope queries by org_id for customer role
function scopeByOrg(req, res, next) {
  if (req.user && req.user.role === 'customer') {
    if (!req.user.org_id) {
      return res.status(403).json({ error: 'No organization linked to this account' });
    }
    req.orgScope = req.user.org_id;
  } else {
    req.orgScope = null; // admin/reviewer see all (or filtered differently)
  }
  next();
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

module.exports = { authenticateToken, requireRole, scopeByOrg, signToken, JWT_SECRET };
