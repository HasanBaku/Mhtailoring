import React, { useState } from 'react';
import axios from 'axios';
import './OrderForm.css'; // create this file for styles
import { useNavigate } from 'react-router-dom';



function OrderForm({ initialData = {}, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    fabric: initialData.fabric || '',
    urgency: initialData.urgency || 'normal',
    deliveryDate: initialData.deliveryDate || '',
    notes: initialData.notes || '',
    image: initialData.image || null,
    measurements: {
      chest: initialData.measurements?.chest || '',
      waist: initialData.measurements?.waist || '',
      length: initialData.measurements?.length || '',
      shoulder: initialData.measurements?.shoulder || '',
      sleeve: initialData.measurements?.sleeve || '',
      inseam: initialData.measurements?.inseam || '',
    },
  });

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleMeasurementChange = (key, value) => {
    setForm(prev => ({
      ...prev,
      measurements: { ...prev.measurements, [key]: value },
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(prev => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const estimatePrice = () => {
    const { chest, waist, length, shoulder, sleeve, inseam } = form.measurements;
    const fabricBase = {
      cotton: 25, wool: 40, silk: 55, linen: 30
    }[form.fabric] || 20;
    const sum = [chest, waist, length, shoulder, sleeve, inseam]
      .map(Number).filter(Boolean).reduce((a, b) => a + b, 0);
    return (fabricBase + sum * 0.4).toFixed(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form, estimatedPrice: parseFloat(estimatePrice()) };
    if (onSubmit) onSubmit(payload);
  };

  return (
    <form className="order-form" onSubmit={handleSubmit}>
      <h2>{initialData.title ? 'Edit Order' : 'Create New Order'}</h2>

      <div className="form-group">
        <label>Order Title</label>
        <input type="text" value={form.title} onChange={e => handleChange('title', e.target.value)} required />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea value={form.description} onChange={e => handleChange('description', e.target.value)} required />
      </div>

      <div className="form-group">
        <label>Fabric</label>
        <select value={form.fabric} onChange={e => handleChange('fabric', e.target.value)} required>
          <option value="">Select Fabric</option>
          <option value="cotton">Cotton</option>
          <option value="wool">Wool</option>
          <option value="silk">Silk</option>
          <option value="linen">Linen</option>
        </select>
      </div>

      <div className="form-grid">
        {['chest', 'waist', 'length', 'shoulder', 'sleeve', 'inseam'].map(key => (
          <div key={key} className="form-group">
            <label>{key.charAt(0).toUpperCase() + key.slice(1)} (cm)</label>
            <input
              type="number"
              value={form.measurements[key]}
              onChange={e => handleMeasurementChange(key, e.target.value)}
              required
            />
          </div>
        ))}
      </div>

      <div className="form-group">
        <label>Urgency</label>
        <select value={form.urgency} onChange={e => handleChange('urgency', e.target.value)}>
          <option value="normal">Normal</option>
          <option value="express">Express</option>
        </select>
      </div>

      <div className="form-group">
        <label>Expected Delivery Date</label>
        <input type="date" value={form.deliveryDate} onChange={e => handleChange('deliveryDate', e.target.value)} />
      </div>

      <div className="form-group">
        <label>Additional Notes</label>
        <textarea value={form.notes} onChange={e => handleChange('notes', e.target.value)} />
      </div>

      <div className="form-group">
        <label>Sketch / Design Image</label>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        {form.image && (
          <div className="preview-image">
            <img src={form.image} alt="Sketch preview" />
          </div>
        )}
      </div>

      <div className="form-group">
        <strong>Estimated Price:</strong> ${estimatePrice()}
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary">Save Order</button>
        {onCancel && <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}

function NewOrder() {
  const navigate = useNavigate(); // ✅ setup navigate

  const handleSubmit = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/orders', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("✅ Order created:", response.data);

      // ✅ Redirect after success
      navigate('/vendor/orders');

    } catch (err) {
      console.error("❌ Failed to create order:", err.response?.data || err.message);
    }
  };

  return <OrderForm onSubmit={handleSubmit} />;
}

export default NewOrder;
