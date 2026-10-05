import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Loader2,
  ShieldCheck,
  Truck,
  CheckCircle2,
} from "lucide-react";

const Cart = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const {
    cartItems,
    loading: cartLoading,
    error: cartError,
    cartCount,
    subtotal,
    totalItems,
    updateQuantity,
    removeFromCart,
    refreshCart,
  } = useCart();

  const [itemProcessing, setItemProcessing] = useState({}); // { [productId]: "updating" | "removing" }
  const [actionError, setActionError] = useState(null);
  const [checkoutNotice, setCheckoutNotice] = useState(false);

  // Handle quantity changes
  const handleQuantityChange = async (productId, currentQty, delta, stock) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    if (newQty > stock) {
      setActionError(`Cannot add more. Only ${stock} units in stock.`);
      setTimeout(() => setActionError(null), 3000);
      return;
    }

    setItemProcessing((prev) => ({ ...prev, [productId]: "updating" }));
    setActionError(null);
    try {
      await updateQuantity(productId, newQty);
    } catch (err) {
      setActionError(err.message || "Failed to update quantity.");
      setTimeout(() => setActionError(null), 3000);
    } finally {
      setItemProcessing((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    }
  };

  // Handle remove item
  const handleRemove = async (productId) => {
    setItemProcessing((prev) => ({ ...prev, [productId]: "removing" }));
    setActionError(null);
    try {
      await removeFromCart(productId);
    } catch (err) {
      setActionError(err.message || "Failed to remove item.");
      setTimeout(() => setActionError(null), 3000);
    } finally {
      setItemProcessing((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    }
  };

  const handleProceedToCheckout = () => {
    setCheckoutNotice(true);
    setTimeout(() => setCheckoutNotice(false), 4000);
  };

  // Auth Loading Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
          <RefreshCw className="w-5 h-5 animate-spin text-red-600" />
          <span>Verifying authentication...</span>
        </div>
      </div>
    );
  }

  // Not Logged In State
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center py-16 px-6 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-md w-full">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-red-50 text-red-600 items-center justify-center mb-4">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
            Sign in to view your cart
          </h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Your shopping cart is safely saved in your account. Log in or create an account to start shopping.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              to="/login"
              className="px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md shadow-red-600/25"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Header Banner */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-red-500/25">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Shopping Cart
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Review your items, adjust quantities, and get ready for checkout.
              </p>
            </div>

            {!cartLoading && !cartError && cartItems.length > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-full text-xs font-bold border border-red-100">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                <span>
                  {cartCount} {cartCount === 1 ? "unit" : "units"} ({totalItems}{" "}
                  {totalItems === 1 ? "product" : "products"})
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Action Error Banner */}
        {actionError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-3 animate-in">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Checkout Preview Banner */}
        {checkoutNotice && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-3 animate-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-bold">Cart is verified and ready for checkout!</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Full checkout & payment processing arriving in Lab 06.
              </p>
            </div>
          </div>
        )}

        {/* State 1: Loading State (Task 17) */}
        {cartLoading ? (
          <div>
            <div className="flex items-center justify-center py-6 text-sm font-bold text-slate-500 gap-2 mb-6">
              <RefreshCw className="w-4 h-4 animate-spin text-red-600" />
              <span>Loading your cart...</span>
            </div>
            <div className="space-y-4 max-w-4xl mx-auto">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl border border-slate-100 p-6 animate-pulse flex flex-col sm:flex-row items-center gap-6"
                >
                  <div className="w-24 h-24 bg-slate-100 rounded-2xl flex-shrink-0"></div>
                  <div className="flex-1 space-y-2.5 w-full">
                    <div className="h-4 bg-slate-100 rounded w-2/3"></div>
                    <div className="h-3 bg-slate-50 rounded w-1/3"></div>
                    <div className="h-5 bg-slate-100 rounded w-1/4 mt-2"></div>
                  </div>
                  <div className="w-28 h-10 bg-slate-100 rounded-xl"></div>
                </div>
              ))}
            </div>
          </div>
        ) : cartError ? (
          /* State 2: Error State (Task 17) */
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-rose-100 shadow-sm max-w-lg mx-auto">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-rose-50 items-center justify-center text-rose-600 mb-4">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Unable to load your cart.
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
              {cartError}
            </p>
            <button
              onClick={refreshCart}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          </div>
        ) : cartItems.length === 0 ? (
          /* State 3: Empty State (Task 17) */
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-lg mx-auto">
            <div className="inline-flex w-16 h-16 rounded-2xl bg-slate-100 items-center justify-center text-slate-400 mb-5">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">
              Your cart is empty 🛒
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6 leading-relaxed">
              Looks like you haven't added anything yet. Discover our top-tier tech gadgets and upgrade your collection today!
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors shadow-lg shadow-red-600/25"
            >
              <Sparkles className="w-4 h-4" />
              <span>Browse Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* State 4: Populated Cart with Order Summary */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 8 Cols: Cart Items */}
            <div className="lg:col-span-8 space-y-4">
              {cartItems.map((item) => {
                const product = item.product;
                if (!product) return null;

                const productId = product._id;
                const isProcessing = Boolean(itemProcessing[productId]);
                const processingType = itemProcessing[productId];
                const itemTotal = (product.price || 0) * (item.quantity || 1);
                const isMaxStock = item.quantity >= product.stock;

                return (
                  <div
                    key={productId}
                    className="bg-white rounded-3xl border border-slate-100 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row items-center gap-5 sm:gap-6 relative"
                  >
                    {/* Product Image */}
                    <Link
                      to={`/products/${productId}`}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-50 p-2 flex items-center justify-center flex-shrink-0 border border-slate-100 hover:scale-105 transition-transform"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80";
                        }}
                      />
                    </Link>

                    {/* Details Column */}
                    <div className="flex-1 w-full text-center sm:text-left">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded-full inline-block mb-1">
                            {product.category}
                          </span>
                          <Link
                            to={`/products/${productId}`}
                            className="block text-sm sm:text-base font-bold text-slate-900 hover:text-red-600 transition-colors line-clamp-1"
                          >
                            {product.name}
                          </Link>
                        </div>

                        {/* Price Breakdown */}
                        <div className="text-center sm:text-right mt-1 sm:mt-0">
                          <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                            ₹{itemTotal.toLocaleString("en-IN")}
                          </span>
                          {item.quantity > 1 && (
                            <p className="text-[11px] text-slate-400 font-medium">
                              ₹{Number(product.price).toLocaleString("en-IN")} each
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Controls Row: Quantity + Remove */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                        {/* Quantity Controls ([-] 2 [+]) */}
                        <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200/80">
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                productId,
                                item.quantity,
                                -1,
                                product.stock
                              )
                            }
                            disabled={item.quantity <= 1 || isProcessing}
                            className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-700 hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            title="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>

                          <div className="w-10 text-center text-xs font-black text-slate-900 flex items-center justify-center">
                            {processingType === "updating" ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" />
                            ) : (
                              <span>{item.quantity}</span>
                            )}
                          </div>

                          <button
                            onClick={() =>
                              handleQuantityChange(
                                productId,
                                item.quantity,
                                1,
                                product.stock
                              )
                            }
                            disabled={isMaxStock || isProcessing}
                            className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-700 hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            title="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Stock warning if max reached */}
                        {isMaxStock && (
                          <span className="text-[11px] text-amber-600 font-semibold bg-amber-50 px-2.5 py-1 rounded-full">
                            Max stock reached ({product.stock})
                          </span>
                        )}

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemove(productId)}
                          disabled={isProcessing}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {processingType === "removing" ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Continue Shopping Action */}
              <div className="pt-2">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-red-600 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Continue Shopping</span>
                </Link>
              </div>
            </div>

            {/* Right 4 Cols: Order Summary (Task 13 & 15) */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm sticky top-24 space-y-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    Order Summary
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Calculated in real-time from active cart items
                  </p>
                </div>

                {/* Derived Metrics (Lab 05 Task 15) */}
                <div className="space-y-3 text-xs border-y border-slate-100 py-4">
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Distinct Products</span>
                    <span className="font-bold text-slate-900">{totalItems}</span>
                  </div>

                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Total Units</span>
                    <span className="font-bold text-slate-900">{cartCount}</span>
                  </div>

                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Subtotal</span>
                    <span className="font-black text-slate-900">
                      ₹{subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Express Shipping</span>
                    <span className="font-bold text-emerald-600 uppercase">
                      FREE
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Estimated Taxes</span>
                    <span className="text-slate-400">Included</span>
                  </div>
                </div>

                {/* Final Total */}
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-bold text-slate-700">
                    Grand Total
                  </span>
                  <span className="text-2xl font-black text-slate-900 tracking-tight">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>

                {/* Proceed to Checkout CTA */}
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full py-4 px-6 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-all hover:gap-3 cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Security and Trust Strip */}
                <div className="pt-2 border-t border-slate-50 space-y-2 text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>256-bit encrypted secure checkout</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>Dispatched in 24 hours with live tracking</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Cart;
