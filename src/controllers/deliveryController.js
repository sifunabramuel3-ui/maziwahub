import pool from '../config/db.js';

export const getAllDeliveries = async (req, res) => {
  try {
    // Paginated utility wrapper to feed the Task 3 front-end pagination module cleanly
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    const [rows] = await pool.query(
      `SELECT d.DeliveryID, d.Date, d.Litres, d.Rate, d.Amount, f.FarmerName, c.CentreName 
       FROM deliveries d
       JOIN farmers f ON d.FarmerNo = f.FarmerNo
       JOIN centres c ON d.CentreID = c.CentreID
       ORDER BY d.Date DESC LIMIT ? OFFSET ?`, 
      [limit, offset]
    );
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createDelivery = async (req, res) => {
  try {
    const { deliveryId, date, farmerNo, centreId, litres, rate } = req.body;

    if (!litres || parseFloat(litres) <= 0) {
      // Direct protection mechanism ensuring validation leaks return explicit 400 Bad Request statuses
      return res.status(400).json({ error: "Invalid Entry: Volume metrics (litres) must be greater than zero." });
    }

    // Verify if the target farmer actually exists prior to insertion
    const [farmerExists] = await pool.query('SELECT 1 FROM farmers WHERE FarmerNo = ?', [farmerNo]);
    if (farmerExists.length === 0) {
      return res.status(404).json({ error: "Validation Error: The designated Farmer ID does not exist within the registry." });
    }

    const calculatedAmount = parseFloat(litres) * parseFloat(rate);

    await pool.query(
      `INSERT INTO deliveries (DeliveryID, Date, FarmerNo, CentreID, Litres, Rate, Amount) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [deliveryId, date, farmerNo, centreId, litres, rate, calculatedAmount]
    );

    res.status(201).json({ success: true, message: "Delivery metrics filed successfully.", amount: calculatedAmount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
