const { Pool } = require('pg');

try {
  // Validate environment variables before creating pool
  const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    database: process.env.DB_NAME
  };

  // Check if required environment variables are defined
  const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_PORT', 'DB_NAME'];
  const missingEnvVars = [];
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingEnvVars.push(envVar);
      console.error(`Missing required environment variable: ${envVar}`);
    }
  }

  console.log('Database configuration:', {
    host: dbConfig.host,
    user: dbConfig.user,
    database: dbConfig.database,
    port: dbConfig.port
  });

  // Log any missing environment variables and exit if any are missing
  if (missingEnvVars.length > 0) {
    console.error(`Application will not start due to missing environment variables: ${missingEnvVars.join(', ')}`);
    process.exit(1);
  }

  // Use environment variables for database connection
  const pool = new Pool(dbConfig);

  // Handle pool errors
  pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
  });

  module.exports = pool;

} catch (error) {
  console.error('Failed to initialize database connection pool:', error.message);
  process.exit(1);
}