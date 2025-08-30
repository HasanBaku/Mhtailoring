import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/api'; // <-- single source of truth

const STATUS_OPTIONS = ['Pending', 'Approved', 'Rejected', 'Completed'];
const FABRIC_OPTIONS = ['cotton', 'wool', 'linen', 'polyester', 'silk'];

const badgeClass = (status) => {
  switch (status) {
    case 'Approved':  return 'badge bg-success';
    case 'Rejected':  return 'badge bg-danger';
    case 'Completed': return 'badge bg-secondary';
    default:          return 'badge bg-warning text-dark';
  }
};

export default function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState(null);
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    fabric: '',
    status: 'Pending',
    estimated_price: '',
    measurements: { chest: '', waist: '', length: '' },
    notes: '',
  });

  useEffect(() => {
    (async () => {
      try {
        // Prefer admin route; adjust to your backend if it’s /orders/:id
        const res = await api.get(`/orders/admin/${id}`);
        const data = res.data;

        setOrder(data);
        setForm({
          title: data.title || '',
          description: data.description || '',
          fabric: data.fabric || '',
          status: data.status || 'Pending',
          estimated_price: data.estimated_price ?? '',
          measurements: {
            chest: data.measurements?.chest ?? '',
            waist: data.measurements?.waist ?? '',
            length: data.measurements?.length ?? '',
          },
          notes: data.notes || '',
        });
      } catch (err) {
        // Fallback if your GET is /orders/:id for admin too
        if (err.response?.status === 404 || err.response?.status === 403) {
          try {
            const res2 = await api.get(`/orders/${id}`);
            const data2 = res2.data;
            setOrder(data2);
            setForm({
              title: data2.title || '',
              description: data2.description || '',
              fabric: data2.fabric || '',
              status: data2.status || 'Pending',
              estimated_price: data2.estimated_price ?? '',
              measurements: {
                chest: data2.measurements?.chest ?? '',
                waist: data2.measurements?.waist ?? '',
                length: data2.measurements?.length ?? '',
              },
              notes: data2.notes || '',
            });
          } catch (err2) {
            console.error('Order fetch error:', err2.response?.data || err2.message);
            setErrMsg(err2.response?.data?.error || 'Failed to load order');
          }
        } else {
          console.error('Order fetch error:', err.response?.data || err.message);
          setErrMsg(err.response?.data?.error || 'Failed to load order');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const locked = order?.status === 'Completed';

  const handleChange = (field, value) => {
    if (!editing || locked) return;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleMeasurementChange = (field, value) => {
    if (!editing || locked) return;
    setForm((prev) => ({
      ...prev,
      measurements: { ...prev.measurements, [field]: value },
    }));
  };

  const saveChanges = async () => {
    // sanitize numerics
    const priceNum = Number(form.estimated_price);
    if (Number.isNaN(priceNum)) {
      alert('Price must be a valid number.');
      return;
    }
    const measurementsNum = Object.fromEntries(
      Object.entries(form.measurements).map(([k, v]) => [k, Number(v) || 0])
    );

    const payload = {
      title: form.title,
      description: form.description,
      fabric: form.fabric,
      status: form.status, // admin-controlled
      estimated_price: priceNum,
      measurements: measurementsNum,
      notes: form.notes,
    };

    try {
      // Align with your admin update route
      const res = await api.put(`/orders/admin/${id}`, payload);
      setOrder(res.data);
      setEditing(false);
    } catch (err) {
      console.error('Save error:', err.response?.data || err.message);
      alert(err.response?.data?.error || 'Failed to update order');
    }
  };

  if (loading) return <div className="container mt-5">Loading…</div>;
  if (errMsg) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{errMsg}</div>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>Back</button>
      </div>
    );
  }
  if (!order) return <div className="container mt-5">Order not found.</div>;

  return (
    <div className="container mt-5" style={{ maxWidth: 800 }}>
      <div className="card shadow-sm p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="mb-0">Order Details</h3>
          <span className={badgeClass(order.status)}>{order.status}</span>
        </div>

        <div className="mb-2"><strong>ID:</strong> {order.id}</div>
        <div className="mb-2"><strong>Vendor Email:</strong> {order.vendor_email}</div>
        <div className="mb-2"><strong>Company Name:</strong> {order.company_name || 'N/A'}</div>
        <div className="mb-2"><strong>Contact Name:</strong> {order.contact_name || 'N/A'}</div>

        <hr className="my-3" />

        <div className="mb-3">
          <label className="form-label"><strong>Title</strong></label>
          <input className="form-control" value={form.title}
                 onChange={(e) => handleChange('title', e.target.value)}
                 readOnly={!editing || locked} />
        </div>

        <div className="mb-3">
          <label className="form-label"><strong>Description</strong></label>
          <textarea className="form-control" rows={3} value={form.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    readOnly={!editing || locked} />
        </div>

        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label"><strong>Fabric</strong></label>
            <select className="form-select" value={form.fabric}
                    onChange={(e) => handleChange('fabric', e.target.value)}
                    disabled={!editing || locked}>
              <option value="">-- Select --</option>
              {FABRIC_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label"><strong>Status</strong></label>
            <select className="form-select" value={form.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    disabled={!editing || locked}>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="row g-3 mt-1">
          <div className="col-md-6">
            <label className="form-label"><strong>Estimated Price</strong></label>
            <input type="number" className="form-control" value={form.estimated_price}
                   onChange={(e) => handleChange('estimated_price', e.target.value)}
                   readOnly={!editing || locked} />
          </div>
          <div className="col-md-6">
            <label className="form-label"><strong>Notes</strong></label>
            <input className="form-control" value={form.notes}
                   onChange={(e) => handleChange('notes', e.target.value)}
                   readOnly={!editing || locked} />
          </div>
        </div>

        <div className="mt-3">
          <label className="form-label"><strong>Measurements (cm)</strong></label>
          <div className="row g-2">
            <div className="col-4">
              <input className="form-control" placeholder="Chest"
                     value={form.measurements.chest}
                     onChange={(e) => handleMeasurementChange('chest', e.target.value)}
                     readOnly={!editing || locked} />
            </div>
            <div className="col-4">
              <input className="form-control" placeholder="Waist"
                     value={form.measurements.waist}
                     onChange={(e) => handleMeasurementChange('waist', e.target.value)}
                     readOnly={!editing || locked} />
            </div>
            <div className="col-4">
              <input className="form-control" placeholder="Length"
                     value={form.measurements.length}
                     onChange={(e) => handleMeasurementChange('length', e.target.value)}
                     readOnly={!editing || locked} />
            </div>
          </div>
        </div>

        {order.image && (
          <div className="mt-3">
            <label className="form-label"><strong>Attached Image</strong></label>
            <img src={order.image} alt="Sketch" className="img-fluid border rounded"
                 style={{ maxWidth: 320, display: 'block' }} />
          </div>
        )}

        <div className="mt-4 d-flex gap-2">
          {!editing ? (
            locked ? (
              <span className="text-muted fw-bold">Editing Locked (Completed)</span>
            ) : (
              <button className="btn btn-primary" onClick={() => setEditing(true)}>Edit Order</button>
            )
          ) : (
            <>
              <button className="btn btn-success" onClick={saveChanges}>Save</button>
              <button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
            </>
          )}
          <button className="btn btn-dark" onClick={() => navigate(-1)}>Back</button>
        </div>
      </div>
    </div>
  );
}
