import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import pool from './src/config/db.js';

import authRoutes from './src/routes/auth.js';
import deliveryRoutes from './src/routes/deliveries.js';
import farmerRoutes from './src/routes/farmers.js';

const app = express();

// Global middleware must run before routes so request bodies are available.
app.use(cors());
app.use(express.json());

// API route mounting
app.use('/api/auth', authRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/farmers', farmerRoutes);

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
