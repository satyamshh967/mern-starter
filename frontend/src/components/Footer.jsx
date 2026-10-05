import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Phone, Mail, MapPin, ShieldCheck, Truck, RotateCcw, Heart } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-100 text-slate-600">
      {/* Top Value Strip */}
      <div className="border-b border-slate-100 py-8 bg-slate-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Worldwide Shipping</p>
                <p className="text-[11px] text-slate-400">Fast delivery to US, UK, UAE & India</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900">100% Secure Checkout</p>
                <p className="text-[11px] text-slate-400">256-bit SSL encrypted transactions</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900">30-Day Hassle-Free Returns</p>
                <p className="text-[11px] text-slate-400">Guaranteed instant exchange or refund</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900">24/7 Dedicated Support</p>
                <a
                  href="tel:+18005550199"
                  className="text-[11px] text-red-600 font-semibold hover:underline"
                >
                  +1 (800) 555-0199
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/products" className="flex items-center gap-2.5 inline-flex group">
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

            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              Your destination for aesthetic tech gadgets, custom mechanical keyboards, audiophile sound, and minimal desk upgrades curated for discerning creators.
            </p>

            <div className="space-y-2 pt-2 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>Call Us: </span>
                <a
                  href="tel:+18005550199"
                  className="font-bold text-slate-900 hover:text-red-600 transition-colors"
                >
                  +1 (800) 555-0199
                </a>
              </div>

              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>Email: </span>
                <a
                  href="mailto:support@shopkart.tech"
                  className="font-bold text-slate-900 hover:text-red-600 transition-colors"
                >
                  support@shopkart.tech
                </a>
              </div>

              <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>San Francisco, CA • London, UK • Bangalore, IN</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-4">
              Explore Catalog
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/products" className="hover:text-red-600 transition-colors">
                  All Tech Gadgets
                </Link>
              </li>
              <li>
                <Link to="/products?category=Electronics" className="hover:text-red-600 transition-colors">
                  Audio & Keyboards
                </Link>
              </li>
              <li>
                <Link to="/products?category=Home" className="hover:text-red-600 transition-colors">
                  Workspace & Desk Lamps
                </Link>
              </li>
              <li>
                <Link to="/products?category=Fashion" className="hover:text-red-600 transition-colors">
                  Everyday Carry & Leather
                </Link>
              </li>
              <li>
                <Link to="/products?category=Books" className="hover:text-red-600 transition-colors">
                  Engineering Books
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Portal */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-4">
              Customer Portal
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/cart" className="hover:text-red-600 transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-red-600 transition-colors">
                  Saved Wishlist
                </Link>
              </li>
              <li>
                <Link to="/home" className="hover:text-red-600 transition-colors">
                  My Profile & Security
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-red-600 transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-red-600 transition-colors">
                  Register Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies & Assurance */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-4">
              Trust & Security
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-500">
              <li>✓ Encrypted JWT Session Storage</li>
              <li>✓ HttpOnly Cookie Protection</li>
              <li>✓ Real-Time Inventory Checks</li>
              <li>✓ 30-Day Money Back Guarantee</li>
              <li>✓ Express Tracked Delivery</li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            © {currentYear} ShopKart Inc. Engineering Labs 01–05. All rights reserved.
          </p>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-red-500 font-semibold">
              Crafted with <Heart className="w-3 h-3 fill-red-500" /> for Tech Lovers
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
