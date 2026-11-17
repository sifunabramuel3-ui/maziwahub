import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import pool from './src/config/db.js';

const app = express();

// Application Global Controls
app.use(cors());
app.use(express.json());

// Basic Server Check
app.get('/health', async (req, res) => {
  try {
    // Quick test to confirm database is alive
    await pool.query('SELECT 1');
    res.json({ status: "healthy", database: "connected" });
  } catch (err) {
    res.status(500).json({ status: "unhealthy", error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 maziwaHub server executing cleanly on port ${PORT}`);
});
