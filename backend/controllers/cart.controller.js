const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

// POST /cart/:productId — Add product to cart (or increment quantity if already present)
exports.addToCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const customerId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.stock <= 0) {
      return res.status(400).json({
        success: false,
        message: "Product is out of stock",
      });
    }

    const customer = await Customer.findById(customerId);
    const cartItemIndex = customer.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (cartItemIndex > -1) {
      const newQuantity = customer.cart[cartItemIndex].quantity + 1;
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more units. Available stock is ${product.stock}`,
        });
      }
      customer.cart[cartItemIndex].quantity = newQuantity;
    } else {
      customer.cart.push({
        product: productId,
        quantity: 1,
      });
    }

    await customer.save();
    await customer.populate("cart.product");

    return res.status(200).json({
      success: true,
      message: "Cart updated",
      cart: customer.cart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// GET /cart — Retrieve populated cart for authenticated user
exports.getCart = async (req, res) => {
  try {
    const customerId = req.user._id;
    const customer = await Customer.findById(customerId).populate("cart.product");

    return res.status(200).json({
      success: true,
      cart: customer.cart || [],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// PATCH /cart/:productId — Update quantity for a specific product in cart
exports.updateQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const customerId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    if (
      typeof quantity !== "number" ||
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be an integer of at least 1",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const customer = await Customer.findById(customerId);
    const cartItemIndex = customer.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (cartItemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity exceeds available stock of ${product.stock}`,
      });
    }

    customer.cart[cartItemIndex].quantity = quantity;

    await customer.save();
    await customer.populate("cart.product");

    return res.status(200).json({
      success: true,
      message: "Quantity updated",
      cart: customer.cart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// DELETE /cart/:productId — Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const customerId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    const customer = await Customer.findById(customerId);
    const initialCount = customer.cart.length;

    customer.cart = customer.cart.filter(
      (item) => item.product.toString() !== productId
    );

    if (customer.cart.length === initialCount) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    await customer.save();
    await customer.populate("cart.product");

    return res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart: customer.cart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
