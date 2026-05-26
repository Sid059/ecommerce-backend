Now you are entering one of the MOST important concepts in backend development:

Middleware
==========

If controllers are the "workers" of your backend, middleware are the "security guards and inspectors" standing before the workers.

These three files are critical because they handle:

| Middleware | Purpose |
| --- | --- |
| auth.js | Checks if user is logged in |
| admin.js | Checks if user is admin |
| errorHandler.js | Handles errors globally |

These are foundational concepts used in real production backends.

* * * * *

FIRST --- What is Middleware?
===========================

In Express.js:

Middleware = function that runs between request and response
============================================================

Flow:

```
Request
   ↓
Middleware
   ↓
Controller
   ↓
Response

```

Middleware can:

-   stop request

-   modify request

-   validate data

-   authenticate users

-   log requests

-   handle errors

* * * * *

Real Example in YOUR Project
============================

Suppose user requests:

```
GET /api/cart

```

Flow becomes:

```
Request
   ↓
auth middleware
   ↓
verify JWT token
   ↓
attach user to req
   ↓
cart controller
   ↓
response

```

* * * * *

Now Let's Deep Dive Into `auth.js`
==================================

* * * * *

Purpose of `auth.js`
====================

This middleware protects routes.

Without it:

❌ anyone can access cart/orders/profile

With it:

✅ only logged-in users can access

* * * * *

Full Flow of Auth Middleware
============================

```
Frontend sends token
       ↓
Middleware extracts token
       ↓
verifyToken()
       ↓
valid?
   ↓       ↓
 yes       no
 ↓          ↓
next()    error response

```

* * * * *

Code Breakdown
==============

* * * * *

1\. Importing Dependencies
==========================

```
const { verifyToken } = require('../services/tokenService');
const { STATUS, MESSAGES } = require('../constants');

```

* * * * *

verifyToken
-----------

Comes from your `tokenService.js`.

Responsible for:

```
JWT validation

```

* * * * *

STATUS and MESSAGES
-------------------

This is a VERY GOOD backend practice.

Instead of:

```
res.status(401)

```

you use:

```
STATUS.UNAUTHORIZED

```

Cleaner and centralized.

* * * * *

2\. Middleware Function
=======================

```
const authenticateToken = (req, res, next) => {

```

In Express Middleware always takes/receives three arguments:

| Parameter | Meaning |
| --- | --- |
| req | Incoming request(the request object)|
| res | Response object |
| next | A function to call the next middleware/controller |

- This is a convention in Express. Express will automatically pass these three arguments to any middleware you use.

* * * * *

What is `next()`?
=================

VERY important concept.

`next()` means:

"Continue request flow"
=======================

Without it:

request gets stuck forever.

* * * * *

3\. Getting Authorization Header
================================

```
const authHeader = req.headers['authorization'];

```

Frontend sends:

```
Authorization: Bearer eyJhbGc...

```

So:

```
authHeader

```

becomes:

```
Bearer eyJhbGc...

```

* * * * *

4\. Extracting Token
====================

```
const token = authHeader && authHeader.split(' ')[1];

```

This line is VERY important.

Let's break it slowly.

* * * * *

First Part
==========

```
authHeader &&

```

Means:

```
Only continue if authHeader exists

```

Prevents crash.

* * * * *

Second Part
===========

```
authHeader.split(' ')

```

Splits string:

```
"Bearer abc123"

```

into:

```
["Bearer", "abc123"]

```

* * * * *

`[1]`
=====

Gets second item:

```
"abc123"

```

That is the actual JWT token.

* * * * *

Why "Bearer"?
=============

This is standard HTTP authentication format.

* * * * *

5\. No Token Check
==================

```
if (!token)

```

Means:

```
If token doesn't exist

```

Then:

```
return res.status(STATUS.UNAUTHORIZED).json({
  message: MESSAGES.UNAUTHORIZED
});

```

* * * * *

Why `return`?
=============

VERY important.

Without `return`:

code continues executing.

That can create bugs.

* * * * *

Status Code 401
===============

```
401 Unauthorized

```

means:

"You are not logged in"
=======================

***There are two different .json() methods, used in different places:***

- **res.json() in Express (server-side):**
Used to send a JavaScript object as a JSON response to the client.

Example:
res.json({ message: "Unauthorized" });

This converts the object to a JSON string and sends it in the HTTP response.

- **.json() on a fetch response (client-side):**
Used to parse the JSON string received from the server into a JavaScript object.

Example:
const data = await response.json();

This takes the response body (a JSON string) and parses it into an object.

* * * * *

6\. Verify Token
================

```
const decoded = verifyToken(token);

```

This calls:

```
jwt.verify()

```

inside tokenService.

* * * * *

If Token is Invalid
===================

```
if (!decoded)

```

Possible reasons:

-   expired token

-   fake token

-   modified token

Then:

```
403 Forbidden

```

* * * * *

Difference Between 401 and 403
==============================

| Code | Meaning |
| --- | --- |
| 401 | Not logged in |
| 403 | Logged in but not allowed |

* * * * *

7\. Attach User to Request
==========================

```
req.user = decoded;

```

- This is EXTREMELY important. req.user is not built-in.
- You can add any property to the req object in your middleware.
- Here, you attach the decoded user info to req.user so later middleware or route handlers can access it.

