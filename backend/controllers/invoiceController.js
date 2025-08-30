const db = require('../db');

// Create Invoice
exports.createInvoice = async (req, res) => {
  const { order_id, vendor_email, amount } = req.body;
  try {
    const vres = await db.query('SELECT id FROM users WHERE email = $1', [vendor_email]);
    const vendor_id = vres.rows[0]?.id;
    if (!vendor_id) return res.status(404).json({ error: 'Vendor not found' });

    const { rows } = await db.query(
      `INSERT INTO invoices (order_id, vendor_id, total_price, payment_status)
       VALUES ($1, $2, $3, 'Pending')
       RETURNING *`,
      [order_id, vendor_id, amount]
    );
    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error('❌ Invoice creation failed:', err);
    return res.status(500).json({ error: 'Failed to create invoice', details: err.message });
  }
};

// Admin: list all invoices
exports.getAllInvoices = async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT i.*,
             i.created_at AS issued_at,   -- alias so UI can show issued_at
             u.email AS vendor_email,
             u.company_name
      FROM invoices i
      JOIN users u ON i.vendor_id = u.id
      ORDER BY i.created_at DESC
    `);
    return res.json(rows);
  } catch (err) {
    console.error('❌ Failed to fetch invoices:', err);
    return res.status(500).json({ error: 'Failed to fetch invoices', details: err.message });
  }
};

// Vendor: list own invoices
exports.getVendorInvoices = async (req, res) => {
  const vendorId = req.user.userId;
  try {
    const { rows } = await db.query(`
      SELECT i.*,
             i.created_at AS issued_at,
             u.email AS vendor_email,
             u.company_name
      FROM invoices i
      JOIN users u ON i.vendor_id = u.id
      WHERE i.vendor_id = $1
      ORDER BY i.created_at DESC
    `, [vendorId]);
    return res.json(rows);
  } catch (err) {
    console.error('❌ Failed to fetch vendor invoices:', err);
    return res.status(500).json({ error: 'Failed to fetch vendor invoices', details: err.message });
  }
};

// Mark invoice as completed AND sync order -> Completed
exports.markInvoicePaid = async (req, res) => {
  const { id } = req.params;
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const { rows: inv } = await client.query(
      'UPDATE invoices SET payment_status = $1 WHERE id = $2 RETURNING *',
      ['Completed', id]
    );
    if (!inv.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const orderId = inv[0].order_id;
    await client.query("UPDATE orders SET status = 'Completed' WHERE id = $1", [orderId]);

    await client.query('COMMIT');
    return res.json(inv[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Failed to update invoice and order status:', err);
    return res.status(500).json({ error: 'Failed to update invoice and order status', details: err.message });
  } finally {
    client.release();
  }
};

exports.deleteInvoice = async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await db.query('DELETE FROM invoices WHERE id = $1', [id]);
    if (!rowCount) return res.status(404).json({ error: 'Invoice not found' });
    return res.json({ message: 'Invoice deleted' });
  } catch (err) {
    console.error('❌ Failed to delete invoice:', err);
    return res.status(500).json({ error: 'Failed to delete invoice', details: err.message });
  }
};
