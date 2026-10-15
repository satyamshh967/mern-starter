import React, { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { getOrderById } from "../services/api";
import {
  CheckCircle2,
  Package,
  ArrowRight,
  ShoppingBag,
  Clock,
  MapPin,
  CreditCard,
  Loader2,
  ShieldCheck,
} from "lucide-react";

const OrderSuccess = () => {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!order && id) {
      const fetchOrder = async () => {
        try {
          const data = await getOrderById(id);
          setOrder(data.order);
        } catch (err) {
          setError(err.response?.data?.message || "Unable to load order details.");
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [id, order]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin text-red-600" />
          <span>Loading order confirmation...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-10 text-center">
          {/* Success Badge */}
          <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
            Order Placed Successfully! 🎉
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-8">
            Thank you for shopping with ShopKart. Your payment has been verified
            and your order is now confirmed.
          </p>

          {/* Order Details Card */}
          <div className="bg-slate-50 rounded-2xl p-6 text-left mb-8 border border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-slate-200/60">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Order ID
                </span>
                <span className="text-xs sm:text-sm font-mono font-bold text-slate-900 select-all">
                  {order?._id || id}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Status
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 mt-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                  {order?.status || "PLACED"}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Payment Status
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  {order?.paymentStatus || "PAID"}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Paid
                </span>
                <span className="text-base sm:text-lg font-black text-slate-900">
                  ₹{Number(order?.totalAmount || 0).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Shipping Address */}
            {order?.shippingAddress && (
              <div className="pt-4">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Shipping To
                </span>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  <strong className="text-slate-900">{order.shippingAddress.fullName}</strong>
                  <br />
                  {order.shippingAddress.addressLine1}, {order.shippingAddress.city},{" "}
                  {order.shippingAddress.state} - {order.shippingAddress.pincode}
                  <br />
                  Phone: {order.shippingAddress.phone}
                </p>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/orders"
              className="px-6 py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-md"
            >
              <Package className="w-4 h-4" />
              <span>View My Orders</span>
            </Link>

            <Link
              to="/products"
              className="px-6 py-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-md shadow-red-600/25"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Continue Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
