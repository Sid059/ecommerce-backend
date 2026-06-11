const FileService = require('../services/fileService');
const { STATUS, MESSAGES } = require('../constants');

const cartService = new FileService('carts');
// we are making product service instance because we need to access product data to add to cart
const productService = new FileService('products');

const getCart = async (req, res) => {
    try{
        const carts = await cartService.read();
        let cart = carts.find(c => c.userId === req.user.id);

        if (!cart) {
            cart = {
                userId: req.user.id,
                items: [] // Initialize with empty items array if cart doesn't exist to avoid undefined errors later
            };
        }

        const products = await productService.read();
        const itemsWithDetails = cart.items.map(item => {
            const product = products.find(p => p.id === item.productId);
            return {
                ...item,
                product: product || null, // null because product might have been deleted after being added to the cart
                subtotal: product ? product.price * item.quantity : 0
            };
        });
        
    const total = itemsWithDetails.reduce((sum, item) => sum + item.subtotal, 0);
    
    res.json({ items: itemsWithDetails, total });

    } catch (error) {
        res.status(STATUS.INTERNAL_ERROR).json({ message: error.message });
    }
}

// Add to cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    const products = await productService.read();
    const product = products.find(p => p.id === productId);
    
    if (!product) {
      return res.status(STATUS.NOT_FOUND).json({ message: MESSAGES.PRODUCT_NOT_FOUND });
    }
    
    if (product.stock < quantity) {
      return res.status(STATUS.BAD_REQUEST).json({ message: MESSAGES.INSUFFICIENT_STOCK });
    }
    
    let carts = await cartService.read();
    let cart = carts.find(c => c.userId === req.user.id);
    
    // Cart should exist from registration, but handle edge cases defensively
    if (!cart) {
      cart = { userId: req.user.id, items: [] };
      carts.push(cart);
    }
    
    const existingItem = cart.items.find(i => i.productId === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }
    
    await cartService.write(carts);
    
    res.json({ message: MESSAGES.ITEM_ADDED });
  } catch (error) {
    res.status(STATUS.INTERNAL_ERROR).json({ message: error.message });
  }
};

// Update cart item
const updateCartItem = async (req, res) => {
  try {
    //req.params is used to access route parameters, in this case productId is expected to be a route parameter like /cart/item/:productId
    const { productId } = req.params;
    //req.body is used to access the data sent in the request body when updating the quantity of a cart item.
    const { quantity } = req.body;
    
    if (quantity < 0) {
      return res.status(STATUS.BAD_REQUEST).json({ message: 'Quantity cannot be negative' });
    }
    
    let carts = await cartService.read();
    const cart = carts.find(c => c.userId === req.user.id);
    
    if (!cart) {
      return res.status(STATUS.NOT_FOUND).json({ message: MESSAGES.CART_EMPTY });
    }
    
    const itemIndex = cart.items.findIndex(i => i.productId === productId);
    
    if (itemIndex === -1) {
      return res.status(STATUS.NOT_FOUND).json({ message: 'Item not in cart' });
    }
    
    // Backend must handle zero quantity for data integrity and security even thought frontend should prevent it. This ensures that if a malicious user tries to set quantity to zero, the backend will handle it gracefully by removing the item from the cart instead of leaving it with an invalid state.
    if (quantity === 0) {
      //splice syntax: array.splice(start, deleteCount, item1, item2, ...)
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }
    
    await cartService.write(carts);
    
    res.json({ message: MESSAGES.ITEM_UPDATED });
  } catch (error) {
    res.status(STATUS.INTERNAL_ERROR).json({ message: error.message });
  }
};

// Remove from cart
const removeFromCart = async (req, res) => {
  try {
    let carts = await cartService.read();
    const cart = carts.find(c => c.userId === req.user.id);
    
    if (cart) {
      cart.items = cart.items.filter(i => i.productId !== req.params.productId);
      await cartService.write(carts);
    }
    
    res.json({ message: MESSAGES.ITEM_REMOVED });
  } catch (error) {
    res.status(STATUS.INTERNAL_ERROR).json({ message: error.message });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  try {
    let carts = await cartService.read();
    const cart = carts.find(c => c.userId === req.user.id);
    
    if (cart) {
      cart.items = [];
      await cartService.write(carts);
    }
    
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(STATUS.INTERNAL_ERROR).json({ message: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};