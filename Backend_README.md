Backend Documentation 
# E-Commerce Backend - Technical Documentation

## Project Overview

| Item | Description |
|------|-------------|
| Purpose | Minimal REST API for e-commerce frontend |
| Philosophy | Just enough backend - focus is frontend |
| Data Storage | JSON files (no real database) |
| Estimated Time | 2-3 days |

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Node.js | JavaScript runtime |
| Express.js | API framework |
| jsonwebtoken | JWT auth tokens |
| bcryptjs | Password hashing |
| cors | Cross-origin requests |
| dotenv | Environment variables |
| nodemon | Auto-restart (dev only) |

---

## Folder Structure
ecommerce-backend/
│
├── server.js # Entry point
├── app.js # Express config
├── package.json
├── .env
├── .gitignore
│
├── data/ # JSON data files
│ ├── users.json
│ ├── products.json
│ ├── carts.json
│ ├── orders.json
│ └── wishlists.json
│
├── middleware/
│ ├── auth.js # JWT verification
│ ├── admin.js # Admin role check
│ └── errorHandler.js # Global error handling
│
├── routes/
│ ├── authRoutes.js
│ ├── productRoutes.js
│ ├── cartRoutes.js
│ ├── wishlistRoutes.js
│ └── orderRoutes.js
│
├── controllers/
│ ├── authController.js
│ ├── productController.js
│ ├── cartController.js
│ ├── wishlistController.js
│ └── orderController.js
│
├── services/
│ ├── fileService.js # JSON read/write operations 
│ └── tokenService.js # JWT operations
│
├── constants/
│ └── index.js # Status codes, messages, roles
│
└── utils/
└── helpers.js # Helper functions

**fileService**: fileService.js is a reusable utility class that handles all interaction with your JSON files.


---

## Data Models (What each JSON file stores)

### users.json
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| email | string | User's email (unique) |
| password | string | Hashed password |
| name | string | Display name |
| role | string | "user" or "admin" |
| createdAt | string | ISO timestamp |

### products.json
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| name | string | Product name |
| price | number | Price in USD |
| description | string | Product description |
| category | string | Product category |
| imageUrl | string | Image URL |
| stock | number | Available quantity |
| rating | number | Average rating (0-5) |
| createdAt | string | ISO timestamp |

### carts.json
| Field | Type | Description |
|-------|------|-------------|
| userId | string | References user.id |
| items | array | Array of cart items |
| items[].productId | string | References product.id |
| items[].quantity | number | Quantity in cart |
| updatedAt | string | ISO timestamp |

### orders.json
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique order ID |
| userId | string | References user.id |
| items | array | Ordered items (snapshot) |
| subtotal | number | Sum of item prices |
| shipping | number | Shipping cost |
| tax | number | Tax amount |
| total | number | Final total |
| shippingAddress | object | Address details |
| status | string | pending/paid/shipped/delivered/cancelled |
| createdAt | string | ISO timestamp |

### wishlists.json
| Field | Type | Description |
|-------|------|-------------|
| userId | string | References user.id |
| productIds | array | Array of product.id strings |

---

## API Endpoints

## Complete API Endpoints List

### Base URL
Development: http://localhost:5000/api
Production: https://your-app-name.onrender.com/api

text

---

### 1. AUTHENTICATION ROUTES (`/auth`)

| # | Method | Endpoint | Body | Response | Access |
|---|--------|----------|------|----------|--------|
| 1 | POST | `/auth/register` | `{ email, password, name }` | `{ token, user }` | Public |
| 2 | POST | `/auth/login` | `{ email, password }` | `{ token, user }` | Public |
| 3 | GET | `/auth/me` | - | `{ user }` | Private |

**Request Examples:**

```http
# Register
POST /api/auth/register
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "123456",
  "name": "John Doe"
}

# Login
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "123456"
}

# Get Current User (Requires Token)
GET /api/auth/me
Header: Authorization: Bearer <token>
```

**Response Examples:**

```json
// Register/Login Success
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_1706000000000",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "user"
  }
}

// Get Me Success
{
  "id": "user_1706000000000",
  "email": "john@example.com",
  "name": "John Doe",
  "role": "user"
}
```

### 2. PRODUCT ROUTES (`/products`)

| # | Method | Endpoint | Query Params | Body | Response | Access |
|---|---|---|---|---|---|---|
| 4 | GET | `/products` | category, minPrice, maxPrice, search | - | Product[] | Public |
| 5 | GET | `/products/:id` | - | - | Product | Public |
| 6 | GET | `/products/categories` | - | - | string[] | Public |
| 7 | POST | `/products` | - | product object | Product | Admin |
| 8 | PUT | `/products/:id` | - | updates object | Product | Admin |
| 9 | DELETE | `/products/:id` | - | - | 204 | Admin |

