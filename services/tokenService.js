const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

// jwt.sign() method is used to create a new JSON web token. JWT is encoded not encrypted, so it can be decoded, so never include sensitive information like passwords, credit card info, etc. in the payload of the token durin token generation.
const generateToken = (user) => { // JSON web token has three parts: header, payload, and a signature. How is header created ? Automatically by jwt.sign() method. It consist of the type of token (JWT) and the signing algorithm used (e.g., HS256).
    return jwt.sign( //A built-in function by jsonwebtoken that takes a payload (the data you want to include in the token), secret key (used to sign the token) and expiration time(optional). In this case, the payload includes the user's id, email, and role. The secret key is stored in an environment variable for security reasons.
        {   
            id: user.id,
            email: user.email,
            role: user.role
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
        //In a complete token, you include the header, payload, signature and the expiration time.
        //Why do we need to set an expiration time for the token? Setting an expiration time for the token is important for security reasons. It limits the window of time during which the token can be used, reducing the risk of unauthorized access if the token is compromised. If a token is stolen, it can only be used until it expires, which helps protect user accounts and sensitive data. 
        //Additionally, it encourages users to re-authenticate periodically, which can help ensure that they are still authorized to access the system.
        //The expiration time is included in the token's payload, and when the token is decoded, the application can check the current time against the expiration time to determine if the token is still valid. If the token has expired, the user will need to re-authenticate (e.g., log in again) to obtain a new token. This process is typically handled by the application's authentication middleware, which checks the validity of the token on each request and prompts for re-authentication if necessary.
    );
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET); //jwt.verify() method is a built-in function by jsonwebtoken that takes in a token and a secret key as arguments. It checks the validity of the token by verifying its signature using the provided secret key. If the token is valid, it returns the decoded payload (the data that was originally included in the token). If the token is invalid (e.g., if it has been tampered with, if the signature doesn't match, or if it has expired), it throws an error. 
        // It returns the decoded payload which includes the user's id, email, role, and the expiration time of the token. This information is used by the authentication middleware to determine if the token is valid and to identify the user making the request. If the token is valid, the decoded payload can be used to grant access to protected resources or perform actions on behalf of the user. If the token is invalid, the authentication middleware can return an appropriate response (e.g., a 401 Unauthorized status) to inform the client that they need to provide a valid token to access the requested resource.
    } catch (error) {
        return null; // why return null instead of throwing an error? Returning null allows the calling code to handle the case of an invalid token gracefully without crashing the application. It provides a way to indicate that the token is not valid without throwing an exception, which can be caught and handled in the authentication middleware or route handlers. This way, you can return an appropriate response (e.g., a 401 Unauthorized status) to the client instead of allowing an unhandled exception to occur. In this code, we catch any errors that occur during verification and return null to indicate that the token is not valid.
  }
};

module.exports = {
  generateToken,
  verifyToken
};