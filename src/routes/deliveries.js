import express from 'express';
import { requireLogin, authorizeRoles } from '../middleware/authMiddleware.js';
import { getAllDeliveries, createDelivery } from '../controllers/deliveryController.js';

const router = express.Router();

// Both operations strictly locked behind authorization barriers to prevent arbitrary visibility
router.get('/', requireLogin, authorizeRoles('clerk', 'manager'), getAllDeliveries);
router.post('/', requireLogin, authorizeRoles('clerk', 'manager'), createDelivery);

export default router;
