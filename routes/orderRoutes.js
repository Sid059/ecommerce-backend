const express = require('express');
const authenticateToken = require('../middleware/auth');
const isAdmin = require('../middleware/admin');
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus
} = require('../controllers/orderController');

const router = express.Router();

// Protected routes
router.post('/', authenticateToken, createOrder);
router.get('/', authenticateToken, getOrders);
router.get('/:id', authenticateToken, getOrderById);

// Admin only
router.put('/:id/status', authenticateToken, isAdmin, updateOrderStatus);

module.exports = router;