import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminLayout from './pages/admin/AdminLayout';
import UserLayout from './pages/user/UserLayout';
import StoreOwnerLayout from './pages/store-owner/StoreOwnerLayout';

const RootRedirect = () => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user?.role === 'store_owner') return <Navigate to="/store-owner/dashboard" replace />;
  return <Navigate to="/user/dashboard" replace />;
};

const Unauthorized = () => {
  const { logout } = useAuth();
  return (
    <div className="error-page">
      <div className="error-code">403</div>
      <div className="error-title">Access Denied</div>
      <div className="error-sub">You don't have permission to view this page.</div>
      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <button className="btn btn-secondary" onClick={() => window.location.href = '/'}>Go Home</button>
        <button className="btn btn-primary" onClick={() => { logout(); window.location.href = '/login'; }}>Logout & Login</button>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a2e',
              color: '#f1f5f9',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: 12,
              fontSize: 14,
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#1a1a2e' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#1a1a2e' } },
          }}
        />
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route path="/admin/*" element={
            <ProtectedRoute roles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          } />

          <Route path="/user/*" element={
            <ProtectedRoute roles={['user']}>
              <UserLayout />
            </ProtectedRoute>
          } />

          <Route path="/store-owner/*" element={
            <ProtectedRoute roles={['store_owner']}>
              <StoreOwnerLayout />
            </ProtectedRoute>
          } />

          <Route path="*" element={
            <div className="error-page">
              <div className="error-code">404</div>
              <div className="error-title">Page Not Found</div>
              <div className="error-sub">The page you're looking for doesn't exist.</div>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => window.location.href = '/'}>Go Home</button>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
