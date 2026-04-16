/**
 * db/index.js — PostgreSQL connection pool
 *
 * A single Pool instance is shared across the whole application.
 * Calling pool.query() is safe to do from any module.
 */

const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME     || 'maison_luxe',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || '',
  // Keep a small pool — adequate for a typical dev/prod setup.
  max:      10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 2_000,
});

// Validate connectivity on startup (non-fatal warning if DB is temporarily down).
pool.connect((err, _client, release) => {
  if (err) {
    console.error('⚠️  PostgreSQL connection error:', err.message);
  } else {
    console.log('✅  PostgreSQL connected');
    release();
  }
});

module.exports = pool;
