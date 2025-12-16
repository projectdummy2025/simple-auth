const { Pool } = require('pg');

// Use environment variables for database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'simple_auth_db',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'admin0123',
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};