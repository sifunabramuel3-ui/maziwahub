import express from 'express';
import pool from '../config/db.js';
import { requireLogin, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Task 2 (c): Aggregation Endpoint feeding analytical summaries safely to administrative views
router.get('/farmer-totals', requireLogin, authorizeRoles('manager'), async (req, res) => {
  try {
    const queryStr = `
      SELECT d.FarmerNo, f.FarmerName, SUM(d.Litres) AS TotalLitres, SUM(d.Amount) AS TotalAmount
      FROM deliveries d
      JOIN farmers f ON d.FarmerNo = f.FarmerNo
      WHERE d.Date BETWEEN '2026-10-01' AND '2026-10-31'
      GROUP BY d.FarmerNo, f.FarmerName;
    `;
    const [rows] = await pool.query(queryStr);
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
