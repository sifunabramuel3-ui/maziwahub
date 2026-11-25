import pool from '../config/db.js';

const getPagination = (query) => {
  const page = query.page === undefined ? 1 : Number(query.page);
  const limit = query.limit === undefined ? 5 : Number(query.limit);
  if (!Number.isInteger(page) || page < 1) return { error: 'page must be a positive whole number.' };
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) return { error: 'limit must be a whole number between 1 and 100.' };
  return { page, limit, offset: (page - 1) * limit };
};

export const getAllDeliveries = async (req, res) => {
  const p = getPagination(req.query);
  if (p.error) return res.status(400).json({ error: p.error });
  try {
    const [rows] = await pool.query(
      `SELECT d.DeliveryID, d.Date, d.Litres, d.Rate, d.Amount,
              f.FarmerNo, f.FarmerName, c.CentreName
       FROM deliveries d
       JOIN farmers f ON d.FarmerNo = f.FarmerNo
       JOIN centres c ON d.CentreID = c.CentreID
       ORDER BY d.Date DESC, d.DeliveryID DESC LIMIT ? OFFSET ?`,
      [p.limit, p.offset]
    );
    const [[countRow]] = await pool.query('SELECT COUNT(*) AS total FROM deliveries');
    const total = Number(countRow.total);
    return res.status(200).json({ data: rows, pagination: { page: p.page, limit: p.limit, total, totalPages: Math.ceil(total / p.limit) } });
  } catch (err) {
    console.error('Get deliveries failed:', err);
    return res.status(500).json({ error: 'Unable to retrieve deliveries.' });
  }
};

export const createDelivery = async (req, res) => {
  try {
    const { deliveryId, date, farmerNo, centreId, litres, rate } = req.body;
    const litresValue = Number(litres);
    const rateValue = Number(rate);
    if (!deliveryId || !date || !farmerNo || !centreId) return res.status(400).json({ error: 'deliveryId, date, farmerNo and centreId are required.' });
    if (!Number.isFinite(litresValue) || litresValue <= 0) return res.status(400).json({ error: 'litres must be a number greater than zero.' });
    if (!Number.isFinite(rateValue) || rateValue <= 0) return res.status(400).json({ error: 'rate must be a number greater than zero.' });
    const [farmers] = await pool.query('SELECT FarmerNo FROM farmers WHERE FarmerNo = ?', [farmerNo]);
    if (!farmers.length) return res.status(404).json({ error: 'Farmer was not found.' });
    const [centres] = await pool.query('SELECT CentreID FROM centres WHERE CentreID = ?', [centreId]);
    if (!centres.length) return res.status(404).json({ error: 'Collection centre was not found.' });
    const amount = Number((litresValue * rateValue).toFixed(2));
    await pool.query(
      'INSERT INTO deliveries (DeliveryID, Date, FarmerNo, CentreID, Litres, Rate, Amount) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [deliveryId, date, farmerNo, centreId, litresValue, rateValue, amount]
    );
    return res.status(201).json({ success: true, message: 'Delivery recorded successfully.', amount });
  } catch (err) {
    console.error('Create delivery failed:', err);
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'A delivery with that ID already exists.' });
    return res.status(500).json({ error: 'Unable to create delivery.' });
  }
};
