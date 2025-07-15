const express = require('express');
const router = express.Router();
const {
  createInvoice,
  getAllInvoices,
  getVendorInvoices,
  markInvoicePaid,
  deleteInvoice
} = require('../controllers/invoiceController');

const { authenticateToken } = require('../middleware/authenticateJWT');

// Routes
router.post('/', authenticateToken, createInvoice);
router.get('/', authenticateToken, getAllInvoices);
router.get('/vendor', authenticateToken, getVendorInvoices);
router.put('/:id/mark-completed', authenticateToken, markInvoicePaid);
router.delete('/:id', authenticateToken, deleteInvoice);

module.exports = router;