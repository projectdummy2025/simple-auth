const jwt = require('jsonwebtoken');

const JWTUtil = {
  generateToken: (userId) => {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
  }
};

module.exports = JWTUtil;