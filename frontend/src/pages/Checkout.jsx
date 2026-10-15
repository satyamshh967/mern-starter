import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { createPaymentOrder, verifyPayment } from "../services/api";
import {
  CreditCard,
  ShieldCheck,
  Truck,
  ArrowLeft,
  Loader2,
  AlertCircle,
  MapPin,
  CheckCircle2,
  HelpCircle,
  Package,
} from "lucide-react";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { cartItems, subtotal, totalItems, clearCart, refreshCart } = useCart();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [pendingPaymentData, setPendingPaymentData] = useState(null);

  // Pre-fill user profile info if available
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.fullName || "",
        phone: prev.phone || user.phone || "",
      }));
    }
  }, [user]);

  // Redirect if not logged in or cart empty
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login?redirect=/checkout");
    }
  }, [user, authLoading, navigate]);

  const validateForm = () => {
    const errs = {};
    if (!formData.fullName.trim()) {
      errs.fullName = "Full name is required";
    }

    const cleanPhone = formData.phone.trim().replace(/[\s\-]/g, "");
    if (!cleanPhone) {
      errs.phone = "Phone number is required";
    } else if (!/^\+?\d{10,13}$/.test(cleanPhone)) {
      errs.phone = "Enter a valid 10-digit phone number";
    }

    if (!formData.addressLine1.trim()) {
      errs.addressLine1 = "Street address is required";
    }

    if (!formData.city.trim()) {
      errs.city = "City is required";
    }

    if (!formData.state.trim()) {
      errs.state = "State is required";
    }

    const pin = formData.pincode.trim();
    if (!pin) {
      errs.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(pin)) {
      errs.pincode = "Pincode must be exactly 6 digits";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) {
      return;
    }

    if (cartItems.length === 0) {
      setServerError("Your cart is empty. Please add items before checking out.");
      return;
    }

    setSubmitting(true);

    try {
      // 1. Call Backend to create ShopKart order & Razorpay order
      const data = await createPaymentOrder({
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        addressLine1: formData.addressLine1.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
      });

      // 2. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();

      // If Razorpay test key is still placeholder or script fails to load,
      // provide test simulation fallback so user can complete order without blocker!
      const isPlaceholderKey =
        !data.key ||
        data.key.includes("placeholder") ||
        data.key === "rzp_test_placeholder";

      if (!scriptLoaded || isPlaceholderKey) {
        setPendingPaymentData(data);
        setShowDemoModal(true);
        setSubmitting(false);
        return;
      }

      // 3. Open Razorpay Checkout Modal
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency || "INR",
        name: "ShopKart",
        description: `Order #${data.shopKartOrderId.slice(-6).toUpperCase()}`,
        order_id: data.razorpayOrderId,
        handler: async function (response) {
          try {
            setVerifying(true);
            const verifyRes = await verifyPayment({
              shopKartOrderId: data.shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            // Payment signature verified! Clear cart in global state
            clearCart();
            await refreshCart();

            // Navigate to Order Success Screen
            navigate(`/order-success/${data.shopKartOrderId}`, {
              state: { order: verifyRes.order },
            });
          } catch (verErr) {
            setServerError(
              verErr.response?.data?.message ||
                "Payment verification failed. Please contact support."
            );
          } finally {
            setVerifying(false);
            setSubmitting(false);
          }
        },
        prefill: {
          name: formData.fullName,
          contact: formData.phone,
          email: user?.email,
        },
        theme: {
          color: "#dc2626", // ShopKart red
        },
        modal: {
          ondismiss: function () {
            setSubmitting(false);
          },
        },
      };

      const paymentObject = new window.Razorpay(options);

      paymentObject.on("payment.failed", function (response) {
        setServerError(
          response.error?.description ||
            "Payment failed. Your cart has not been cleared. Please try again."
        );
        setSubmitting(false);
      });

      paymentObject.open();
    } catch (err) {
      console.error("Checkout initiation error:", err);
      setServerError(
        err.response?.data?.message ||
          "Failed to initiate order. Please verify cart items and stock."
      );
      setSubmitting(false);
    }
  };

  // Simulation handler for local testing when test keys aren't set yet
  const handleSimulatePayment = async (simulateSuccess = true) => {
    if (!pendingPaymentData) return;
    setVerifying(true);
    setShowDemoModal(false);

    try {
      if (simulateSuccess) {
        // Compute expected signature on backend
        const verifyRes = await verifyPayment({
          shopKartOrderId: pendingPaymentData.shopKartOrderId,
          razorpay_order_id: pendingPaymentData.razorpayOrderId,
          razorpay_payment_id: `pay_sim_${Date.now()}`,
          razorpay_signature: "test_mock_valid_signature",
        });

        clearCart();
        await refreshCart();

        navigate(`/order-success/${pendingPaymentData.shopKartOrderId}`, {
          state: { order: verifyRes.order },
        });
      } else {
        setServerError("Payment was cancelled or failed. Your cart is preserved.");
      }
    } catch (err) {
      setServerError(
        err.response?.data?.message || "Simulation payment verification failed."
      );
    } finally {
      setVerifying(false);
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin text-red-600" />
          <span>Verifying credentials...</span>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0 && !submitting && !verifying) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center py-16 px-6 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-md w-full">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-red-50 text-red-600 items-center justify-center mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
            Your cart is empty
          </h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            You cannot checkout with an empty cart. Discover our tech gadgets and add them to your cart.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md shadow-red-600/25"
          >
            <span>Browse Products</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs font-bold text-slate-500">
          <Link
            to="/cart"
            className="flex items-center gap-1 hover:text-red-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Cart</span>
          </Link>
          <span>/</span>
          <span className="text-slate-900">Checkout</span>
        </div>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Checkout & Shipping
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Enter your shipping address and complete your payment securely.
          </p>
        </div>

        {/* Global Error Banner */}
        {serverError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-3 text-xs font-medium">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">Checkout Issue: </span>
              {serverError}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Shipping Details Form (Task 3) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 pb-6 border-b border-slate-100 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Shipping Details
                </h2>
                <p className="text-xs text-slate-400">
                  Where should we dispatch your order?
                </p>
              </div>
            </div>

            <form onSubmit={handlePlaceOrder} className="space-y-4 sm:space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Aarav Sharma"
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none ${
                    errors.fullName
                      ? "border-rose-300 bg-rose-50/30 focus:border-rose-500"
                      : "border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600"
                  }`}
                />
                {errors.fullName && (
                  <p className="mt-1 text-[11px] font-semibold text-rose-600">
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number, e.g. 9876543210"
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none ${
                    errors.phone
                      ? "border-rose-300 bg-rose-50/30 focus:border-rose-500"
                      : "border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600"
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-[11px] font-semibold text-rose-600">
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Address Line */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Address Line <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  placeholder="Flat, House no., Building, Company, Apartment"
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none ${
                    errors.addressLine1
                      ? "border-rose-300 bg-rose-50/30 focus:border-rose-500"
                      : "border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600"
                  }`}
                />
                {errors.addressLine1 && (
                  <p className="mt-1 text-[11px] font-semibold text-rose-600">
                    {errors.addressLine1}
                  </p>
                )}
              </div>

              {/* City and State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Bengaluru"
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none ${
                      errors.city
                        ? "border-rose-300 bg-rose-50/30 focus:border-rose-500"
                        : "border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600"
                    }`}
                  />
                  {errors.city && (
                    <p className="mt-1 text-[11px] font-semibold text-rose-600">
                      {errors.city}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="e.g. Karnataka"
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none ${
                      errors.state
                        ? "border-rose-300 bg-rose-50/30 focus:border-rose-500"
                        : "border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600"
                    }`}
                  />
                  {errors.state && (
                    <p className="mt-1 text-[11px] font-semibold text-rose-600">
                      {errors.state}
                    </p>
                  )}
                </div>
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Pincode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="pincode"
                  maxLength={6}
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="6-digit PIN code, e.g. 560001"
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none ${
                    errors.pincode
                      ? "border-rose-300 bg-rose-50/30 focus:border-rose-500"
                      : "border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600"
                  }`}
                />
                {errors.pincode && (
                  <p className="mt-1 text-[11px] font-semibold text-rose-600">
                    {errors.pincode}
                  </p>
                )}
              </div>

              {/* Submit CTA (Desktop/Mobile) */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting || verifying}
                  className="w-full py-4 px-6 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting || verifying ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>
                        {verifying
                          ? "Verifying Payment Signature..."
                          : "Connecting to Razorpay..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      <span>
                        Pay ₹{subtotal.toLocaleString("en-IN")} via Razorpay
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Order Summary Snapshot (Task 2) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-black text-slate-900 pb-4 border-b border-slate-100 mb-4">
              Order Summary ({totalItems} {totalItems === 1 ? "item" : "items"})
            </h2>

            {/* Cart Items List */}
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-1">
              {cartItems.map((item) => {
                const prod = item.product || {};
                return (
                  <div key={prod._id || item._id} className="py-3 flex items-center gap-3">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-14 h-14 rounded-xl object-contain bg-slate-50 border border-slate-100 p-1 flex-shrink-0"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {prod.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Qty: {item.quantity} × ₹{Number(prod.price).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="text-xs font-black text-slate-900 text-right">
                      ₹{(Number(prod.price || 0) * item.quantity).toLocaleString("en-IN")}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cost Breakdown */}
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Shipping</span>
                <span className="text-emerald-600 font-bold">FREE</span>
              </div>
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Taxes</span>
                <span className="text-slate-400">Included</span>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900">
                  Total Payable
                </span>
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Security Badges */}
            <div className="mt-6 pt-4 border-t border-slate-100 space-y-2.5 text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>HMAC-SHA256 verified Razorpay payment</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>Express courier shipping included</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demo / Sandbox Modal for when keys are placeholder */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">
              Razorpay Test Simulation
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Your backend created order{" "}
              <code className="text-red-600 bg-red-50 px-1 py-0.5 rounded font-mono font-bold">
                {pendingPaymentData?.shopKartOrderId?.slice(-8)}
              </code>{" "}
              for{" "}
              <strong>₹{((pendingPaymentData?.amount || 0) / 100).toLocaleString("en-IN")}</strong>.
              <br />
              Since Razorpay keys are currently in placeholder mode, you can simulate the payment callback directly:
            </p>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => handleSimulatePayment(true)}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simulate Successful Payment (Verify & Clear Cart)</span>
              </button>

              <button
                onClick={() => handleSimulatePayment(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
              >
                Simulate Payment Failure
              </button>

              <button
                onClick={() => setShowDemoModal(false)}
                className="w-full py-2 text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
