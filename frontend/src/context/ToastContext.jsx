import React, { createContext, useContext, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, AlertCircle, Info, X, ShoppingCart, Heart, ArrowRight } from "lucide-react";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(({ message, type = "success", actionText, actionLink, duration = 3500 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    const newToast = { id, message, type, actionText, actionLink };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Floating Toast Container */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-slate-900 text-white rounded-2xl p-4 shadow-xl shadow-slate-900/25 border border-slate-800 flex items-center justify-between gap-3 animate-slide-up transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-red-600/20 text-red-500 flex items-center justify-center flex-shrink-0">
                {toast.type === "error" ? (
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                ) : toast.actionLink?.includes("cart") ? (
                  <ShoppingCart className="w-4 h-4 text-red-500" />
                ) : toast.actionLink?.includes("wishlist") ? (
                  <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
              </div>
              <p className="text-xs font-semibold text-slate-100 truncate">
                {toast.message}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {toast.actionText && toast.actionLink && (
                <Link
                  to={toast.actionLink}
                  onClick={() => removeToast(toast.id)}
                  className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold flex items-center gap-1 transition-colors"
                >
                  <span>{toast.actionText}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white p-1 transition-colors cursor-pointer"
                aria-label="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
