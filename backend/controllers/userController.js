const db = require('../db');

// This will fetch *all* columns for the current user
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const userResult = await db.query(`
      SELECT
        id AS user_id,
        email,
        role,
        company_name,
        contact_name,
        phone,
        address,
        industry,
        website_url,
        company_description,
        registered_at
      FROM users
      WHERE id = $1
    `, [userId]);

    if (!userResult.rows.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(userResult.rows[0]);
  } catch (err) {
    console.error("❌ Failed to fetch user profile:", err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};



exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      company_name,
      contact_name,
      phone,
      address,
      industry,
      website_url,
      company_description
    } = req.body;

    const result = await db.query(`
      UPDATE users SET
        company_name = $1,
        contact_name = $2,
        phone = $3,
        address = $4,
        industry = $5,
        website_url = $6,
        company_description = $7
      WHERE id = $8
      RETURNING *
    `, [
      company_name,
      contact_name,
      phone,
      address,
      industry,
      website_url,
      company_description,
      userId
    ]);

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Failed to update user profile:", err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};


// Get all vendors (admin-only)
exports.getAllVendors = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        id, email, role, registered_at,
        company_name, contact_name, phone,
        address, industry, website_url, company_description
      FROM users
      WHERE role = 'vendor'
      ORDER BY registered_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Failed to fetch vendors:", err);
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
};

const bcrypt = require('bcrypt');

exports.createVendor = async (req, res) => {
  try {
    const { email, password, company_name, contact_name, phone, address, industry } = req.body;

    const result = await db.query(`
      INSERT INTO users (email, password, role, company_name, contact_name, phone, address, industry, registered_at)
      VALUES ($1, $2, 'vendor', $3, $4, $5, $6, $7, NOW())
      RETURNING id, email, role, registered_at
    `, [email, password, company_name, contact_name, phone, address, industry]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('❌ Failed to create vendor:', err);
    res.status(500).json({ error: 'Vendor creation failed' });
  }
};
exports.deleteVendor = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM users WHERE id = $1 AND role = $2', [id, 'vendor']);
    res.json({ message: 'Vendor deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete vendor' });
  }
};

exports.updateVendorPassword = async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = $1 WHERE id = $2 AND role = $3', [hashedPassword, id, 'vendor']);
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update password' });
  }
};
