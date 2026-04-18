const { supabase } = require('../config/supabase');

// Get store owner dashboard - list of raters and avg rating
const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get store info
    const { data: store, error: storeError } = await supabase
      .from('store_stats')
      .select('*')
      .eq('owner_id', userId)
      .single();

    if (storeError) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Get raters
    const { data: raters, error: ratersError } = await supabase
      .from('ratings')
      .select(`
        rating,
        rated_at:created_at,
        user:users(id, name, email)
      `)
      .eq('store_id', store.id);

    if (ratersError) throw ratersError;

    // Format for frontend
    const formattedRaters = raters.map(r => ({
      user_id: r.user.id,
      user_name: r.user.name,
      user_email: r.user.email,
      rating: r.rating,
      rated_at: r.rated_at
    }));

    res.json({
      store,
      raters: formattedRaters
    });
  } catch (error) {
    console.error('Store owner dashboard error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getDashboard };
