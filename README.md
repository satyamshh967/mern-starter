# 🛒 ShopKart — Full-Stack MERN E-Commerce Platform

> **Final Trimester Capstone Project** • Engineering Labs 01–06 Complete Implementation  
> *A modern full-stack commerce experience connecting authentication, product catalog discovery, real-time wishlist, reactive shopping cart state, server-side business rules, Razorpay test payments, cryptographic verification, and persistent order history.*

---

## 🏆 Project Overview

ShopKart is a production-grade full-stack commerce application built from the ground up using the **MERN** stack (MongoDB, Express.js, React, Node.js) with Tailwind CSS, Vite, and Razorpay. It solves the end-to-end engineering lifecycle of an online store:

```text
Register / Login
       ↓
Browse Catalog (Search, Filter, Sort)
       ↓
Save to Wishlist (Persistent, Real-Time Sync)
       ↓
Add to Cart (Global State, Derived Metrics)
       ↓
Checkout & Shipping Validation
       ↓
Server Price & Stock Snapshotting
       ↓
Razorpay Test Payment
       ↓
HMAC-SHA256 Signature Verification
       ↓
Order Placed & Cart Cleared
       ↓
Order Confirmation & Order History
```

---

## 📋 Labs Completed (Full Curriculum Implementation)

| Lab | Module | Key Architectural Focus | Status |
|:---:|---|---|:---:|
| **01** | **Customer Authentication** | Salted bcrypt passwords, JWT generation, secure cookie issuance | ✅ Completed |
| **02** | **Session Security & Profile** | HttpOnly cookie auth, `/customers/me`, password change verification | ✅ Completed |
| **03** | **Product Catalog Discovery** | MongoDB aggregation, live regex search, category filtering, price sorting | ✅ Completed |
| **04** | **Persistent Wishlist** | MongoDB ObjectId references, 1-click toggle, real-time cross-tab sync | ✅ Completed |
| **05** | **Shopping Cart State** | Global React Context, derived subtotal & item counts, strict stock checks | ✅ Completed |
| **06** | **Checkout, Orders & Razorpay** | Server-side total calculation, order snapshots, Razorpay popup, HMAC verification | ✅ Completed |

---

## 🌟 Core Features

### 🔐 1. Authentication & Session Security (Labs 01 & 02)
- **Secure Registration & Login**: Validated inputs, email uniqueness, sanitized phone numbers.
- **Bcrypt Password Hashing**: Passwords are cryptographically salted and hashed before database persistence.
- **HttpOnly Cookie Tokens**: Issues signed JWT session tokens stored exclusively inside browser-managed, XSS-immune `HttpOnly` cookies (`SameSite: Lax`).
- **Protected Profile & Session Invalidation**: `/customers/me` checks session validity; `/customers/logout` clears client cookies immediately.
- **Password Updates**: Secure in-app password changes requiring verification of old credentials.

### 🛍️ 2. Curated Product Catalog & Discovery (Lab 03)
- **Pre-Added Curated Items**: Pre-seeded with 30 Pinterest-aesthetic workspace gadgets, audiophile headphones, artisan mechanical keyboards, and engineering literature.
- **Automatic Startup Seeding**: The server automatically checks and auto-seeds catalog products on startup if the database is ever empty, guaranteeing persistent availability across any browser.
- **Live Search & Category Filters**: Case-insensitive instant search and category navigation across *Electronics*, *Home*, *Fashion*, and *Books*.
- **Price Sorting & Details**: Ascending/descending sorting, live inventory stock badges, and detailed view pages.

### ❤️ 3. Persistent Wishlist System (Lab 04)
- **Database Reference Model**: Stored as an array of `ObjectId` references on the Customer model to ensure wishlist data always fetches the latest product price and availability upon population.
- **Optimistic Heart Toggle**: 1-click heart toggle on product cards with loading spinner feedback.
- **Live Navbar Badge**: Badge updates instantaneously across catalog, product details, and wishlist pages without full reloads.

### 🛒 4. Reactive Shopping Cart & Global State (Lab 05)
- **Centralized Cart State (`CartContext`)**: Single source of truth driving Navbar badges, product card buttons, cart page steppers, and checkout summaries.
- **Duplicate Prevention & Quantity Controls**: Adding existing products increments quantity rather than creating duplicate rows.
- **Strict Stock Validation**: Backend queries the latest product stock before allowing quantity increases, rejecting requests exceeding stock with `400 Bad Request`.
- **Derived Metrics**: Subtotal, grand total, and unit counts are computed on the fly using `useMemo`, preventing stale redundant database state.

