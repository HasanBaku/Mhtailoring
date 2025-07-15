import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import './VendorLayout.css';
import { useAuth } from '../context/AuthContext';


function VendorLayout() {
    const { logout } = useAuth();
  return (
    <div className="vendor-dashboard-layout">
      <aside className="sidebar">
        <h3 className="sidebar-title">TailorPro</h3>
        <nav>
          <ul>
            <li><Link to="/vendor/dashboard">Dashboard</Link></li>
            <li><Link to="/vendor/orders">Orders</Link></li>
            <li><Link to="/vendor/orders/new">New Order</Link></li>
            <li><Link to="/vendor/invoices">Invoices</Link></li>
            <li><Link to="/vendor/profile">Profile</Link></li>
            <li><button onClick={logout} className="logout-btn">Logout</button></li>
          </ul>
        </nav>
      </aside>

      <main className="dashboard-content">
        <Outlet />
      </main>
    </div>
  );
}

export default VendorLayout;
