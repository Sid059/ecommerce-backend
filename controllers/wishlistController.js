const FileService = require('../services/fileService');
const { STATUS, MESSAGES } = require('../constants');

const wishlistService = new FileService('wishlists');
const productService = new FileService('products');

// Get user's wishlist
const getWishlist = async (req, res) => {
  try {
    const wishlists = await wishlistService.read();
    let wishlist = wishlists.find(w => w.userId === req.user.id);
    
    if (!wishlist) {
      wishlist = { userId: req.user.id, productIds: [] };
    }
    
    const products = await productService.read();
    const wishlistProducts = wishlist.productIds
      .map(id => products.find(p => p.id === id))
      .filter(p => p !== undefined);
    
    res.json(wishlistProducts);
  } catch (error) {
    res.status(STATUS.INTERNAL_ERROR).json({ message: error.message });
  }
};

// Add to wishlist
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const products = await productService.read();
    const product = products.find(p => p.id === productId);
    
    if (!product) {
      return res.status(STATUS.NOT_FOUND).json({ message: MESSAGES.PRODUCT_NOT_FOUND });
    }
    
    let wishlists = await wishlistService.read();
    let wishlist = wishlists.find(w => w.userId === req.user.id);
    
    if (!wishlist) {
      wishlist = { userId: req.user.id, productIds: [] };
      wishlists.push(wishlist);
    }
    
    if (!wishlist.productIds.includes(productId)) {
      wishlist.productIds.push(productId);
      await wishlistService.write(wishlists);
    }
    
    res.json({ message: MESSAGES.WISHLIST_ADDED });
  } catch (error) {
    res.status(STATUS.INTERNAL_ERROR).json({ message: error.message });
  }
};

// Remove from wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    
    let wishlists = await wishlistService.read();
    const wishlist = wishlists.find(w => w.userId === req.user.id);
    
    if (wishlist) {
      wishlist.productIds = wishlist.productIds.filter(id => id !== productId);
      await wishlistService.write(wishlists);
    }
    
    res.json({ message: MESSAGES.WISHLIST_REMOVED });
  } catch (error) {
    res.status(STATUS.INTERNAL_ERROR).json({ message: error.message });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist
};