/**
 * controllers/cart.controller.js
 *
 * GET    /api/cart          — fetch current user's cart (requires auth)
 * POST   /api/cart/add      — add / increment item    (requires auth)
 * PATCH  /api/cart/:id/qty  — update quantity          (requires auth)
 * DELETE /api/cart/:id      — remove item              (requires auth)
 * DELETE /api/cart          — clear entire cart        (requires auth)
 */

const pool = require('../db');

// ── GET /api/cart ─────────────────────────────────────────────────────────────

const getCart = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.id, c.qty, c.added_at,
              p.id AS product_id, p.name, p.price, p.image, p.category, p.stock
       FROM   cart c
       JOIN   products p ON p.id = c.product_id
       WHERE  c.user_id = $1
       ORDER  BY c.added_at ASC`,
      [req.user.id]
    );

    // Shape data to match the CartContext item structure used in the frontend
    const items = rows.map(({ id, qty, product_id, name, price, image, category, stock }) => ({
      cartRowId: id,
      id:        product_id,
      name,
      price:     parseFloat(price),
      image,
      category,
      stock,
      qty,
    }));

    res.json(items);
  } catch (err) {
    next(err);
  }
};

// ── POST /api/cart/add ────────────────────────────────────────────────────────

const addToCart = async (req, res, next) => {
  try {
    const { productId, qty = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'productId is required.' });
    }

    // Verify product exists
    const { rows: productRows } = await pool.query(
      'SELECT id FROM products WHERE id = $1',
      [productId]
    );
    if (!productRows[0]) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Upsert: if row already exists, increment qty; otherwise insert
    const { rows } = await pool.query(
      `INSERT INTO cart (user_id, product_id, qty)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, product_id)
       DO UPDATE SET qty = cart.qty + EXCLUDED.qty
       RETURNING *`,
      [req.user.id, productId, qty]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/cart/:id/qty ───────────────────────────────────────────────────

const updateCartQty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { qty } = req.body;

    if (!qty || qty < 1) {
      return res.status(400).json({ message: 'qty must be ≥ 1.' });
    }

    const { rows } = await pool.query(
      `UPDATE cart SET qty = $1
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [qty, id, req.user.id]
    );

    if (!rows[0]) {
      return res.status(404).json({ message: 'Cart item not found.' });
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/cart/:id ──────────────────────────────────────────────────────

const removeFromCart = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { rowCount } = await pool.query(
      'DELETE FROM cart WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (!rowCount) {
      return res.status(404).json({ message: 'Cart item not found.' });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/cart ──────────────────────────────────────────────────────────

const clearCart = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM cart WHERE user_id = $1', [req.user.id]);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = { getCart, addToCart, updateCartQty, removeFromCart, clearCart };
