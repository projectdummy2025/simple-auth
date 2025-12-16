const express = require('express');
const cors = require('cors');

// Load environment variables as early as possible
require('dotenv').config();
console.log('Environment variables after dotenv.load:');
console.log('- DB_HOST:', process.env.DB_HOST);
console.log('- DB_USER:', process.env.DB_USER);
console.log('- DB_PORT:', process.env.DB_PORT);
console.log('- DB_NAME:', process.env.DB_NAME);
console.log('- DB_PASSWORD exists:', !!process.env.DB_PASSWORD);

let db;
try {
  console.log('Attempting to load database configuration...');
  console.log('Environment variables during db load:');
  console.log('- DB_HOST:', process.env.DB_HOST);
  console.log('- DB_USER:', process.env.DB_USER);
  console.log('- DB_PORT:', process.env.DB_PORT);
  console.log('- DB_NAME:', process.env.DB_NAME);
  console.log('- DB_PASSWORD exists:', !!process.env.DB_PASSWORD);

  db = require('./config/db'); // Database connection
  console.log('Database configuration loaded successfully:', !!db);
} catch (error) {
  console.error('Failed to load database configuration:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}

const authRoutes = require('./routes/auth');
const errorHandler = require('./middleware/errorHandler');

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
if (db && db.pool && typeof db.pool.connect === 'function') {
  db.pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error acquiring client', err.stack);
    }
    client.query('SELECT NOW()', (err, result) => {
      release();
      if (err) {
        return console.error('Error executing query', err.stack);
      }
      console.log('Database connected successfully:', result.rows[0]);
    });
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