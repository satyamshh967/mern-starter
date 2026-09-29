const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../index");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/shopkart_test";

let authCookie;
let productId1;
let productId2;

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI);
  }
});

beforeEach(async () => {
  await Customer.deleteMany({});
  await Product.deleteMany({});

  // Create product 1
  const product1 = await Product.create({
    name: "Test Product 1",
    description: "Test Description 1",
    price: 100,
    category: "Test Category",
    image: "test1.jpg",
    stock: 10,
  });
  productId1 = product1._id.toString();

  // Create product 2
  const product2 = await Product.create({
    name: "Test Product 2",
    description: "Test Description 2",
    price: 200,
    category: "Test Category",
    image: "test2.jpg",
    stock: 20,
  });
  productId2 = product2._id.toString();

  // Create customer and login
  const sampleCustomer = {
    fullName: "John Doe",
    email: "john@gmail.com",
    password: "john123",
    phone: "9876543210",
  };
  await request(app).post("/customers/register").send(sampleCustomer);
  const loginRes = await request(app).post("/customers/login").send({
    email: "john@gmail.com",
    password: "john123",
  });
  authCookie = loginRes.headers["set-cookie"];
});

afterAll(async () => {
  await Customer.deleteMany({});
  await Product.deleteMany({});
  await mongoose.connection.close();
});

describe("Lab 04: Wishlist APIs", () => {
  describe("POST /wishlist/:productId", () => {
    it("should add a product to wishlist successfully", async () => {
      const res = await request(app)
        .post(`/wishlist/${productId1}`)
        .set("Cookie", authCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Product added to wishlist");
      expect(res.body.wishlist).toContain(productId1);
    });

    it("should return 409 if product is already in wishlist", async () => {
      await request(app)
        .post(`/wishlist/${productId1}`)
        .set("Cookie", authCookie);

      const res = await request(app)
        .post(`/wishlist/${productId1}`)
        .set("Cookie", authCookie);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Product already in wishlist");
    });

    it("should return 400 for invalid product ID", async () => {
      const res = await request(app)
        .post(`/wishlist/invalid_id`)
        .set("Cookie", authCookie);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 404 if product does not exist", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .post(`/wishlist/${fakeId}`)
        .set("Cookie", authCookie);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("should return 401 if unauthenticated", async () => {
      const res = await request(app).post(`/wishlist/${productId1}`);
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /wishlist", () => {
    it("should return an empty wishlist initially", async () => {
      const res = await request(app)
        .get("/wishlist")
        .set("Cookie", authCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.wishlist).toEqual([]);
    });

    it("should return populated wishlist data", async () => {
      await request(app)
        .post(`/wishlist/${productId1}`)
        .set("Cookie", authCookie);

      const res = await request(app)
        .get("/wishlist")
        .set("Cookie", authCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.wishlist.length).toBe(1);
      expect(res.body.wishlist[0]._id).toBe(productId1);
      expect(res.body.wishlist[0].name).toBe("Test Product 1");
    });

    it("should return 401 if unauthenticated", async () => {
      const res = await request(app).get("/wishlist");
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("DELETE /wishlist/:productId", () => {
    beforeEach(async () => {
      await request(app)
        .post(`/wishlist/${productId1}`)
        .set("Cookie", authCookie);
    });

    it("should remove product from wishlist successfully", async () => {
      const res = await request(app)
        .delete(`/wishlist/${productId1}`)
        .set("Cookie", authCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Product removed from wishlist");
      expect(res.body.wishlist).not.toContain(productId1);
    });

    it("should return 404 if product is not in wishlist", async () => {
      const res = await request(app)
        .delete(`/wishlist/${productId2}`)
        .set("Cookie", authCookie);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("should return 401 if unauthenticated", async () => {
      const res = await request(app).delete(`/wishlist/${productId1}`);
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("PATCH /wishlist/:productId/toggle", () => {
    it("should add product if not in wishlist", async () => {
      const res = await request(app)
        .patch(`/wishlist/${productId1}/toggle`)
        .set("Cookie", authCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.action).toBe("added");
      expect(res.body.wishlist).toContain(productId1);
    });

    it("should remove product if already in wishlist", async () => {
      await request(app)
        .patch(`/wishlist/${productId1}/toggle`)
        .set("Cookie", authCookie);

      const res = await request(app)
        .patch(`/wishlist/${productId1}/toggle`)
        .set("Cookie", authCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.action).toBe("removed");
      expect(res.body.wishlist).not.toContain(productId1);
    });

    it("should return 401 if unauthenticated", async () => {
      const res = await request(app).patch(`/wishlist/${productId1}/toggle`);
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
