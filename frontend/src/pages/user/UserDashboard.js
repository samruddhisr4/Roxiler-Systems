import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { MdPerson, MdStar, MdEmail, MdLocationOn } from 'react-icons/md';

const UserDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/user/dashboard')
      .then(({ data }) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading-wrap">
      <div className="spinner" />
      <span className="loading-text">Loading profile...</span>
    </div>
  );

  return (
    <>
      <div className="content-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your account and view activity</p>
      </div>
      <div className="content-body">
        <div className="profile-grid">
          <div className="card profile-card">
            <div className="profile-hero">
              <div className="user-avatar large">
                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <h2 className="profile-name">{user.name}</h2>
              <span className="badge badge-user">Normal User</span>
            </div>
            <div className="profile-details">
              <div className="profile-info-item">
                <MdEmail className="info-icon" />
                <div className="info-content">
                  <span className="info-label">Email Address</span>
                  <span className="info-value">{user.email}</span>
                </div>
              </div>
              <div className="profile-info-item">
                <MdLocationOn className="info-icon" />
                <div className="info-content">
                  <span className="info-label">Current Address</span>
                  <span className="info-value">{user.address || 'No address provided'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card stats-card">
            <div className="card-header">
              <span className="card-title">Activity Summary</span>
            </div>
            <div className="card-body">
              <div className="stat-highlight">
                <div className="stat-highlight-icon"><MdStar /></div>
                <div>
                  <div className="stat-highlight-value">{stats?.ratedStoresCount || 0}</div>
                  <div className="stat-highlight-label">Stores Rated</div>
                </div>
              </div>
              <p style={{ marginTop: 24, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                You have contributed <strong>{stats?.ratedStoresCount || 0}</strong> reviews to the community. 
                Your feedback helps others discover amazing local stores!
              </p>
              <button className="btn btn-primary btn-full" style={{ marginTop: 20 }} onClick={() => window.location.href = '/user/stores'}>
                Rate More Stores
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserDashboard;
