import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import pool from './src/config/db.js';

import authRoutes from './src/routes/auth.js';
import deliveryRoutes from './src/routes/deliveries.js';
import farmerRoutes from './src/routes/farmers.js';
import reportRoutes from './src/routes/reports.js';

const app = express();

// Allow configured browser origins; same-origin requests and tools without Origin are allowed.
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5500')
  .split(',').map((origin) => origin.trim()).filter(Boolean);
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  }
}));
app.use(express.json());
app.use(express.static('public'));

// API route mounting
app.use('/api/auth', authRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/reports', reportRoutes);

// Basic server/database health check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'healthy', database: 'connected' });
  } catch (err) {
    // Do not expose internal database error details to public clients.
    console.error('Health check failed:', err);
    res.status(500).json({ status: 'unhealthy', database: 'disconnected' });
  }
});

// JSON response for unknown API paths instead of a browser-style HTML error.
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`MaziwaHub server running on port ${PORT}`);
});
