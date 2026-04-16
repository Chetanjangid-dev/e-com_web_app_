/**
 * index.js — Maison Luxe API server
 *
 * Entry point. Loads env, mounts routes, starts listening.
 */

require('dotenv').config();

const express = require('express');
const cors    = require('cors');

const authRoutes     = require('./routes/auth.routes');
const productRoutes  = require('./routes/products.routes');
const cartRoutes     = require('./routes/cart.routes');
const orderRoutes    = require('./routes/orders.routes');
const { errorHandler } = require('./middleware/errorHandler');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Global Middleware ─────────────────────────────────────────────────────────

app.use(cors({
  origin:      process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Routes ────────────────────────────────────────────────────────────────────

app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart',     cartRoutes);
app.use('/api/orders',   orderRoutes);

// Health check — useful for Docker / CI probes
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// 404 for unknown API routes
app.use((_req, res) => res.status(404).json({ message: 'Route not found.' }));

// ── Centralised Error Handler ─────────────────────────────────────────────────

app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`🚀  Maison Luxe API running on http://localhost:${PORT}`);
  console.log(`    Environment : ${process.env.NODE_ENV || 'development'}`);
});
