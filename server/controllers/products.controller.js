/**
 * controllers/products.controller.js
 *
 * GET    /api/products             — list with optional ?category= and ?search=
 * GET    /api/products/categories  — distinct category list
 * GET    /api/products/:id         — single product
 * POST   /api/products             — create product (admin)
 * PUT    /api/products/:id         — update product (admin)
 * DELETE /api/products/bulk        — bulk delete products (admin)
 * DELETE /api/products/:id         — delete product (admin)
 */

const pool = require('../db');

// ── GET /api/products ─────────────────────────────────────────────────────────

const getAllProducts = async (req, res, next) => {
  try {
    const { category, search } = req.query;

    const conditions = [];
    const values     = [];

    if (category && category !== 'All') {
      values.push(category);
      conditions.push(`category = $${values.length}`);
    }

    if (search && search.trim()) {
      values.push(`%${search.trim().toLowerCase()}%`);
      const idx = values.length;
      conditions.push(
        `(LOWER(name) LIKE $${idx} OR LOWER(category) LIKE $${idx} OR LOWER(description) LIKE $${idx})`
      );
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows } = await pool.query(
      `SELECT id, name, category, price, rating, reviews, badge, stock, description, image
       FROM products
       ${where}
       ORDER BY id ASC`,
      values
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// ── GET /api/products/categories ─────────────────────────────────────────────

const getCategories = async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT DISTINCT category FROM products ORDER BY category ASC'
    );
    const categories = ['All', ...rows.map((r) => r.category)];
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

// ── GET /api/products/:id ─────────────────────────────────────────────────────

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!Number.isInteger(Number(id)) || Number(id) < 1) {
      return res.status(400).json({ message: 'Invalid product ID.' });
    }

    const { rows } = await pool.query(
      `SELECT id, name, category, price, rating, reviews, badge, stock, description, image
       FROM products WHERE id = $1`,
      [id]
    );

    if (!rows[0]) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// ── POST /api/products ────────────────────────────────────────────────────────

const createProduct = async (req, res, next) => {
  try {
    const { name, category, price, rating, reviews, badge, stock, description, image } = req.body;

    if (!name || !category || price === undefined || !description || !image) {
      return res.status(400).json({ message: 'Missing required fields: name, category, price, description, image.' });
    }

    const { rows } = await pool.query(
      `INSERT INTO products (name, category, price, rating, reviews, badge, stock, description, image)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, name, category, price, rating, reviews, badge, stock, description, image`,
      [
        name.trim(),
        category.trim(),
        parseFloat(price),
        parseFloat(rating) || 0,
        parseInt(reviews) || 0,
        badge && badge.trim() ? badge.trim() : null,
        parseInt(stock) || 0,
        description.trim(),
        image.trim(),
      ]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/products/:id ─────────────────────────────────────────────────────

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!Number.isInteger(Number(id)) || Number(id) < 1) {
      return res.status(400).json({ message: 'Invalid product ID.' });
    }

    const { name, category, price, rating, reviews, badge, stock, description, image } = req.body;

    if (!name || !category || price === undefined || !description || !image) {
      return res.status(400).json({ message: 'Missing required fields: name, category, price, description, image.' });
    }

    const { rows } = await pool.query(
      `UPDATE products
       SET name=$1, category=$2, price=$3, rating=$4, reviews=$5, badge=$6, stock=$7, description=$8, image=$9
       WHERE id=$10
       RETURNING id, name, category, price, rating, reviews, badge, stock, description, image`,
      [
        name.trim(),
        category.trim(),
        parseFloat(price),
        parseFloat(rating) || 0,
        parseInt(reviews) || 0,
        badge && badge.trim() ? badge.trim() : null,
        parseInt(stock) || 0,
        description.trim(),
        image.trim(),
        id,
      ]
    );

    if (!rows[0]) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/products/bulk ─────────────────────────────────────────────────

const bulkDeleteProducts = async (req, res, next) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Provide an array of product IDs.' });
    }

    const validIds = ids.filter((id) => Number.isInteger(Number(id)) && Number(id) > 0);

    if (validIds.length === 0) {
      return res.status(400).json({ message: 'No valid IDs provided.' });
    }

    const placeholders = validIds.map((_, i) => `$${i + 1}`).join(', ');
    const { rowCount } = await pool.query(
      `DELETE FROM products WHERE id IN (${placeholders})`,
      validIds
    );

    res.json({ deleted: rowCount });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/products/:id ──────────────────────────────────────────────────

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!Number.isInteger(Number(id)) || Number(id) < 1) {
      return res.status(400).json({ message: 'Invalid product ID.' });
    }

    const { rowCount } = await pool.query(
      'DELETE FROM products WHERE id = $1',
      [id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllProducts,
  getCategories,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts,
};
