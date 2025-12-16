const { query } = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
  // Create a new user
  create: async (userData) => {
    const { username, email, password } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
      [username, email, hashedPassword]
    );
    
    return result.rows[0];
  },

  // Find user by username
  findByUsername: async (username) => {
    const result = await query(
      'SELECT id, username, email, password_hash FROM users WHERE username = $1',
      [username]
    );
    
    return result.rows[0];
  },

  // Find user by email
  findByEmail: async (email) => {
    const result = await query(
      'SELECT id, username, email, password_hash FROM users WHERE email = $1',
      [email]
    );
    
    return result.rows[0];
  },

  // Find user by ID
  findById: async (id) => {
    const result = await query(
      'SELECT id, username, email, created_at FROM users WHERE id = $1',
      [id]
    );
    
    return result.rows[0];
  }
};

module.exports = User;