Authentication using JWT
========================

This `tokenService.js` file is responsible for:

Creating and verifying login tokens
===================================

This is the core of how your backend knows:

-   who the user is
-   whether they are logged in
-   whether they are admin or normal user

* * * * *

First Understand the Big Picture
================================

When a user logs in:

```
Frontend → Backend
```

Backend checks:

-   email
-   password

If correct:

```
Backend generates JWT token
```

Then frontend stores that token.

Later, every protected request sends:

```
Authorization: Bearer <token>
```

Then backend verifies the token.

* * * * *

So What Does `tokenService.js` Do?
==================================

It has TWO jobs:

| Function | Purpose |
| --- | --- |
| generateToken() | Create JWT token |
| verifyToken() | Check if token is valid |

* * * * *

What is JWT?
============

JWT means:

JSON Web Token
==============

It is basically a secure encoded string.

Example:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

This token contains user information securely.

* * * * *

Real-World Flow in YOUR Project
===============================

Login Flow
----------

```
User logs in    ↓authController checks password    ↓tokenService.generateToken(user)    ↓token returned to frontend    ↓Frontend stores token
```

* * * * *

Protected Route Flow
====================

Example:

```
GET /api/cart
```

Frontend sends token:

```
Authorization: Bearer eyJhbGc...
```

Then:

```
auth middleware    ↓tokenService.verifyToken(token)    ↓User verified    ↓Access granted
```

* * * * *

Now Let's Break Down the Code
=============================

* * * * *

1\. Import JWT Library
======================

```
const jwt = require('jsonwebtoken');
```

This imports the JWT package.

From your project docs:

| Package | Purpose |
| --- | --- |
| jsonwebtoken | JWT auth tokens |

This package handles:

-   token creation
-   token verification
-   token expiration
-   token decoding

* * * * *

2\. Environment Variables
=========================

```
const JWT_SECRET = process.env.JWT_SECRET;const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
```

* * * * *

What is `process.env`?
======================

`process.env` gives access to environment variables.

From your `.env`:

```
JWT_SECRET=ecommerce_senior_dev_secret_key_2024JWT_EXPIRES_IN=7d
```

So:

```
process.env.JWT_SECRET
```

becomes:

```
"ecommerce_senior_dev_secret_key_2024"
```

* * * * *

Why Use Environment Variables?
==============================

Security.

You NEVER hardcode secrets like this:

```
const secret = "mysecret123";
```

because:

-   dangerous
-   visible in GitHub
-   insecure

Instead:

```
JWT_SECRET=super_secret_key
```

* * * * *

What is JWT_SECRET?
===================

This is the cryptographic secret used to SIGN tokens.

Think of it like:

Your backend's secret signature
===============================

Only your backend knows this secret.

* * * * *

Example Analogy
===============

Imagine the backend stamps a passport.

The stamp proves:

> "This passport is authentic."

JWT_SECRET is that secret stamp.

* * * * *

What is `JWT_EXPIRES_IN`?
=========================

```
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
```

This controls token expiration.

Example:

```
7d = 7 days1h = 1 hour30m = 30 minutes
```

* * * * *

Why `|| '7d'`?
==============

This is a fallback value.

Meaning:

```
If env variable doesn't exist,use '7d'
```

* * * * *

3\. generateToken()
===================

```
const generateToken = (user) => {
```

This function creates a JWT token.

* * * * *

Inside jwt.sign()
=================

```
return jwt.sign(
```

`jwt.sign()` means:

Create and digitally sign token
===============================

* * * * *

Part 1 --- Payload
================

```
{   id: user.id,   email: user.email,   role: user.role }
```

This is the data stored INSIDE the token.

This is called:

Payload
=======

* * * * *

Example Payload
===============

```
{  id: "user_123",  email: "john@example.com",  role: "admin"}
```

* * * * *

Important Concept
=================

JWT is:

encoded, NOT encrypted
======================

That means:

People can decode it.

So NEVER store:

-   passwords
-   credit card info
-   sensitive secrets

inside JWT payloads.

