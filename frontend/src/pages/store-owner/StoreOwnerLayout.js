import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import StoreOwnerDashboard from './StoreOwnerDashboard';
import ChangePassword from '../shared/ChangePassword';
import { MdDashboard, MdLock } from 'react-icons/md';

const StoreOwnerLayout = () => {
  const navLinks = [
    {
      title: 'Navigation',
      items: [
        { to: '/store-owner/dashboard', label: 'My Dashboard', icon: <MdDashboard size={16} /> },
        { to: '/store-owner/change-password', label: 'Change Password', icon: <MdLock size={16} /> },
      ],
    },
  ];

  return (
    <div className="app-layout">
      <Sidebar navLinks={navLinks} />
      <main className="main-content">
        <Routes>
          <Route path="dashboard" element={<StoreOwnerDashboard />} />
          <Route path="change-password" element={<ChangePassword />} />
        </Routes>
      </main>
    </div>
  );
};

export default StoreOwnerLayout;
