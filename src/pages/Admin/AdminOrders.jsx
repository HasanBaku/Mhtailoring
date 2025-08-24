import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { sendEmail } from '../../utils/sendEmail';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';



function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newPrice, setNewPrice] = useState('');
  const [filters, setFilters] = useState({
    vendorEmail: '',
    status: '',
    fabric: ''
  });
  const navigate = useNavigate();


const fetchOrders = async () => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch('http://localhost:5000/api/orders/admin/all', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }

    const data = await response.json();
    setOrders(data);
  } catch (err) {
    console.error('Error fetching orders:', err.message);
  }
};

  useEffect(() => {
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/orders/admin/all', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err.message);
    }
  };

  fetchOrders();
}, []);
  
  console.log('Fetched Orders:', orders);


const editOrder = async (id) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`http://localhost:5000/api/orders/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ estimatedPrice: parseFloat(newPrice) }) // backend expects this

    });

    if (!response.ok) throw new Error('Failed to update order price');

    const updatedOrder = await response.json();
    setOrders(prev =>
      prev.map(order => (order.id === id ? updatedOrder : order))
    );
    setEditingId(null);
    setNewPrice('');
  } catch (err) {
    console.error('Edit order error:', err.message);
  }
};


const updateOrderStatus = async (id, newStatus) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`http://localhost:5000/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus })
    });

    if (!response.ok) throw new Error('Failed to update order status');
    const updatedOrder = await response.json();

    setOrders(prev =>
      prev.map(order => (order.id === id ? updatedOrder : order))
    );
  } catch (err) {
    console.error('Error updating status:', err.message);
  }
};


const deleteOrder = async (id) => {
  if (!window.confirm('Are you sure you want to delete this order?')) return;
  try {
    const token = localStorage.getItem('authToken');
    await axios.delete(`/orders/${id}`);
    setOrders(prev => prev.filter(order => order.id !== id));
    if (!res.ok) throw new Error('Delete failed');
    setOrders(prev => prev.filter(order => order.id !== id));
  } catch (err) {
    console.error('Delete error:', err.message);
  }
};

const approveOrder = async (orderId) => {
  if (!window.confirm("Are you sure you want to approve this order? An invoice will be generated.")) return;
  try {
    await api.put(`/orders/${orderId}/approve`);   // ✅ now /api/orders/:id/approve
    fetchOrders();
  } catch (err) {
    console.error("❌ Failed to approve order:", err.response?.data || err.message);
  }
};

