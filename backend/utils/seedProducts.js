require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/product.model");

const sampleProducts = [
  {
    name: "Mechanical Keyboard",
    description: "RGB backlit mechanical keyboard with tactile blue switches, durable aluminum top frame, and detachable USB-C braided cable.",
    price: 2999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
    stock: 15,
  },
  {
    name: "Noise Cancelling Headphones",
    description: "Wireless over-ear headphones with advanced active noise cancellation, 30-hour battery life, and crystal-clear microphone for calls.",
    price: 4999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    stock: 25,
  },
  {
    name: "Ultra-Light Gaming Mouse",
    description: "Ergonomic gaming mouse with 16,000 DPI optical sensor, lightweight honeycomb design, and customizable RGB lighting.",
    price: 1499,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80",
    stock: 40,
  },
  {
    name: "Classic Denim Jacket",
    description: "Timeless vintage wash denim jacket made from 100% premium organic cotton. Features dual chest pockets and buttoned cuffs.",
    price: 2499,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80",
    stock: 20,
  },
  {
    name: "Minimalist Leather Sneakers",
    description: "Clean low-top handcrafted sneakers with genuine full-grain leather upper, cushioned memory foam insole, and vulcanized rubber sole.",
    price: 3299,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
    stock: 12,
  },
  {
    name: "Polarized Aviator Sunglasses",
    description: "Classic metal aviator sunglasses with UV400 polarized scratch-resistant lenses for exceptional clarity and eye protection.",
    price: 999,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
    stock: 35,
  },
  {
    name: "Atomic Habits by James Clear",
    description: "An easy and proven way to build good habits and break bad ones. Transform your habits and unlock your true potential.",
    price: 499,
    category: "Books",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    stock: 50,
  },
  {
    name: "Clean Code by Robert C. Martin",
    description: "A handbook of agile software craftsmanship. Learn principles, patterns, and practices of writing clean, maintainable code.",
    price: 899,
    category: "Books",
    image: "https://images.unsplash.com/photo-1532012164546-f432f2e37b73?auto=format&fit=crop&w=800&q=80",
    stock: 18,
  },
  {
    name: "Ceramic Pour-Over Coffee Dripper",
    description: "Artisan handcrafted ceramic coffee dripper designed for precision pour-over brewing, enhancing nuanced coffee flavor notes.",
    price: 799,
    category: "Home",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
    stock: 22,
  },
  {
    name: "Smart LED Desk Lamp",
    description: "Dimmable LED desk lamp with touch controls, wireless phone charging base, multiple color temperature modes, and timer.",
    price: 1899,
    category: "Home",
    image: "https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?auto=format&fit=crop&w=800&q=80",
    stock: 14,
  }
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/shopkart";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for seeding...");

    // Remove existing products to avoid duplicates
    await Product.deleteMany({});
    console.log("Cleared existing products.");

    // Insert sample products
    const inserted = await Product.insertMany(sampleProducts);
    console.log(`Successfully seeded ${inserted.length} products!`);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding products:", error);
    process.exit(1);
  }
};

seedDB();
