import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const router = express.Router();

// Registration Gateway securing plain passwords before physical persistence
router.post('/register', async (req, res) => {
  try {
    const { farmerNo, name, phone, password, role } = req.body;
    
    // Mitigate overlapping identities
    const [exists] = await pool.query('SELECT * FROM farmers WHERE Phone = ? OR FarmerNo = ?', [phone, farmerNo]);
    if (exists.length > 0) {
      return res.status(409).json({ error: "Conflict Error: A user with this identification metadata already exists." });
    }

    // Strong cryptographic encryption block
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await pool.query(
      'INSERT INTO farmers (FarmerNo, FarmerName, Phone, Password, Role) VALUES (?, ?, ?, ?, ?)',
      [farmerNo, name, phone, hashedPassword, role || 'farmer']
    );

    res.status(201).json({ success: true, message: "User account established securely." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Secure Login Pipeline deploying parameterized prepared statements against SQL injection vectoring
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body; // Supports querying by Phone OR explicitly mapped Farmer No identifier for fallback mechanisms

    const [rows] = await pool.query('SELECT * FROM farmers WHERE Phone = ? OR FarmerNo = ?', [phone, phone]);
    if (rows.length === 0) {
      return res.status(401).json({ error: "Access Denied: Invalid credentials provided." });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.Password);
    if (!match) {
      return res.status(401).json({ error: "Access Denied: Invalid credentials provided." });
    }

    // Provision a clean token payload with an explicit 1-hour expiration deadline
    const token = jwt.sign(
      { id: user.FarmerNo, role: user.Role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Completely prune password string details from transit payloads before hitting client log consoles
    delete user.Password;
    res.status(200).json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
