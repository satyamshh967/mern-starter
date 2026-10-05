import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShoppingBag, Sparkles, Home } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-sm">
        {/* Decorative Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 text-red-600 font-extrabold text-xs mb-6 border border-red-100">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Error 404 • Missing Link</span>
        </div>

        <h1 className="text-6xl sm:text-7xl font-black text-slate-900 tracking-tight mb-3">
          4<span className="text-red-600">0</span>4
        </h1>

        <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
          Page Not Found
        </h2>

        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-8">
          The page or product you are looking for doesn't exist, has been removed, or is temporarily unavailable.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 transition-all hover:gap-3"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Browse Catalog</span>
          </Link>

          <Link
            to="/home"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Go Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
