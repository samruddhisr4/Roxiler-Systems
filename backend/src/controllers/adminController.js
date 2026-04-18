const { supabase } = require('../config/supabase');

// Dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const { count: userCount, error: userError } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: storeCount, error: storeError } = await supabase.from('stores').select('*', { count: 'exact', head: true });
    const { count: ratingCount, error: ratingError } = await supabase.from('ratings').select('*', { count: 'exact', head: true });

    if (userError || storeError || ratingError) throw new Error('Failed to fetch stats');

    res.json({
      totalUsers: userCount,
      totalStores: storeCount,
      totalRatings: ratingCount,
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

    let query = supabase.from('users').select('*');

    if (name) query = query.ilike('name', `%${name}%`);
    if (email) query = query.ilike('email', `%${email}%`);
    if (address) query = query.ilike('address', `%${address}%`);
    if (role) query = query.eq('role', role);

    const { data, error } = await query.order(sortBy, { ascending: sortOrder === 'ASC' });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { data, error } = await supabase.from('users').select('*').eq('id', req.params.id).single();
    if (error || !data) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(data);
  } catch (error) {
    console.error('Get user by id error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create user (admin only)
const createUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    // Use Supabase Auth for user creation
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, address, role }
    });

    if (authError) return res.status(400).json({ message: authError.message });

    // The user record in public.users is usually created via a trigger, 
    // but if not, we can manually insert it here.
    const { data, error } = await supabase
      .from('users')
      .insert([{ id: authData.user.id, name, email, address, role }]);

    if (error) throw error;

    res.status(201).json({ message: 'User created successfully', userId: authData.user.id });
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

    const updates = { name, email, address, role };
    const { error } = await supabase.from('users').update(updates).eq('id', userId);

    if (error) throw error;

    if (password) {
      const { error: passError } = await supabase.auth.admin.updateUserById(userId, { password });
      if (passError) throw passError;
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
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    if (authError) throw authError;

    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) throw error;

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

    let query = supabase.from('store_stats').select('*');

    if (name) query = query.ilike('name', `%${name}%`);
    if (email) query = query.ilike('email', `%${email}%`);
    if (address) query = query.ilike('address', `%${address}%`);

    const { data, error } = await query.order(sortBy, { ascending: sortOrder === 'ASC' });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create store (admin only)
const createStore = async (req, res) => {
  try {
    const { name, email, address, owner_id } = req.body;

    const { data, error } = await supabase
      .from('stores')
      .insert([{ name, email, address: address || null, owner_id: owner_id || null }]);

    if (error) return res.status(400).json({ message: error.message });

    res.status(201).json({ message: 'Store created successfully' });
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

    const { error } = await supabase
      .from('stores')
      .update({ name, email, address: address || null, owner_id: owner_id || null })
      .eq('id', storeId);

    if (error) return res.status(400).json({ message: error.message });

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
    const { error } = await supabase.from('stores').delete().eq('id', storeId);
    if (error) throw error;
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
