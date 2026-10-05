# ShopKart — Fullstack E-Commerce Platform

A modern, fullstack e-commerce web application featuring secure customer authentication with JWT and HttpOnly cookies, responsive product catalog discovery, category filtering, search, detailed product views, a persistent wishlist experience, and a reactive global shopping cart.

---

## 🌟 Features

### 🔐 Customer Authentication
- **Secure Registration**: Creates customer accounts with input validation and duplicate email prevention.
- **Bcrypt Hashing**: One-way cryptographic hashing with salted passwords stored in MongoDB.
- **HttpOnly Cookie Authentication**: Issues signed JWT session tokens inside browser-managed, cross-site-scripting-resistant `HttpOnly` cookies (`SameSite: Lax`).
- **Protected Profile Route**: Safeguarded endpoint (`/customers/me`) verifying JWT session validity.
- **Secure Logout**: Invalidates the active authentication session by clearing client cookies.
- **Password Management**: In-app capability to update passwords with current credential verification.

### 🛒 Product Catalog & Discovery
- **Dynamic Catalog**: Real-time product listing rendered from MongoDB.
- **Live Search**: Instant, case-insensitive title search.
- **Category Filtering**: Filter products across Electronics, Fashion, Books, and Home departments.
- **Price Sorting**: Sort by ascending or descending price.
- **Single Product View**: Detailed product page displaying high-resolution images, descriptions, live stock indicators, delivery badges, and an interactive Add-to-Cart workflow.
- **State Handling**: Polished skeleton loading states, informative error states with retry actions, and empty states.

### ♥️ Wishlist
- **Persistent Wishlist**: Backend-driven wishlist stored as ObjectId references in the Customer model.
- **Toggle Heart Button**: One-click ♡/♥ toggle on every product card with loading spinner feedback.
- **Dedicated Wishlist Page**: Full `/wishlist` page with loading skeleton, empty state CTA, error handling, and remove button.
- **Navbar Badge**: Live wishlist count badge in the navigation bar, refreshed on every route change.
- **Duplicate Prevention**: Backend returns 409 Conflict if the same product is added twice.
- **Bonus Toggle Endpoint**: `PATCH /wishlist/:productId/toggle` — adds if absent, removes if present.

### 🛍️ Shopping Cart
- **Persistent Backend Cart**: Quantity-aware cart stored in MongoDB referencing the Product collection.
- **Global Cart State**: Real-time state synchronisation via React Context API (`CartContext`), keeping the Cart page, Navbar badge, and Product cards in perfect sync.
- **Duplicate Prevention & Auto-Increment**: Adding an existing cart item increments its quantity rather than creating duplicate rows.
- **Strict Stock Validation**: Validates available stock for both initial addition and quantity adjustments (rejects with 400 Bad Request if requested quantity exceeds stock).
- **Reactive Quantity Controls**: Intuitive `[-] quantity [+]` stepper controls with item-level loading indicators.
- **Derived Order Metrics**: Real-time calculation of subtotal, total units, and item counts without saving stale redundant data in the database.
- **Full State Coverage**: Comprehensive treatment for loading skeletons, empty cart state with CTA, and actionable error states.

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Security & Tokens**: bcrypt, jsonwebtoken, cookie-parser, cors, dotenv
- **Testing**: Jest, Supertest (59 automated tests)

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router DOM (v6)
- **State Management**: React Context API (`AuthContext`, `CartContext`)
- **HTTP Client**: Axios (configured with `withCredentials: true`)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

---

## 📁 Project Architecture

Follows a clean Model-View-Controller (MVC) structure:

