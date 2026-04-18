import React, { useEffect, useState, useCallback } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { MdAdd, MdClose, MdEdit, MdDelete } from 'react-icons/md';
import { StarDisplay } from '../../components/StarRating';

const AdminStores = () => {
  const [stores, setStores] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [sort, setSort] = useState({ field: 'name', order: 'ASC' });
  const [showModal, setShowModal] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', address: '', owner_id: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, sortBy: sort.field, sortOrder: sort.order };
      const { data } = await API.get('/admin/stores', { params });
      setStores(data);
    } catch {
      toast.error('Failed to load stores');
    } finally {
      setLoading(false);
    }
  }, [filters, sort]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  useEffect(() => {
    API.get('/admin/users', { params: { role: 'store_owner' } })
      .then(({ data }) => setOwners(data))
      .catch(() => {});
  }, []);

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
    if (form.address && form.address.length > 400) e.address = 'Max 400 chars';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const payload = { ...form, owner_id: form.owner_id || null };
      if (editingStore) {
        await API.put(`/admin/stores/${editingStore.id}`, payload);
        toast.success('Store updated successfully');
      } else {
        await API.post('/admin/stores', payload);
        toast.success('Store created successfully');
      }
      closeModal();
      fetchStores();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save store');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this store?')) return;
    try {
      await API.delete(`/admin/stores/${id}`);
      toast.success('Store deleted successfully');
      fetchStores();
    } catch (err) {
      toast.error('Failed to delete store');
    }
  };

  const openEdit = (store) => {
    setEditingStore(store);
    setForm({
      name: store.name,
      email: store.email,
      address: store.address || '',
      owner_id: store.owner_id || ''
    });
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingStore(null);
    setForm({ name: '', email: '', address: '', owner_id: '' });
    setFormErrors({});
  };

  return (
    <>
      <div className="content-header">
        <h1 className="page-title">Stores</h1>
        <p className="page-subtitle">Manage all registered stores</p>
      </div>
      <div className="content-body">
        <div className="card">
          <div className="card-header">
            <span className="card-title">🏪 All Stores ({stores.length})</span>
            <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
              <MdAdd /> Add Store
            </button>
          </div>
          <div style={{ padding: '16px 24px' }}>
            <div className="filters-row">
              {['name', 'email', 'address'].map(f => (
                <input key={f} className="filter-input" placeholder={`Filter by ${f}...`}
                  value={filters[f]} onChange={e => setFilters(p => ({ ...p, [f]: e.target.value }))} />
              ))}
            </div>
          </div>

          {loading ? (
            <div className="loading-wrap"><div className="spinner" /></div>
          ) : stores.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🏪</div>
              <div className="empty-title">No stores found</div>
              <div className="empty-sub">Add a store to get started</div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    {[['name', 'Name'], ['email', 'Email'], ['address', 'Address']].map(([f, l]) => (
                      <th key={f} onClick={() => handleSort(f)}>{l} <SortIcon field={f} /></th>
                    ))}
                    <th onClick={() => handleSort('avg_rating')}>Rating <SortIcon field="avg_rating" /></th>
                    <th>Owner</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600 }}>{s.name}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{s.email}</td>
                      <td style={{ color: 'var(--text-secondary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.address || '—'}</td>
                      <td>
                        <div className="avg-rating">
                          <StarDisplay value={s.avg_rating} />
                          <span className="avg-rating-value">{parseFloat(s.avg_rating).toFixed(1)}</span>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>({s.rating_count})</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{s.owner_name || '—'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => openEdit(s)} title="Edit">
                            <MdEdit />
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)} title="Delete">
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

      {/* Create/Edit Store Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editingStore ? 'Edit Store' : 'Add New Store'}</span>
              <button className="modal-close" onClick={closeModal}><MdClose /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Store Name <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>(20–60 chars)</span></label>
                  <input className={`form-input ${formErrors.name ? 'error' : ''}`} value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. The Grand Coffee Emporium" />
                  {formErrors.name && <p className="form-error">{formErrors.name}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className={`form-input ${formErrors.email ? 'error' : ''}`} type="email" value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="store@example.com" />
                  {formErrors.email && <p className="form-error">{formErrors.email}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <textarea className={`form-input ${formErrors.address ? 'error' : ''}`} rows={2} value={form.address}
                    onChange={e => setForm(p => ({ ...p, address: e.target.value }))} style={{ resize: 'vertical' }} />
                  {formErrors.address && <p className="form-error">{formErrors.address}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">Assign Owner <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>(optional)</span></label>
                  <select className="form-input" value={form.owner_id} onChange={e => setForm(p => ({ ...p, owner_id: e.target.value }))}>
                    <option value="">No Owner</option>
                    {owners.map(o => <option key={o.id} value={o.id}>{o.name} ({o.email})</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : editingStore ? 'Update Store' : 'Create Store'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminStores;
