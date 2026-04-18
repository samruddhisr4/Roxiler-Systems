import React, { useEffect, useState, useCallback } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { MdAdd, MdClose, MdEdit, MdDelete } from 'react-icons/md';
import { StarDisplay } from '../../components/StarRating';

const ROLES = ['admin', 'user', 'store_owner'];

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [sort, setSort] = useState({ field: 'name', order: 'ASC' });
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [detailUser, setDetailUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', address: '', role: 'user' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, sortBy: sort.field, sortOrder: sort.order };
      const { data } = await API.get('/admin/users', { params });
      setUsers(data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [filters, sort]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSort = (field) => {
    setSort(s => ({ field, order: s.field === field && s.order === 'ASC' ? 'DESC' : 'ASC' }));
  };

  const SortIcon = ({ field }) => {
    if (sort.field !== field) return <span className="sort-icon" style={{ opacity: 0.3 }}>↕</span>;
    return <span className="sort-icon">{sort.order === 'ASC' ? '↑' : '↓'}</span>;
  };

  const validateForm = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    else if (form.name.trim().length < 20) e.name = 'Min 20 chars';
    else if (form.name.trim().length > 60) e.name = 'Max 60 chars';
    if (!form.email) e.email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    
    if (!editingUser) {
      if (!form.password) e.password = 'Required';
      else if (form.password.length < 8 || form.password.length > 16) e.password = '8–16 chars';
      else if (!/[A-Z]/.test(form.password)) e.password = 'Needs uppercase';
      else if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.password)) e.password = 'Needs special char';
    } else if (form.password) {
      if (form.password.length < 8 || form.password.length > 16) e.password = '8–16 chars';
      else if (!/[A-Z]/.test(form.password)) e.password = 'Needs uppercase';
      else if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.password)) e.password = 'Needs special char';
    }

    if (form.address && form.address.length > 400) e.address = 'Max 400 chars';
    if (!form.role) e.role = 'Required';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      if (editingUser) {
        await API.put(`/admin/users/${editingUser.id}`, form);
        toast.success('User updated successfully');
      } else {
        await API.post('/admin/users', form);
        toast.success('User created successfully');
      }
      closeModal();
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await API.delete(`/admin/users/${id}`);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      address: user.address || '',
      role: user.role
    });
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setForm({ name: '', email: '', password: '', address: '', role: 'user' });
    setFormErrors({});
  };

  return (
    <>
      <div className="content-header">
        <h1 className="page-title">Users</h1>
        <p className="page-subtitle">Manage all platform users</p>
      </div>
      <div className="content-body">
        <div className="card">
          <div className="card-header">
            <span className="card-title">👥 All Users ({users.length})</span>
            <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
              <MdAdd /> Add User
            </button>
          </div>
          <div style={{ padding: '16px 24px' }}>
            <div className="filters-row">
              {['name', 'email', 'address'].map(f => (
                <input key={f} className="filter-input" placeholder={`Filter by ${f}...`}
                  value={filters[f]} onChange={e => setFilters(p => ({ ...p, [f]: e.target.value }))} />
              ))}
              <select className="filter-select" value={filters.role} onChange={e => setFilters(p => ({ ...p, role: e.target.value }))}>
                <option value="">All Roles</option>
                {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading-wrap"><div className="spinner" /></div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👤</div>
              <div className="empty-title">No users found</div>
              <div className="empty-sub">Try adjusting your filters</div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    {[['name', 'Name'], ['email', 'Email'], ['address', 'Address'], ['role', 'Role']].map(([f, l]) => (
                      <th key={f} onClick={() => handleSort(f)}>{l} <SortIcon field={f} /></th>
                    ))}
                    <th>Rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 600 }}>{u.name}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td style={{ color: 'var(--text-secondary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.address || '—'}</td>
                      <td>
                        <span className={`badge badge-${u.role}`}>{u.role.replace('_', ' ')}</span>
                      </td>
                      <td>
                        {u.role === 'store_owner' && u.store_rating
                          ? <div className="avg-rating"><StarDisplay value={u.store_rating} /><span className="avg-rating-value">{parseFloat(u.store_rating).toFixed(1)}</span></div>
                          : '—'
                        }
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => setDetailUser(u)} title="View">
                            View
                          </button>
                          <button className="btn btn-secondary btn-sm" onClick={() => openEdit(u)} title="Edit">
                            <MdEdit />
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)} title="Delete">
                            <MdDelete />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit User Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editingUser ? 'Edit User' : 'Add New User'}</span>
              <button className="modal-close" onClick={closeModal}><MdClose /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>(20–60 chars)</span></label>
                  <input className={`form-input ${formErrors.name ? 'error' : ''}`} value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. John Alexander Williams" />
                  {formErrors.name && <p className="form-error">{formErrors.name}</p>}
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className={`form-input ${formErrors.email ? 'error' : ''}`} type="email" value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="email@example.com" />
                    {formErrors.email && <p className="form-error">{formErrors.email}</p>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <select className="form-input" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                      {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Password {editingUser && <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>(leave blank to keep current)</span>}</label>
                  <input className={`form-input ${formErrors.password ? 'error' : ''}`} type="password" value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder={editingUser ? "Reset password..." : "Min 8 chars, uppercase + special"} />
                  {formErrors.password && <p className="form-error">{formErrors.password}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">Address <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>(optional)</span></label>
                  <textarea className={`form-input ${formErrors.address ? 'error' : ''}`} rows={2} value={form.address}
                    onChange={e => setForm(p => ({ ...p, address: e.target.value }))} style={{ resize: 'vertical' }} />
                  {formErrors.address && <p className="form-error">{formErrors.address}</p>}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {detailUser && (
        <div className="modal-overlay" onClick={() => setDetailUser(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">User Details</span>
              <button className="modal-close" onClick={() => setDetailUser(null)}><MdClose /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <div className="user-avatar" style={{ width: 56, height: 56, fontSize: 22 }}>
                  {detailUser.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{detailUser.name}</div>
                  <span className={`badge badge-${detailUser.role}`}>{detailUser.role.replace('_', ' ')}</span>
                </div>
              </div>
              {[['Email', detailUser.email], ['Address', detailUser.address || 'Not provided']].map(([l, v]) => (
                <div key={l} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{l}</div>
                  <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{v}</div>
                </div>
              ))}
              {detailUser.role === 'store_owner' && (
                <div style={{ marginTop: 16, padding: 16, background: 'var(--bg-card2)', borderRadius: 10 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>STORE RATING</div>
                  {detailUser.store_rating ? (
                    <div className="avg-rating">
                      <StarDisplay value={detailUser.store_rating} size={18} />
                      <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--warning)', marginLeft: 4 }}>
                        {parseFloat(detailUser.store_rating).toFixed(1)}
                      </span>
                    </div>
                  ) : <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>No ratings yet</span>}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setDetailUser(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminUsers;
