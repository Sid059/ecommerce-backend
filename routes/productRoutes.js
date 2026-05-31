const express = require('express');
const { getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getCategories
} = require('../controllers/productController');
const authenticateToken = require('../middleware/auth');
const isAdmin = require('../middleware/admin');

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);

// Admin only routes
router.post('/', authenticateToken, isAdmin, createProduct);
router.put('/:id', authenticateToken, isAdmin, updateProduct);
router.delete('/:id', authenticateToken, isAdmin, deleteProduct);

module.exports = router;