// How does the auth middleware work ? The auth middleware is responsible for verifying the authenticity of the token sent by the client in the request headers. It checks if the token is valid and if it has not expired. If the token is valid, it allows the request to proceed to the next middleware or route handler. If the token is invalid or has expired, it returns an appropriate response (e.g., a 401 Unauthorized status) to the client.
const { verifyToken } = require('../services/tokenService');
const { STATUS, MESSAGES } = require('../constants');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization']; // The client sends the token in the Authorization header of the request. The format of the header is usually Bearer <token>, where <token> is the actual JWT token. We extract the token from the header by splitting the string and taking the second part (the token itself).
    const token = authHeader && authHeader.split(' ')[1]; // If the authHeader exists, we split it by space and take the second part (the token). If the authHeader does not exist, token will be undefined.

    if(!token) {
        // why res.status() ? The res.status() method is used to set the HTTP status code of the response that will be sent back to the client. It informs the client about the nature of the error and allow them to handle it appropriately on their end.
        // why .json() ? In Express (server-side) it is used to send a JavaScript object as a JSON response to the client unlike the way it is used in React (client-side) where it is used to parse a JSON string into a JavaScript object.
        return res.status(STATUS.UNAUTHORIZED).json({ message: MESSAGES.UNAUTHORIZED });
        //This statement is sending a response back to the client with a status code of 401 (Unauthorized) and a JSON object containing a message that indicates the user is unauthorized. This is typically used when the client fails to provide a valid token in the request headers, indicating that they are not authenticated to access the requested resource. By returning this response, we inform the client that they need to provide a valid token to proceed with their request.
    }

    const decoded = verifyToken(token); // we get the decoded payload 
    
    if(!decoded) {
        return res.status(STATUS.FORBIDDEN).json({ message: MESSAGES.TOKEN_EXPIRED });
        // This statement is sending a response back to the client with a status code of 403 (Forbidden) and a JSON object containing a message that indicates the token is invalid or has expired. This is typically used when the client provides a token that cannot be verified (e.g., it has been tampered with, the signature doesn't match, or it has expired). By returning this response, we inform the client that their token is not valid and they need to provide a valid token to access the requested resource.
    }

    req.user = decoded; // if the token is valid, this code assigns decoded payload to req.user which is a custom property for storing user information in the request object which will be used in the route handlers to identify the user making the request and to determine their permission for accessing certain resources or actions. By attaching the decoded token payload to req.user, we can easily access the user's information (e.g., id, email, role) in subsequent middleware or route handlers without needing to decode the token again.
    next(); // This function is used to pass control to the next middleware function in the stack if the token is valid. This will allow the request to proceed through the authentication process and reach the intended route handler.
    // By stack I mean the sequence of middleware functions that are executed for a particular route. When a request is made to a route, Express will execute the middleware functions in the order they are defined until it reaches the route handler. If any middleware function sends a response (e.g., res.status().json()), it will end the request-response cycle and prevent further middleware or route handlers from being executed. However, if a middleware function calls next(), it will pass control to the next middleware function in the stack, allowing the request to continue through the authentication process and eventually reach the intended route handler if all checks pass successfully.
}

module.exports = authenticateToken;