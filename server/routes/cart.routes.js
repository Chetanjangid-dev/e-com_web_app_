/**
 * routes/cart.routes.js — all routes require authentication
 */

const router = require('express').Router();
const {
  getCart,
  addToCart,
  updateCartQty,
  removeFromCart,
  clearCart,
} = require('../controllers/cart.controller');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth); // protect every route in this file

router.get(   '/',          getCart);
router.post(  '/add',       addToCart);
router.patch( '/:id/qty',   updateCartQty);
router.delete('/:id',       removeFromCart);
router.delete('/',          clearCart);

module.exports = router;
