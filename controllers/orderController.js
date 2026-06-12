const FileService = require('../services/fileService');
const { v4: uuidv4 } = require('uuid');
const { STATUS, MESSAGES, ORDER_STATUS } = require('../constants');

const orderService = new FileService('orders');
const cartService = new FileService('carts');
const productService = new FileService('products');

// Generate order ID
const generateOrderId = () => `order_${uuidv4()}`;

// @desc    Create order from cart
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    // Validation
    if (!shippingAddress || !paymentMethod) {
      return res.status(STATUS.BAD_REQUEST).json({ 
        message: 'Shipping address and payment method are required' 
      });
    }

    // Get user's cart
    const carts = await cartService.read();
    const cart = carts.find(c => c.userId === req.user.id);

    if (!cart || cart.items.length === 0) {
      return res.status(STATUS.BAD_REQUEST).json({ 
        message: MESSAGES.CART_EMPTY 
      });
    }

    // Get all products
    const products = await productService.read();
    
    // Build order items and calculate totals
    const orderItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const product = products.find(p => p.id === item.productId);
      
      if (!product) {
        return res.status(STATUS.BAD_REQUEST).json({ 
          message: `Product ${item.productId} not found` 
        });
      }

      if (product.stock < item.quantity) {
        return res.status(STATUS.BAD_REQUEST).json({ 
          message: `${product.name} has insufficient stock. Available: ${product.stock}` 
        });
      }

      const itemSubtotal = product.price * item.quantity;
      orderItems.push({
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
        subtotal: itemSubtotal
      });
      subtotal += itemSubtotal;
    }

    // Calculate totals
    const shipping = 5.99;
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + shipping + tax;

    // Create order
    const newOrder = {
      id: generateOrderId(),
      userId: req.user.id,
      items: orderItems,
      subtotal,
      shipping,
      tax,
      total,
      shippingAddress,
      paymentMethod,
      status: ORDER_STATUS.PENDING,
      createdAt: new Date().toISOString()
    };

    await orderService.create(newOrder);

    // Update stock for each product
    for (const item of cart.items) {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        product.stock -= item.quantity;
      }
    }
    await productService.write(products);

    // Clear user's cart
    cart.items = [];
    await cartService.write(carts);

    res.status(STATUS.CREATED).json(newOrder);
  } catch (error) {
    console.error('CreateOrder error:', error);
    res.status(STATUS.INTERNAL_ERROR).json({ message: MESSAGES.SERVER_ERROR });
  }
};

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
  try {
    const orders = await orderService.read();
    const userOrders = orders
      .filter(o => o.userId === req.user.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(userOrders);
  } catch (error) {
    console.error('GetOrders error:', error);
    res.status(STATUS.INTERNAL_ERROR).json({ message: MESSAGES.SERVER_ERROR });
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const orders = await orderService.read();
    const order = orders.find(o => o.id === req.params.id);

    if (!order) {
      return res.status(STATUS.NOT_FOUND).json({ message: MESSAGES.ORDER_NOT_FOUND });
    }

    // Check if order belongs to user OR user is admin
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(STATUS.FORBIDDEN).json({ message: 'Access denied' });
    }

    res.json(order);
  } catch (error) {
    console.error('GetOrderById error:', error);
    res.status(STATUS.INTERNAL_ERROR).json({ message: MESSAGES.SERVER_ERROR });
  }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(STATUS.BAD_REQUEST).json({ 
        message: 'Invalid status. Allowed: pending, paid, shipped, delivered, cancelled' 
      });
    }

    const order = await orderService.update(id, { status });
    
    if (!order) {
      return res.status(STATUS.NOT_FOUND).json({ message: MESSAGES.ORDER_NOT_FOUND });
    }

    res.json(order);
  } catch (error) {
    console.error('UpdateOrderStatus error:', error);
    res.status(STATUS.INTERNAL_ERROR).json({ message: MESSAGES.SERVER_ERROR });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus
};