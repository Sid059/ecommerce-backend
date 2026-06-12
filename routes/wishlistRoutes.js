const express = require('express');
const authenticateToken = require('../middleware/auth');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist
} = require('../controllers/wishlistController');

const router = express.Router();

router.get('/', authenticateToken, getWishlist);
router.post('/:productId', authenticateToken, addToWishlist);
router.delete('/:productId', authenticateToken, removeFromWishlist);

module.exports = router;