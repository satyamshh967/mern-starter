const request = require("supertest");
const mongoose = require("mongoose");
const crypto = require("crypto");
const app = require("../index");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");

const MONGO_URI = process.env.TEST_MONGO_URI || "mongodb://127.0.0.1:27017/shopkart_test";

let authCookie;
let otherUserCookie;
let product1Id;
let product2Id;
let outOfStockId;

const validShippingAddress = {
  fullName: "Aarav Sharma",
  phone: "9876543210",
  addressLine1: "22 MG Road, Koramangala",
  city: "Bengaluru",
  state: "Karnataka",
  pincode: "560001",
};

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI);
  }
});

beforeEach(async () => {
  await Customer.deleteMany({});
  await Product.deleteMany({});
  await Order.deleteMany({});

  // Product 1
  const p1 = await Product.create({
    name: "Mechanical Keyboard",
    description: "RGB Mechanical Gaming Keyboard",
    price: 2999,
    category: "Electronics",
    image: "https://example.com/keyboard.jpg",
    stock: 5,
  });
  product1Id = p1._id.toString();

  // Product 2
  const p2 = await Product.create({
    name: "Wireless Mouse",
    description: "High Precision Mouse",
    price: 1499,
    category: "Electronics",
    image: "https://example.com/mouse.jpg",
    stock: 2,
  });
  product2Id = p2._id.toString();

  // Out of stock product
  const p3 = await Product.create({
    name: "Sold Out Headset",
    description: "Studio Headset",
    price: 4999,
    category: "Electronics",
    image: "https://example.com/headset.jpg",
    stock: 0,
  });
  outOfStockId = p3._id.toString();

  // Register and login main test user
  await request(app).post("/customers/register").send({
    fullName: "Order Tester",
    email: "ordertester@example.com",
    password: "password123",
    phone: "9876543210",
  });
  const loginRes = await request(app).post("/customers/login").send({
    email: "ordertester@example.com",
    password: "password123",
  });
  authCookie = loginRes.headers["set-cookie"];

  // Register and login second user (for ownership tests)
  await request(app).post("/customers/register").send({
    fullName: "Other Customer",
    email: "other@example.com",
    password: "password123",
    phone: "9123456789",
  });
  const otherLoginRes = await request(app).post("/customers/login").send({
    email: "other@example.com",
    password: "password123",
  });
  otherUserCookie = otherLoginRes.headers["set-cookie"];
});

afterAll(async () => {
  await Customer.deleteMany({});
  await Product.deleteMany({});
  await Order.deleteMany({});
  await mongoose.connection.close();
});

