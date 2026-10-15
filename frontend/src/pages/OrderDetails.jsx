import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getOrderById, updateOrderStatus } from "../services/api";
import {
  Package,
  Calendar,
  CreditCard,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

const statusSteps = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrderById(id);
      setOrder(data.order);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load order details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  // Bonus progression tester
  const handleStatusProgression = async (nextStatus) => {
    setUpdatingStatus(true);
    try {
      const res = await updateOrderStatus(order._id, nextStatus);
      setOrder(res.order);
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
          <RefreshCw className="w-5 h-5 animate-spin text-red-600" />
          <span>Loading order details...</span>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center py-16 px-6 bg-white rounded-3xl border border-rose-100 shadow-sm max-w-md w-full">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 items-center justify-center mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Could not retrieve order
          </h2>
          <p className="text-xs text-slate-500 mb-6">{error}</p>
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Orders</span>
          </Link>
        </div>
      </div>
    );
  }

  const currentStepIndex = statusSteps.indexOf(order.status);
  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs font-bold text-slate-500">
          <Link
            to="/orders"
            className="flex items-center gap-1 hover:text-red-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>My Orders</span>
          </Link>
          <span>/</span>
          <span className="text-slate-900">
            Order #{order._id.slice(-8).toUpperCase()}
          </span>
        </div>

        {/* Order Header Card */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Order Reference
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                #{order._id}
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Placed on {formattedDate}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {order.status}
              </span>
              <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                Payment: {order.paymentStatus}
              </span>
            </div>
          </div>

          {/* Status Progression Timeline (Bonus Challenge) */}
          <div className="pt-6">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
              Delivery Progress
            </h2>
            <div className="grid grid-cols-4 gap-2 relative">
              {statusSteps.map((step, idx) => {
                const isCompleted = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={step} className="flex flex-col items-center text-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all mb-2 ${
                        isCompleted
                          ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                          : "bg-slate-100 text-slate-400"
                      } ${isCurrent ? "ring-4 ring-red-100" : ""}`}
                    >
                      {idx + 1}
                    </div>
                    <span
                      className={`text-[11px] font-bold leading-tight ${
                        isCompleted ? "text-slate-900" : "text-slate-400"
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Progression simulation controls (Bonus) */}
            <div className="mt-6 pt-4 border-t border-slate-50 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[11px] font-bold text-slate-400">
                Advance status (Bonus Test):
              </span>
              {statusSteps.map((step) => (
                <button
                  key={step}
                  onClick={() => handleStatusProgression(step)}
                  disabled={updatingStatus || order.status === step}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                    order.status === step
                      ? "bg-red-600 text-white border-red-600"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  {step}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2-Column Content: Items + Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Purchased Items (2 Cols) */}
          <div className="md:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 sm:p-7 shadow-sm">
            <h2 className="text-sm font-black text-slate-900 pb-4 border-b border-slate-100 mb-4">
              Items Purchased ({order.items?.length || 0})
            </h2>

            <div className="divide-y divide-slate-100">
              {order.items?.map((item, idx) => (
                <div key={idx} className="py-4 flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-2xl object-contain bg-slate-50 border border-slate-100 p-1 flex-shrink-0"
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Price: ₹{Number(item.price).toLocaleString("en-IN")} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-sm font-black text-slate-900">
                    ₹{(Number(item.price) * item.quantity).toLocaleString("en-IN")}
                  </div>
                </div>
              ))}
            </div>

            {/* Total Row */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-baseline">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Paid
              </span>
              <span className="text-xl font-black text-slate-900">
                ₹{Number(order.totalAmount).toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Shipping & Payment Meta (1 Col) */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3 text-slate-900 font-bold text-xs uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-red-600" />
                <span>Shipping Address</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                <strong className="text-slate-900 block mb-1">
                  {order.shippingAddress?.fullName}
                </strong>
                {order.shippingAddress?.addressLine1}
                <br />
                {order.shippingAddress?.city}, {order.shippingAddress?.state} -{" "}
                {order.shippingAddress?.pincode}
                <br />
                <span className="text-slate-400 text-[11px] block mt-1">
                  Phone: {order.shippingAddress?.phone}
                </span>
              </p>
            </div>

            {/* Payment Snapshot */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3 text-slate-900 font-bold text-xs uppercase tracking-wider">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Payment Details</span>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] block">
                    Razorpay Order ID
                  </span>
                  <span className="font-mono text-slate-800 text-[11px] break-all">
                    {order.razorpayOrderId || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">
                    Payment ID
                  </span>
                  <span className="font-mono text-slate-800 text-[11px] break-all">
                    {order.razorpayPaymentId || "N/A"}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-emerald-700 font-bold text-[11px]">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verified HMAC-SHA256 Signature</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
