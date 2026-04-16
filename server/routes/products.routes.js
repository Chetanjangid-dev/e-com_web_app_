// /**
//  * routes/products.routes.js
//  */

const router = require('express').Router();
const {
  getAllProducts,
  getCategories,
   getProductById,
 } = require('../controllers/products.controller');

 // NOTE: /categories must come before /:id so Express doesn't treat "categories" as an id.
 router.get('/categories', getCategories);
 router.get('/',           getAllProducts);
 router.get('/:id',        getProductById);

 module.exports = router;