### 💳 5. Checkout, Razorpay Payment & Orders (Lab 06)
- **Shipping Address Validation**: Strict validation for required fields, valid 10-digit mobile numbers, and exactly 6-digit Indian PIN codes.
- **Server-Side Total Calculation**: Backend recalculates prices directly from MongoDB, deliberately ignoring any client-sent fake totals.
- **Order Snapshotting**: Saves immutable purchase-time snapshots of product name, price, and image to preserve historical accuracy even if catalog prices change later.
- **Razorpay Test Integration**: Server creates orders in paise (`amount * 100`), returns signed `razorpay_order_id`, and opens the official Razorpay test checkout modal.
- **Cryptographic Signature Verification**: Uses Node’s `crypto.createHmac("sha256", RAZORPAY_KEY_SECRET)` to verify signatures before marking orders `PAID` or clearing user carts.
- **Delivery Progress Tracker (Bonus)**: Interactive 4-step delivery progress stepper (`PLACED` → `CONFIRMED` → `SHIPPED` → `DELIVERED`).

### ✨ 6. UI Finishing Touches & Micro-Interactions
- **Custom Vector Favicon**: High-resolution squircle SVG icon with brand gradient and tech spark bolt.
- **Smooth Scrolling & ScrollToTop**: Automatic route scroll reset and floating smooth back-to-top button.
- **Animated Toast Notification System**: Interactive floating action toasts for instant feedback when items are added to cart or saved to wishlist.
- **Active Navigation Highlighting**: Highlights active routes and adds subtle pulsing glow rings to cart/wishlist count badges.
- **Custom Sleek Scrollbar**: Rounded 7px scrollbar styled with subtle red accent transitions.

---

## 🛠️ Tech Stack

