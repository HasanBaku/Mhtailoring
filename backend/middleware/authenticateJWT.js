const jwt = require('jsonwebtoken');
const db = require('../db'); // add this at the top

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  console.log("Incoming auth header:", authHeader);
  const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const user = jwt.verify(token, process.env.JWT);

    // Ensure required fields
    if (!user.userId || !user.role) {
    return res.status(403).json({ error: 'Invalid token structure' });
    }

    const result = await db.query('SELECT id FROM users WHERE id = $1', [user.userId]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.log("JWT error:", err.message);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'TokenExpired' });
    }
    return res.status(403).json({ error: 'Invalid token' });
  }
};


module.exports = { authenticateToken }; // ✅ named export
