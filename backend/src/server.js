const express = require('express');
const cors = require('cors');

let db;
try {
  db = require('./config/db'); // Database connection
} catch (error) {
  console.error('Failed to load database configuration:', error.message);
  process.exit(1);
}

const authRoutes = require('./routes/auth');
const errorHandler = require('./middleware/errorHandler');

require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Backend is running' });
});

// Error handling middleware
app.use(errorHandler);

// Test database connection
const pool = db;
if (pool && typeof pool.connect === 'function') {
  pool.connect((err, client, release) => {
    if (err) {
      console.error('Error connecting to the database:', err);
    } else {
      console.log('Successfully connected to the database');
      if (release) release();
    }
  });
} else {
  console.error('Database pool is not available or invalid');
}

const PORT = process.env.BACKEND_PORT || 8000;
const HOST = process.env.BACKEND_HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
  console.log(`Database connected to: ${process.env.DB_HOST || 'localhost'}`);
});

module.exports = app;