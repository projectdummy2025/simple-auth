# TUTORIAL: Phase 3 - Backend Development (Docker-Native)

This tutorial explains how to complete Phase 3 of the development plan: Backend Development (Docker-Native).

## Tasks to Complete:
1. Create backend package.json inside container context
2. Build Express.js application from within Docker container
3. Establish PostgreSQL connection from containerized environment
4. Implement user model/schema with PostgreSQL in mind
5. Implement password hashing functionality (inside container workflow)
6. Implement JWT authentication within containerized backend
7. Develop POST /auth/register endpoint (test within container)
8. Develop POST /auth/login endpoint (test within container)
9. Develop GET /auth/me endpoint (protected, test within container)
10. Create error handling middleware (container-compatible)
11. Test all backend endpoints using containerized environment only
12. Ensure no host machine dependencies for backend development

## PREREQUISITES
- Phase 1 (Project Setup) completed
- Phase 2 (Database Setup) completed
- PostgreSQL container running and accessible as 'postgres'
- Docker and docker-compose installed

## STEP 1: CREATE BACKEND PACKAGE.JSON

In the containerized environment, we'll create a package.json file for the backend service with necessary dependencies.

From your project root directory (`/home/fedora/projects/simple-auth`), create the backend package.json:

```
cd backend/src
```

Create the `package.json` file with the following content:

```json
{
  "name": "simple-auth-backend",
  "version": "1.0.0",
  "description": "Backend API for simple authentication system",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": ["authentication", "express", "docker"],
  "author": "Simple Auth Team",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "express-rate-limit": "^6.7.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

## STEP 2: CREATE BACKEND SOURCE FILES

Create the following files in the `backend/src` directory:

### server.js - Main server entry point:

```
const express = require('express');
const cors = require('cors');
const { pool } = require('./config/db'); // Database connection
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
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Successfully connected to the database');
    release();
  }
});

const PORT = process.env.BACKEND_PORT || 8000;
const HOST = process.env.BACKEND_HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
  console.log(`Database connected to: ${process.env.DB_HOST || 'localhost'}`);
});

module.exports = app;
```

### config/db.js - Database configuration:

```
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
```

### models/User.js - User model for database operations:

```
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
```

### middleware/auth.js - JWT authentication middleware:

```
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    
    // Get user from token
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;
```

### utils/password.js - Password utility functions:

```
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
```

### utils/jwt.js - JWT utility functions:

```
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
```

### routes/auth.js - Authentication routes:

```
const express = require('express');
const User = require('../models/User');
const PasswordUtil = require('../utils/password');
const JWTUtil = require('../utils/jwt');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide username, email, and password' });
    }

    // Check if user already exists
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Create new user
    const user = await User.create({ username, email, password });

    // Generate JWT token
    const token = JWTUtil.generateToken(user.id);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /auth/login
// @desc    Authenticate user and get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide username and password' });
    }

    // Find user by username
    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await PasswordUtil.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = JWTUtil.generateToken(user.id);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   GET /auth/me
// @desc    Get authenticated user's info
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        created_at: req.user.created_at
      }
    });
  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json({ message: 'Server error getting user info' });
  }
});

module.exports = router;
```

### middleware/errorHandler.js - Global error handling middleware:

```
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  res.status(err.statusCode || 500).json({
    message: err.message || 'Server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
```

## STEP 3: BUILD AND RUN THE BACKEND CONTAINER

Now that all the backend files are created, let's build and run the backend container with the database:

From the project root directory (`/home/fedora/projects/simple-auth`), run:

```
docker compose up --build backend
```

This will:
1. Build the backend container using the Dockerfile
2. Start the PostgreSQL database container (due to depends_on)
3. Start the backend container
4. Connect the backend to the database

## STEP 4: TEST THE BACKEND ENDPOINTS

Once the containers are running, open a new terminal and test the endpoints:

### Test health check:
```
curl http://localhost:8000/health
```

### Test registration:
```
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"testpassword"}'
```

### Test login:
```
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpassword"}'
```

### Test protected route (use the token from login response):
```
curl -H "Authorization: Bearer <JWT_TOKEN_FROM_LOGIN>" http://localhost:8000/auth/me
```

## STEP 5: VERIFY CONTAINERIZED DEVELOPMENT WORKFLOW

To verify that development happens entirely within containers:

1. Make a change to one of the backend files (e.g. server.js)
2. The nodemon in the container should automatically restart the server (due to volume mapping)
3. Check that the change is reflected by making a request to the API

## SUCCESS CRITERIA:
- Backend container builds and runs successfully
- Backend connects to PostgreSQL database container
- All authentication endpoints work correctly (register, login, me)
- JWT tokens are generated and validated properly
- Password hashing works correctly
- Error handling is in place
- Development happens entirely within containers (no local Node.js required)