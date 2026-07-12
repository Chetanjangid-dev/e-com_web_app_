/**
 * routes/products.routes.js
 *
 * IMPORTANT: specific routes (/categories, /bulk) must be declared
 * BEFORE the wildcard /:id route so Express matches them correctly.
 */

const router = require('express').Router();
const {
  getAllProducts,
  getCategories,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts,
} = require('../controllers/products.controller');

// ── Read ──────────────────────────────────────────────────────────
router.get('/categories', getCategories);
router.get('/',           getAllProducts);
router.get('/:id',        getProductById);

// ── Admin CRUD ────────────────────────────────────────────────────
router.post('/',          createProduct);
router.put('/:id',        updateProduct);
router.delete('/bulk',    bulkDeleteProducts);   // Must be before /:id
router.delete('/:id',     deleteProduct);

module.exports = router;

