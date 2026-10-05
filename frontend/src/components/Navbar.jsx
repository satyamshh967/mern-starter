import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { getWishlist } from "../services/api";
import {
  ShoppingBag,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Sparkles,
  Heart,
  ShoppingCart,
  Menu,
  X,
} from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [wishlistCount, setWishlistCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu whenever route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Fetch wishlist count when user is logged in or location changes
  useEffect(() => {
    const fetchCount = async () => {
      if (!user) {
        setWishlistCount(0);
        return;
      }
      try {
        const data = await getWishlist();
        setWishlistCount((data.wishlist || []).length);
      } catch {
        setWishlistCount(0);
      }
    };
    fetchCount();
  }, [user, location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/95">
      {/* Top micro-announcement bar */}
      <div className="bg-slate-900 text-white text-[11px] py-1.5 px-4 text-center tracking-wide font-medium flex items-center justify-center gap-4">
        <span>🇺🇸 US &nbsp;•&nbsp; 🇬🇧 UK &nbsp;•&nbsp; 🇦🇪 UAE &nbsp;•&nbsp; 🇮🇳 India</span>
        <span className="hidden sm:inline text-red-400 font-semibold">• Fast Express Delivery On All Orders</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Brand (Clickable, goes to Catalog/Home) */}
          <Link
            to={user ? "/products" : "/login"}
            className="flex items-center gap-2.5 group cursor-pointer"
            title="ShopKart Home"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-red-500/25 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center">
                <span className="text-xl font-black tracking-tight text-slate-900">
                  ShopKart
                </span>
                <span className="w-2 h-2 rounded-full bg-red-600 ml-1 mt-1"></span>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold -mt-1">
                Tech & Gadgets
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            <Link
              to="/products"
              className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-red-600 hover:bg-red-50/50 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-red-600" />
              <span>Browse Catalog</span>
            </Link>

            {user ? (
              <>
                {/* Wishlist Link with Count Badge */}
                <Link
                  to="/wishlist"
                  className="relative px-3 py-2 text-xs font-bold text-slate-700 hover:text-red-600 hover:bg-red-50/50 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Heart className={`w-3.5 h-3.5 ${wishlistCount > 0 ? "fill-red-500 text-red-500" : "text-red-600"}`} />
                  <span>Wishlist</span>
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center shadow-sm shadow-red-500/30 animate-in">
                      {wishlistCount > 9 ? "9+" : wishlistCount}
                    </span>
                  )}
                </Link>

                {/* Cart Link with Live Count Badge */}
                <Link
                  to="/cart"
                  className="relative px-3 py-2 text-xs font-bold text-slate-700 hover:text-red-600 hover:bg-red-50/50 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <ShoppingCart className={`w-3.5 h-3.5 ${cartCount > 0 ? "text-red-600" : "text-slate-600"}`} />
                  <span>Cart</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center shadow-sm shadow-red-500/30 animate-in">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </Link>

                <Link
                  to="/home"
                  className="px-3 py-2 text-xs font-bold text-slate-700 hover:text-red-600 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-2"
                >
                  <User className="w-3.5 h-3.5 text-red-600" />
                  <span>My Profile</span>
                </Link>

                <div className="h-5 w-px bg-slate-200 mx-1"></div>

                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-xs font-bold border border-red-100">
                  <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
                  <span>{user.fullName}</span>
                </div>

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 hover:text-red-600 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>

                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-600/25 transition-all hover:shadow-lg"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Get Started</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Right Controls: Quick Cart + Hamburger Toggle */}
          <div className="flex md:hidden items-center gap-2">
            {user && (
              <Link
                to="/cart"
                className="relative p-2 text-slate-700 hover:text-red-600 transition-colors"
                aria-label="View Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:text-red-600 hover:bg-slate-100 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white/98 backdrop-blur-md px-4 py-4 space-y-2 shadow-xl animate-in">
          {user && (
            <div className="p-3 bg-red-50 text-red-800 rounded-2xl flex items-center gap-2.5 mb-3 border border-red-100">
              <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></div>
              <span className="text-xs font-bold">{user.fullName}</span>
              <span className="text-[10px] text-red-500 font-medium ml-auto">Active Session</span>
            </div>
          )}

          <Link
            to="/products"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-800 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-red-600" />
            <span>Browse Catalog</span>
          </Link>

          {user ? (
            <>
              <Link
                to="/wishlist"
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-800 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-4 h-4 text-red-600" />
                  <span>My Wishlist</span>
                </div>
                {wishlistCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-xs font-bold">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                to="/cart"
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-800 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-4 h-4 text-red-600" />
                  <span>Shopping Cart</span>
                </div>
                {cartCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-xs font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>

              <Link
                to="/home"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-800 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <User className="w-4 h-4 text-red-600" />
                <span>My Profile</span>
              </Link>

              <div className="border-t border-slate-100 my-2"></div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </>
          ) : (
            <>
              <div className="border-t border-slate-100 my-2"></div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  className="py-2.5 px-4 text-center rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="py-2.5 px-4 text-center rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/20 transition-all"
                >
                  Get Started
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
