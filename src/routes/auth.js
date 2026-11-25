import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const router = express.Router();
const PHONE_PATTERN = /^\\+?\\d{10,13}$/;
const FARMER_NO_PATTERN = /^[A-Za-z0-9-]{2,10}$/;
const JWT_SECRET_MIN_LENGTH = 32;

const hasJwtSecret = () =>
  typeof process.env.JWT_SECRET === 'string' &&
  process.env.JWT_SECRET.length >= JWT_SECRET_MIN_LENGTH;

// Public registration is farmer-only. Privileged accounts must be provisioned
// by a trusted administrator, never by accepting a role from the request body.
router.post('/register', async (req, res) => {
  const { farmerNo, name, phone, password } = req.body || {};

  if (!farmerNo || !name || !phone || !password) {
    return res.status(400).json({ error: 'farmerNo, name, phone and password are required.' });
  }
  if (typeof farmerNo !== 'string' || !FARMER_NO_PATTERN.test(farmerNo.trim())) {
    return res.status(400).json({ error: 'farmerNo must be 2–10 letters, numbers or hyphens.' });
  }
  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
    return res.status(400).json({ error: 'name must be between 2 and 100 characters.' });
  }
  if (typeof phone !== 'string' || !PHONE_PATTERN.test(phone.trim())) {
    return res.status(400).json({ error: 'Provide a valid phone number (10–13 digits, optional leading +).' });
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 72) {
    return res.status(400).json({ error: 'Password must be between 8 and 72 characters.' });
  }
  if (Object.prototype.hasOwnProperty.call(req.body, 'role') && req.body.role !== 'farmer') {
    return res.status(400).json({ error: 'Public registration is restricted to the farmer role.' });
  }

  try {
    const [exists] = await pool.query(
      'SELECT FarmerNo FROM farmers WHERE Phone = ? OR FarmerNo = ?',
      [phone.trim(), farmerNo.trim()]
    );
    if (exists.length > 0) {
      return res.status(409).json({ error: 'A farmer with that phone number or farmer number already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await pool.query(
      'INSERT INTO farmers (FarmerNo, FarmerName, Phone, Password, Role) VALUES (?, ?, ?, ?, ?)',
      [farmerNo.trim(), name.trim(), phone.trim(), hashedPassword, 'farmer']
    );

    return res.status(201).json({ success: true, message: 'Farmer account created successfully.' });
  } catch (err) {
    // Unique database constraints also protect against simultaneous registrations.
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'A farmer with that phone number or farmer number already exists.' });
    }
    console.error('Registration failed:', err);
    return res.status(500).json({ error: 'Unable to create the account.' });
  }
});

router.post('/login', async (req, res) => {
  const { phone, password } = req.body || {};
  if (typeof phone !== 'string' || !phone.trim() || typeof password !== 'string' || !password) {
    return res.status(400).json({ error: 'Phone/farmer number and password are required.' });
  }
  if (!hasJwtSecret()) {
    console.error('JWT_SECRET is missing or shorter than 32 characters.');
    return res.status(500).json({ error: 'Authentication is not configured on the server.' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT FarmerNo, FarmerName, Phone, Password, Role FROM farmers WHERE Phone = ? OR FarmerNo = ? LIMIT 1',
      [phone.trim(), phone.trim()]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid phone/farmer number or password.' });
    }

    const user = rows[0];
    const passwordMatches = await bcrypt.compare(password, user.Password);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid phone/farmer number or password.' });
    }

    const token = jwt.sign(
      { id: user.FarmerNo, role: user.Role },
      process.env.JWT_SECRET,
      { expiresIn: '1h', issuer: 'maziwahub' }
    );

    return res.status(200).json({
      token,
      user: {
        FarmerNo: user.FarmerNo,
        FarmerName: user.FarmerName,
        Phone: user.Phone,
        Role: user.Role
      }
    });
  } catch (err) {
    console.error('Login failed:', err);
    return res.status(500).json({ error: 'Unable to complete login.' });
  }
});

export default router;
