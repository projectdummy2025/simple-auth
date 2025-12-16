const { Pool } = require('pg');

// Initialize with null to ensure module exports something
let pool = null;

try {
  // Validate environment variables before creating pool
  const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    database: process.env.DB_NAME
  };

  console.log('Database configuration:', {
    host: dbConfig.host,
    user: dbConfig.user,
    database: dbConfig.database,
    port: dbConfig.port
  });

  // Check if required environment variables are defined
  const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_PORT', 'DB_NAME'];
  const missingEnvVars = [];
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingEnvVars.push(envVar);
      console.error(`Missing required environment variable: ${envVar}`);
    }
  }

  // Log any missing environment variables and exit if any are missing
  if (missingEnvVars.length > 0) {
    console.error(`Application will not start due to missing environment variables: ${missingEnvVars.join(', ')}`);
    process.exit(1);
  }

  // Use environment variables for database connection
  pool = new Pool(dbConfig);

  // Handle pool errors
  pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
  });

} catch (error) {
  console.error('Failed to initialize database connection pool:', error.message);
  console.error('Error stack:', error.stack);
  // Don't exit here, just don't create the pool
}

// If pool was initialized successfully, also provide a query helper function
if (pool) {
  // Add a query helper method that returns a promise
  const query = (text, params) => {
    console.log('Executing query:', text);
    return new Promise((resolve, reject) => {
      pool.query(text, params, (err, res) => {
        if (err) {
          console.error('Database query error:', err);
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  };

  // Also attach the query function to the pool object for compatibility
  pool.queryPromise = query;

  // Export both pool and query function
  module.exports = {
    pool,
    query
  };
} else {
  // If pool is null, export null for both
  module.exports = {
    pool: null,
    query: null
  };
}