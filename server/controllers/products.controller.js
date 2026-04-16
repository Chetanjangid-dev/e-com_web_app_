const pool = require('../db');

const getAllProducts = async (req, res, next) => {
  try {
    const { category, search } = req.query;

    const conditions = [];
    const values = [];

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

module.exports = { getAllProducts, getCategories, getProductById };

// /**
//  * controllers/products.controller.js
//  *
//  * GET /api/products             — list with optional ?category= and ?search=
//  * GET /api/products/categories  — distinct category list
//  * GET /api/products/:id         — single product
//  */

// const pool = require('../db');

// // ── GET /api/products ─────────────────────────────────────────────────────────

// const getAllProducts = async (req, res, next) => {
//   try {
//     const { category, search } = req.query;

//     const conditions = [];
//     const values     = [];

//     if (category && category !== 'All') {
//       values.push(category);
//       conditions.push(`category = $${values.length}`);
//     }

//     if (search && search.trim()) {
//       values.push(`%${search.trim().toLowerCase()}%`);
//       const idx = values.length;
//       conditions.push(
//         `(LOWER(name) LIKE $${idx} OR LOWER(category) LIKE $${idx} OR LOWER(description) LIKE $${idx})`
//       );
//     }

//     const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

//     const { rows } = await pool.query(
//       `SELECT id, name, category, price, rating, reviews, badge, stock, description, image
//        FROM products
//        ${where}
//        ORDER BY id ASC`,
//       values
//     );

//     res.json(rows);
//   } catch (err) {
//     next(err);
//   }
// };

// // ── GET /api/products/categories ─────────────────────────────────────────────

// const getCategories = async (_req, res, next) => {
//   try {
//     const { rows } = await pool.query(
//       'SELECT DISTINCT category FROM products ORDER BY category ASC'
//     );
//     const categories = ['All', ...rows.map((r) => r.category)];
//     res.json(categories);
//   } catch (err) {
//     next(err);
//   }
// };

// // ── GET /api/products/:id ─────────────────────────────────────────────────────

// const getProductById = async (req, res, next) => {
//   try {
//     const { id } = req.params;

//     if (!Number.isInteger(Number(id)) || Number(id) < 1) {
//       return res.status(400).json({ message: 'Invalid product ID.' });
//     }

//     const { rows } = await pool.query(
//       `SELECT id, name, category, price, rating, reviews, badge, stock, description, image
//        FROM products WHERE id = $1`,
//       [id]
//     );

//     if (!rows[0]) {
//       return res.status(404).json({ message: 'Product not found.' });
//     }

//     res.json(rows[0]);
//   } catch (err) {
//     next(err);
//   }
// };

// module.exports = { getAllProducts, getCategories, getProductById };
