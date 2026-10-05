import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import {
  Heart,
  Trash2,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  ShoppingBag,
  Loader2,
  Sparkles,
} from "lucide-react";

const Wishlist = () => {
  const { user, loading: authLoading } = useAuth();
  const {
    wishlist: wishlistItems,
    loading,
    error,
    removeFromWishlist,
    refreshWishlist,
  } = useWishlist();
  const [removingId, setRemovingId] = useState(null);

  const handleRemove = async (productId) => {
    setRemovingId(productId);
    try {
      await removeFromWishlist(productId);
    } catch (err) {
      console.error(
        "Remove from wishlist failed:",
        err.message
      );
    } finally {
      setRemovingId(null);
    }
  };

  // Auth loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
          <RefreshCw className="w-4 h-4 animate-spin text-red-600" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page Header */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-red-500/25">
                  <Heart className="w-5 h-5" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  My Wishlist
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Products you've saved for later — your curated picks all in one
                place.
              </p>
            </div>

            {!loading && !error && wishlistItems.length > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-full text-xs font-bold border border-red-100">
                <Heart className="w-3.5 h-3.5 fill-red-500" />
                <span>
                  {wishlistItems.length}{" "}
                  {wishlistItems.length === 1 ? "item" : "items"} saved
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Content Area */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Loading State */}
        {loading ? (
          <div>
            <div className="flex items-center justify-center py-6 text-sm font-bold text-slate-500 gap-2 mb-6">
              <RefreshCw className="w-4 h-4 animate-spin text-red-600" />
              <span>Loading your wishlist...</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-slate-100 p-4 animate-pulse flex flex-col gap-3"
                >
                  <div className="aspect-square bg-slate-100 rounded-xl w-full"></div>
                  <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-50 rounded w-1/2"></div>
                  <div className="h-9 bg-slate-100 rounded mt-auto"></div>
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          /* Error State */
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-rose-100 shadow-sm max-w-lg mx-auto">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-rose-50 items-center justify-center text-rose-600 mb-4">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Couldn't load your wishlist
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
              {error}
            </p>
            {user ? (
              <button
                onClick={refreshWishlist}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors"
              >
                <span>Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        ) : wishlistItems.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-lg mx-auto">
            <div className="inline-flex w-16 h-16 rounded-2xl bg-slate-100 items-center justify-center text-slate-400 mb-5">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6 leading-relaxed">
              Discover amazing tech gadgets and tap the ♡ to save your
              favorites here.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors shadow-lg shadow-red-600/25"
            >
              <Sparkles className="w-4 h-4" />
              <span>Browse Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* Wishlist Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {wishlistItems.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-2xl border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden group"
              >
                {/* Product Image */}
                <div className="relative aspect-square w-full overflow-hidden bg-slate-50 flex items-center justify-center p-6">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80";
                    }}
                  />

                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/90 backdrop-blur-md text-slate-700 shadow-sm border border-slate-100">
                      {product.category}
                    </span>
                  </div>

                  {/* Filled Heart Indicator */}
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-50 border border-red-200 flex items-center justify-center">
                    <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4 sm:p-5 flex flex-col flex-grow">
                  <div className="flex-grow">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                      ₹{Number(product.price).toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-3 flex gap-2">
                    <Link
                      to={`/products/${product._id}`}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-red-600 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors duration-200"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>View Details</span>
                    </Link>

                    <button
                      onClick={() => handleRemove(product._id)}
                      disabled={removingId === product._id}
                      className="w-10 h-10 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-wait flex-shrink-0"
                      title="Remove from wishlist"
                    >
                      {removingId === product._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Wishlist;
