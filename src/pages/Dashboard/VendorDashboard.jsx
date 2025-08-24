import React, { useEffect, useState } from 'react';
import api from '../../api/api'; // ✅ baseURL = VITE_API_BASE_URL + '/api'

function VendorDashboard() {
  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        // fetch vendor’s own orders and invoices in parallel
        const [ordersRes, invoicesRes] = await Promise.all([
          api.get('/orders'),            // -> /api/orders  (vendor-scoped)
          api.get('/invoices/vendor')    // -> /api/invoices/vendor
        ]);
        setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
        setInvoices(Array.isArray(invoicesRes.data) ? invoicesRes.data : []);
      } catch (e) {
        console.error('❌ VendorDashboard fetch error:', e.response?.status, e.response?.data || e.message);
        setErr('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div style={{ padding: 40 }}>Loading…</div>;
  if (err) return <div style={{ padding: 40, color: 'crimson' }}>{err}</div>;

  const norm = (s) => (s || '').toString().trim().toLowerCase();

  const totalOrders   = orders.length;
  const pending       = orders.filter(o => norm(o.status) === 'pending').length;
  const approved      = orders.filter(o => norm(o.status) === 'approved').length;
  const rejected      = orders.filter(o => norm(o.status) === 'rejected').length;
  const completed     = orders.filter(o => norm(o.status) === 'completed').length;

  // invoices table uses total_price/payment_status in your backend
  const totalInvoices = invoices.length;
  const invoicesPending   = invoices.filter(i => norm(i.payment_status) === 'pending').length;
  const invoicesCompleted = invoices.filter(i => norm(i.payment_status) === 'completed').length;

  return (
    <div style={{ width: '100%', padding: '60px' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: 40 }}>Vendor Dashboard</h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 20
      }}>
        <Metric label="Total Orders" value={totalOrders} />
        <Metric label="Pending" value={pending} />
        <Metric label="Approved" value={approved} />
        <Metric label="Rejected" value={rejected} />
        <Metric label="Completed" value={completed} />
        <Metric label="Total Invoices" value={totalInvoices} />
        <Metric label="Invoices Pending" value={invoicesPending} />
        <Metric label="Invoices Completed" value={invoicesCompleted} />
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div style={{ background: '#fff', padding: 24, borderRadius: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', textAlign: 'center' }}>
      <div style={{ color: '#666', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

export default VendorDashboard;