describe("Lab 06: Checkout & Orders APIs", () => {
  describe("POST /orders/create-payment-order (and POST /orders)", () => {
    it("should reject order if user is not authenticated (401)", async () => {
      const res = await request(app)
        .post("/orders/create-payment-order")
        .send({ shippingAddress: validShippingAddress });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should reject order creation if cart is empty (400)", async () => {
      const res = await request(app)
        .post("/orders/create-payment-order")
        .set("Cookie", authCookie)
        .send({ shippingAddress: validShippingAddress });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/cart is empty/i);
    });

    it("should validate shipping address fields (400)", async () => {
      // Add product to cart first
      await request(app).post(`/cart/${product1Id}`).set("Cookie", authCookie);

      // Missing shippingAddress object
      const res1 = await request(app)
        .post("/orders/create-payment-order")
        .set("Cookie", authCookie)
        .send({});
      expect(res1.status).toBe(400);

      // Invalid pincode (not 6 digits)
      const res2 = await request(app)
        .post("/orders/create-payment-order")
        .set("Cookie", authCookie)
        .send({
          shippingAddress: { ...validShippingAddress, pincode: "123" },
        });
      expect(res2.status).toBe(400);
      expect(res2.body.message).toMatch(/6 digits/i);

      // Invalid phone
      const res3 = await request(app)
        .post("/orders/create-payment-order")
        .set("Cookie", authCookie)
        .send({
          shippingAddress: { ...validShippingAddress, phone: "abc" },
        });
      expect(res3.status).toBe(400);
    });

    it("should verify stock and reject if stock is insufficient (400)", async () => {
      // Add product 2 (stock = 2)
      await request(app).post(`/cart/${product2Id}`).set("Cookie", authCookie);
      // Increase quantity to 2
      await request(app).post(`/cart/${product2Id}`).set("Cookie", authCookie);

      // Simulate stock reduced in database to 1 by another purchase
      await Product.findByIdAndUpdate(product2Id, { stock: 1 });

      const res = await request(app)
        .post("/orders/create-payment-order")
        .set("Cookie", authCookie)
        .send({ shippingAddress: validShippingAddress });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/insufficient stock/i);
    });

    it("should create ShopKart pending order and Razorpay order, ignoring client totalAmount", async () => {
      // Add keyboard (2999) and mouse (1499)
      await request(app).post(`/cart/${product1Id}`).set("Cookie", authCookie);
      await request(app).post(`/cart/${product2Id}`).set("Cookie", authCookie);

      const fakeClientTotal = 1; // client trying to manipulate price
      const res = await request(app)
        .post("/orders/create-payment-order")
        .set("Cookie", authCookie)
        .send({
          shippingAddress: validShippingAddress,
          totalAmount: fakeClientTotal,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.shopKartOrderId).toBeDefined();
      expect(res.body.razorpayOrderId).toBeDefined();

      // Expected total: 2999 + 1499 = 4498 INR -> 449800 paise
      expect(res.body.amount).toBe(449800);
      expect(res.body.currency).toBe("INR");

      // Verify order snapshot in database
      const order = await Order.findById(res.body.shopKartOrderId);
      expect(order).not.toBeNull();
      expect(order.totalAmount).toBe(4498);
      expect(order.status).toBe("PENDING_PAYMENT");
      expect(order.paymentStatus).toBe("PENDING");
      expect(order.items.length).toBe(2);
      expect(order.items[0].name).toBe("Mechanical Keyboard");
      expect(order.items[0].price).toBe(2999);
    });

    it("should keep cart items before payment verification", async () => {
      await request(app).post(`/cart/${product1Id}`).set("Cookie", authCookie);

      await request(app)
        .post("/orders/create-payment-order")
        .set("Cookie", authCookie)
        .send({ shippingAddress: validShippingAddress });

      // Check cart
      const cartRes = await request(app).get("/cart").set("Cookie", authCookie);
      expect(cartRes.status).toBe(200);
      expect(cartRes.body.cart.length).toBe(1);
    });
  });

  describe("POST /orders/verify-payment", () => {
    let testOrder;
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "rzp_secret_placeholder";

    beforeEach(async () => {
      await request(app).post(`/cart/${product1Id}`).set("Cookie", authCookie);
      const res = await request(app)
        .post("/orders/create-payment-order")
        .set("Cookie", authCookie)
        .send({ shippingAddress: validShippingAddress });

      testOrder = res.body;
    });

    it("should reject verification with invalid signature (400) and keep cart intact", async () => {
      const res = await request(app)
        .post("/orders/verify-payment")
        .set("Cookie", authCookie)
        .send({
          shopKartOrderId: testOrder.shopKartOrderId,
          razorpay_order_id: testOrder.razorpayOrderId,
          razorpay_payment_id: "pay_fake123",
          razorpay_signature: "invalid_signature_hash",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid payment signature/i);

      // Verify cart still has items
      const cartRes = await request(app).get("/cart").set("Cookie", authCookie);
      expect(cartRes.body.cart.length).toBe(1);

      // Verify order is not marked paid
      const order = await Order.findById(testOrder.shopKartOrderId);
      expect(order.paymentStatus).toBe("FAILED");
      expect(order.status).toBe("PENDING_PAYMENT");
    });

    it("should successfully verify payment with valid HMAC signature, mark PAID, decrement stock and clear cart", async () => {
      const fakePaymentId = "pay_testValid123456";
      const payload = `${testOrder.razorpayOrderId}|${fakePaymentId}`;
      const validSignature = crypto
        .createHmac("sha256", keySecret)
        .update(payload)
        .digest("hex");

      const stockBefore = (await Product.findById(product1Id)).stock;

      const res = await request(app)
        .post("/orders/verify-payment")
        .set("Cookie", authCookie)
        .send({
          shopKartOrderId: testOrder.shopKartOrderId,
          razorpay_order_id: testOrder.razorpayOrderId,
          razorpay_payment_id: fakePaymentId,
          razorpay_signature: validSignature,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.order.paymentStatus).toBe("PAID");
      expect(res.body.order.status).toBe("PLACED");

      // Verify cart is cleared
      const cartRes = await request(app).get("/cart").set("Cookie", authCookie);
      expect(cartRes.body.cart.length).toBe(0);

      // Verify stock decremented by 1
      const stockAfter = (await Product.findById(product1Id)).stock;
      expect(stockAfter).toBe(stockBefore - 1);
    });
  });

  describe("GET /orders and GET /orders/:id", () => {
    let orderId;

    beforeEach(async () => {
      await request(app).post(`/cart/${product1Id}`).set("Cookie", authCookie);
      const res = await request(app)
        .post("/orders/create-payment-order")
        .set("Cookie", authCookie)
        .send({ shippingAddress: validShippingAddress });

      orderId = res.body.shopKartOrderId;
    });

    it("should get user orders sorted newest first", async () => {
      const res = await request(app).get("/orders").set("Cookie", authCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.orders)).toBe(true);
      expect(res.body.orders.length).toBe(1);
      expect(res.body.orders[0]._id).toBe(orderId);
    });

    it("should fetch a specific order by ID", async () => {
      const res = await request(app)
        .get(`/orders/${orderId}`)
        .set("Cookie", authCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.order._id).toBe(orderId);
      expect(res.body.order.shippingAddress.fullName).toBe("Aarav Sharma");
    });

    it("should prevent a user from accessing another user's order (403)", async () => {
      const res = await request(app)
        .get(`/orders/${orderId}`)
        .set("Cookie", otherUserCookie);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("should update order status progression (Bonus Challenge)", async () => {
      const res = await request(app)
        .patch(`/orders/${orderId}/status`)
        .set("Cookie", authCookie)
        .send({ status: "CONFIRMED" });

      expect(res.status).toBe(200);
      expect(res.body.order.status).toBe("CONFIRMED");
    });
  });
});
