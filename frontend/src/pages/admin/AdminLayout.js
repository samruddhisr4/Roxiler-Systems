import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import AdminDashboard from './AdminDashboard';
import AdminUsers from './AdminUsers';
import AdminStores from './AdminStores';
import { MdDashboard, MdPeople, MdStore } from 'react-icons/md';

const AdminLayout = () => {
  const navLinks = [
    {
      title: 'Navigation',
      items: [
        { to: '/admin/dashboard', label: 'Dashboard', icon: <MdDashboard size={16} /> },
        { to: '/admin/users', label: 'Users', icon: <MdPeople size={16} /> },
        { to: '/admin/stores', label: 'Stores', icon: <MdStore size={16} /> },
      ],
    },
  ];

  return (
    <div className="app-layout">
      <Sidebar navLinks={navLinks} />
      <main className="main-content">
        <Routes>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="stores" element={<AdminStores />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminLayout;
