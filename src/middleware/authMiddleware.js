import jwt from 'jsonwebtoken';
import 'dotenv/config';

export const requireLogin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Access Denied: No authentication token provided." });
  }

  const token = authHeader.split(' ')[1];
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // Append payload information containing user id and assigned system role
    next();
  } catch (err) {
    return res.status(403).json({ error: "Access Denied: Invalid or expired validation session token." });
  }
};

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: `Forbidden: Access restricted. Requires roles: [${allowedRoles.join(', ')}]` });
    }
    next();
  };
};
