const express = require('express');
const router = express.Router();
const {
  createOrder,
  getVendorOrders,
  updateOrder,
  deleteOrderByVendor,
  updateOrderStatus,
  updateOrderByAdmin,
  getAllOrders,
  deleteOrder,
  approveOrder,
  rejectOrder
} = require('../controllers/ordersController');
const { authenticateToken } = require('../middleware/authenticateJWT');

// ⬇ Move this function to ordersController.js ideally, but fine here for now
const db = require('../db');

const getOrderById = async (req, res) => {
  const orderId = req.params.id;

  try {
    const result = await db.query(`
      SELECT 
        o.*, 
        u.email AS vendor_email,
        u.company_name,
        u.contact_name
      FROM orders o
      LEFT JOIN users u ON o.vendor_id = u.id
      WHERE o.id = $1
    `, [orderId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching order by ID:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

router.get('/admin/all', authenticateToken, getAllOrders);
router.put('/admin/:id', authenticateToken, updateOrderByAdmin);

// Vendor routes
router.post('/', authenticateToken, createOrder);
router.get('/', authenticateToken, getVendorOrders);
router.get('/:id', authenticateToken, getOrderById);
router.put('/:id', authenticateToken, updateOrder);
router.patch('/:id/status', authenticateToken, updateOrderStatus);
router.delete('/:id', authenticateToken, deleteOrderByVendor);
router.put('/:id/approve', authenticateToken, approveOrder);
router.put('/:id/reject', authenticateToken, rejectOrder);


// (Optional) Admin delete route if needed
router.delete('/admin/:id', authenticateToken, deleteOrder);




module.exports = router;
