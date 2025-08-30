import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api'; // <-- use the shared axios instance
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [toast, setToast] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [fabricFilter, setFabricFilter] = useState('');
  const navigate = useNavigate();
  const [editingOrder, setEditingOrder] = useState(null);

  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    fabric: '',
    measurements: {
      chest: 0,
      waist: 0,
      length: 0,
      shoulder: 0,
      sleeve: 0,
      inseam: 0,
    },
    urgency: 'normal',
    deliveryDate: '',
    notes: '',
    image: '',
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // Token is injected by api interceptor (expects 'authToken')
      const res = await api.get('/orders'); // baseURL already includes /api
      setOrders(res.data || []);
    } catch (err) {
      console.error('Failed to fetch orders:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      showToast(err.response?.data?.error || 'Failed to load orders');
    }
  };

  const handleEditClick = (e, order) => {
    e.stopPropagation();
    e.preventDefault();
    setEditForm({
      title: order.title || '',
      description: order.description || '',
      fabric: order.fabric || '',
      measurements: order.measurements || {
        chest: 0,
        waist: 0,
        length: 0,
        shoulder: 0,
        sleeve: 0,
        inseam: 0,
      },
      urgency: order.urgency || 'normal',
      deliveryDate: order.delivery_date ? order.delivery_date.slice(0, 10) : '',
      notes: order.notes || '',
      image: order.image || '',
    });
    setEditingOrder(order.id);
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditMeasurementChange = (key, value) => {
    setEditForm((prev) => ({
      ...prev,
      measurements: {
        ...prev.measurements,
        [key]: parseFloat(value) || 0,
      },
    }));
  };

  const handleEditImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditForm((prev) => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const calculateEstimatedPrice = (form) => {
    const basePrice = 50;
    const fabricMultiplier = { cotton: 1.1, wool: 1.5, silk: 1.8, linen: 1.3 };
    const measurementSum = Object
      .values(form.measurements)
      .reduce((sum, v) => sum + (parseFloat(v) || 0), 0);
    const urgencyMultiplier = form.urgency === 'express' ? 1.3 : 1;
    const price = basePrice + measurementSum * 0.8;
    const adjusted = price * (fabricMultiplier[form.fabric] || 1) * urgencyMultiplier;
    return Number(adjusted.toFixed(2));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const estimated_price = calculateEstimatedPrice(editForm);
      // Map camelCase -> snake_case for backend
      const payload = {
        title: editForm.title,
        description: editForm.description,
        fabric: editForm.fabric,
        measurements: editForm.measurements,
        urgency: editForm.urgency,
        delivery_date: editForm.deliveryDate || null,
        notes: editForm.notes,
        image: editForm.image,
        estimated_price,
      };

      const res = await api.put(`/orders/${editingOrder}`, payload);
      setOrders((prev) => prev.map((o) => (o.id === editingOrder ? res.data : o)));
      showToast('Order updated');
      setEditingOrder(null);
    } catch (err) {
      console.error('Update error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      showToast(err.response?.data?.error || 'Failed to update order');
    }
    // optional: re-sync from server
    fetchOrders();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      await api.delete(`/orders/${id}`);
      setOrders((prev) => prev.filter((o) => o.id !== id));
      showToast('Order deleted successfully');
    } catch (err) {
      console.error('Delete error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      showToast(err.response?.data?.error || 'Failed to delete order');
    }
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const filteredOrders = orders.filter((order) => {
    const statusMatch = statusFilter ? order.status === statusFilter : true;
    const fabricMatch = fabricFilter ? order.fabric === fabricFilter : true;
    return statusMatch && fabricMatch;
  });

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Your Orders</h2>

      <div className="d-flex gap-3 mb-3 align-items-center">
        <div>
          <label>Status:</label>
          <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <div>
          <label>Fabric:</label>
          <select className="form-select" value={fabricFilter} onChange={(e) => setFabricFilter(e.target.value)}>
            <option value="">All</option>
            <option value="cotton">Cotton</option>
            <option value="wool">Wool</option>
            <option value="silk">Silk</option>
            <option value="linen">Linen</option>
          </select>
        </div>
      </div>

      {toast && <div className="alert alert-info position-fixed bottom-0 end-0 m-4">{toast}</div>}

      {filteredOrders.length === 0 ? (
        <div className="text-muted">No orders submitted yet.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>Title</th>
                <th>Fabric</th>
                <th>Price</th>
                <th>Status</th>
                <th>Delivery</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.title}</td>
                  <td>{order.fabric}</td>
                  <td>${order.estimated_price ?? '-'}</td>
                  <td>
                    <span
                      className={`badge ${
                        order.status === 'Completed'
                          ? 'bg-secondary'
                          : order.status === 'Approved'
                          ? 'bg-success'
                          : order.status === 'Rejected'
                          ? 'bg-danger'
                          : 'bg-warning text-dark'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td>{order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    {order.status === 'Completed' ? (
                      <button className="btn btn-sm btn-secondary" disabled title="Order locked">
                        <i className="bi bi-lock-fill">Locked</i>
                      </button>
                    ) : (
                      <>
                        <button className="btn btn-sm btn-primary me-2" onClick={() => navigate(`/vendor/orders/${order.id}`)}>
                          View
                        </button>
                        <button className="btn btn-sm btn-secondary me-2" onClick={(e) => handleEditClick(e, order)}>
                          Edit
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(order.id)}>
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingOrder && (
        <div className="modal-overlay">
          <div className="custom-modal">
            <form className="order-form" onSubmit={handleEditSubmit}>
              <h2>Edit Order</h2>

              <div className="form-group">
                <label>Order Title</label>
                <input type="text" value={editForm.title} onChange={(e) => handleEditChange('title', e.target.value)} required />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea value={editForm.description} onChange={(e) => handleEditChange('description', e.target.value)} required />
              </div>

              <div className="form-group">
                <label>Fabric</label>
                <select value={editForm.fabric} onChange={(e) => handleEditChange('fabric', e.target.value)} required>
                  <option value="">Select Fabric</option>
                  <option value="cotton">Cotton</option>
                  <option value="wool">Wool</option>
                  <option value="silk">Silk</option>
                  <option value="linen">Linen</option>
                </select>
              </div>

              <div className="form-grid">
                {['chest', 'waist', 'length', 'shoulder', 'sleeve', 'inseam'].map((key) => (
                  <div key={key} className="form-group">
                    <label>{key.charAt(0).toUpperCase() + key.slice(1)} (cm)</label>
                    <input
                      type="number"
                      value={editForm.measurements?.[key] ?? ''}
                      onChange={(e) => handleEditMeasurementChange(key, e.target.value)}
                      required
                    />
                  </div>
                ))}
              </div>

              <div className="form-group">
                <label>Urgency</label>
                <select value={editForm.urgency} onChange={(e) => handleEditChange('urgency', e.target.value)}>
                  <option value="normal">Normal</option>
                  <option value="express">Express</option>
                </select>
              </div>

              <div className="form-group">
                <label>Expected Delivery Date</label>
                <input type="date" value={editForm.deliveryDate} onChange={(e) => handleEditChange('deliveryDate', e.target.value)} />
              </div>

              <div className="form-group">
                <label>Additional Notes</label>
                <textarea value={editForm.notes} onChange={(e) => handleEditChange('notes', e.target.value)} />
              </div>

              <div className="form-group">
                <label>Sketch / Design Image</label>
                <input type="file" accept="image/*" onChange={handleEditImageUpload} />
                {editForm.image && (
                  <div className="preview-image">
                    <img src={editForm.image} alt="Sketch preview" />
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Save Changes</button>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingOrder(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
