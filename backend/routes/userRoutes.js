const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authenticateJWT');
const { 
  getUserProfile, 
  updateUserProfile, 
  getAllVendors,
  createVendor,
  deleteVendor,
  updateVendorPassword
} = require('../controllers/userController');

// ✅ Protected routes

router.get('/me', authenticateToken, getUserProfile);
router.put('/me', authenticateToken, updateUserProfile);
router.get('/vendors', authenticateToken, getAllVendors);
router.post('/vendors', authenticateToken, createVendor);
router.delete('/vendors/:id', authenticateToken, deleteVendor);
router.put('/vendors/:id/password', authenticateToken, updateVendorPassword);

// ✅ Test route (optional)
router.get('/test', (req, res) => {
  res.send('User route works');
});
const db = require('../db');

// 🔍 Debug DB connection route
router.get('/ping-db', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({ status: '✅ DB connected', time: result.rows[0].now });
  } catch (err) {
    console.error('❌ DB connection failed:', err);
    res.status(500).json({ error: 'DB failed', details: err.message });
  }
// ✅ Export after all routes are defined
module.exports = router;
