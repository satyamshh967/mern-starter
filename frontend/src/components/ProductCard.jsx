import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Tag, AlertCircle, CheckCircle2 } from "lucide-react";

const ProductCard = ({ product }) => {
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden group">
      {/* Product Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=800&q=80";
          }}
        />
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-sm text-slate-700 shadow-sm">
            <Tag className="w-3 h-3 text-blue-600" />
            {product.category}
          </span>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex-grow">
          <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
            {product.name}
          </h3>

          <p className="mt-1 text-xs text-slate-500 line-clamp-2">
            {product.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Price</span>
            <span className="text-lg font-extrabold text-slate-900">
              ₹{Number(product.price).toLocaleString("en-IN")}
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 font-medium block">Status</span>
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600">
                <AlertCircle className="w-3 h-3" />
                Out of stock
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="w-3 h-3" />
                {product.stock} units left
              </span>
            )}
          </div>
        </div>

        {/* View Details Action */}
        <Link
          to={`/products/${product._id}`}
          className="mt-4 w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors duration-200"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