* * * * *

Why store these fields?
=======================

Because backend needs them later.

Example:

`id`
----

Used to know:

```
Which user is making request?
```

* * * * *

`role`
------

Used for admin protection.

Example:

```
Only admins can create products
```

* * * * *

Part 2 --- Secret
===============

```
JWT_SECRET
```

This signs the token securely.

Without correct secret:

-   token becomes invalid
-   cannot be faked

* * * * *

Part 3 --- Options
================

```
{ expiresIn: JWT_EXPIRES_IN }
```

This sets expiration time.

Example:

```
Token expires after 7 days
```

* * * * *

Final Generated Token
=====================

Result looks like:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Frontend receives this after login.

* * * * *

4\. verifyToken()
=================

```
const verifyToken = (token) => {
```

This checks whether token is valid.

* * * * *

Inside Try Block
================

```
return jwt.verify(token, JWT_SECRET);
```

This does several things:

* * * * *

It checks:
==========

1\. Was token signed correctly?
-------------------------------

If secret doesn't match:

❌ invalid

* * * * *

2\. Has token expired?
----------------------

If expired:

❌ invalid

* * * * *

3\. Was token modified?
-----------------------

If someone changes payload manually:

❌ invalid

* * * * *

If valid?
=========

It returns decoded payload.

Example:

```
{  id: "user_123",  email: "john@example.com",  role: "admin",  iat: 1720000000,  exp: 1720600000}
```

* * * * *

What are `iat` and `exp`?
=========================

JWT automatically adds:

| Field | Meaning |
| --- | --- |
| iat | issued at |
| exp | expiration timestamp |

* * * * *

5\. Error Handling
==================

```
catch (error) {  return null;}
```

If token fails verification:

-   expired
-   invalid
-   corrupted

then:

```
return null;
```

This is VERY clean design.

Why?

Because middleware can simply do:

```
const decoded = verifyToken(token);if (!decoded) {  return res.status(401).json({    message: 'Unauthorized'  });}
```

* * * * *

Exporting Functions
===================

```
module.exports = {  generateToken,  verifyToken};
```

Makes functions available elsewhere.

* * * * *

How This Will Be Used in Your Project
=====================================

* * * * *

In Login Controller
===================

Example:

```
const token = generateToken(user);
```

Then send response:

```
res.json({  token,  user});
```

* * * * *

In Auth Middleware
==================

Example:

```
const decoded = verifyToken(token);
```

Then:

```
req.user = decoded;
```

Now every route knows:

```
req.user.idreq.user.role
```

* * * * *

Real Backend Architecture Here
==============================

```
Frontend Login      ↓authController      ↓tokenService.generateToken()      ↓JWT returned      ↓Frontend stores token      ↓Protected request      ↓auth middleware      ↓tokenService.verifyToken()      ↓req.user created      ↓Controller executes
```

* * * * *

Senior Developer Perspective
============================

This file introduces VERY important backend concepts:

| Concept | Why It Matters |
| --- | --- |
| Stateless authentication | Server doesn't store sessions |
| JWT signing | Prevents token tampering |
| Middleware authentication | Protect protected routes |
| Authorization | Role-based access |
| Environment security | Secrets outside code |
| Token expiration | Security control |

* * * * *

Why JWT is Popular
==================

Because backend becomes:

Stateless
=========

Meaning:

Server doesn't need session storage.

The token itself carries authentication info.

This makes JWT excellent for:

-   React frontends
-   mobile apps
-   REST APIs
-   microservices

* * * * *

One VERY Important Security Note
================================

This line:

```
return null;
```

is okay for your project.

But in larger applications, developers often:

-   log token errors
-   distinguish expired vs invalid token
-   refresh expired tokens

Example:

```
TokenExpiredErrorJsonWebTokenError
```

But your simplified version is PERFECT for learning and portfolio projects.

* * * * *

One More Important Thing
========================

Your current token payload contains:

```
idemailrole
```

This is good.

But NEVER do this:

```
password: user.password
```

Passwords should NEVER go inside tokens.

Never.