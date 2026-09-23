import React, { useState, useEffect } from "react";
import { getProducts } from "../services/api";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import { AlertCircle, RefreshCw, PackageX, Sparkles } from "lucide-react";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("");

  const fetchProductList = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (category && category !== "All") params.category = category;
      if (sort) params.sort = sort;

      const data = await getProducts(params);
      setProducts(data.products || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong while loading products."
      );
    } finally {
      setLoading(false);
    }
  };

  // Debounced search / trigger on filter change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProductList();
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm, category, sort]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setCategory("All");
    setSort("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header section */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>ShopKart Discovery Catalog</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Explore Products
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Find top electronic gear, trendy fashion, inspiring books, and home essentials.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="mb-8">
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          category={category}
          setCategory={setCategory}
          sort={sort}
          setSort={setSort}
          onReset={handleResetFilters}
        />
      </div>

      {/* State Handling: Loading, Error, Empty, and Success */}
      {loading ? (
        // Loading State
        <div>
          <div className="flex items-center justify-center py-6 text-sm font-medium text-slate-500 gap-2 mb-6">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
            <span>Loading products...</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse flex flex-col gap-3"
              >
                <div className="aspect-[4/3] bg-slate-200 rounded-xl w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                <div className="h-8 bg-slate-100 rounded mt-auto"></div>
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
        // Error State
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-rose-100 p-8 shadow-sm">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-rose-50 items-center justify-center text-rose-600 mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            Something went wrong while loading products.
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
            {error}
          </p>
          <button
            onClick={fetchProductList}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      ) : products.length === 0 ? (
        // Empty State
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-slate-100 items-center justify-center text-slate-400 mb-4">
            <PackageX className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            No products found.
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
            We couldn't find any items matching your criteria. Try changing your search query or category filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <span>Reset Filters</span>
          </button>
        </div>
      ) : (
        // Products Grid
        <div>
          <div className="mb-4 text-xs font-medium text-slate-500">
            Showing <span className="font-bold text-slate-900">{products.length}</span> products
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
