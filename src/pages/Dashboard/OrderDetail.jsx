import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrder(res.data);
      } catch (err) {
        console.error('Failed to fetch order details:', err);
      }
    };

    fetchOrder();
  }, [id]);

  if (!order) {
    return <div className="container mt-5">Loading...</div>;
  }

  return (
    <div className="container mt-5">
      <div className="card shadow-sm p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="mb-0">Order Detail</h3>
          <span className={`badge bg-${order.status === 'Approved' ? 'success' : order.status === 'Rejected' ? 'danger' : 'warning'} text-dark`}>
            {order.status}
          </span>
        </div>

        <hr />

        <div className="row mb-3">
          <div className="col-sm-4 fw-bold">Title:</div>
          <div className="col-sm-8">{order.title}</div>
        </div>

        <div className="row mb-3">
          <div className="col-sm-4 fw-bold">Description:</div>
          <div className="col-sm-8">{order.description}</div>
        </div>

        <div className="row mb-3">
          <div className="col-sm-4 fw-bold">Fabric:</div>
          <div className="col-sm-8 text-capitalize">{order.fabric}</div>
        </div>

        <div className="row mb-3">
          <div className="col-sm-4 fw-bold">Urgency:</div>
          <div className="col-sm-8 text-capitalize">{order.urgency}</div>
        </div>

        <div className="row mb-3">
          <div className="col-sm-4 fw-bold">Delivery Date:</div>
          <div className="col-sm-8">{order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : 'N/A'}</div>
        </div>

        <div className="row mb-3">
          <div className="col-sm-4 fw-bold">Estimated Price:</div>
          <div className="col-sm-8">${order.estimated_price}</div>
        </div>

        <div className="row mb-3">
          <div className="col-sm-4 fw-bold">Notes:</div>
          <div className="col-sm-8">{order.notes || 'None'}</div>
        </div>

        <hr className="my-4" />

        <div className="mb-4">
          <h5 className="mb-3">Measurements</h5>
          <div className="row">
            {order.measurements &&
              Object.entries(order.measurements).map(([key, value]) => (
                <div className="col-md-4 mb-2" key={key}>
                  <div className="border rounded p-2 text-center bg-light">
                    <strong>{key}</strong>: {value} cm
                  </div>
                </div>
              ))}
          </div>
        </div>

        {order.image && (
          <div className="mb-4">
            <h5 className="mb-3">Design Image</h5>
            <img
              src={order.image}
              alt="Design Sketch"
              className="img-fluid border rounded"
              style={{ maxWidth: '100%', maxHeight: '500px' }}
            />
          </div>
        )}

        <div className="text-end">
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Back to Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
