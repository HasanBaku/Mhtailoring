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

// ✅ Export after all routes are defined
module.exports = router;