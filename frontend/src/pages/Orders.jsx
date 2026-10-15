import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyOrders } from "../services/api";
import {
  Package,
  Calendar,
  CreditCard,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Truck,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
} from "lucide-react";

const getStatusBadge = (status) => {
  switch (status) {
    case "DELIVERED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "SHIPPED":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "CONFIRMED":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "PLACED":
      return "bg-amber-50 text-amber-700 border-amber-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
};

const Orders = () => {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyOrders();
      setOrders(data.orders || []);
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Please log in to view your orders.");
      } else {
        setError(
          err.response?.data?.message || "Failed to load order history."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchOrders();
    } else if (!authLoading && !user) {
      setLoading(false);
      setError("Please log in to view your orders.");
    }
  }, [authLoading, user]);

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md">
                <Package className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                My Orders
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              View order tracking, payment receipts, and purchase history.
            </p>
          </div>

          {!loading && !error && orders.length > 0 && (
            <div className="text-xs font-bold text-slate-500 bg-white px-4 py-2 rounded-full border border-slate-200/60 shadow-sm self-start sm:self-auto">
              Total Orders: <span className="text-slate-900">{orders.length}</span>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div>
            <div className="flex items-center justify-center py-6 text-sm font-bold text-slate-500 gap-2 mb-6">
              <RefreshCw className="w-4 h-4 animate-spin text-red-600" />
              <span>Loading your orders...</span>
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl border border-slate-100 p-6 animate-pulse space-y-4"
                >
                  <div className="h-5 bg-slate-100 rounded w-1/3"></div>
                  <div className="h-16 bg-slate-50 rounded-xl"></div>
                  <div className="h-4 bg-slate-100 rounded w-1/4"></div>
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
              Couldn't load orders
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
              {error}
            </p>
            {user ? (
              <button
                onClick={fetchOrders}
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
        ) : orders.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-lg mx-auto">
            <div className="inline-flex w-16 h-16 rounded-2xl bg-slate-100 items-center justify-center text-slate-400 mb-5">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">
              You have not placed any orders yet
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6 leading-relaxed">
              When you purchase items from your cart, your orders and tracking details will appear here.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors shadow-lg shadow-red-600/25"
            >
              <Sparkles className="w-4 h-4" />
              <span>Start Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* Orders List */
          <div className="space-y-6">
            {orders.map((order) => {
              const formattedDate = new Date(order.createdAt).toLocaleDateString(
                "en-IN",
                {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }
              );

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-7 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className="text-sm font-black text-slate-900">
                        Order #{order._id.slice(-8).toUpperCase()}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        {formattedDate}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-bold border ${getStatusBadge(
                          order.status
                        )}`}
                      >
                        {order.status || "PLACED"}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                        {order.paymentStatus || "PENDING"}
                      </span>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="py-5 space-y-3">
                    {order.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-4 text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 rounded-xl object-contain bg-slate-50 border border-slate-100 p-1 flex-shrink-0"
                              onError={(e) => {
                                e.target.src =
                                  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80";
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">
                              {item.name}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Qty: {item.quantity} × ₹{Number(item.price).toLocaleString("en-IN")}
                            </p>
                          </div>
                        </div>

                        <div className="font-bold text-slate-900 text-right flex-shrink-0">
                          ₹{(Number(item.price) * item.quantity).toLocaleString("en-IN")}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer & Action */}
                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-xs text-slate-400">Total Amount</span>
                      <p className="text-lg font-black text-slate-900">
                        ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                      </p>
                    </div>

                    <Link
                      to={`/orders/${order._id}`}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-red-600 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      <span>View Details</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
