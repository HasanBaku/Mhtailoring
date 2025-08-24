import React, { useEffect, useState } from 'react';
import api from '../../api/api';            // ✅ only this
import { generatePDF } from '../../utils/pdfUtils';

function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/invoices/vendor');  // -> /api/invoices/vendor
        setInvoices(res.data);
      } catch (error) {
        console.error('❌ Failed to fetch invoices:',
          error.response?.status,
          error.response?.data);
      }
    })();
  }, []);

  const handleMarkCompleted = async (invoiceId) => {
    try {
      await api.put(`/invoices/${invoiceId}/mark-completed`);  // -> /api/invoices/:id/mark-completed
      setInvoices(prev =>
        prev.map(inv =>
          inv.id === invoiceId ? { ...inv, payment_status: 'Completed' } : inv
        )
      );
    } catch (err) {
      console.error('❌ Failed to mark invoice as completed:', err.response?.data || err.message);
    }
  };

  const filtered = invoices.filter(inv =>
    statusFilter ? inv.payment_status === statusFilter : true
  );

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <label>Filter by Status: </label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '6px 12px', borderRadius: 5, marginLeft: 10 }}
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
            <p><strong>Amount:</strong> ${Number(inv.total_price ?? inv.amount ?? 0).toFixed(2)}</p>
            <p><strong>Issued At:</strong> {inv.issued_at ? new Date(inv.issued_at).toLocaleString() : 'N/A'}</p>
            <p><strong>Status:</strong> {inv.payment_status}</p>

            <button onClick={() => generatePDF(`invoice-${inv.id}`, `Invoice-${inv.id}.pdf`)}>Download PDF</button>

            {inv.payment_status !== 'Completed' && (
              <button onClick={() => handleMarkCompleted(inv.id)} className="btn btn-success ms-3">
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
