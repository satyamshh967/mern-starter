import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Heart,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShoppingCart,
} from "lucide-react";
import { toggleWishlist } from "../services/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const ProductCard = ({ product, isInWishlist = false, onWishlistChange }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, addToCart } = useCart();

  const [wishlisted, setWishlisted] = useState(isInWishlist);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartError, setCartError] = useState(null);

  const isOutOfStock = product.stock <= 0;

  // Check if item is already in cart
  const cartItem = cartItems.find(
    (item) => (item.product?._id || item.product) === product._id
  );
  const isInCart = Boolean(cartItem);
  const currentCartQty = cartItem ? cartItem.quantity : 0;

  // Generate deterministic realistic like counts based on id
  const likes = Math.floor(1200 + (product.price % 800) * 1.5);

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (wishlistLoading) return;

    if (!user) {
      navigate("/login");
      return;
    }

    setWishlistLoading(true);
    try {
      const data = await toggleWishlist(product._id);
      const nowWishlisted = data.action === "added";
      setWishlisted(nowWishlisted);
      if (onWishlistChange) {
        onWishlistChange(product._id, nowWishlisted);
      }
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error(
          "Wishlist toggle failed:",
          err.response?.data?.message || err.message
        );
      }
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || addingToCart) return;

    if (!user) {
      navigate("/login");
      return;
    }

    setAddingToCart(true);
    setCartError(null);
    try {
      await addToCart(product._id);
    } catch (err) {
      setCartError(err.message || "Failed to add to cart");
      setTimeout(() => setCartError(null), 3000);
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden group">
      {/* Product Image Stage */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-50 flex items-center justify-center p-6">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain object-center group-hover:scale-108 transition-transform duration-300"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80";
          }}
        />

        {/* Category Pill Tag */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/90 backdrop-blur-md text-slate-700 shadow-sm border border-slate-100">
            {product.category}
          </span>
        </div>

        {/* Heart / Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          disabled={wishlistLoading}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center shadow-sm border transition-all duration-200 ${
            wishlisted
              ? "bg-red-50 border-red-200 text-red-500"
              : "bg-white/90 border-slate-100 text-slate-400 hover:text-red-500"
          } ${wishlistLoading ? "opacity-70 cursor-wait" : "cursor-pointer"}`}
          title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          {wishlistLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-red-500" />
          ) : (
            <Heart
              className={`w-4 h-4 transition-all duration-200 ${
                wishlisted ? "fill-red-500 text-red-500 scale-110" : ""
              }`}
            />
          )}
        </button>
      </div>

      {/* Product Information */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow">
        <div className="flex-grow">
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-1">
            {product.name}
          </h3>

          <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Social proof row */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              ₹{Number(product.price).toLocaleString("en-IN")}
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
            <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
            <span>{(likes / 1000).toFixed(1)}k</span>
          </div>
        </div>

        {/* Stock status indicator */}
        <div className="mt-2 flex items-center justify-between text-[11px]">
          {isOutOfStock ? (
            <span className="inline-flex items-center gap-1 font-semibold text-rose-600">
              <AlertCircle className="w-3 h-3" />
              Out of stock
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
              <CheckCircle2 className="w-3 h-3" />
              {product.stock} in stock
            </span>
          )}

          <span className="text-slate-400">Ships in 24h</span>
        </div>

        {/* Inline error feedback if stock limit hit */}
        {cartError && (
          <p className="mt-2 text-[11px] font-medium text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">
            {cartError}
          </p>
        )}

        {/* Actions Row: Add to Cart + View Details */}
        <div className="mt-3.5 flex gap-2">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || addingToCart}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              isInCart
                ? "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                : "bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20"
            }`}
          >
            {addingToCart ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Adding...</span>
              </>
            ) : isInCart ? (
              <>
                <ShoppingCart className="w-3.5 h-3.5 text-red-600" />
                <span>Add Another ({currentCartQty})</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
              </>
            )}
          </button>

          <Link
            to={`/products/${product._id}`}
            className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center transition-colors"
            title="View Details"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
