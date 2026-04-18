import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', address: '', role: 'user' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name) e.name = 'Name is required';
    else if (form.name.trim().length < 20) e.name = 'Name must be at least 20 characters';
    else if (form.name.trim().length > 60) e.name = 'Name must be at most 60 characters';

    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address';

    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8 || form.password.length > 16) e.password = 'Password must be 8–16 characters';
    else if (!/[A-Z]/.test(form.password)) e.password = 'Must include at least one uppercase letter';
    else if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.password)) e.password = 'Must include at least one special character';

    if (form.address && form.address.length > 400) e.address = 'Address cannot exceed 400 characters';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await API.post('/auth/register', form);
      login(data.user, data.token);
      toast.success(`Welcome, ${data.user.name.split(' ')[0]}! Account created.`);
      
      const role = data.user.role;
      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'store_owner') navigate('/store-owner/dashboard');
      else navigate('/user/stores');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 520 }}>
        <div className="auth-logo">
          <div className="logo-icon">⭐</div>
          <h1>RateMyStore</h1>
          <p>Create your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>(20–60 chars)</span></label>
            <input
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="e.g. John Alexander Williams"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className={`form-input ${errors.email ? 'error' : ''}`}
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
            {errors.email && <p className="form-error">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Password <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>(8–16 chars, 1 uppercase, 1 special)</span></label>
            <input
              className={`form-input ${errors.password ? 'error' : ''}`}
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
            {errors.password && <p className="form-error">{errors.password}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Address <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>(optional, max 400 chars)</span></label>
            <textarea
              className={`form-input ${errors.address ? 'error' : ''}`}
              placeholder="Your address..."
              rows={3}
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              style={{ resize: 'vertical' }}
            />
            {errors.address && <p className="form-error">{errors.address}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Join As</label>
            <select
              className="form-input"
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
            >
              <option value="user">Normal User (Rate stores)</option>
              <option value="store_owner">Store Owner (Manage your store)</option>
              <option value="admin">Administrator (System control)</option>
            </select>
          </div>

          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
