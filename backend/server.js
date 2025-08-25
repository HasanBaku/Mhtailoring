const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

console.log('Loaded ENV:', {
  DB_URL: process.env.DATABASE_URL,
  JWT: process.env.JWT_SECRET,
  PORT: process.env.PORT
});

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://mhtailoring-front.onrender.com',
  'https://mhtailoring.onrender.com'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`🚫 Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};


app.options('*', cors(corsOptions)); // 🔥 THIS LINE IS MANDATORY


// 🔥 FIX: move these here, BEFORE any routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ Routes
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use((err, req, res, next) => {
  console.error('🔥 Global Error Handler:', err.stack);
  res.status(500).json({ error: 'Server error', details: err.message });
});
// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
