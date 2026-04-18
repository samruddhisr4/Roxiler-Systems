const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

// Dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const [[userCount]] = await pool.query('SELECT COUNT(*) as count FROM users');
    const [[storeCount]] = await pool.query('SELECT COUNT(*) as count FROM stores');
    const [[ratingCount]] = await pool.query('SELECT COUNT(*) as count FROM ratings');

    res.json({
      totalUsers: userCount.count,
      totalStores: storeCount.count,
      totalRatings: ratingCount.count,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all users with optional filters
const getUsers = async (req, res) => {
  try {
    const { name, email, address, role, sortBy = 'name', sortOrder = 'ASC' } = req.query;

    const allowedSortFields = ['name', 'email', 'address', 'role', 'created_at'];
    const allowedSortOrders = ['ASC', 'DESC'];
    const safeSort = allowedSortFields.includes(sortBy) ? sortBy : 'name';
    const safeSortOrder = allowedSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';

    let query = `
      SELECT u.id, u.name, u.email, u.address, u.role, u.created_at,
        (SELECT AVG(r.rating) FROM ratings r JOIN stores s ON r.store_id = s.id WHERE s.owner_id = u.id) as store_rating
      FROM users u
      WHERE 1=1
    `;
    const params = [];

    if (name) { query += ' AND u.name LIKE ?'; params.push(`%${name}%`); }
    if (email) { query += ' AND u.email LIKE ?'; params.push(`%${email}%`); }
    if (address) { query += ' AND u.address LIKE ?'; params.push(`%${address}%`); }
    if (role) { query += ' AND u.role = ?'; params.push(role); }

    query += ` ORDER BY u.${safeSort} ${safeSortOrder}`;

    const [users] = await pool.query(query, params);
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT u.id, u.name, u.email, u.address, u.role,
        (SELECT AVG(r.rating) FROM ratings r JOIN stores s ON r.store_id = s.id WHERE s.owner_id = u.id) as store_rating
       FROM users u WHERE u.id = ?`,
      [req.params.id]
    );
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(users[0]);
  } catch (error) {
    console.error('Get user by id error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create user (admin only)
const createUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, address || null, role]
    );

    res.status(201).json({ message: 'User created successfully', userId: result.insertId });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update user (admin only)
const updateUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;
    const userId = req.params.id;

    // Check if email is already used by another user
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already used by another user' });
    }

    let query = 'UPDATE users SET name = ?, email = ?, address = ?, role = ?';
    const params = [name, email, address || null, role];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ', password = ?';
      params.push(hashedPassword);
    }

    query += ' WHERE id = ?';
    params.push(userId);

    const [result] = await pool.query(query, params);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    // Note: In a real app, you might want to handle cascading deletes or prevent deleting self.
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [userId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all stores
const getStores = async (req, res) => {
  try {
    const { name, email, address, sortBy = 'name', sortOrder = 'ASC' } = req.query;

    const allowedSortFields = ['name', 'email', 'address', 'avg_rating', 'created_at'];
    const allowedSortOrders = ['ASC', 'DESC'];
    const safeSort = allowedSortFields.includes(sortBy) ? sortBy : 'name';
    const safeSortOrder = allowedSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';

    let query = `
      SELECT s.id, s.name, s.email, s.address, s.owner_id,
        u.name as owner_name,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(r.id) as rating_count
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE 1=1
    `;
    const params = [];

    if (name) { query += ' AND s.name LIKE ?'; params.push(`%${name}%`); }
    if (email) { query += ' AND s.email LIKE ?'; params.push(`%${email}%`); }
    if (address) { query += ' AND s.address LIKE ?'; params.push(`%${address}%`); }

    query += ` GROUP BY s.id ORDER BY ${safeSort === 'avg_rating' ? 'avg_rating' : `s.${safeSort}`} ${safeSortOrder}`;

    const [stores] = await pool.query(query, params);
    res.json(stores);
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create store (admin only)
const createStore = async (req, res) => {
  try {
    const { name, email, address, owner_id } = req.body;

    const [existing] = await pool.query('SELECT id FROM stores WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Store email already exists' });
    }

    if (owner_id) {
      const [owner] = await pool.query('SELECT id, role FROM users WHERE id = ? AND role = ?', [owner_id, 'store_owner']);
      if (owner.length === 0) {
        return res.status(400).json({ message: 'Owner must be a store_owner role user' });
      }
    }

    const [result] = await pool.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name, email, address || null, owner_id || null]
    );

    res.status(201).json({ message: 'Store created successfully', storeId: result.insertId });
  } catch (error) {
    console.error('Create store error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update store (admin only)
const updateStore = async (req, res) => {
  try {
    const { name, email, address, owner_id } = req.body;
    const storeId = req.params.id;

    // Check if email already exists for another store
    const [existing] = await pool.query('SELECT id FROM stores WHERE email = ? AND id != ?', [email, storeId]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Store email already used by another store' });
    }

    if (owner_id) {
      const [owner] = await pool.query('SELECT id, role FROM users WHERE id = ? AND role = ?', [owner_id, 'store_owner']);
      if (owner.length === 0) {
        return res.status(400).json({ message: 'Owner must be a store_owner role user' });
      }
    }

    const [result] = await pool.query(
      'UPDATE stores SET name = ?, email = ?, address = ?, owner_id = ? WHERE id = ?',
      [name, email, address || null, owner_id || null, storeId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }

    res.json({ message: 'Store updated successfully' });
  } catch (error) {
    console.error('Update store error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete store (admin only)
const deleteStore = async (req, res) => {
  try {
    const storeId = req.params.id;
    const [result] = await pool.query('DELETE FROM stores WHERE id = ?', [storeId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }
    res.json({ message: 'Store deleted successfully' });
  } catch (error) {
    console.error('Delete store error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getStores,
  createStore,
  updateStore,
  deleteStore
};
