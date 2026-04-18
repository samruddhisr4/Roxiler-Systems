import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { StarDisplay } from '../../components/StarRating';

const StoreOwnerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState({ field: 'user_name', order: 'ASC' });

  useEffect(() => {
    API.get('/store-owner/dashboard')
      .then(({ data }) => setData(data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const handleSort = (field) => {
    setSort(s => ({ field, order: s.field === field && s.order === 'ASC' ? 'DESC' : 'ASC' }));
  };

  const sortedRaters = data?.raters
    ? [...data.raters].sort((a, b) => {
        const aVal = a[sort.field] ?? '';
        const bVal = b[sort.field] ?? '';
        return sort.order === 'ASC'
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      })
    : [];

  const SortIcon = ({ field }) => {
    if (sort.field !== field) return <span className="sort-icon" style={{ opacity: 0.3 }}>↕</span>;
    return <span className="sort-icon">{sort.order === 'ASC' ? '↑' : '↓'}</span>;
  };

  if (loading) return (
    <div className="loading-wrap">
      <div className="spinner" />
      <span className="loading-text">Loading your dashboard...</span>
    </div>
  );

  if (!data) return (
    <div className="content-body">
      <div className="alert alert-error">No store found for your account. Please contact an administrator.</div>
    </div>
  );

  const avgRating = parseFloat(data.store.avg_rating);

  return (
    <>
      <div className="content-header">
        <h1 className="page-title">Store Dashboard</h1>
        <p className="page-subtitle">{data.store.name}</p>
      </div>
      <div className="content-body">
        {/* Big Rating Card */}
        <div className="big-rating">
          <div className="big-rating-value">{avgRating.toFixed(1)}</div>
          <div className="big-rating-stars">
            <StarDisplay value={avgRating} size={28} />
          </div>
          <div className="big-rating-count">
            Based on <strong>{data.store.total_ratings}</strong> {data.store.total_ratings === 1 ? 'review' : 'reviews'}
          </div>
          {data.store.address && (
            <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
              📍 {data.store.address}
            </div>
          )}
        </div>

        {/* Raters Table */}
        <div className="card raters-section">
          <div className="card-header">
            <span className="card-title">👥 User Ratings ({sortedRaters.length})</span>
          </div>
          {sortedRaters.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">⭐</div>
              <div className="empty-title">No ratings yet</div>
              <div className="empty-sub">Your store hasn't received any ratings yet</div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th onClick={() => handleSort('user_name')}>User Name <SortIcon field="user_name" /></th>
                    <th onClick={() => handleSort('user_email')}>Email <SortIcon field="user_email" /></th>
                    <th onClick={() => handleSort('rating')}>Rating <SortIcon field="rating" /></th>
                    <th onClick={() => handleSort('rated_at')}>Date <SortIcon field="rated_at" /></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRaters.map((r) => (
                    <tr key={r.user_id}>
                      <td style={{ fontWeight: 600 }}>{r.user_name}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{r.user_email}</td>
                      <td>
                        <div className="avg-rating">
                          <StarDisplay value={r.rating} />
                          <span className="avg-rating-value">{r.rating}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                        {new Date(r.rated_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default StoreOwnerDashboard;
