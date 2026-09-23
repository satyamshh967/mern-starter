# ShopKart — Fullstack E-Commerce Platform

A modern, fullstack e-commerce web application featuring secure customer authentication with JWT and HttpOnly cookies, responsive product catalog discovery, category filtering, search, and detailed product views.

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

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Security & Tokens**: bcrypt, jsonwebtoken, cookie-parser, cors, dotenv
- **Testing**: Jest, Supertest

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router DOM (v6)
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
│   │   └── product.controller.js   # Product creation, listing, search, filtering
│   ├── models/
│   │   ├── customer.model.js       # Customer schema & validations
│   │   └── product.model.js        # Product schema & validations
│   ├── routes/
│   │   ├── customer.routes.js      # /customers endpoints
│   │   └── product.routes.js       # /products endpoints
│   ├── middlewares/
│   │   └── auth.middleware.js      # JWT cookie verification middleware
│   ├── utils/
│   │   ├── generateToken.js        # Signs JWT tokens
│   │   └── seedProducts.js         # Mock product seeder
│   ├── tests/
│   │   ├── customer.test.js        # Authentication test suite
│   │   └── product.test.js         # Product API test suite
│   ├── index.js                    # Express app entrypoint & MongoDB connection
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Top navigation & user session badge
│   │   │   ├── ProductCard.jsx     # Product card display
│   │   │   └── SearchBar.jsx       # Search input, category dropdown & sort selector
│   │   ├── pages/
│   │   │   ├── Register.jsx        # Account registration page
│   │   │   ├── Login.jsx           # User login page
│   │   │   ├── Home.jsx            # Protected customer dashboard
│   │   │   ├── Products.jsx        # Product discovery catalog
│   │   │   └── ProductDetails.jsx  # Single product details view
│   │   ├── services/
│   │   │   └── api.js              # Centralized Axios API client
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # React context for global auth state
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

#### Sample Register Request
```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword123",
  "phone": "9876543210"
}
```

#### Sample Login Request
```json
{
  "email": "jane@example.com",
  "password": "securepassword123"
}
```

---

### Product Catalog (`/products`)

| Method | Endpoint | Description | Query Parameters |
|---|---|---|---|
| `POST` | `/products` | Create a new product | — |
| `GET` | `/products` | Retrieve catalog with optional search & filters | `search`, `category`, `sort=price_asc\|price_desc` |
| `GET` | `/products/:id` | Retrieve single product by MongoDB ID | — |

#### Sample Create Product Request
```json
{
  "name": "Mechanical Keyboard",
  "description": "RGB backlit mechanical keyboard with blue switches.",
  "price": 2999,
  "category": "Electronics",
  "image": "https://example.com/keyboard.jpg",
  "stock": 10
}
```

---

## 🧪 Testing

The backend includes a comprehensive Jest and Supertest suite:

```bash
cd backend
npm test
```

All 25 test cases run against a local test database and validate registration, bcrypt hashing, cookie generation, route protection, search, filtering, and error handling.
