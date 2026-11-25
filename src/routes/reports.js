import express from 'express';
import { requireLogin, authorizeRoles } from '../middleware/authMiddleware.js';
import {
  getFarmerTotals,
  getCentreDeliveryCounts
} from '../controllers/reportController.js';

const router = express.Router();

// Institution-wide reports are restricted to managers.
router.get('/farmer-totals', requireLogin, authorizeRoles('manager'), getFarmerTotals);
router.get('/centre-counts', requireLogin, authorizeRoles('manager'), getCentreDeliveryCounts);

export default router;
