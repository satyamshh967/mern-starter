const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} = require("../controllers/order.controller");

// All order routes require authenticated user
router.use(authMiddleware);

// Checkout and Payment Order creation
router.post("/create-payment-order", createPaymentOrder);
router.post("/", createPaymentOrder); // Alias for standard POST /orders test compatibility

// Payment Verification
router.post("/verify-payment", verifyPayment);

// Order History & Details
router.get("/", getMyOrders);
router.get("/:id", getOrderById);

// Bonus: Status Progression
router.patch("/:id/status", updateOrderStatus);

module.exports = router;
