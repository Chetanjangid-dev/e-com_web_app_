/**
 * controllers/orders.controller.js
 *
 * POST /api/orders      — place an order from the current cart (requires auth)
 * GET  /api/orders      — list user's orders                   (requires auth)
 * GET  /api/orders/:id  — single order with items              (requires auth)
 */

const pool = require('../db');

// ── POST /api/orders ──────────────────────────────────────────────────────────

const createOrder = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const { items, shipping = 0, tax = 0, discount = 0 } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item.' });
    }

    // Validate every item has required fields
    for (const item of items) {
      if (!item.id || !item.qty || item.qty < 1 || !item.price) {
        return res.status(400).json({
          message: 'Each item must have id, qty (≥ 1), and price.',
        });
      }
    }

    await client.query('BEGIN');

    // Calculate subtotal server-side (never trust client totals blindly)
    const subtotal = items.reduce((sum, i) => sum + Number(i.price) * i.qty, 0);
    const grandTotal = subtotal + Number(shipping) + Number(tax) - Number(discount);

    // Insert order header
    const { rows: orderRows } = await client.query(
      `INSERT INTO orders (user_id, subtotal, shipping, tax, discount, grand_total)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.user.id, subtotal.toFixed(2), Number(shipping).toFixed(2),
       Number(tax).toFixed(2), Number(discount).toFixed(2), grandTotal.toFixed(2)]
    );

    const order = orderRows[0];

    // Insert line items
    for (const item of items) {
      // Fetch current product name as a snapshot
      const { rows: prodRows } = await client.query(
        'SELECT name FROM products WHERE id = $1',
        [item.id]
      );
      const productName = prodRows[0]?.name || item.name || 'Unknown product';

      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, price, qty)
         VALUES ($1, $2, $3, $4, $5)`,
        [order.id, item.id, productName, Number(item.price).toFixed(2), item.qty]
      );
    }

    // Clear the user's server-side cart after successful order
    await client.query('DELETE FROM cart WHERE user_id = $1', [req.user.id]);

    await client.query('COMMIT');

    res.status(201).json({ order });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

// ── GET /api/orders ───────────────────────────────────────────────────────────

const getOrders = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, status, subtotal, shipping, tax, discount, grand_total, created_at
       FROM orders
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// ── GET /api/orders/:id ───────────────────────────────────────────────────────

const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { rows: orderRows } = await pool.query(
      `SELECT id, status, subtotal, shipping, tax, discount, grand_total, created_at
       FROM orders
       WHERE id = $1 AND user_id = $2`,
      [id, req.user.id]
    );

    if (!orderRows[0]) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    const { rows: itemRows } = await pool.query(
      `SELECT oi.id, oi.product_id, oi.product_name, oi.price, oi.qty,
              p.image
       FROM   order_items oi
       LEFT   JOIN products p ON p.id = oi.product_id
       WHERE  oi.order_id = $1`,
      [id]
    );

    res.json({ ...orderRows[0], items: itemRows });
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, getOrders, getOrderById };
