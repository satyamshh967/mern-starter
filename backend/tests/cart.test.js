const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../index");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/shopkart_test";

let authCookie;
let productId1;
let productId2;
let outOfStockId;

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI);
  }
});

beforeEach(async () => {
  await Customer.deleteMany({});
  await Product.deleteMany({});

  // Product 1 with stock 5
  const product1 = await Product.create({
    name: "Mechanical Keyboard",
    description: "RGB Mechanical Keyboard",
    price: 2999,
    category: "Electronics",
    image: "keyboard.jpg",
    stock: 5,
  });
  productId1 = product1._id.toString();

  // Product 2 with stock 2 (for stock limit testing)
  const product2 = await Product.create({
    name: "Wireless Mouse",
    description: "Ergonomic Mouse",
    price: 1499,
    category: "Electronics",
    image: "mouse.jpg",
    stock: 2,
  });
  productId2 = product2._id.toString();

  // Out of stock product
  const product3 = await Product.create({
    name: "Sold Out Headset",
    description: "Studio Headset",
    price: 4999,
    category: "Electronics",
    image: "headset.jpg",
    stock: 0,
  });
  outOfStockId = product3._id.toString();

  // Register and login customer
  const sampleCustomer = {
    fullName: "Cart Tester",
    email: "cartuser@example.com",
    password: "password123",
    phone: "9876543210",
  };
  await request(app).post("/customers/register").send(sampleCustomer);
  const loginRes = await request(app).post("/customers/login").send({
    email: "cartuser@example.com",
    password: "password123",
  });
  authCookie = loginRes.headers["set-cookie"];
});

afterAll(async () => {
  await Customer.deleteMany({});
  await Product.deleteMany({});
  await mongoose.connection.close();
});

describe("Lab 05: Shopping Cart APIs", () => {
  describe("POST /cart/:productId", () => {
    it("should add a product to cart with quantity 1", async () => {
      const res = await request(app)
        .post(`/cart/${productId1}`)
        .set("Cookie", authCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.cart.length).toBe(1);
      expect(res.body.cart[0].product._id).toBe(productId1);
      expect(res.body.cart[0].quantity).toBe(1);
    });

    it("should increase quantity when adding the same product again", async () => {
      await request(app)
        .post(`/cart/${productId1}`)
        .set("Cookie", authCookie);

      const res = await request(app)
        .post(`/cart/${productId1}`)
        .set("Cookie", authCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.cart.length).toBe(1);
      expect(res.body.cart[0].quantity).toBe(2);
    });

    it("should reject adding product when out of stock", async () => {
      const res = await request(app)
        .post(`/cart/${outOfStockId}`)
        .set("Cookie", authCookie);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/out of stock/i);
    });

    it("should reject increasing quantity beyond available stock", async () => {
      // productId2 has stock: 2
      await request(app).post(`/cart/${productId2}`).set("Cookie", authCookie); // quantity = 1
      await request(app).post(`/cart/${productId2}`).set("Cookie", authCookie); // quantity = 2

      // Third add should exceed stock
      const res = await request(app)
        .post(`/cart/${productId2}`)
        .set("Cookie", authCookie);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/stock/i);
    });

    it("should return 400 for invalid product ID format", async () => {
      const res = await request(app)
        .post("/cart/invalid-id-123")
        .set("Cookie", authCookie);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 404 if product does not exist", async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .post(`/cart/${nonExistentId}`)
        .set("Cookie", authCookie);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("should return 401 if unauthenticated", async () => {
      const res = await request(app).post(`/cart/${productId1}`);
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /cart", () => {
    it("should return empty cart initially", async () => {
      const res = await request(app)
        .get("/cart")
        .set("Cookie", authCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.cart).toEqual([]);
    });

    it("should return populated cart items with product details", async () => {
      await request(app).post(`/cart/${productId1}`).set("Cookie", authCookie);

      const res = await request(app)
        .get("/cart")
        .set("Cookie", authCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.cart.length).toBe(1);
      expect(res.body.cart[0].product.name).toBe("Mechanical Keyboard");
      expect(res.body.cart[0].product.price).toBe(2999);
      expect(res.body.cart[0].quantity).toBe(1);
    });

    it("should return 401 if unauthenticated", async () => {
      const res = await request(app).get("/cart");
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("PATCH /cart/:productId", () => {
    beforeEach(async () => {
      await request(app).post(`/cart/${productId1}`).set("Cookie", authCookie);
    });

    it("should update quantity successfully", async () => {
      const res = await request(app)
        .patch(`/cart/${productId1}`)
        .set("Cookie", authCookie)
        .send({ quantity: 4 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.cart[0].quantity).toBe(4);
    });

    it("should reject quantity less than 1", async () => {
      const res = await request(app)
        .patch(`/cart/${productId1}`)
        .set("Cookie", authCookie)
        .send({ quantity: 0 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject quantity exceeding stock", async () => {
      // productId1 has stock 5
      const res = await request(app)
        .patch(`/cart/${productId1}`)
        .set("Cookie", authCookie)
        .send({ quantity: 10 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/stock/i);
    });

    it("should return 404 if product is not in cart", async () => {
      const res = await request(app)
        .patch(`/cart/${productId2}`)
        .set("Cookie", authCookie)
        .send({ quantity: 1 });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 for invalid product ID", async () => {
      const res = await request(app)
        .patch("/cart/invalid-id")
        .set("Cookie", authCookie)
        .send({ quantity: 2 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 401 if unauthenticated", async () => {
      const res = await request(app)
        .patch(`/cart/${productId1}`)
        .send({ quantity: 2 });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("DELETE /cart/:productId", () => {
    beforeEach(async () => {
      await request(app).post(`/cart/${productId1}`).set("Cookie", authCookie);
    });

    it("should remove product from cart successfully", async () => {
      const res = await request(app)
        .delete(`/cart/${productId1}`)
        .set("Cookie", authCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Product removed from cart");
      expect(res.body.cart).toEqual([]);
    });

    it("should return 404 if product is not in cart", async () => {
      const res = await request(app)
        .delete(`/cart/${productId2}`)
        .set("Cookie", authCookie);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 for invalid product ID", async () => {
      const res = await request(app)
        .delete("/cart/invalid-id")
        .set("Cookie", authCookie);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 401 if unauthenticated", async () => {
      const res = await request(app).delete(`/cart/${productId1}`);
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