**Request Examples:**

```http
# Get All Products (with filters)
GET /api/products
GET /api/products?category=Electronics
GET /api/products?minPrice=10&maxPrice=100
GET /api/products?search=headphone

# Get Single Product
GET /api/products/prod_1706000000000

# Create Product (Admin)
POST /api/products
Header: Authorization: Bearer <admin_token>
Content-Type: application/json
{
  "name": "New Product",
  "price": 49.99,
  "description": "Product description",
  "category": "Electronics",
  "stock": 100
}

# Update Product (Admin)
PUT /api/products/prod_1706000000000
Header: Authorization: Bearer <admin_token>
Content-Type: application/json
{
  "price": 39.99,
  "stock": 50
}

# Delete Product (Admin)
DELETE /api/products/prod_1706000000000
Header: Authorization: Bearer <admin_token>
```

**Response Examples:**

```json
// GET /products - Array of products
[
  {
    "id": "prod_1706000000000",
    "name": "Wireless Headphones",
    "price": 99.99,
    "description": "Noise-cancelling headphones",
    "category": "Electronics",
    "imageUrl": "https://images.unsplash.com/...",
    "stock": 50,
    "rating": 4.5,
    "createdAt": "2024-01-15T10:30:00Z"
  }
]

// GET /products/:id - Single product
{
  "id": "prod_1706000000000",
  "name": "Wireless Headphones",
  "price": 99.99,
  "description": "Noise-cancelling headphones",
  "category": "Electronics",
  "imageUrl": "https://images.unsplash.com/...",
  "stock": 50,
  "rating": 4.5,
  "createdAt": "2024-01-15T10:30:00Z"
}

// GET /products/categories
["Electronics", "Clothing", "Footwear", "Home", "Accessories"]
```

### 3. CART ROUTES (`/cart`)

| # | Method | Endpoint | Body | Response | Access |
|---|---|---|---|---|---|
| 10 | GET | `/cart` | - | `{ items, total }` | Private |
| 11 | POST | `/cart` | `{ productId, quantity }` | `{ message, cart }` | Private |
| 12 | PUT | `/cart/:productId` | `{ quantity }` | `{ message, cart }` | Private |
| 13 | DELETE | `/cart/:productId` | - | `{ message }` | Private |
| 14 | DELETE | `/cart` | - | `{ message }` | Private |

**Request Examples:**

```http
# Get Cart
GET /api/cart
Header: Authorization: Bearer <token>

# Add Item to Cart
POST /api/cart
Header: Authorization: Bearer <token>
Content-Type: application/json
{
  "productId": "prod_1706000000000",
  "quantity": 2
}

# Update Quantity
PUT /api/cart/prod_1706000000000
Header: Authorization: Bearer <token>
Content-Type: application/json
{
  "quantity": 3
}

# Remove Item
DELETE /api/cart/prod_1706000000000
Header: Authorization: Bearer <token>

# Clear Cart
DELETE /api/cart
Header: Authorization: Bearer <token>
```

**Response Examples:**

```json
// GET /cart
{
  "items": [
    {
      "productId": "prod_1706000000000",
      "quantity": 2,
      "product": {
        "id": "prod_1706000000000",
        "name": "Wireless Headphones",
        "price": 99.99,
        "imageUrl": "https://..."
      },
      "subtotal": 199.98
    }
  ],
  "total": 199.98
}

// POST/PUT/DELETE /cart
{
  "message": "Item added to cart"
}
```

4. WISHLIST ROUTES (/wishlist)

### Endpoints

| # | Method | Endpoint | Response | Access |
|---|---|---|---|---|
| 15 | GET | /wishlist | Product[] | Private |
| 16 | POST | /wishlist/:productId | { message } | Private |
| 17 | DELETE | /wishlist/:productId | { message } | Private |

### Request Examples

**Get Wishlist**

GET /api/wishlist  
Header: `Authorization: Bearer <token>`

**Add to Wishlist**

POST /api/wishlist/prod_1706000000000  
Header: `Authorization: Bearer <token>`

**Remove from Wishlist**

DELETE /api/wishlist/prod_1706000000000  
Header: `Authorization: Bearer <token>`

### Response Examples

