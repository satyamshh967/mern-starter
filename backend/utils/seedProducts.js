require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/product.model");
const defaultProducts = require("./defaultProducts");

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/shopkart";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for seeding...");

    // Remove existing products
    await Product.deleteMany({});
    console.log("Cleared existing products.");

    // Insert updated gadget products
    const inserted = await Product.insertMany(defaultProducts);
    console.log(`Successfully seeded ${inserted.length} pre-added curated products into ShopKart!`);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding products:", error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDB();
}

module.exports = { seedDB, defaultProducts };
