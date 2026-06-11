//must run before files need environment variables, so they can access them when imported
const dotenv = require('dotenv');
// here dotenv.config() is used to load environment variables from a .env file into process.env. This allows you to keep sensitive information like database credentials, API keys, and other configuration settings out of your source code and instead manage them through environment variables. By calling dotenv.config() at the beginning of your application, you ensure that all the environment variables defined in your .env file are available throughout your application via process.env. This is a common practice in Node.js applications to enhance security and flexibility in different deployment environments (development, staging, production).
dotenv.config();

const app = require('./app');

const PORT = process.env.PORT || 5000;

// listen() is a method of the express application instance that we created inside app.js using const app = express(). It is used to start the server and have it listen for incoming HTTP requests on a specified port. In this case, we are using PORT from environment variables or defaulting to 5000 if it's not set. When the server starts successfully, it will execute the callback function provided as the second argument to listen(), which logs a message to the console indicating that the server is running and on which port. This is essential for making your backend API accessible to clients (like your frontend application) and for confirming that the server has started without issues.
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   🚀 E-Commerce Backend Server         ║
╠════════════════════════════════════════╣
║   Port: ${PORT}                        ║
║   Environment: ${process.env.NODE_ENV || 'development'}      ║
║   JWT Secret: ${process.env.JWT_SECRET ? '✓ Set' : '✗ Missing'}        ║
╚════════════════════════════════════════╝
  `);
});

//server.js loads environment variables, imports the configured Express app from app.js, then starts an HTTP server that listens for requests on port 5000 and prints a confirmation box when ready.