```json
[
  {
    "id": "prod_1706000000000",
    "name": "Wireless Headphones",
    "price": 99.99,
    "description": "Noise-cancelling headphones",
    "category": "Electronics",
    "imageUrl": "https://...",
    "stock": 50,
    "rating": 4.5
  }
]
```

```json
{
  "message": "Added to wishlist"
}
```

5. ORDER ROUTES (/orders)

### Endpoints

| # | Method | Endpoint | Body | Response | Access |
|---|---|---|---|---|---|
| 18 | POST | /orders | { shippingAddress, paymentMethod } | Order | Private |
| 19 | GET | /orders | - | Order[] | Private |
| 20 | GET | /orders/:id | - | Order | Private |
| 21 | PUT | /orders/:id/status | { status } | Order | Admin |

### Request Examples

**Create Order (from cart)**

POST /api/orders  
Header: `Authorization: Bearer <token>`

```json
{
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "country": "USA"
  },
  "paymentMethod": "card"
}
```

**Get All Orders**

GET /api/orders  
Header: `Authorization: Bearer <token>`

**Get Single Order**

GET /api/orders/order_1706000000000  
Header: `Authorization: Bearer <token>`

**Update Order Status (Admin)**

PUT /api/orders/order_1706000000000/status  
Header: `Authorization: Bearer <admin_token>`

```json
{
  "status": "shipped"
}
```

### Response Examples

```json
{
  "id": "order_1706000000000",
  "userId": "user_1706000000000",
  "items": [
    {
      "productId": "prod_1706000000000",
      "productName": "Wireless Headphones",
      "quantity": 2,
      "price": 99.99,
      "subtotal": 199.98
    }
  ],
  "subtotal": 199.98,
  "shipping": 5.99,
  "tax": 20.00,
  "total": 225.97,
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "zip": "10001"
  },
  "status": "pending",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

```json
[
  { "...order1..." },
  { "...order2..." }
]
```

```json
{
  "id": "order_1706000000000",
  "status": "shipped"
}
```

6. HEALTH CHECK

### Endpoint

| # | Method | Endpoint | Response | Access |
|---|---|---|---|---|
| 22 | GET | /health | { status, timestamp, uptime } | Public |

### Request

GET /health

### Response

```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 123.45
}
```

## Summary: All 22 Endpoints

| # | Method | Endpoint | Access |
|---|---|---|---|
| 1 | POST | /api/auth/register | Public |
| 2 | POST | /api/auth/login | Public |
| 3 | GET | /api/auth/me | Private |
| 4 | GET | /api/products | Public |
| 5 | GET | /api/products/:id | Public |
| 6 | GET | /api/products/categories | Public |
| 7 | POST | /api/products | Admin |
| 8 | PUT | /api/products/:id | Admin |
| 9 | DELETE | /api/products/:id | Admin |
| 10 | GET | /api/cart | Private |
| 11 | POST | /api/cart | Private |
| 12 | PUT | /api/cart/:productId | Private |
| 13 | DELETE | /api/cart/:productId | Private |
| 14 | DELETE | /api/cart | Private |
| 15 | GET | /api/wishlist | Private |
| 16 | POST | /api/wishlist/:productId | Private |
| 17 | DELETE | /api/wishlist/:productId | Private |
| 18 | POST | /api/orders | Private |
| 19 | GET | /api/orders | Private |
| 20 | GET | /api/orders/:id | Private |
| 21 | PUT | /api/orders/:id/status | Admin |
| 22 | GET | /health | Public |

## Environment Files

### Local Development (.env)

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=ecommerce_senior_dev_secret_key_2024
JWT_EXPIRES_IN=7d

# CORS Configuration (for local React)
CORS_ORIGIN=http://localhost:5173
```

### Production (.env.production)

```env
# Server Configuration
PORT=10000
NODE_ENV=production

# JWT Configuration (USE STRONG RANDOM KEY)
JWT_SECRET=replace_with_32_char_random_string_xyz789
JWT_EXPIRES_IN=7d

# CORS Configuration (your frontend URL)
CORS_ORIGIN=https://your-frontend.vercel.app
```

## How to Generate Secure JWT Secret (Production)

Run the following command in your terminal:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and use it as `JWT_SECRET`.

## Hosting & Deployment

### Option 1: Render.com (Recommended - Free)

Why Render: Free tier, auto-deploy from GitHub, easy environment variables.

### Setup Steps

1. Push code to GitHub

```bash
git init
git add .
git commit -m "Initial backend commit"
git remote add origin https://github.com/yourusername/ecommerce-backend.git
git push -u origin main
```

2. Deploy on Render

