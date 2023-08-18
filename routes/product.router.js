const express = require('express');
const Product = require('../models/Product.model');
const advancedResults = require('../middleware/advanced');

const {getProducts, 
    addProducts, 
    updateProducts, 
    deleteProducts, 
    getProduct,
    addProductToCart,
    removeProductFromCart
} = require('../controllers/product.controller')

const router = express.Router();
const {protect, authorize} = require('../middleware/auth')

router.get('/', advancedResults(Product), getProducts);
router.post('/', protect, authorize('admin'), addProducts);
router.post('/addtocart', protect, addProductToCart);
router.post('/removefromcart', protect, removeProductFromCart);
router.get('/:id', getProduct);
router.put('/:id', updateProducts);
router.delete('/:id', deleteProducts);

module.exports = router;