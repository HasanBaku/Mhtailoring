import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { useEffect } from 'react';
import Home from './pages/Home';
import Services from './pages/Services';
import Portfolio from './pages/Portfolio';
import Contact from './pages/Contact';
import Login from './pages/Login';
import { initialVendors } from './data/initialVendors';
import VendorDashboard from './pages/Dashboard/VendorDashboard';
import Orders from './pages/Dashboard/Orders';
import NewOrder from './pages/Dashboard/NewOrder';
import Invoices from './pages/Dashboard/Invoices';
import Profile from './pages/Dashboard/Profile';

import VendorLayout from './components/VendorLayout';
import PublicLayout from './components/PublicLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminOrders from './pages/Admin/AdminOrders';
import AdminInvoices from './pages/Admin/AdminInvoices';
import AdminOrderDetail from './pages/Admin/AdminOrderDetail';
import AdminVendors from './pages/Admin/AdminVendors';
import AdminVendorDetail from './pages/Admin/AdminVendorDetail';
import OrderDetail from './pages/Dashboard/OrderDetail';




function App() {
  useEffect(() => {
    const INACTIVITY_LIMIT_MS = 60 * 60 * 1000; // 1 hour
    const CHECK_EVERY_MS = 60 * 1000; // 1 minute

    const updateActivity = () => localStorage.setItem('lastActive', Date.now().toString());

    updateActivity();

    const events = ['click', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach(evt => window.addEventListener(evt, updateActivity));

    const interval = setInterval(() => {
      const lastActive = parseInt(localStorage.getItem('lastActive') || '0', 10);
      if (Date.now() - lastActive > INACTIVITY_LIMIT_MS) {
        console.warn('🛑 Session expired due to inactivity.');
        localStorage.removeItem('authToken');
        localStorage.removeItem('lastActive');
        if (window.location.pathname !== '/login') window.location.href = '/login';
      }
    }, CHECK_EVERY_MS);

    return () => {
      events.forEach(evt => window.removeEventListener(evt, updateActivity));
      clearInterval(interval);
    };
  }, []);

  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Vendor (protected) */}
      <Route
        path="/vendor"
        element={
          <ProtectedRoute allowedRole="vendor">
            <VendorLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<VendorDashboard />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/new" element={<NewOrder />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="profile" element={<Profile />} />
        <Route path="orders/:id" element={<OrderDetail />} />
      </Route>

      {/* Admin (protected)  ⬅️ you were missing this */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="orders/:id" element={<AdminOrderDetail />} />
        <Route path="invoices" element={<AdminInvoices />} />
        <Route path="vendors" element={<AdminVendors />} />
      </Route>
    </Routes>
  );
}


export default App;