- Go to render.com
- Sign up with GitHub
- Click "New +" → "Web Service"
- Connect your GitHub repo
- Configure:

| Setting | Value |
|---|---|
| Name | ecommerce-backend |

Environment	Node
Build Command	npm install
Start Command	npm start
Plan	Free
Add Environment Variables in Render Dashboard

Go to your service → Environment

Add:

Key	Value
PORT	10000
NODE_ENV	production
JWT_SECRET	your_generated_secret
JWT_EXPIRES_IN	7d
CORS_ORIGIN	https://your-frontend.vercel.app
Deploy

Click "Deploy"

Render auto-deploys on every git push

Your backend will be live at:

text
https://ecommerce-backend.onrender.com
Option 2: Cyclic.sh (Alternative - Free)
Setup Steps:

Go to cyclic.sh

Connect GitHub

Select your backend repo

Add environment variables

Deploy

Your backend will be live at:

text
https://your-app-name.cyclic.app
Option 3: Railway.app (Alternative - Free)
Setup Steps:

Go to railway.app

Connect GitHub

Deploy from repo

Add environment variables

Complete Deployment Checklist
Before Deployment
All 22 endpoints tested locally with Postman

JWT_SECRET is set (not default value)

CORS_ORIGIN points to your frontend URL

NODE_ENV is set to production

No console.log statements in production code

Error handling works properly

After Deployment
Health check works: GET https://your-backend.com/health

Public endpoints work: GET https://your-backend.com/api/products

CORS works with frontend

Environment variables are loaded

Frontend API Configuration
After deployment, update your frontend .env:

env
# Frontend .env
VITE_API_URL=https://ecommerce-backend.onrender.com/api
Your axios config will use this:

javascript
// src/utils/axiosConfig.js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});
Local Development vs Production
Aspect	Local	Production
Base URL	http://localhost:5000/api	https://your-app.onrender.com/api
JWT Secret	Simple key	Strong random key
CORS	All origins allowed	Only frontend URL
Data	JSON files in project	JSON files in server (resets on redeploy⚠️)
⚠️ Important Note for Production
JSON files reset on every redeploy!

For persistent storage in production, you would need a real database. But for a portfolio project demonstrating frontend skills, this is acceptable.

Alternative for production persistence:

Add a data/ folder to .gitignore (prevents reset)

Or use a free MongoDB (Atlas) instead of JSON files

Testing the Backend (Local)
Using Postman Collection
Create a collection with these requests in order:

POST /api/auth/register - Create user

POST /api/auth/login - Get token

GET /api/products - List products

POST /api/cart - Add to cart (use token)

GET /api/cart - View cart

POST /api/orders - Create order

GET /api/orders - View orders

Using curl Commands

# 1. Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456","name":"Test"}'

# 2. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'

# 3. Get Products
curl http://localhost:5000/api/products

# 4. Add to Cart (replace TOKEN with your login token)
curl -X POST http://localhost:5000/api/cart \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId":"prod_1","quantity":2}'
Quick Reference Card

# Development
npm run dev              # Start dev server
npm start                # Start production server
PORT=5000                # Default port

# Production (Render)
Auto-deploys on git push
URL: https://app-name.onrender.com
Health: /health

# Environment Variables (Required)
JWT_SECRET               # Your secret key
NODE_ENV                 # development/production

# Default Admin Account (created automatically)
Email: admin@shop.com
Password: admin123
Success Checklist
All 22 API endpoints documented

Environment variables configured

Local development working

Deployed to Render.com

Health check returns OK

Frontend can connect to backend

Admin account works

JWT authentication working

Need Help?
Issue	Solution
CORS error	Check CORS_ORIGIN in env
401 Unauthorized	Token missing or expired
403 Forbidden	Admin route with non-admin token
404 Not Found	Check URL path
500 Server error	Check server logs on Render
text

---

## Environment Variables

Create `.env` file with:

| Variable | Example | Description |
|----------|---------|-------------|
| PORT | 5000 | Server port |
| JWT_SECRET | your_secret_key_here | Used to sign JWT tokens |
| JWT_EXPIRES_IN | 7d | Token expiration time |
| NODE_ENV | development | Environment mode |

---

## Setup Instructions

### Step 1: Initialize Project

mkdir ecommerce-backend
cd ecommerce-backend
npm init -y
Step 2: Install Dependencies

npm install express cors dotenv jsonwebtoken bcryptjs
npm install -D nodemon
Step 3: Create Folder Structure

mkdir data middleware routes controllers services constants utils
Step 4: Create JSON Files

