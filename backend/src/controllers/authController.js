const { supabase } = require('../config/supabase');

const register = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;
    const userRole = role || 'user';

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, address, role: userRole }
      }
    });

    if (authError) return res.status(400).json({ message: authError.message });

    // Insert into public.users if not handled by a trigger
    const { data: user, error: dbError } = await supabase
      .from('users')
      .upsert({
        id: authData.user.id,
        name,
        email,
        address,
        role: userRole
      })
      .select()
      .single();

    if (dbError) throw dbError;

    res.status(201).json({
      message: 'Registration successful. Please check your email.',
      token: authData.session?.access_token,
      user
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      return res.status(401).json({ message: authError.message });
    }

    // Fetch extra metadata from public.users
    let { data: user, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    // IF user record is missing in public.users (due to previous RLS errors), 
    // let's create it now using the metadata stored in Auth
    if (!user) {
        console.log("User record missing in public.users, attempting to repair...");
        const meta = authData.user.user_metadata;
        const { data: newUser, error: repairError } = await supabase
            .from('users')
            .upsert({
                id: authData.user.id,
                name: meta.name || 'User',
                email: authData.user.email,
                address: meta.address || '',
                role: meta.role || 'user'
            })
            .select()
            .single();
        
        if (repairError) throw repairError;
        user = newUser;
    }

    res.json({
      token: authData.session.access_token,
      user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) return res.status(400).json({ message: error.message });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getMe = async (req, res) => {
  try {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser) return res.status(401).json({ message: 'Unauthorized' });

    const { data: user, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (dbError) throw dbError;
    res.json(user);
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { register, login, updatePassword, getMe };
