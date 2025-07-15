import React, { useEffect, useState } from 'react';
import axios from '../../utils/axiosInstance';
import { generatePDF } from '../../utils/pdfUtils';

function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchVendorInvoices = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('/invoices/vendor', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setInvoices(response.data);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    }
  };

  useEffect(() => {
    fetchVendorInvoices();
  }, []);

  const handleMarkCompleted = async (invoiceId) => {
    try {
      await axios.put(`/invoices/${invoiceId}/mark-completed`);
      await fetchVendorInvoices(); // Refresh invoices after marking as complete
    } catch (err) {
      console.error('❌ Failed to mark invoice as completed:', err);
    }
  };

  const filtered = invoices.filter(inv =>
    statusFilter ? inv.payment_status === statusFilter : true
  );

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <label>Filter by Status: </label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '6px 12px', borderRadius: '5px', marginLeft: '10px' }}
        >
          <option value="">All</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      <h2>Your Invoices</h2>
      {filtered.length === 0 ? (
        <p>No invoices found.</p>
      ) : (
        filtered.map((inv) => (
          <div key={inv.id} id={`invoice-${inv.id}`} style={{ background: '#fff', padding: 20, marginBottom: 20 }}>
            <p><strong>Invoice ID:</strong> {inv.id}</p>
            <p><strong>Order ID:</strong> {inv.order_id}</p>
            <p><strong>Amount:</strong> ${Number(inv.amount).toFixed(2)}</p>
            <p><strong>Issued At:</strong> {new Date(inv.issued_at).toLocaleString()}</p>
            <p><strong>Status:</strong> {inv.payment_status}</p>

            <button onClick={() => generatePDF(`invoice-${inv.id}`, `Invoice-${inv.id}.pdf`)}>Download PDF</button>

            {inv.payment_status !== 'Completed' && (
              <button
                onClick={() => handleMarkCompleted(inv.id)}
                className="btn btn-success ms-3"
              >
                Mark as Paid
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default Invoices;
