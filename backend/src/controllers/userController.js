const { pool } = require('../config/db');

// Get all stores for normal users with their own rating
const getStores = async (req, res) => {
  try {
    const { name, address, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    const userId = req.user.id;

    const allowedSortFields = ['name', 'address', 'avg_rating'];
    const allowedSortOrders = ['ASC', 'DESC'];
    const safeSort = allowedSortFields.includes(sortBy) ? sortBy : 'name';
    const safeSortOrder = allowedSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';

    let query = `
      SELECT 
        s.id, s.name, s.address, s.email,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(r.id) as rating_count,
        ur.rating as user_rating,
        ur.id as user_rating_id
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      LEFT JOIN ratings ur ON s.id = ur.store_id AND ur.user_id = ?
      WHERE 1=1
    `;
    const params = [userId];

    if (name) { query += ' AND s.name LIKE ?'; params.push(`%${name}%`); }
    if (address) { query += ' AND s.address LIKE ?'; params.push(`%${address}%`); }

    query += ` GROUP BY s.id, ur.rating, ur.id ORDER BY ${safeSort === 'avg_rating' ? 'avg_rating' : `s.${safeSort}`} ${safeSortOrder}`;

    const [stores] = await pool.query(query, params);
    res.json(stores);
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Submit or update a rating
const submitRating = async (req, res) => {
  try {
    const { rating } = req.body;
    const { storeId } = req.params;
    const userId = req.user.id;

    // Check store exists
    const [stores] = await pool.query('SELECT id FROM stores WHERE id = ?', [storeId]);
    if (stores.length === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Upsert rating
    await pool.query(
      `INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = ?, updated_at = CURRENT_TIMESTAMP`,
      [userId, storeId, rating, rating]
    );

    res.json({ message: 'Rating submitted successfully' });
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const [[ratingCount]] = await pool.query('SELECT COUNT(*) as count FROM ratings WHERE user_id = ?', [userId]);
    res.json({ ratedStoresCount: ratingCount.count });
  } catch (error) {
    console.error('User dashboard stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getStores, submitRating, getDashboardStats };
