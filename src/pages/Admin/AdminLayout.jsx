import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import './AdminLayout.css';

function AdminLayout() {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <Outlet /> {/* This renders the nested route (e.g., Dashboard or Orders) */}
      </div>
    </div>
  );
}

export default AdminLayout;
