import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  MdDashboard, MdPeople, MdStore, MdLogout, MdLock
} from 'react-icons/md';

const Sidebar = ({ navLinks }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const roleLabel = {
    admin: '🛡️ Administrator',
    user: '👤 Normal User',
    store_owner: '🏪 Store Owner',
  }[user?.role] || user?.role;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">⭐</div>
        <div>
          <div className="brand-text">RateMyStore</div>
          <div className="brand-sub">Platform</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navLinks.map((section, si) => (
          <div key={si} style={{ marginBottom: 16 }}>
            {section.title && <div className="nav-section-title">{section.title}</div>}
            {section.items.map((item, ii) => (
              <NavLink
                key={ii}
                to={item.to}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{initials}</div>
          <div>
            <div className="user-name" style={{ fontSize: 12, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
            <div className="user-role">{roleLabel}</div>
          </div>
        </div>
        <button className="nav-item" onClick={handleLogout} style={{ color: 'var(--danger)', width: '100%' }}>
          <MdLogout size={16} /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
