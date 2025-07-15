import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import axios from '../../utils/axiosInstance'; // make sure this points to your authorized Axios instance
// Add this once in your chart setup file or top-level component (e.g., AdminDashboard.jsx)
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale);

function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await axios.get('/orders/admin/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(res.data);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const totalOrders = orders.length;
  const pending = orders.filter(o => o.status?.toLowerCase() === 'pending').length;
  const approved = orders.filter(o => o.status?.toLowerCase() === 'approved').length;
  const rejected = orders.filter(o => o.status?.toLowerCase() === 'rejected').length;
  const completed = orders.filter(o => o.status?.toLowerCase() === 'completed').length;

  const totalRevenue = orders
    .filter(o => o.status?.toLowerCase() === 'approved' || o.status?.toLowerCase() === 'completed')
    .reduce((acc, o) => acc + (parseFloat(o.estimated_price) || 0), 0);

  const chartData = {
    labels: ['Pending', 'Approved', 'Rejected', 'Completed'],
    datasets: [{
      label: 'Order Status',
      data: [pending, approved, rejected, completed],
      backgroundColor: ['#f0ad4e', '#5cb85c', '#d9534f', '#6c757d'],
    }],
  };

  return (
    <>
      <h2 style={{ marginBottom: '30px' }}>Admin Dashboard</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            marginBottom: '40px'
          }}>
            <MetricBox label="Total Orders" value={totalOrders} />
            <MetricBox label="Pending" value={pending} />
            <MetricBox label="Approved" value={approved} />
            <MetricBox label="Rejected" value={rejected} />
            <MetricBox label="Completed" value={completed} />
            <MetricBox label="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} />
          </div>

          <div style={{ background: '#fff', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h4 style={{ marginBottom: '20px' }}>Order Status Distribution</h4>
            <div style={{ width: '400px', height: '400px', margin: '0 auto' }}>
  <Pie data={chartData} />
</div>
          </div>
        </>
      )}
    </>
  );
}

function MetricBox({ label, value }) {
  return (
    <div style={{
      background: '#fff',
      padding: '25px',
      borderRadius: '10px',
      textAlign: 'center',
      boxShadow: '0 4px 8px rgba(0,0,0,0.06)',
      transition: '0.2s ease',
    }}>
      <h5 style={{ marginBottom: '10px', fontWeight: '500', color: '#555' }}>{label}</h5>
      <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#333' }}>{value}</p>
    </div>
  );
}

export default AdminDashboard;