| Area | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router DOM v6, Tailwind CSS, Lucide React Icons |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB with Mongoose ODM |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`), `bcrypt`, `cookie-parser` |
| **Payment Gateway** | Razorpay Node.js SDK (Test Mode) + Razorpay Standard Checkout JS |
| **Testing** | Jest, Supertest (**71/71 Automated Tests Passing**) |

---

## 📁 Project Structure

```text
Mern/
├── backend/
│   ├── config/
│   │   └── razorpay.js             # Razorpay SDK initialization
│   ├── controllers/
│   │   ├── customer.controller.js  # Registration, login, profile, logout
│   │   ├── product.controller.js   # Product catalog, search, filtering
│   │   ├── wishlist.controller.js  # Wishlist add, remove, toggle
│   │   ├── cart.controller.js      # Cart CRUD & stock limit validations
│   │   └── order.controller.js     # Checkout, Razorpay orders, HMAC verification, history
│   ├── models/
│   │   ├── customer.model.js       # Customer schema with embedded wishlist & cart
│   │   ├── product.model.js        # Product schema with stock limits
│   │   └── order.model.js          # Order schema with immutable price snapshots
│   ├── routes/
│   │   ├── customer.routes.js      # /customers endpoints
│   │   ├── product.routes.js       # /products endpoints
│   │   ├── wishlist.routes.js      # /wishlist endpoints (protected)
│   │   ├── cart.routes.js          # /cart endpoints (protected)
│   │   └── order.routes.js         # /orders endpoints (protected)
│   ├── middlewares/
│   │   └── auth.middleware.js      # JWT cookie verification middleware
│   ├── utils/
│   │   ├── defaultProducts.js      # Curated 30-product catalog for auto-seeding
│   │   ├── seedProducts.js         # Manual seed script
│   │   └── generateToken.js        # JWT token signer
│   ├── tests/
│   │   ├── customer.test.js        # Auth test suite (15 tests)
│   │   ├── product.test.js         # Catalog test suite (10 tests)
│   │   ├── wishlist.test.js        # Wishlist test suite (14 tests)
│   │   ├── cart.test.js            # Shopping cart test suite (20 tests)
│   │   └── order.test.js           # Order & Razorpay test suite (12 tests)
│   ├── index.js                    # Server entry point & auto-seed connection
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── public/
│   │   └── favicon.svg             # Custom ShopKart SVG squircle icon
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Active link highlighting, live count badges
│   │   │   ├── Footer.jsx          # Comprehensive footer with assurances
│   │   │   ├── ProductCard.jsx     # Card lift, toast hooks, wishlist toggle
│   │   │   ├── SearchBar.jsx       # Real-time search, category dropdown, sort
│   │   │   └── ScrollToTop.jsx     # Automatic route scroll reset & floating button
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     # Global user authentication session
│   │   │   ├── WishlistContext.jsx # Global wishlist state & 0ms badge sync
│   │   │   ├── CartContext.jsx     # Global cart state, item steppers & clearCart
│   │   │   └── ToastContext.jsx    # Real-time animated notification alerts
│   │   ├── pages/
│   │   │   ├── Login.jsx           # Sign in page
│   │   │   ├── Register.jsx        # Customer registration page
│   │   │   ├── Home.jsx            # Customer profile dashboard & password change
│   │   │   ├── Products.jsx        # Product catalog with filters
│   │   │   ├── ProductDetails.jsx  # Single product view with Add to Cart / Wishlist
│   │   │   ├── Wishlist.jsx        # Saved wishlist page
│   │   │   ├── Cart.jsx            # Shopping cart page with order summary
│   │   │   ├── Checkout.jsx        # Shipping form & Razorpay popup launcher
│   │   │   ├── OrderSuccess.jsx    # Order confirmation receipt page
│   │   │   ├── Orders.jsx          # My Orders history page
│   │   │   ├── OrderDetails.jsx    # Order view with status progression tracker
│   │   │   └── NotFound.jsx        # 404 handler
│   │   ├── services/
│   │   │   └── api.js              # Centralized Axios client with withCredentials
│   │   ├── App.jsx                 # Routing configuration
│   │   ├── index.css               # Tailwind directives, animations & custom scrollbar
│   │   └── main.jsx
│   ├── package.json
│   ├── index.html
│   └── vite.config.js
```

---

## 🚀 Setup & Installation Instructions

### Prerequisites
* **Node.js** (v18.0.0 or higher)
* **npm** (v9.0.0 or higher)
* **MongoDB** (Local instance running at `mongodb://127.0.0.1:27017` or a MongoDB Atlas connection string)
* **Razorpay Test Account** (Free from [dashboard.razorpay.com](https://dashboard.razorpay.com))

---

### 1. Clone the Repository
```bash
git clone https://github.com/satyamshh967/mern-starter.git
cd mern-starter
```

---

### 2. Backend Configuration
1. Navigate to `backend`:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Configure your `.env` file:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/shopkart
   JWT_SECRET=shopkart_super_secret_jwt_key_2026_secure
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   RAZORPAY_KEY_ID=rzp_test_yourKeyIdHere
   RAZORPAY_KEY_SECRET=yourKeySecretHere
   ```
   > 🔒 **Security Notice:** The `.env` file is excluded from Git via `.gitignore`. Never commit API keys or secrets to public repositories.

5. Start the backend server:
   ```bash
   # Development mode with nodemon
   npm run dev

   # Or standard production mode
   npm start
   ```
   *The server runs on **http://localhost:5000** and will automatically seed 30 curated products if the database is empty.*

---

### 3. Frontend Configuration
1. Open a new terminal and navigate to `frontend`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open **http://localhost:5173** in your browser.

---

## 🧪 Automated Testing

The backend includes 5 automated test suites powered by **Jest** and **Supertest** running against an isolated test database (`shopkart_test`):

```bash
cd backend
npm test
```

### Test Results
```text
PASS tests/order.test.js (12 tests)
PASS tests/cart.test.js (20 tests)
PASS tests/wishlist.test.js (14 tests)
PASS tests/customer.test.js (15 tests)
PASS tests/product.test.js (10 tests)

Test Suites: 5 passed, 5 total
Tests:       71 passed, 71 total
Snapshots:   0 total
Time:        19.766 s
```

---

## 📡 API Reference

### 1. Authentication (`/customers`)
| Method | Endpoint | Description | Protected |
|---|---|---|:---:|
| `POST` | `/customers/register` | Register new customer (`fullName`, `email`, `password`, `phone`) | No |
| `POST` | `/customers/login` | Log in customer & issue HttpOnly JWT cookie | No |
| `GET` | `/customers/me` | Fetch authenticated user profile | **Yes** |
| `POST` | `/customers/logout` | Clear cookie session | **Yes** |
| `PATCH` | `/customers/change-password` | Change user password (`oldPassword`, `newPassword`) | **Yes** |

### 2. Product Catalog (`/products`)
| Method | Endpoint | Description | Query Parameters |
|---|---|---|---|
| `GET` | `/products` | Retrieve catalog with search & filtering | `search`, `category`, `sort=price_asc\|price_desc` |
| `GET` | `/products/:id` | Fetch single product by ID | — |
| `POST` | `/products` | Create a new catalog item | — |

### 3. Wishlist (`/wishlist`) — All Protected
| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `GET` | `/wishlist` | Get current user's populated wishlist | 200 |
| `POST` | `/wishlist/:productId` | Add product to wishlist | 200, 400, 409 |
| `DELETE` | `/wishlist/:productId` | Remove product from wishlist | 200, 400, 404 |
| `PATCH` | `/wishlist/:productId/toggle`| 1-click toggle in/out of wishlist | 200, 400, 404 |

### 4. Shopping Cart (`/cart`) — All Protected
| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `GET` | `/cart` | Fetch user's cart populated with products | 200 |
| `POST` | `/cart/:productId` | Add product to cart (or increment quantity) | 200, 400, 404 |
| `PATCH` | `/cart/:productId` | Update item quantity (`{ quantity }`) | 200, 400, 404 |
| `DELETE` | `/cart/:productId` | Remove product from cart | 200, 400, 404 |

### 5. Checkout & Orders (`/orders`) — All Protected
| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `POST` | `/orders/create-payment-order` | Validate cart, snapshot prices & create Razorpay order | 201, 400 |
| `POST` | `/orders/verify-payment` | Verify HMAC-SHA256 signature, mark PAID & clear cart | 200, 400, 403 |
| `GET` | `/orders` | Fetch authenticated user's order history (newest first) | 200 |
| `GET` | `/orders/:id` | Fetch single order details (ownership protected) | 200, 403, 404 |
| `PATCH`| `/orders/:id/status` | Advance delivery status (Bonus Challenge) | 200, 400, 403 |

---

## 💳 Testing Razorpay Payments (Test Mode)

1. Sign in to your test account at [http://localhost:5173](http://localhost:5173).
2. Add products to your cart and navigate to **Checkout**.
3. Fill in the shipping address (10-digit phone number, 6-digit PIN).
4. Click **Pay via Razorpay** to launch the Razorpay Standard Checkout popup.
5. In the Razorpay modal, select **Card**:
   * **Card Number**: `4111 1111 1111 1111`
   * **Expiry**: Any future date (e.g. `12/28`)
   * **CVV**: `123`
   * On the OTP prompt, click **Success** (or enter `123456`).
6. Upon payment verification:
   * Backend cryptographically verifies the HMAC signature.
   * Inventory stock is decremented.
   * The MongoDB cart and Navbar badge reset to `0`.
   * You are redirected to the **Order Confirmation** page.

---

## 🔒 Security Best Practices Implemented

- **No Secrets in Git**: `.env` is strictly ignored by `.gitignore`; only `.env.example` is committed.
- **XSS & CSRF Mitigation**: JWT session tokens are stored in `HttpOnly` cookies.
- **Server-Side Price Ownership**: Cart prices and total amounts are calculated strictly on the backend.
- **Cryptographic Payment Integrity**: HMAC SHA-256 verification prevents fake payment confirmations.
- **IDOR Protection**: All protected resources enforce user ownership (`req.user.id`).

---

## 📝 Submission Checklist

- [x] **GitHub Repository**: Latest code committed and pushed to `main`.
- [x] **Full-Stack Implementation**: Labs 01 to 06 completed and functional.
- [x] **Database Integration**: MongoDB connection with models for Customer, Product, and Order.
- [x] **Setup Documentation**: Complete setup instructions in `README.md`.
- [x] **Security Adherence**: Zero API keys, passwords, or `.env` files pushed to GitHub.
- [x] **Automated Tests**: All 71 unit and integration tests passing.
- [x] **UI & Polish**: Favicon, smooth scrolling, toasts, and micro-interactions active.
