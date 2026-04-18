import React, { useState } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const ChangePassword = () => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.currentPassword) e.currentPassword = 'Current password is required';
    if (!form.newPassword) e.newPassword = 'New password is required';
    else if (form.newPassword.length < 8 || form.newPassword.length > 16) e.newPassword = 'Must be 8–16 characters';
    else if (!/[A-Z]/.test(form.newPassword)) e.newPassword = 'Must include an uppercase letter';
    else if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.newPassword)) e.newPassword = 'Must include a special character';
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your new password';
    else if (form.newPassword !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await API.put('/auth/update-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success('Password updated successfully!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="content-header">
        <h1 className="page-title">Change Password</h1>
        <p className="page-subtitle">Update your account password</p>
      </div>
      <div className="content-body">
        <div className="card password-page-card">
          <div className="card-header">
            <span className="card-title">🔒 Update Password</span>
          </div>
          <div className="card-body">
            <div className="alert alert-info" style={{ marginBottom: 20 }}>
              Password must be 8–16 characters, include at least one uppercase letter and one special character (!@#$%^&*...).
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input className={`form-input ${errors.currentPassword ? 'error' : ''}`} type="password"
                  value={form.currentPassword} onChange={e => setForm(p => ({ ...p, currentPassword: e.target.value }))}
                  placeholder="Enter current password" />
                {errors.currentPassword && <p className="form-error">{errors.currentPassword}</p>}
              </div>

              <div className="section-divider" />

              <div className="form-group">
                <label className="form-label">New Password</label>
                <input className={`form-input ${errors.newPassword ? 'error' : ''}`} type="password"
                  value={form.newPassword} onChange={e => setForm(p => ({ ...p, newPassword: e.target.value }))}
                  placeholder="Enter new password" />
                {errors.newPassword && <p className="form-error">{errors.newPassword}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input className={`form-input ${errors.confirmPassword ? 'error' : ''}`} type="password"
                  value={form.confirmPassword} onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                  placeholder="Re-enter new password" />
                {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
              </div>

              <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: 8 }}>
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChangePassword;
