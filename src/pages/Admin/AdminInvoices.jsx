import React, { useEffect, useState } from 'react';
import axios from '../../utils/axiosInstance';
import { generatePDF } from '../../utils/pdfUtils';

function AdminInvoices() {
  const [allInvoices, setAllInvoices] = useState([]);
  const [filterEmail, setFilterEmail] = useState('');

  useEffect(() => {
    fetchAllInvoices();
  }, []);

  const fetchAllInvoices = async () => {
    try {
      const res = await axios.get('/invoices');
      setAllInvoices(res.data); // Assuming backend returns [{...invoice}]
    } catch (err) {
      console.error("❌ Failed to fetch invoices:", err);
    }
  };

  const markAsCompleted = async (invoiceId) => {
    if (!window.confirm("Mark this invoice as COMPLETED? This action is irreversible.")) return;
    try {
      await axios.put(`/invoices/${invoiceId}/mark-completed`);
      setAllInvoices(prev =>
        prev.map(inv =>
          inv.id === invoiceId ? { ...inv, payment_status: 'Completed' } : inv
        )
      );
    } catch (err) {
      console.error("❌ Failed to mark as completed:", err);
    }
    
  };

  const deleteInvoice = async (id) => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) return;
    try {
      await axios.delete(`/invoices/${id}`);
      setAllInvoices(prev => prev.filter(inv => inv.id !== id));
    } catch (err) {
      console.error("❌ Failed to delete invoice:", err);
    }
  };

  const filteredInvoices = filterEmail
    ? allInvoices.filter(inv => inv.vendor_email === filterEmail)
    : allInvoices;



  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <label>Filter by Vendor: </label>
        <select
          value={filterEmail}
          onChange={e => setFilterEmail(e.target.value)}
          style={{ padding: '6px 12px', borderRadius: '5px', marginLeft: '10px' }}
        >
          <option value="">All</option>
          {[...new Set(allInvoices.map(inv => inv.vendor_email))].map(email => (
            <option key={email} value={email}>{email}</option>
          ))}
        </select>
      </div>

      <h2>All Vendor Invoices</h2>
      {filteredInvoices.map((inv) => (
        <div key={inv.id} id={`admin-invoice-${inv.id}`} style={{ background: '#f9f9f9', padding: 20, marginBottom: 20 }}>
          <p><strong>Vendor:</strong> {inv.company_name || inv.vendor_email || 'N/A'}</p>
          <p><strong>Invoice ID:</strong> {inv.id}</p>
          <p><strong>Order ID:</strong> {inv.order_id}</p>
          <p><strong>Amount:</strong> ${inv.total_price}</p>

          <p><strong>Issued At:</strong> {inv.issued_at}</p>
          <p><strong>Status:</strong> {inv.payment_status}</p>
          <button onClick={() => generatePDF(`admin-invoice-${inv.id}`, `Invoice-${inv.id}.pdf`)}>Download PDF</button>
          <button
            onClick={() => deleteInvoice(inv.id)}
            style={{ marginLeft: '10px', background: '#dc3545', color: '#fff', padding: '6px 12px', border: 'none', borderRadius: '5px' }}
          >
            Delete
          </button>
          {inv.payment_status !== 'Completed' && (
            <button
              onClick={() => markAsCompleted(inv.id)}
              style={{ marginLeft: '10px', background: '#28a745', color: '#fff', padding: '6px 12px', border: 'none', borderRadius: '5px' }}
            >
              Mark as Completed
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default AdminInvoices;