echo '[]' > data/users.json
echo '[]' > data/products.json
echo '[]' > data/carts.json
echo '[]' > data/orders.json
echo '[]' > data/wishlists.json
Step 5: Create All Files Listed in Folder Structure
(Refer to the file contents section below for each file)

Step 6: Run Development Server

npm run dev
Step 7: Test with Postman or Browser

GET http://localhost:5000/health
POST http://localhost:5000/api/auth/register
POST http://localhost:5000/api/auth/login
GET http://localhost:5000/api/products
File Contents Reference
Create each file with the following purpose:

File	What it does
constants/index.js	Stores all HTTP status codes, user roles, order statuses, and response messages
services/fileService.js	Reusable class for reading/writing JSON files (CRUD operations)
services/tokenService.js	JWT generate, verify, and decode functions
middleware/auth.js	Verifies JWT token from Authorization header
middleware/admin.js	Checks if authenticated user has admin role
middleware/errorHandler.js	Global error handler and 404 handler
server.js	Entry point - starts the server
app.js	Express app setup - middleware, routes, error handlers
controllers/*.js	Business logic for each route
routes/*.js	Route definitions linking URLs to controllers
API Response Format (Standard)
Success Response
```json
{
  "message": "Success message",
  "data": { ... }
}
```
Error Response
```json
{
  "message": "Error description"
}
```
Auth Response
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```
Development Phases
Day 1: Foundation
Initialize project and install dependencies

Create folder structure

Create constants/index.js

Create services/fileService.js

Create services/tokenService.js

Create server.js and app.js

Test with /health endpoint

Day 2: Auth & Products
Create middleware/auth.js and admin.js

Create authController.js and authRoutes.js

Test register and login endpoints

Create productController.js and productRoutes.js

Test product GET endpoints

Day 3: Cart, Wishlist & Orders
Create cartController.js and cartRoutes.js

Test cart endpoints

Create wishlistController.js and wishlistRoutes.js

Create orderController.js and orderRoutes.js

Test full flow: login → add to cart → create order

Testing the Backend
Test Credentials (After First Run)

Admin User:
Email: admin@shop.com
Password: admin123

Regular User:
Create your own via /register endpoint
Sample API Test Flow (Postman)
Register


POST /api/auth/register
Body: { "email": "test@test.com", "password": "123456", "name": "Test User" }
Login (copy token from response)


POST /api/auth/login
Body: { "email": "test@test.com", "password": "123456" }
Get Products (public - no token needed)


GET /api/products
Add to Cart (requires token in headers)


POST /api/cart
Headers: { "Authorization": "Bearer YOUR_TOKEN" }
Body: { "productId": "prod_1", "quantity": 2 }
Create Order (requires token)


POST /api/orders
Headers: { "Authorization": "Bearer YOUR_TOKEN" }
Body: { "shippingAddress": { "street": "123 Main St", "city": "NYC", "zip": "10001" }, "paymentMethod": "card" }
Common Errors & Solutions
Error	Likely Cause	Solution
ECONNREFUSED	Server not running	Run npm run dev
401 Unauthorized	Missing/invalid token	Check Authorization header
Cannot read property 'id' of undefined	User not found	Verify user exists in users.json
JWT_SECRET not set	Missing .env file	Create .env with JWT_SECRET
EACCES: permission denied	Port already in use	Change PORT in .env or kill process
Deployment Commands (Render.com)

# 1. Push code to GitHub

# 2. Connect repository to Render.com

# 3. Set environment variables in Render dashboard:
#    - JWT_SECRET=your_secret_key
#    - NODE_ENV=production

# 4. Render will auto-deploy on push
Success Checklist
npm run dev starts server without errors

GET /health returns { status: "OK" }

POST /api/auth/register creates new user

POST /api/auth/login returns token

GET /api/products returns product array

Protected routes return 401 without token

Admin routes return 403 for non-admin users

Cart add/remove/update works correctly

Order creation deducts stock and clears cart

Notes
All data persists in JSON files in the data/ folder

Server must be restarted to reflect manual changes to JSON files

No database setup or migration needed

This backend is intentionally minimal - focus is frontend



---

## Senior Summary

| Section | What It Contains |
|---------|------------------|
| Overview | What this backend is |
| Tech Stack | Technologies used |
| Folder Structure | Where files go |
| Data Models | What each JSON stores |
| API Endpoints | All routes documented |
| Environment Variables | What to put in .env |
| Setup Instructions | Step-by-step commands |
| File Reference | What each file does (not code) |
| Testing Flow | How to verify it works |
| Errors | Common problems and fixes |
| Checklist | When you're done |

---