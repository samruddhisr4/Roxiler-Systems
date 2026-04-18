import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import UserDashboard from './UserDashboard';
import UserStores from './UserStores';
import ChangePassword from '../shared/ChangePassword';
import { MdDashboard, MdStore, MdLock } from 'react-icons/md';

const UserLayout = () => {
  const navLinks = [
    {
      title: 'Navigation',
      items: [
        { to: '/user/dashboard', label: 'My Profile', icon: <MdDashboard size={16} /> },
        { to: '/user/stores', label: 'Browse Stores', icon: <MdStore size={16} /> },
        { to: '/user/change-password', label: 'Change Password', icon: <MdLock size={16} /> },
      ],
    },
  ];

  return (
    <div className="app-layout">
      <Sidebar navLinks={navLinks} />
      <main className="main-content">
        <Routes>
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="stores" element={<UserStores />} />
          <Route path="change-password" element={<ChangePassword />} />
        </Routes>
      </main>
    </div>
  );
};

export default UserLayout;
