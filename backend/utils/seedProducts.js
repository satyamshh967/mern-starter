require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/product.model");

const sampleProducts = [
  {
    name: "Smart Watch Series 9",
    description: "Always-on Retina display with precision biometric health sensors, fitness tracking, and cellular connectivity.",
    price: 3499,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80",
    stock: 18,
  },
  {
    name: "Wireless Earbuds Pro",
    description: "Active noise cancellation with transparency mode, spatial audio, and wireless charging case with 30-hour battery.",
    price: 2499,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80",
    stock: 25,
  },
  {
    name: "Portable Bluetooth Speaker",
    description: "Rugged waterproof IPX7 wireless speaker with 360-degree room-filling acoustic bass and 24-hour playtime.",
    price: 1999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80",
    stock: 14,
  },
  {
    name: "3-in-1 Fast Wireless Charger",
    description: "Magnetic fast charging dock for smartphone, smartwatch, and wireless earbuds with smart heat-dissipation.",
    price: 1799,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1622445262464-84b1456045b6?auto=format&fit=crop&w=800&q=80",
    stock: 30,
  },
  {
    name: "4K Foldable Camera Drone",
    description: "Ultra-compact quadcopter drone featuring 4K UHD stabilized camera, GPS auto-return, and 35-minute flight time.",
    price: 8999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80",
    stock: 8,
  },
  {
    name: "Noise Cancelling Headphones",
    description: "Flagship over-ear silver headphones with dual active noise canceling, high-fidelity drivers, and plush memory foam.",
    price: 4999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    stock: 22,
  },
  {
    name: "RGB Mechanical Keyboard",
    description: "Compact wireless mechanical keyboard with hot-swappable switches, per-key RGB backlighting, and aluminum chassis.",
    price: 2999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
    stock: 16,
  },
  {
    name: "Smartphone 3-Axis Gimbal",
    description: "Handheld foldable 3-axis stabilizer with AI face tracking, magnetic phone clamp, and cinematic zoom wheel.",
    price: 4499,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=800&q=80",
    stock: 12,
  },
  {
    name: "Urban Minimalist Jacket",
    description: "Water-resistant commuter jacket tailored from breathable performance fabric with concealed tech pockets.",
    price: 2499,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80",
    stock: 20,
  },
  {
    name: "Tech Lifestyle Sneakers",
    description: "Lightweight breathable knit running sneakers with responsive high-energy return cushioning sole.",
    price: 3299,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
    stock: 15,
  },
  {
    name: "Atomic Habits by James Clear",
    description: "An easy and proven way to build good habits and break bad ones. Transform your daily routine with science-backed insights.",
    price: 499,
    category: "Books",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    stock: 45,
  },
  {
    name: "Smart Ambient Desk Lamp",
    description: "Minimalist smart ambient LED table lamp with smartphone app control, scheduling, and 16 million colors.",
    price: 1899,
    category: "Home",
    image: "https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?auto=format&fit=crop&w=800&q=80",
    stock: 19,
  }
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/shopkart";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for seeding...");

    // Remove existing products
    await Product.deleteMany({});
    console.log("Cleared existing products.");

    // Insert updated gadget products
    const inserted = await Product.insertMany(sampleProducts);
    console.log(`Successfully seeded ${inserted.length} high-tech products!`);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding products:", error);
    process.exit(1);
  }
};

seedDB();
