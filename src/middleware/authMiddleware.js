import jwt from 'jsonwebtoken';
import 'dotenv/config';

const hasJwtSecret = () =>
  typeof process.env.JWT_SECRET === 'string' &&
  process.env.JWT_SECRET.length >= 32;

export const requireLogin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication token is required.' });
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return res.status(401).json({ error: 'Authentication token is required.' });
  }
  if (!hasJwtSecret()) {
    console.error('JWT_SECRET is missing or shorter than 32 characters.');
    return res.status(500).json({ error: 'Authentication is not configured on the server.' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET, { issuer: 'maziwahub' });
    if (!req.user.id || !req.user.role) {
      return res.status(401).json({ error: 'Invalid authentication token.' });
    }
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }
};

export const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication is required.' });
  }
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'You do not have permission to access this resource.' });
  }
  return next();
};
