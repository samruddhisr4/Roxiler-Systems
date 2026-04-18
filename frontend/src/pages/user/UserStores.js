import React, { useEffect, useState, useCallback } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { StarDisplay } from '../../components/StarRating';
import StarRating from '../../components/StarRating';

const UserStores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', address: '' });
  const [sort, setSort] = useState({ field: 'name', order: 'ASC' });
  const [ratingStore, setRatingStore] = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [submittingRating, setSubmittingRating] = useState(false);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, sortBy: sort.field, sortOrder: sort.order };
      const { data } = await API.get('/user/stores', { params });
      setStores(data);
    } catch {
      toast.error('Failed to load stores');
    } finally {
      setLoading(false);
    }
  }, [filters, sort]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  const openRating = (store) => {
    setRatingStore(store);
    setSelectedRating(store.user_rating || 0);
  };

  const handleSubmitRating = async () => {
    if (!selectedRating) { toast.error('Please select a rating'); return; }
    setSubmittingRating(true);
    try {
      await API.post(`/user/stores/${ratingStore.id}/rate`, { rating: selectedRating });
      toast.success(ratingStore.user_rating ? 'Rating updated!' : 'Rating submitted!');
      setRatingStore(null);
      fetchStores();
    } catch {
      toast.error('Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  return (
    <>
      <div className="content-header">
        <h1 className="page-title">Browse Stores</h1>
        <p className="page-subtitle">Discover and rate stores on the platform</p>
      </div>
      <div className="content-body">
        {/* Search / Filter */}
        <div className="filters-row" style={{ marginBottom: 24 }}>
          <input className="filter-input" placeholder="🔍 Search by store name..."
            value={filters.name} onChange={e => setFilters(p => ({ ...p, name: e.target.value }))} />
          <input className="filter-input" placeholder="📍 Search by address..."
            value={filters.address} onChange={e => setFilters(p => ({ ...p, address: e.target.value }))} />
          <select className="filter-select" value={sort.field + ':' + sort.order}
            onChange={e => { const [f, o] = e.target.value.split(':'); setSort({ field: f, order: o }); }}>
            <option value="name:ASC">Name A→Z</option>
            <option value="name:DESC">Name Z→A</option>
            <option value="avg_rating:DESC">Highest Rated</option>
            <option value="avg_rating:ASC">Lowest Rated</option>
          </select>
        </div>

        {loading ? (
          <div className="loading-wrap"><div className="spinner" /><span className="loading-text">Loading stores...</span></div>
        ) : stores.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏪</div>
            <div className="empty-title">No stores found</div>
            <div className="empty-sub">Try a different search term</div>
          </div>
        ) : (
          <div className="stores-grid">
            {stores.map(store => (
              <div className="store-card" key={store.id}>
                <div className="store-card-header">
                  <div className="store-icon">🏪</div>
                  <div>
                    <div className="store-name">{store.name}</div>
                    <div className="store-address">📍 {store.address || 'No address listed'}</div>
                  </div>
                </div>

                <div className="store-divider" />

                <div className="store-rating-section">
                  <div className="rating-label">Overall Rating</div>
                  <div className="avg-rating">
                    <StarDisplay value={store.avg_rating} size={16} />
                    <span className="avg-rating-value">{parseFloat(store.avg_rating).toFixed(1)}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>({store.rating_count} reviews)</span>
                  </div>

                  <div className="your-rating-row">
                    <span className="your-rating-label">Your Rating:</span>
                    {store.user_rating
                      ? <StarDisplay value={store.user_rating} size={14} />
                      : <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Not rated yet</span>
                    }
                  </div>
                </div>

                <button
                  className={`btn btn-sm btn-full ${store.user_rating ? 'btn-secondary' : 'btn-primary'}`}
                  onClick={() => openRating(store)}
                >
                  {store.user_rating ? '✏️ Modify Rating' : '⭐ Submit Rating'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {ratingStore && (
        <div className="modal-overlay" onClick={() => setRatingStore(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{ratingStore.user_rating ? 'Update Rating' : 'Rate Store'}</span>
              <button className="modal-close" onClick={() => setRatingStore(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{ratingStore.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{ratingStore.address}</div>
              </div>
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Select your rating</div>
                <StarRating value={selectedRating} onChange={setSelectedRating} size={40} />
                {selectedRating > 0 && (
                  <div style={{ marginTop: 12, fontSize: 14, color: 'var(--warning)', fontWeight: 600 }}>
                    {['', 'Terrible', 'Bad', 'Okay', 'Good', 'Excellent'][selectedRating]} ({selectedRating}/5)
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setRatingStore(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmitRating} disabled={submittingRating || !selectedRating}>
                {submittingRating ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserStores;
