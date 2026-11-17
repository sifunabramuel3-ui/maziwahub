import express from 'express';
import mysql from 'mysql2/promise';
import 'dotenv/config';

const app = express();
app.use(express.json()); // Parses incoming JSON payloads

// Create the connection pool to MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

// A sample GET API Route
app.get('/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users'); // SQL statement execution
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message }); // Error middleware safety
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server executing safely on port ${PORT}`));
