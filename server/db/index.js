const { Pool } = require('pg');

// Render aur Neon ke liye DATABASE_URL best hai
const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Ise badha kar 10 sec kar diya
});

pool.connect((err, _client, release) => {
  if (err) {
    console.error('⚠️  PostgreSQL connection error:', err.stack);
  } else {
    console.log('✅  PostgreSQL connected');
    release();
  }
});

module.exports = pool;
