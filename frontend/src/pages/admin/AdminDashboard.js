import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import { MdPeople, MdStore, MdStar } from 'react-icons/md';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/dashboard')
      .then(({ data }) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading-wrap">
      <div className="spinner" />
      <span className="loading-text">Loading dashboard...</span>
    </div>
  );

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: <MdPeople />, colorClass: 'purple' },
    { label: 'Total Stores', value: stats?.totalStores ?? 0, icon: <MdStore />, colorClass: 'blue' },
    { label: 'Total Ratings', value: stats?.totalRatings ?? 0, icon: <MdStar />, colorClass: 'amber' },
  ];

  return (
    <>
      <div className="content-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Platform overview and key metrics</p>
      </div>
      <div className="content-body">
        <div className="stats-grid">
          {cards.map((c, i) => (
            <div className="stat-card" key={i}>
              <div className={`stat-icon ${c.colorClass}`}>{c.icon}</div>
              <div>
                <div className="stat-value">{c.value.toLocaleString()}</div>
                <div className="stat-label">{c.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">📊 Platform Summary</span>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
              {[
                { label: 'Avg Ratings per Store', value: stats?.totalStores > 0 ? (stats.totalRatings / stats.totalStores).toFixed(1) : '0' },
                { label: 'Avg Reviews per User', value: stats?.totalUsers > 0 ? (stats.totalRatings / stats.totalUsers).toFixed(1) : '0' },
              ].map((m, i) => (
                <div key={i} style={{ background: 'var(--bg-card2)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
                  <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--primary-light)' }}>{m.value}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
