const db = require('../db');

// Create Invoice
exports.createInvoice = async (req, res) => {
  const { order_id, vendor_email, amount } = req.body;

const vendorRes = await db.query('SELECT id FROM users WHERE email = $1', [vendor_email]);
const vendor_id = vendorRes.rows[0]?.id;

await db.query(`
  INSERT INTO invoices (order_id, vendor_id, total_price, payment_status)
  VALUES ($1, $2, $3, 'Pending')
  RETURNING *
`, [order_id, vendor_id, amount]);
  try {
    const result = await db.query(`
      INSERT INTO invoices (order_id, vendor_email, amount)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [order_id, vendor_email, amount]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('❌ Invoice creation failed:', err);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
};

// Get all invoices (admin)
exports.getAllInvoices = async (req, res) => {
  try {
    console.log("🧠 Reached getAllInvoices");
    const result = await db.query(`
        SELECT i.*, u.email AS vendor_email, u.company_name
        FROM invoices i
        LEFT JOIN users u ON i.vendor_id = u.id
        ORDER BY i.created_at DESC
        `);

    res.json(result.rows);
  } catch (err) {
    console.error('❌ Failed to fetch invoices:', err);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
};
// Get vendor invoices
exports.getVendorInvoices = async (req, res) => {
  const vendorEmail = req.user.email;
  const vendorId = req.user.userId;
  try {
    const result = await db.query(`
  SELECT i.*, u.email AS vendor_email, u.company_name
  FROM invoices i
  JOIN users u ON i.vendor_id = u.id
  WHERE i.vendor_id = $1
  ORDER BY i.issued_at DESC
`, [vendorId]);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vendor invoices' });
  }
};

// Mark invoice as completed
// Mark invoice as completed AND sync order status
exports.markInvoicePaid = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Mark invoice as Completed
    await db.query(`UPDATE invoices SET payment_status = 'Completed' WHERE id = $1`, [id]);

    // 2. Fetch the related order_id
    const result = await db.query(`SELECT order_id FROM invoices WHERE id = $1`, [id]);
    const orderId = result.rows[0]?.order_id;

    if (!orderId) {
      return res.status(404).json({ error: 'Related order not found' });
    }

    // 3. Update order status to Completed
    await db.query(`UPDATE orders SET status = 'Completed' WHERE id = $1`, [orderId]);

    res.json({ message: 'Invoice marked as Completed and order status updated.' });
  } catch (err) {
    console.error('❌ Failed to update invoice and order status:', err);
    res.status(500).json({ error: 'Failed to update invoice and order status' });
  }
};

// Delete invoice
exports.deleteInvoice = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query(`DELETE FROM invoices WHERE id = $1`, [id]);
    res.json({ message: 'Invoice deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
};

