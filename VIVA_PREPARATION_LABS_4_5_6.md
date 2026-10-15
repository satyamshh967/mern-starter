# 🎓 ShopKart Engineering Labs 04, 05 & 06 — Comprehensive Viva & Technical Interview Guide

This guide contains every conceptual question, architectural decision, security rule, and common pitfall for **Lab 04 (Wishlist)**, **Lab 05 (Shopping Cart)**, and **Lab 06 (Checkout & Orders)**.

---

## 📑 Table of Contents
1. [Lab 04 — Wishlist System](#-lab-04--wishlist-system)
2. [Lab 05 — Shopping Cart & Global State](#-lab-05--shopping-cart--global-state)
3. [Lab 06 — Checkout, Razorpay & Orders](#-lab-06--checkout-razorpay--orders)
4. [Cross-Cutting Architectural & Security Questions](#-cross-cutting-architectural--security-questions)

---

# 💖 Lab 04 — Wishlist System

### Q1. Why store only `ObjectId` references in the wishlist rather than embedding full product objects?
* **Answer:**
  * **Data Integrity & Synchronization:** Products frequently change—prices fluctuate, descriptions get updated, and items go out of stock. Storing only references (`ObjectId` with `ref: "Product"`) ensures that when the wishlist is populated (`.populate("wishlist")`), the user always receives the **latest, real-time product information**.
  * **Eliminates Redundancy:** Embedding full product copies duplicates data across thousands of user documents in MongoDB and risks stale data.

### Q2. What is the difference between a toggle endpoint and separate add/remove endpoints?
* **Answer:**
  * A toggle endpoint (`PATCH /wishlist/:productId/toggle`) allows the UI (such as a heart icon on product cards) to perform optimistic or 1-click toggling with a single network request. The server determines whether the item already exists in the user's wishlist: if present, it removes it; if absent, it adds it.
  * Having dedicated `POST` and `DELETE` endpoints is also useful for explicit button actions (like a dedicated "Remove" button on the `/wishlist` page).

### Q3. Why does `user.wishlist.includes(productId)` fail in JavaScript when `productId` is from `req.params`?
* **Answer:**
  * In Mongoose, array elements in `user.wishlist` are instances of `mongoose.Types.ObjectId`.
  * `req.params.productId` is a JavaScript primitive `string`.
  * JavaScript’s `Array.prototype.includes()` uses strict equality (`===`). Comparing an `ObjectId` object with a `string` always returns `false` (`new ObjectId(...) === "string"` is `false`).
  * **Fix:** Use `.some(id => id.toString() === productId)` or `user.wishlist.some(id => id.equals(productId))`.

### Q4. How does Mongoose `.populate()` work behind the scenes?
* **Answer:**
  * MongoDB is non-relational and does not have native SQL `JOIN`s.
  * When you run `Customer.findById(userId).populate("wishlist")`, Mongoose executes the primary query to fetch the customer, inspects the `wishlist` array of `ObjectId`s, and automatically issues a second batch query (`Product.find({ _id: { $in: wishlistIds } })`) behind the scenes to substitute the references with the actual documents.

### Q5. Why should wishlist endpoints never accept `userId` in `req.body` or `req.params`?
* **Answer:**
  * To prevent **IDOR (Insecure Direct Object Reference)** vulnerabilities.
  * If the API accepted `userId` from the client, any logged-in user could view or alter another customer's wishlist by tampering with the ID. Instead, the user identity is extracted securely from the validated JWT token (`req.user.id`).

---

# 🛒 Lab 05 — Shopping Cart & Global State

### Q1. How does the Cart data model fundamentally differ from the Wishlist data model?
* **Answer:**
  * **Wishlist:** Tracks long-term interest ("What do I like?"). Needs only a product reference (`ObjectId`).
  * **Cart:** Tracks immediate purchase intent ("What am I buying right now, and how many?"). It requires a quantity:
    ```js
    cart: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, default: 1, min: 1 }
      }
    ]
    ```

### Q2. How do you prevent duplicate cart rows when a user adds the same product again?
* **Answer:**
  * When `POST /cart/:productId` is called, the backend searches the user's cart array:
    * If the product is not present: push a new object with `quantity = 1`.
    * If already present: increment the existing item's `quantity` by 1 (after verifying the new quantity does not exceed product stock).

### Q3. What is "Derived State" in React, and why should `subtotal` and `cartCount` not be saved in separate `useState` variables?
* **Answer:**
  * **Derived State** is data that can be computed synchronously from existing state during render.
  * If `subtotal` or `cartCount` were kept in independent `useState` variables, every cart mutation (add, delete, quantity change) would require updating 3 separate states. This introduces synchronization bugs and extra re-renders.
  * By computing them with `useMemo`:
    ```jsx
    const cartCount = useMemo(() => cartItems.reduce((acc, item) => acc + item.quantity, 0), [cartItems]);
    const subtotal = useMemo(() => cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0), [cartItems]);
    ```
    `cartCount` and `subtotal` are guaranteed to remain 100% synchronized with `cartItems` at all times (Single Source of Truth).

### Q4. Where should stock limits be enforced: frontend, backend, or both?
* **Answer:**
  * **Both, but the backend is the authoritative gatekeeper.**
  * The frontend disables the `+` button when `quantity === product.stock` for a responsive user experience.
  * The backend **must** always query `Product.findById(productId)` and verify `newQuantity <= product.stock` before saving. A user could bypass frontend UI controls using curl or Postman.

### Q5. Why was a global state management solution (`CartContext`) required in Lab 05?
* **Answer:**
  * Cart state is shared across completely disconnected components across the application tree:
    * Navbar needs live `cartCount` badge.
    * Product Card needs add-to-cart status.
    * Cart Page needs full item list and quantity controls.
    * Checkout needs subtotal and items.
  * Without Context, you would have to pass state and handlers down through dozens of layers of props ("prop drilling"), which is brittle and unmaintainable.

---

# 💳 Lab 06 — Checkout, Razorpay & Orders

### Q1. Why does the `Order` model snapshot product `name`, `price`, and `image` instead of just referencing `product`?
* **Answer:**
  * **Immutability of Financial Records:** A product's price, title, or image may change in the future, or the product might be deleted altogether.
  * If the order only stored references, looking at an order from 6 months ago would display current prices rather than what the customer agreed to pay at the time of purchase. An order is a permanent, immutable legal contract snapshot.

### Q2. Why should the backend NEVER trust `totalAmount` sent from the frontend?
* **Answer:**
  * Any client-side data can be intercepted and manipulated (via browser DevTools, proxies like BurpSuite, or direct API calls).
  * If the server trusted `req.body.totalAmount`, an attacker could buy a ₹1,00,000 laptop for ₹1.
  * **Rule:** The server must calculate `totalAmount = sum(latestProduct.price * cartItem.quantity)` directly from database records.

### Q3. Why must the Razorpay Order be created on the backend?
* **Answer:**
  * The backend verifies cart items and stock, calculates the true rupee total, converts it to paise, and tells Razorpay's servers: *"Create an order for exactly ₹X"*.
  * Razorpay returns a signed `razorpay_order_id`. When the frontend opens Checkout, it passes this ID. Razorpay prevents the client from paying anything other than the exact amount locked in by the backend.

### Q4. Why is `RAZORPAY_KEY_SECRET` never sent to React or committed to GitHub?
* **Answer:**
  * The `Key Secret` is the private key used to generate and verify HMAC SHA-256 cryptographic signatures.
  * If exposed to the client, an attacker could forge signatures and mark any pending order as "PAID" without making a payment.

### Q5. Why does Razorpay expect amounts in paise (INR * 100)?
* **Answer:**
  * In computer software, floating-point numbers (`0.1 + 0.2 = 0.30000000000000004`) cause rounding and precision errors.
  * Financial payment gateways work strictly with integers in the smallest currency unit (1 Rupee = 100 paise; ₹2,999 = 299900 paise).

### Q6. What are `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature`?
* **Answer:**
  * `razorpay_order_id`: The ID created on the backend when initiating the purchase.
  * `razorpay_payment_id`: The unique transaction ID generated by Razorpay when payment completes.
  * `razorpay_signature`: An HMAC SHA-256 hash generated by Razorpay's servers using your `RAZORPAY_KEY_SECRET` over `${razorpay_order_id}|${razorpay_payment_id}`.

### Q7. How does the backend verify the payment signature, and why is it mandatory?
* **Answer:**
  * The backend recreates the HMAC hash using its own secret:
    ```js
    const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${order.razorpayOrderId}|${razorpay_payment_id}`)
      .digest("hex");
    ```
  * If `expected === razorpay_signature`, the payment is authentic.
  * It is mandatory because a client could easily invoke the verification API with fake data or a simple `paymentSuccess: true`. The signature guarantees Razorpay actually processed the funds.

### Q8. Why should the cart NOT be cleared when Checkout opens or if payment fails?
* **Answer:**
  * Merely opening Checkout is not a completed purchase; users frequently abandon the payment modal, experience network drops, or face bank OTP declines.
  * If the cart were cleared before verification, the customer would lose their selections. The cart is cleared **only after** `verifyPayment` confirms a valid signature.

### Q9. How is order ownership enforced in `GET /orders/:id`?
* **Answer:**
  * After fetching the order by ID, check:
    ```js
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    ```
  * This prevents users from accessing other customers' receipts, shipping addresses, or order histories by guessing MongoDB ObjectIds.

---

# 🛡️ Cross-Cutting Architectural & Security Questions

| Topic | Key Principle |
|---|---|
| **Authentication** | Handled via JWT in HttpOnly cookies (`req.cookies.token`), verified by `authMiddleware`. Prevents XSS token theft. |
| **Stock Race Conditions** | Final stock must be checked again at checkout because inventory can change between the moment an item is added to cart and when the order is placed. |
| **Inventory Decrement** | Decrement product stock (`$inc: { stock: -quantity }`) **only** when payment is confirmed. |
| **Error Handling** | Always return meaningful HTTP status codes: `400` (Validation), `401` (Unauthenticated), `403` (Forbidden/Ownership), `404` (Not Found), `500` (Server Error). |
