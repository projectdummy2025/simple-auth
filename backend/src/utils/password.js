const bcrypt = require('bcryptjs');

const PasswordUtil = {
  hash: async (password) => {
    return await bcrypt.hash(password, 10);
  },

  compare: async (password, hash) => {
    return await bcrypt.compare(password, hash);
  }
};

module.exports = PasswordUtil;