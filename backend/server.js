const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
console.log('Loaded ENV:', {
  DB_URL: process.env.DATABASE_URL,
  JWT: process.env.JWT_SECRET,
  PORT: process.env.PORT
});

const app = express();

// ✅ Payload parsing BEFORE routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ Skip CORS completely
// If you REALLY want to allow everything (not recommended for production), you can use:
// const cors = require('cors');
// app.use(cors()); 

// ✅ Mount routes
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');

app.use(cors({ origin: true, credentials: true }));

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/invoices', invoiceRoutes);

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error('🔥 Global Error Handler:', err.stack);
  res.status(500).json({ error: 'Server error', details: err.message });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
