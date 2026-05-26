const { STATUS, MESSAGES } = require('../constants');

// This middleware function is designed to handle errors that occur during the processing of requests in the application. It takes four parameters: err (the error object), req (the request object), res (the response object), and next (a function to pass control to the next middleware). 

// No matter where you are in your Express app—whether in a route handler, controller, or any middleware—if you call next(error) (where error is an Error object or message), Express will immediately skip all remaining normal middleware and route handlers, and jump straight to the error-handling middleware (the one with four arguments: (err, req, res, next)).
// This is how Express handles errors globally and consistently.


// When an error occurs, it logs the error stack trace to the console for debugging purposes. Then, it sends a JSON response with a status code of 500 (Internal Server Error) and a message indicating that a server error occurred. If the application is running in development mode, it also includes the error message in the response for easier debugging. In production mode, it omits the error message to avoid exposing sensitive information about the server's internals.
const errorHandler = (err, req,  res, next) => {
    console.error(`[Error] ${err.stack}`);

    res.status(STATUS.INTERNAL_ERROR).json({
        message: MESSAGES.SERVER_ERROR,
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
};

// Handles invalid routes (e.g., when a user tries to access a route that doesn't exist). It sends a 404 Not Found status code along with a JSON response containing an error message. 
// This middleware should be placed after all other route handlers to catch any requests that don't match any defined routes. By providing a clear message for invalid routes, it helps improve the user experience and makes it easier for developers to debug issues related to routing in the application.
const notFound = (req, res) => {
    res.status(STATUS.NOT_FOUND).json({
        message: MESSAGES.ROUTE_NOT_FOUND
    });
};

module.exports = {
    errorHandler,
    notFound
}