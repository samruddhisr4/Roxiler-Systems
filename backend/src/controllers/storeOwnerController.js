const { pool } = require('../config/db');

// Get store owner dashboard - list of raters and avg rating
const getDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id;

    // Get the store owned by this user
    const [stores] = await pool.query(
      'SELECT id, name, address FROM stores WHERE owner_id = ?',
      [ownerId]
    );

    if (stores.length === 0) {
      return res.status(404).json({ message: 'No store found for this owner' });
    }

    const store = stores[0];

    // Get ratings with user info for this store
    const [ratings] = await pool.query(
      `SELECT 
        u.id as user_id, u.name as user_name, u.email as user_email,
        r.rating, r.updated_at as rated_at
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.store_id = ?
       ORDER BY r.updated_at DESC`,
      [store.id]
    );

    // Get avg rating
    const [[avgResult]] = await pool.query(
      'SELECT COALESCE(AVG(rating), 0) as avg_rating, COUNT(*) as total_ratings FROM ratings WHERE store_id = ?',
      [store.id]
    );

    res.json({
      store: {
        id: store.id,
        name: store.name,
        address: store.address,
        avg_rating: parseFloat(avgResult.avg_rating).toFixed(2),
        total_ratings: avgResult.total_ratings,
      },
      raters: ratings,
    });
  } catch (error) {
    console.error('Store owner dashboard error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getDashboard };
