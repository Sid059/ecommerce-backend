const express = require('express');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');

//This creates an instance of an Express application or server. The app variable is used to define routes, middleware, and other configurations for your backend API. It serves as the main entry point for handling incoming HTTP requests and sending responses back to clients. By using app, you can set up various endpoints for authentication, product management, cart operations, and more, allowing you to build a fully functional e-commerce backend.
const app = express();

// Middleware
//app.use() is used to mount middleware functions at the specified path.
//app.use() syntax: app.use([path], callback) - path is optional and specifies the base path for the middleware. If not provided, it defaults to '/' which means the middleware will be executed for every request.

// cors() is a middleware function that enables Cross-Origin Resource Sharing for the application. To make it simple it allows your backend to accept requests from different origins (like your frontend running on a different port). This is essential for modern web applications where the frontend and backend are often hosted separately. By using app.use(cors()), you are allowing all origins to access your API, which is useful during development. In production, you might want to configure it to allow only specific origins for better security.
app.use(cors());
// express.json() is a built-in middleware function in Express that parses incoming requests with JSON payloads and is based on body-parser. It makes the parsed data available in req.body. This is essential for handling POST and PUT requests where the client sends data in JSON format. By using app.use(express.json()), you ensure that your application can handle JSON data sent from the frontend, allowing you to easily access and manipulate it in your route handlers. 
// It eliminates the need to manually parse the request body, making it easier to work with JSON data in your API endpoints.
app.use(express.json());
// express.urlendoded() in simple words is a middleware function that parses incoming requests with URL-encoded payloads (like form submissions) and is based on body-parser. It makes the parsed data available in req.body. The extended: true option allows for rich objects and arrays to be encoded into the URL-encoded format, which can be useful for complex form data. By using app.use(express.urlencoded({ extended: true })), you enable your application to handle form submissions and other URL-encoded data sent from the frontend, making it easier to access and manipulate this data in your route handlers.
app.use(express.urlencoded({ extended: true }));

// Request logger
//what this does is it logs every incoming request to the console with a timestamp, HTTP method, and URL. This is useful for debugging and monitoring purposes, as it allows you to see the traffic coming into your application in real-time.
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
// app.use() is used to mount both route handlers and middleware functions at the specified path. When you use app.use('/api/auth', authRoutes), you are mounting the authRoutes router at the /api/auth path. This means that any request that starts with /api/auth will be handled by the authRoutes router. Similarly, app.use('/api/products', productRoutes) mounts the productRoutes router at the /api/products path, and app.use('/api/cart', cartRoutes) mounts the cartRoutes router at the /api/cart path. This allows you to organize your routes into separate files and keep your main application file clean and modular.
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);

// Health check
// This endpoint is used to check if the server is running and healthy. How do we know its healthy ? We can check the status, timestamp, and uptime. The status should be 'OK', the timestamp will show the current time, and the uptime will show how long the server has been running. This is useful for monitoring and ensuring that your application is up and running as expected. You can use this endpoint in your monitoring tools or simply access it in your browser to verify that the server is healthy.
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handlers
app.use(notFound);
app.use(errorHandler);

module.exports = app;