import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    fabric: '',
    estimated_price: '',
    measurements: { chest: '', waist: '', length: '' }
  });

  const fabricOptions = ['cotton', 'wool', 'linen', 'polyester', 'silk'];

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`http://localhost:5000/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to fetch order details');
        const data = await res.json();
        setOrder(data);
        setForm({
          title: data.title || '',
          description: data.description || '',
          fabric: data.fabric || '',
          estimated_price: data.estimated_price || '',
          measurements: {
            chest: data.measurements?.chest || '',
            waist: data.measurements?.waist || '',
            length: data.measurements?.length || '',
          }
        });
      } catch (err) {
        console.error('Order fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const handleChange = (field, value) => {
    if (!editing) return;
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleMeasurementChange = (field, value) => {
    if (!editing) return;
    setForm(prev => ({
      ...prev,
      measurements: { ...prev.measurements, [field]: value }
    }));
  };

  const saveChanges = async () => {
    const priceNum = Number(form.estimated_price);
    if (isNaN(priceNum)) {
      alert('Price must be a valid number.');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`http://localhost:5000/api/orders/admin/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          estimated_price: priceNum
        })
      });

      if (!res.ok) throw new Error('Failed to update order');

      const updated = await res.json();
      setOrder(updated);
      setEditing(false);
    } catch (err) {
      console.error('Save error:', err.message);
    }
  };

  if (loading) return <p style={{ padding: '30px' }}>Loading...</p>;
  if (!order) return <p style={{ padding: '30px' }}>Order not found.</p>;

  return (
    <div style={containerStyle}>
      <h2 style={{ marginBottom: '20px' }}>Order Details</h2>

      <DataRow label="ID" value={order.id} />
      <DataRow label="Vendor Email" value={order.vendor_email} />
      <DataRow label="Company Name" value={order.company_name || 'N/A'} />
      <DataRow label="Contact Name" value={order.contact_name || 'N/A'} />
      <DataRow label="Status" value={order.status} />

      <hr style={{ margin: '20px 0' }} />

      <FormGroup label="Title">
        <input value={form.title} onChange={e => handleChange('title', e.target.value)} className="form-control" readOnly={!editing} />
      </FormGroup>

      <FormGroup label="Description">
        <textarea value={form.description} onChange={e => handleChange('description', e.target.value)} className="form-control" rows={3} readOnly={!editing} />
      </FormGroup>

      <FormGroup label="Fabric">
        <select value={form.fabric} onChange={e => handleChange('fabric', e.target.value)} className="form-control" disabled={!editing}>
          <option value="">-- Select --</option>
          {fabricOptions.map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </FormGroup>

      <FormGroup label="Estimated Price">
        <input
          type="number"
          value={form.estimated_price}
          onChange={e => handleChange('estimated_price', e.target.value)}
          className="form-control"
          readOnly={!editing}
        />
      </FormGroup>

      <FormGroup label="Measurements">
        <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
          <input type="text" placeholder="Chest" value={form.measurements.chest} onChange={e => handleMeasurementChange('chest', e.target.value)} className="form-control" readOnly={!editing} />
          <input type="text" placeholder="Waist" value={form.measurements.waist} onChange={e => handleMeasurementChange('waist', e.target.value)} className="form-control" readOnly={!editing} />
          <input type="text" placeholder="Length" value={form.measurements.length} onChange={e => handleMeasurementChange('length', e.target.value)} className="form-control" readOnly={!editing} />
        </div>
      </FormGroup>

      {order.image && (
        <div style={{ marginTop: '15px' }}>
          <label><strong>Attached Image:</strong></label>
          <img src={order.image} alt="Sketch" style={{ maxWidth: '300px', borderRadius: '6px', display: 'block', marginTop: '10px' }} />
        </div>
      )}

      <div style={{ marginTop: '30px' }}>
        {!editing ? (
  order.status === 'Completed' ? (
    <span style={{ color: '#999', fontWeight: 'bold' }}>Editing Locked (Completed)</span>
  ) : (
    <button onClick={() => setEditing(true)} style={buttonStyle('#007bff')}>Edit Order</button>
  )
) : (
          <>
            <button onClick={saveChanges} style={buttonStyle('#28a745')}>Save</button>
            <button onClick={() => setEditing(false)} style={buttonStyle('#6c757d')}>Cancel</button>
          </>
        )}
        <button onClick={() => navigate(-1)} style={buttonStyle('#343a40')}>Back</button>
      </div>
    </div>
  );
}

const DataRow = ({ label, value }) => (
  <div style={{ marginBottom: '10px' }}><strong>{label}:</strong> {value}</div>
);

const FormGroup = ({ label, children }) => (
  <div style={{ marginBottom: '10px' }}>
    <label><strong>{label}:</strong></label>
    {children}
  </div>
);

const containerStyle = {
  padding: '30px',
  maxWidth: '700px',
  margin: '0 auto',
  background: '#f9f9f9',
  borderRadius: '10px'
};

const buttonStyle = (bg) => ({
  backgroundColor: bg,
  color: '#fff',
  border: 'none',
  padding: '10px 16px',
  borderRadius: '6px',
  marginRight: '10px',
  marginTop: '10px',
  cursor: 'pointer'
});

export default AdminOrderDetail;
