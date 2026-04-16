/**
 * middleware/auth.js — JWT authentication middleware
 *
 * Usage:
 *   router.get('/protected', requireAuth, handler);
 *
 * On success, sets req.user = { id, email, name }.
 * On failure, responds 401 with a JSON error.
 */

const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, name, iat, exp }
    next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError'
      ? 'Session expired. Please log in again.'
      : 'Invalid token. Please log in again.';
    return res.status(401).json({ message });
  }
};

module.exports = { requireAuth };
