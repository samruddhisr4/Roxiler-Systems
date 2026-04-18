const { supabase } = require('../config/supabase');

// Get all stores for normal users with their own rating
const getStores = async (req, res) => {
  try {
    const { name, address, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    const userId = req.user.id;

    let query = supabase
      .from('store_stats')
      .select(`
        *,
        user_rating:ratings(rating)
      `)
      .eq('ratings.user_id', userId);

    if (name) query = query.ilike('name', `%${name}%`);
    if (address) query = query.ilike('address', `%${address}%`);

    const { data, error } = await query.order(sortBy, { ascending: sortOrder === 'ASC' });

    if (error) throw error;

    // Format for frontend compatibility
    const formatted = data.map(s => ({
      ...s,
      user_rating: s.user_rating?.[0]?.rating || null
    }));

    res.json(formatted);
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

    const { error } = await supabase
      .from('ratings')
      .upsert(
        { user_id: userId, store_id: storeId, rating: rating, updated_at: new Date() },
        { onConflict: 'user_id,store_id' }
      );

    if (error) throw error;

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
    const { count, error } = await supabase
      .from('ratings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) throw error;
    res.json({ ratedStoresCount: count });
  } catch (error) {
    console.error('User dashboard stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getStores, submitRating, getDashboardStats };
