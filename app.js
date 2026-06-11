const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

//must run before files need environment variables, so they can access them when imported
dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');

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
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);

// Health check
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