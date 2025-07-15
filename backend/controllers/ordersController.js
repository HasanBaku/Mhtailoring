const db = require('../db');
const { authenticateToken } = require('../middleware/authenticateJWT');

const createOrder = async (req, res) => {
  const vendorId = req.user.userId;
  const {
    title,
    description,
    fabric,
    measurements,
    estimatedPrice,
    urgency,
    deliveryDate,
    notes,
    image
  } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO orders
        (title, description, fabric, measurements, estimated_price, vendor_id,
         urgency, delivery_date, notes, image)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        title,
        description,
        fabric,
        measurements,
        estimatedPrice,
        vendorId,
        urgency,
        deliveryDate || null,
        notes || null,
        image || null
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create order', details: err.message });
  }
};


const getVendorOrders = async (req, res) => {
  const vendorId = req.user.userId;
  try {
    const result = await db.query(
      'SELECT * FROM orders WHERE vendor_id = $1 AND is_deleted = FALSE ORDER BY created_at DESC',
      [vendorId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders', details: err.message });
  }
};


const deleteOrderByVendor = async (req, res) => {
  const vendorId = req.user.userId;
  const { id } = req.params;

  try {
    const result = await db.query(
      'UPDATE orders SET is_deleted = TRUE WHERE id = $1 AND vendor_id = $2 RETURNING *',
      [id, vendorId]
    );
    if (result.rowCount === 0) {
      return res.status(403).json({ error: 'Unauthorized or not found' });
    }
    res.json({ message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete order' });
  }
};


const updateOrder = async (req, res) => {
  const vendorId = req.user.userId;
  const orderId = req.params.id;
  const {
    title,
    description,
    fabric,
    measurements,
    estimatedPrice,
    urgency,
    deliveryDate,
    notes,
    image
  } = req.body;

  try {
    const result = await db.query(
      `UPDATE orders
       SET title = $1,
           description = $2,
           fabric = $3,
           measurements = $4,
           estimated_price = $5,
           urgency = $6,
           delivery_date = $7,
           notes = $8,
           image = $9
       WHERE id = $10 AND vendor_id = $11
       RETURNING *`,
      [
        title,
        description,
        fabric,
        measurements,
        estimatedPrice,
        urgency,
        deliveryDate || null,
        notes || null,
        image || null,
        orderId,
        vendorId
      ]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({ error: 'Unauthorized or order not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order', details: err.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const result = await db.query(`
  SELECT 
    o.*,
    u.email AS vendor_email,
    u.company_name,
    u.contact_name
  FROM orders o
  JOIN users u ON o.vendor_id = u.id
  WHERE o.is_deleted = FALSE
  ORDER BY o.created_at DESC
`);


    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders', details: err.message });
  }
};


const updateOrderPrice = async (req, res) => {
  const orderId = req.params.id;
  const { estimatedPrice } = req.body;

  try {
    const result = await db.query(
      'UPDATE orders SET estimated_price = $1, admin_edited = true WHERE id = $2 RETURNING *',
      [estimatedPrice, orderId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order price', details: err.message });
  }
};

const deleteOrder = async (req, res) => {
  const { id } = req.params;
  const userRole = req.user?.role;

const { userId, role } = req.user;

  try {
    // Check if order exists and get vendor_id
    const result = await db.query('SELECT vendor_id FROM orders WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = result.rows[0];

    if (role !== 'admin' && userId !== order.vendor_id) {
      return res.status(403).json({ error: 'You are not authorized to delete this order' });
    }

    // Delete the order
    await db.query('DELETE FROM orders WHERE id = $1', [id]);
    res.json({ message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete order', details: err.message });
  }
};


const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const result = await db.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status', details: err.message });
  }
};


const updateOrderByAdmin = async (req, res) => {
  const orderId = req.params.id;
  const {
    title,
    description,
    fabric,
    measurements,
    estimated_price,
    urgency,
    deliveryDate,
    notes,
    image
  } = req.body;

  try {
    const result = await db.query(
      `UPDATE orders
       SET title = $1,
           description = $2,
           fabric = $3,
           measurements = $4,
           estimated_price = $5,
           urgency = $6,
           delivery_date = $7,
           notes = $8,
           image = $9
       WHERE id = $10
       RETURNING *`,
      [
        title,
        description,
        fabric,
        measurements,
        estimated_price,
        urgency,
        deliveryDate || null,
        notes || null,
        image || null,
        orderId
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order', details: err.message });
  }
};


const approveOrder = async (req, res) => {
  const orderId = req.params.id;

  try {
    // 1. Fetch order first
const orderRes = await db.query(`
  SELECT o.*, u.email AS vendor_email 
  FROM orders o 
  JOIN users u ON o.vendor_id = u.id 
  WHERE o.id = $1
`, [orderId]);

const order = orderRes.rows[0];

    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (order.status === 'Approved') {
  console.log("⚠️ Order already approved. Skipping status update, checking invoice...");
} else {
  await db.query(`UPDATE orders SET status = 'Approved' WHERE id = $1`, [orderId]);
}


    // 2. Update order status to Approved
    await db.query(`UPDATE orders SET status = 'Approved' WHERE id = $1`, [orderId]);

    // 3. Check if an invoice already exists
    const invoiceCheck = await db.query(`SELECT * FROM invoices WHERE order_id = $1`, [orderId]);
    if (invoiceCheck.rows.length === 0) {
      console.log('Invoice fields:', {
  orderId: order.id,
  vendorId: order.vendor_id,
  price: order.estimated_price
});
      // 4. Generate Invoice
      await db.query(`
  INSERT INTO invoices (order_id, vendor_id, total_price, payment_status)
  VALUES ($1, $2, $3, $4)
`, [order.id, order.vendor_id, order.estimated_price, 'Pending']);}

    res.json({ message: 'Order approved and invoice generated.' });
  } catch (err) {
    console.error('❌ Approve order failed:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
const rejectOrder = async (req, res) => {
  const orderId = req.params.id;

  try {
    console.log('Rejecting order:', orderId); // add this

    const invoice = await db.query(`SELECT * FROM invoices WHERE order_id = $1`, [orderId]);
    console.log('Fetched invoice:', invoice.rows); // and this

    if (invoice.rows.length > 0 && invoice.rows[0].payment_status === 'Completed') {
      return res.status(400).json({ error: 'Cannot reject order with a completed invoice' });
    }

    const orderUpdate = await db.query(
      `UPDATE orders SET status = 'Rejected' WHERE id = $1 RETURNING *`,
      [orderId]
    );

    await db.query(`DELETE FROM invoices WHERE order_id = $1`, [orderId]);

    res.json(orderUpdate.rows[0]);
  } catch (err) {
    console.error('❌ Reject failed:', err);
    res.status(500).json({ error: 'Server error while rejecting' });
  }
};





module.exports = {
  createOrder,
  getVendorOrders,
  updateOrder,
  deleteOrderByVendor,
  getAllOrders,
  updateOrderPrice,
  updateOrderStatus,
  updateOrderByAdmin,
  deleteOrder,
  approveOrder,
  rejectOrder
};


