const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

console.log('Incoming login request:', req.body);

try {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: 'Missing fields' });
  }

  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

  if (result.rows.length === 0) {
    return res.status(401).json({ msg: 'User not found' });
  }

  const user = result.rows[0];
  console.log('User found in DB:', user);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ msg: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.status(200).json({ token, user: { id: user.id, email: user.email } });

} catch (err) {
  console.error('🔥 Login Error:', err.message, err.stack);
  res.status(500).json({ error: 'Server error', details: err.message });
}


const register = async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING *',
      [email, hashedPassword, role || 'vendor']
    );
    res.status(201).json({ message: 'User registered', user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  console.log('Incoming email:', email);

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      console.log('User not found');
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    console.log('Fetched user:', user.email);

    const match = await bcrypt.compare(password, user.password);
    console.log('Password match result:', match);

    if (!match) return res.status(400).json({ error: 'Invalid credentials' });



    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        email: user.email,
        role: user.role,
        id: user.id
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
};



module.exports = { register, login };
