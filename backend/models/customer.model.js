const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Full name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  cart: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
        min: [1, "Quantity cannot be less than 1"],
      },
    },
  ],
});

const Customer = mongoose.models.Customer || mongoose.model("Customer", customerSchema);
if (!mongoose.models.User) {
  try {
    mongoose.model("User", customerSchema);
  } catch (e) {
    throw new Error("Couldn't Load");
    
  }
}

module.exports = Customer;
