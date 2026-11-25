import express from 'express';
import pool from '../config/db.js';
import { requireLogin, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Farmer identity comes only from the verified JWT, never from a query parameter.
router.get('/my-deliveries', requireLogin, authorizeRoles('farmer'), async (req, res) => {
  const page = req.query.page === undefined ? 1 : Number(req.query.page);
  const limit = req.query.limit === undefined ? 5 : Number(req.query.limit);
  if (!Number.isInteger(page) || page < 1) return res.status(400).json({ error: 'page must be a positive whole number.' });
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) return res.status(400).json({ error: 'limit must be a whole number between 1 and 100.' });
  const offset = (page - 1) * limit;
  try {
    const [rows] = await pool.query(
      `SELECT d.DeliveryID, d.Date, d.Litres, d.Rate, d.Amount, c.CentreName
       FROM deliveries d JOIN centres c ON d.CentreID = c.CentreID
       WHERE d.FarmerNo = ?
       ORDER BY d.Date DESC, d.DeliveryID DESC LIMIT ? OFFSET ?`,
      [req.user.id, limit, offset]
    );
    const [[countRow]] = await pool.query('SELECT COUNT(*) AS total FROM deliveries WHERE FarmerNo = ?', [req.user.id]);
    const total = Number(countRow.total);
    return res.status(200).json({ data: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    console.error('Get farmer deliveries failed:', err);
    return res.status(500).json({ error: 'Unable to retrieve your deliveries.' });
  }
});

export default router;
