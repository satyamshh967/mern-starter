import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Heart, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toggleWishlist } from "../services/api";

const ProductCard = ({ product, isInWishlist = false, onWishlistChange }) => {
  const [wishlisted, setWishlisted] = useState(isInWishlist);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const isOutOfStock = product.stock <= 0;

  // Generate deterministic realistic like counts based on id
  const likes = Math.floor(1200 + (product.price % 800) * 1.5);

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (wishlistLoading) return;

    setWishlistLoading(true);
    try {
      const data = await toggleWishlist(product._id);
      const nowWishlisted = data.action === "added";
      setWishlisted(nowWishlisted);
      if (onWishlistChange) {
        onWishlistChange(product._id, nowWishlisted);
      }
    } catch (err) {
      // If 401, user not logged in — silently ignore
      if (err.response?.status !== 401) {
        console.error("Wishlist toggle failed:", err.response?.data?.message || err.message);
      }
    } finally {
      setWishlistLoading(false);
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

        {/* View Details Action Button */}
        <Link
          to={`/products/${product._id}`}
          className="mt-3.5 w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-red-600 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors duration-200"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
