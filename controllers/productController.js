const { v4: uuidv4 } = require('uuid');
const FileService = require('../services/fileService');
const { STATUS, MESSAGES } = require('../constants');

const productService = new FileService('products');

const generateId = () => `prod_${uuidv4()}`;

// ============ HELPER FUNCTIONS ============

const validateProduct = (name, price) => {
  if (!name) return 'Product name is required';
  if (!price) return 'Price is required';
  if (isNaN(price) || price <= 0) return 'Price must be a positive number';
  return null;
};

// ============ CONTROLLERS ============

// @desc    Get all products with filters
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    let products = await productService.read();
    
    // query is an object provided by Express, containing the query parameters from the URL. For example, if the URL is /api/products?category=electronics&minPrice=100, then req.query will be { category: 'electronics', minPrice: '100' }. We can use these query parameters to filter the products based on the criteria specified by the client. In this code, we are extracting category, minPrice, maxPrice, and search from req.query to apply filters to the products list.
    const { category, minPrice, maxPrice, search } = req.query;

    if (category) {
      products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (minPrice) {
      products = products.filter(p => p.price >= Number(minPrice));
    }

    if (maxPrice) {
      products = products.filter(p => p.price <= Number(maxPrice));
    }

    if (search) {
      products = products.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.json(products);
  } catch (error) {
    console.error('GetProducts error:', error);
    res.status(STATUS.INTERNAL_ERROR).json({ message: MESSAGES.SERVER_ERROR });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await productService.findById(req.params.id);
    
    if (!product) {
      return res.status(STATUS.NOT_FOUND).json({ message: MESSAGES.PRODUCT_NOT_FOUND });
    }
    
    res.json(product);
  } catch (error) {
    console.error('GetProductById error:', error);
    res.status(STATUS.INTERNAL_ERROR).json({ message: MESSAGES.SERVER_ERROR });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Admin only
const createProduct = async (req, res) => {
  try {
    // body is an Object provided by Express that contains the parsed body of the request. When a client sends a POST request with a JSON payload, Express will parse that JSON and populate req.body with the resulting object. For example, if the client sends { "name": "Laptop", "price": 999.99 }, then req.body will be { name: 'Laptop', price: 999.99 }. We can then destructure the properties we need from req.body to create a new product.
    const { name, price, description, category, imageUrl, stock } = req.body;

    const validationError = validateProduct(name, price);
    if (validationError) {
      return res.status(STATUS.BAD_REQUEST).json({ message: validationError });
    }

    const newProduct = {
      id: generateId(),
      name,
      price: Number(price),
      description: description || '',
      category: category || 'Uncategorized',
      imageUrl: imageUrl || 'https://placehold.co/400x400?text=Product',
      stock: stock || 0,
      rating: 0,
      createdAt: new Date().toISOString()
    };

    await productService.create(newProduct);
    res.status(STATUS.CREATED).json(newProduct);
  } catch (error) {
    console.error('CreateProduct error:', error);
    res.status(STATUS.INTERNAL_ERROR).json({ message: MESSAGES.SERVER_ERROR });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Admin only
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updated = await productService.update(id, updates);
    
    if (!updated) {
      return res.status(STATUS.NOT_FOUND).json({ message: MESSAGES.PRODUCT_NOT_FOUND });
    }
    
    res.json(updated);
  } catch (error) {
    console.error('UpdateProduct error:', error);
    res.status(STATUS.INTERNAL_ERROR).json({ message: MESSAGES.SERVER_ERROR });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Admin only
const deleteProduct = async (req, res) => {
  try {
    // params is an Object provided by Express that contains the route parameters defined in the URL. For example, if the route is defined as /api/products/:id and the client makes a request to /api/products/123, then req.params will be { id: '123' }. We can destructure the id from req.params to identify which product to delete.
    const { id } = req.params;
    const deleted = await productService.delete(id);
    
    if (!deleted) {
      return res.status(STATUS.NOT_FOUND).json({ message: MESSAGES.PRODUCT_NOT_FOUND });
    }
    
    res.status(STATUS.NO_CONTENT).send();
  } catch (error) {
    console.error('DeleteProduct error:', error);
    res.status(STATUS.INTERNAL_ERROR).json({ message: MESSAGES.SERVER_ERROR });
  }
};

// @desc    Get all categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const products = await productService.read();
    const categories = [...new Set(products.map(p => p.category))];
    res.json(categories);
  } catch (error) {
    console.error('GetCategories error:', error);
    res.status(STATUS.INTERNAL_ERROR).json({ message: MESSAGES.SERVER_ERROR });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories
};
