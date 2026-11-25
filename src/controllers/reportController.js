import pool from '../config/db.js';

// October 2026 farmer totals required by the BIT 3120 CAT.
export const getFarmerTotals = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         f.FarmerNo,
         f.FarmerName,
         COALESCE(SUM(d.Litres), 0) AS TotalLitres,
         COALESCE(SUM(d.Amount), 0) AS TotalAmount,
         COUNT(d.DeliveryID) AS DeliveryCount
       FROM farmers f
       LEFT JOIN deliveries d
         ON d.FarmerNo = f.FarmerNo
        AND d.Date >= ? AND d.Date < ?
       WHERE f.Role = 'farmer'
       GROUP BY f.FarmerNo, f.FarmerName
       ORDER BY f.FarmerNo`,
      ['2026-10-01', '2026-11-01']
    );

    res.status(200).json({
      period: 'October 2026',
      count: rows.length,
      data: rows
    });
  } catch (err) {
    console.error('Farmer totals report failed:', err);
    res.status(500).json({ error: 'Unable to generate farmer totals report.' });
  }
};

// Delivery count by centre, including centres with zero deliveries.
export const getCentreDeliveryCounts = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         c.CentreID,
         c.CentreName,
         COUNT(d.DeliveryID) AS DeliveryCount,
         COALESCE(SUM(d.Litres), 0) AS TotalLitres
       FROM centres c
       LEFT JOIN deliveries d ON d.CentreID = c.CentreID
       GROUP BY c.CentreID, c.CentreName
       ORDER BY c.CentreID`
    );

    res.status(200).json({ count: rows.length, data: rows });
  } catch (err) {
    console.error('Centre delivery count report failed:', err);
    res.status(500).json({ error: 'Unable to generate centre delivery count report.' });
  }
};