```text
Mern/
├── backend/
│   ├── controllers/
│   │   ├── customer.controller.js  # Customer registration, login, profile, logout
│   │   ├── product.controller.js   # Product creation, listing, search, filtering
│   │   ├── wishlist.controller.js  # Wishlist add, get, remove, toggle
│   │   └── cart.controller.js      # Cart add, get, update quantity, remove
│   ├── models/
│   │   ├── customer.model.js       # Customer schema (includes wishlist & cart refs)
│   │   └── product.model.js        # Product schema & validations
│   ├── routes/
│   │   ├── customer.routes.js      # /customers endpoints
│   │   ├── product.routes.js       # /products endpoints
│   │   ├── wishlist.routes.js      # /wishlist endpoints (protected)
│   │   └── cart.routes.js          # /cart endpoints (protected)
│   ├── middlewares/
│   │   └── auth.middleware.js      # JWT cookie verification middleware
│   ├── utils/
│   │   ├── generateToken.js        # Signs JWT tokens
│   │   └── seedProducts.js         # Mock product seeder
│   ├── tests/
│   │   ├── customer.test.js        # Authentication test suite (15 tests)
│   │   ├── product.test.js         # Product API test suite (10 tests)
│   │   ├── wishlist.test.js        # Wishlist API test suite (14 tests)
│   │   └── cart.test.js            # Cart API test suite (20 tests)
│   ├── index.js                    # Express app entrypoint & MongoDB connection
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Top navigation, user session, wishlist & cart badges
│   │   │   ├── ProductCard.jsx     # Product card with wishlist & cart integration
│   │   │   └── SearchBar.jsx       # Search input, category dropdown & sort selector
│   │   ├── pages/
│   │   │   ├── Register.jsx        # Account registration page
│   │   │   ├── Login.jsx           # User login page
│   │   │   ├── Home.jsx            # Protected customer dashboard
│   │   │   ├── Products.jsx        # Product discovery catalog
│   │   │   ├── ProductDetails.jsx  # Single product details view & Add to Cart
│   │   │   ├── Wishlist.jsx        # Wishlist page with remove & empty states
│   │   │   └── Cart.jsx            # Cart page with stepper controls & order summary
│   │   ├── services/
│   │   │   └── api.js              # Centralized Axios API client
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     # React context for global auth state
│   │   │   └── CartContext.jsx     # Global cart state & derived totals
│   │   ├── App.jsx                 # Route configurations
│   │   ├── index.css               # Tailwind directives
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (running locally on port `27017` or a MongoDB Atlas URI)

---

### 1. MongoDB Setup
Ensure MongoDB is running locally:
```powershell
# On Windows, check that the MongoDB service is active
Get-Service -Name *MongoDB*
```
If connecting to MongoDB Atlas or an external instance, update `MONGO_URI` in `backend/.env`.

---

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Seed initial product catalog
npm run seed

# Run automated tests
npm test

# Start the server (runs on http://localhost:5000)
npm start

# Or start in development mode with nodemon
npm run dev
```

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the Vite development server (runs on http://localhost:5173)
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📡 API Reference

### Customer Authentication (`/customers`)

| Method | Endpoint | Description | Protected |
|---|---|---|:---:|
| `POST` | `/customers/register` | Register new customer (`fullName`, `email`, `password`, `phone`) | No |
| `POST` | `/customers/login` | Authenticate customer & issue HttpOnly JWT cookie | No |
| `GET` | `/customers/me` | Retrieve authenticated user profile | **Yes** |
| `POST` | `/customers/logout` | Clear authentication cookie and end session | **Yes** |
| `PATCH` | `/customers/change-password` | Update account password (`oldPassword`, `newPassword`) | **Yes** |

---

### Product Catalog (`/products`)

| Method | Endpoint | Description | Query Parameters |
|---|---|---|---|
| `POST` | `/products` | Create a new product | — |
| `GET` | `/products` | Retrieve catalog with optional search & filters | `search`, `category`, `sort=price_asc\|price_desc` |
| `GET` | `/products/:id` | Retrieve single product by MongoDB ID | — |

---

### Wishlist (`/wishlist`) — All Protected

| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `POST` | `/wishlist/:productId` | Add product to wishlist | 200, 400, 404, 409 |
| `GET` | `/wishlist` | Get wishlist with populated product data | 200 |
| `DELETE` | `/wishlist/:productId` | Remove product from wishlist | 200, 400, 404 |
| `PATCH` | `/wishlist/:productId/toggle` | Toggle product in/out of wishlist | 200, 400, 404 |

---

### Shopping Cart (`/cart`) — All Protected

| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `POST` | `/cart/:productId` | Add product to cart (or increment quantity) | 200, 400, 404 |
| `GET` | `/cart` | Retrieve user's cart populated with product details | 200 |
| `PATCH` | `/cart/:productId` | Update item quantity (`{ quantity }`) | 200, 400, 404 |
| `DELETE` | `/cart/:productId` | Remove item from cart | 200, 400, 404 |

---

## 🧪 Testing

The backend includes a comprehensive Jest and Supertest suite:

```bash
cd backend
npm test
```

All 59 test cases run against a local test database and validate registration, password hashing, cookies, route protection, search, filtering, wishlist CRUD, and full cart business logic with stock limit checks.