const rejectOrder = async (orderId) => {
  if (!window.confirm("Rejecting will delete the invoice (if exists). Are you sure?")) return;
  try {
    const res = await api.put(`/orders/${orderId}/reject`);  // ✅ now /api/orders/:id/reject
    const updated = res.data;
    setOrders(prev => prev.map(order => (order.id === updated.id ? updated : order)));
  } catch (err) {
    console.error("❌ Failed to reject order:", err.response?.data || err.message);
  }
};



  return (
    <>
    <div style={{ marginBottom: '20px', display: 'flex', gap: '20px' }}>
  <select
  value={filters.vendorEmail}
  onChange={(e) => setFilters({ ...filters, vendorEmail: e.target.value })}
>
  <option value="">All Vendors</option>
  {Array.from(new Set(orders.map(order => order.vendor_email).filter(Boolean)))
    .map(email => (
      <option key={email} value={email}>{email}</option>
  ))}

</select>



  <select
    value={filters.status}
    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
  >
    <option value="">All Statuses</option>
    <option value="Pending">Pending</option>
    <option value="Approved">Approved</option>
    <option value="Rejected">Rejected</option>
  </select>

  <select
  value={filters.fabric}
  onChange={(e) => setFilters({ ...filters, fabric: e.target.value })}
>
  <option value="">All Fabrics</option>
  {[...new Set(
  orders.map(order => order.fabric).filter(f => typeof f === 'string' && f.trim() !== '')
)].map((fabric, index) => (
  <option key={`fabric-${index}-${fabric}`} value={fabric}>{fabric}</option>
))}


</select>
</div>
      <h2 style={{ marginBottom: '20px' }}>All Vendor Orders</h2>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
          <thead>
            <tr>
              <th style={thStyle}>Order ID</th>
              <th style={thStyle}>Vendor</th>
              <th style={thStyle}>Title</th>
              <th style={thStyle}>Fabric</th>
              <th style={thStyle}>Price</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
              <th style={thStyle}>Details</th>
            </tr>
          </thead>
          <tbody>
  {orders
    .filter(order =>
  (filters.vendorEmail ? order.vendor_email?.trim().toLowerCase() === filters.vendorEmail.trim().toLowerCase() : true) &&
  (filters.status ? order.status?.trim().toLowerCase() === filters.status.trim().toLowerCase() : true) &&
  (filters.fabric ? order.fabric === filters.fabric : true)
)

    .map(order => {
      const cleanEmail = order.vendor_email?.trim().toLowerCase();

      return (
  <tr key={order.id}>
  {/* Order ID */}
  <td style={tdStyle}>{order.id}</td>

  {/* Vendor Info */}
  <td style={tdStyle}>
    <div>
      <strong>{order.company_name || order.vendor_email}</strong><br />
      <small>{order.contact_name || ''}</small>
      {order.is_deleted && (
        <span style={{ color: 'red', marginLeft: '6px', fontSize: '0.9em' }}>
          (Deleted by vendor)
        </span>
      )}
    </div>
  </td>

  {/* Title */}
  <td style={tdStyle}>{order.title}</td>

  {/* Fabric */}
  <td style={tdStyle}>{order.fabric}</td>

  {/* Price */}
  <td style={tdStyle}>
    {editingId === order.id ? (
      <input
        type="number"
        value={newPrice}
        onChange={(e) => setNewPrice(e.target.value)}
        style={{ width: '80px' }}
      />
    ) : (
      <span>
        {order.estimated_price !== undefined && order.estimated_price !== null
          ? `$${Number(order.estimated_price).toFixed(2)}`
          : '—'}
      </span>

    )}
  </td>

  {/* Status */}
  <td style={tdStyle}>
    <span style={{
      padding: '4px 8px',
      borderRadius: '6px',
      backgroundColor:
        order.status === 'Approved' ? '#d4edda' :
        order.status === 'Rejected' ? '#f8d7da' :
        '#fff3cd',
      color:
        order.status === 'Approved' ? '#155724' :
        order.status === 'Rejected' ? '#721c24' :
        '#856404',
      fontWeight: 'bold',
    }}>
      {order.status}
    </span>
  </td>

  {/* Actions */}
  <td style={tdStyle}>
  {order.status === 'Completed' ? (
    <button style={{
      backgroundColor: '#ccc',
      color: '#555',
      border: 'none',
      padding: '6px 12px',
      borderRadius: '5px',
      fontWeight: 'bold',
      cursor: 'not-allowed'
    }} disabled>
      🔒 Locked
    </button>
  ) : editingId === order.id ? (
    <>
      <button onClick={() => editOrder(order.id)} style={buttonStyle('#17a2b8')}>Save</button>
      <button onClick={() => { setEditingId(null); setNewPrice(''); }} style={buttonStyle('#6c757d')}>Cancel</button>
    </>
  ) : (
    <>
      <button onClick={() => approveOrder(order.id)} style={buttonStyle('#28a745')}>Approve</button>
      <button onClick={() => rejectOrder(order.id)} style={buttonStyle('#ffc107')}>Reject</button>
      <button onClick={() => deleteOrder(order.id)} style={buttonStyle('#dc3545')}>Delete</button>
    </>
  )}
</td>

  {/* Details */}
  <td style={tdStyle}>
    <button onClick={() => navigate(`/admin/orders/${order.id}`)}>Details</button>
  </td>
</tr>
      );
    })}
</tbody>
        </table>
      )}
      
    </>
  );
}

const thStyle = { padding: '12px', background: '#f1f1f1', textAlign: 'left', fontWeight: 'bold' };
const tdStyle = { padding: '12px' };
const buttonStyle = (bg) => ({
  backgroundColor: bg,
  color: '#fff',
  border: 'none',
  padding: '6px 10px',
  marginRight: '6px',
  borderRadius: '5px',
  cursor: 'pointer'
});

export default AdminOrders;
