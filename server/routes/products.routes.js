// /**
//  * routes/products.routes.js
//  */

// const router = require('express').Router();
// const {
//   getAllProducts,
//   getCategories,
//   getProductById,
// } = require('../controllers/products.controller');

// // NOTE: /categories must come before /:id so Express doesn't treat "categories" as an id.
// router.get('/categories', getCategories);
// router.get('/',           getAllProducts);
// router.get('/:id',        getProductById);

// module.exports = router;

const express = require('express');
const router = express.Router();
const { getProducts, getProductById, addProduct } = require('../controllers/products.controller');

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/add', addProduct); // Ye line zaroori hai

module.exports = router;
