const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const customerId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID format" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const customer = await Customer.findById(customerId);
    if (customer.wishlist.includes(productId)) {
      return res.status(409).json({ success: false, message: "Product already in wishlist" });
    }

    customer.wishlist.push(productId);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Product added to wishlist",
      wishlist: customer.wishlist,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const customerId = req.user._id;
    const customer = await Customer.findById(customerId).populate("wishlist");

    return res.status(200).json({
      success: true,
      wishlist: customer.wishlist,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const customerId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID format" });
    }

    const customer = await Customer.findById(customerId);
    
    if (!customer.wishlist.includes(productId)) {
      return res.status(404).json({ success: false, message: "Product not found in wishlist" });
    }

    customer.wishlist.pull(productId);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
      wishlist: customer.wishlist,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

exports.toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const customerId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID format" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const customer = await Customer.findById(customerId);
    const index = customer.wishlist.indexOf(productId);
    
    let action = "";
    if (index > -1) {
      customer.wishlist.pull(productId);
      action = "removed";
    } else {
      customer.wishlist.push(productId);
      action = "added";
    }
    
    await customer.save();

    return res.status(200).json({
      success: true,
      action: action,
      wishlist: customer.wishlist,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};
