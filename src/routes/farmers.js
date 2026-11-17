import express from 'express';
import pool from '../config/db.js';
import { requireLogin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Securely lists only the active session holder's deliveries to satisfy Privacy requirements
router.get('/my-deliveries', requireLogin, async (req, res) => {
  try {
    const farmerId = req.user.id; // Extracted dynamically from JWT payload string
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    const [rows] = await pool.query(
      `SELECT d.DeliveryID, d.Date, d.Litres, d.Rate, d.Amount, c.CentreName
       FROM deliveries d
       JOIN centres c ON d.CentreID = c.CentreID
       WHERE d.FarmerNo = ?
       ORDER BY d.Date DESC LIMIT ? OFFSET ?`,
      [farmerId, limit, offset]
    );
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
