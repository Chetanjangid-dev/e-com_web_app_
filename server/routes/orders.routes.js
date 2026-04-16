/**
 * routes/orders.routes.js — all routes require authentication
 */

const router = require('express').Router();
const {
  createOrder,
  getOrders,
  getOrderById,
} = require('../controllers/orders.controller');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.post('/',    createOrder);
router.get( '/',    getOrders);
router.get( '/:id', getOrderById);

module.exports = router;
