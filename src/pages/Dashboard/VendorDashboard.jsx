import React, { useEffect, useState } from 'react';
import './VendorDashboard.css';

function VendorDashboard() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem('vendor_orders')) || [];
    setOrders(savedOrders);
  }, []);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order =>
    order.status && order.status.toLowerCase().includes('pending')
  ).length;
  const invoicedOrders = orders.filter(order =>
    order.invoiceGenerated // or use a string check like order.status === 'invoiced'
  ).length;

  return (
    <div style={{ width: '100%', padding: '60px' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '40px' }}>
        Welcome to Your Dashboard
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '30px',
        width: '100%',
      }}>
        <div style={{ background: '#fff', padding: '30px', borderRadius: '10px' }}>
          <h5>Total Orders</h5>
          <p>{totalOrders}</p>
        </div>
        <div style={{ background: '#fff', padding: '30px', borderRadius: '10px' }}>
          <h5>Pending</h5>
          <p>{pendingOrders}</p>
        </div>
        <div style={{ background: '#fff', padding: '30px', borderRadius: '10px' }}>
          <h5>Invoices</h5>
          <p>{invoicedOrders}</p>
        </div>
      </div>
    </div>
  );
}

export default VendorDashboard;