Now every controller can access:

```
req.user.id
req.user.role
req.user.email

```

* * * * *

Example
=======

Suppose token payload:

```
{
  id: "user_1",
  role: "admin"
}

```

Then after middleware:

```
req.user = {
  id: "user_1",
  role: "admin"
}

```

* * * * *

8\. next()
==========

```
next();

```

Means:

Authentication successful → continue
====================================

Without this:

request never reaches controller.

* * * * *

Real Flow Example
=================

```
GET /api/cart
      ↓
authenticateToken
      ↓
req.user created
      ↓
cartController
      ↓
req.user.id used

```

* * * * *

Now `admin.js`
==============

* * * * *

Purpose of `admin.js`
=====================

This middleware checks:

"Is this user an admin?"
========================

Used for routes like:

```
POST /products
DELETE /products
PUT /orders/:id/status

```

* * * * *

Flow
====

```
auth middleware
      ↓
req.user exists
      ↓
admin middleware
      ↓
check role

```

* * * * *

Code Breakdown
==============

* * * * *

1\. Import Constants
====================

```
const { STATUS, ROLES } = require('../constants');

```

Likely:

```
ROLES.ADMIN = 'admin'

```

* * * * *

2\. Middleware Function
=======================

```
const isAdmin = (req, res, next) => {

```

* * * * *

3\. Role Check
==============

```
if (req.user.role !== ROLES.ADMIN)

```

Checks:

```
Is user NOT admin?

```

* * * * *

Important Dependency
====================

This middleware ONLY works because:

```
auth.js

```

already attached:

```
req.user

```

So middleware order matters.

* * * * *

Correct Order
=============

```
router.post(
  '/',
  authenticateToken,
  isAdmin,
  createProduct
);

```

* * * * *

Wrong Order
===========

```
router.post(
  '/',
  isAdmin,
  authenticateToken,
  createProduct
);

```

This fails because:

```
req.user

```

doesn't exist yet.

* * * * *

4\. Forbidden Response
======================

```
return res.status(STATUS.FORBIDDEN).json({
  message: 'Admin access required'
});

```

403 means:

"You are logged in but lack permission."
========================================

* * * * *

5\. next()
==========

```
next();

```

If user IS admin:

continue request.

* * * * *

Now `errorHandler.js`
=====================

This is one of the BEST practices in Express backends.

* * * * *

Purpose
=======

Centralized error handling.

Instead of:

```
try/catch everywhere

```

you let one middleware handle errors globally.

* * * * *

Why This Is Important
=====================

Without centralized handling:

-   duplicate code

-   inconsistent responses

-   ugly debugging

* * * * *

Express Error Middleware Special Syntax
=======================================

```
(err, req, res, next)

```

NOTICE:

4 parameters
============

This tells Express:

```
"This is an error middleware"

```

* * * * *

1\. Logging Error
=================

```
console.error(`[ERROR] ${err.stack}`);

```

`err.stack` gives full error trace.

Example:

```
TypeError: Cannot read property...
    at authController.js:12

```

VERY useful for debugging.

* * * * *

2\. Sending Response
====================

```
res.status(STATUS.INTERNAL_ERROR).json({

```

Typically:

```
500 Internal Server Error

```

* * * * *

3\. Safe Error Responses
========================

```
error: process.env.NODE_ENV === 'development'
  ? err.message
  : undefined

```

This is VERY professional backend practice.

* * * * *

In Development
==============

You WANT detailed errors.

Example:

```
{
  "message": "Server error",
  "error": "Cannot read property 'id'"
}

```

* * * * *

In Production
=============

You HIDE internal details.

Why?

Security.

You don't want hackers seeing:

-   file structure

-   database details

-   stack traces

So production response becomes:

```
{
  "message": "Server error"
}

```

* * * * *

notFound Middleware
===================

```
const notFound = (req, res) => {

```

Handles invalid routes.

Example:

```
GET /api/unknown

```

returns:

```
404 Not Found

```

* * * * *

Why Separate 404 Middleware?
============================

Because Express checks routes sequentially.

If no route matches:

```
notFound middleware runs

```

* * * * *

How These Middleware Work Together
==================================

Full production-style flow:

```
Request
   ↓
auth middleware
   ↓
admin middleware
   ↓
controller
   ↓
error handler

```

* * * * *

Real Example
============

```
router.post(
  '/products',
  authenticateToken,
  isAdmin,
  createProduct
);

```

Flow:

```
User sends request
       ↓
JWT checked
       ↓
Role checked
       ↓
Controller executes
       ↓
Errors handled globally

```

* * * * *

Senior Developer Perspective
============================

These files introduce core backend engineering concepts:

| Concept | Importance |
| --- | --- |
| Authentication | Verify identity |
| Authorization | Verify permissions |
| Middleware chaining | Modular architecture |
| Global error handling | Clean scalable backend |
| Security layers | Protect routes |
| Request lifecycle | Understand Express deeply |

* * * * *

One VERY Important Backend Principle
====================================

Your middleware architecture is now becoming:

Layered Security
================

Instead of controllers doing everything:

```
Middleware → validation/security
Controller → business logic
Service → data access

```

This separation is EXACTLY how professional backends are structured.