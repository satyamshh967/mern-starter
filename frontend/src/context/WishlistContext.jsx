import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import {
  getWishlist,
  toggleWishlist as apiToggleWishlist,
  removeFromWishlist as apiRemoveFromWishlist,
} from "../services/api";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWishlist = async () => {
    if (!user) {
      setWishlist([]);
      setWishlistIds(new Set());
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getWishlist();
      const items = data.wishlist || [];
      setWishlist(items);
      const ids = new Set(items.map((item) => (item._id || item).toString()));
      setWishlistIds(ids);
    } catch (err) {
      if (err.response?.status !== 401) {
        setError(err.response?.data?.message || "Failed to load wishlist.");
      }
      setWishlist([]);
      setWishlistIds(new Set());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const isInWishlist = (productId) => {
    if (!productId) return false;
    return wishlistIds.has(productId.toString());
  };

  const toggleItem = async (productId) => {
    if (!user) {
      throw new Error("Please log in to manage your wishlist.");
    }

    try {
      const data = await apiToggleWishlist(productId);
      const isAdded = data.action === "added";

      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (isAdded) {
          next.add(productId.toString());
        } else {
          next.delete(productId.toString());
        }
        return next;
      });

      // Synchronize populated list
      const refreshed = await getWishlist();
      setWishlist(refreshed.wishlist || []);

      return { action: data.action, isWishlisted: isAdded };
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update wishlist.";
      throw new Error(msg);
    }
  };

  const removeItem = async (productId) => {
    try {
      await apiRemoveFromWishlist(productId);
      setWishlistIds((prev) => {
        const next = new Set(prev);
        next.delete(productId.toString());
        return next;
      });
      setWishlist((prev) =>
        prev.filter((item) => (item._id || item).toString() !== productId.toString())
      );
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to remove from wishlist.";
      throw new Error(msg);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistIds,
        wishlistCount: wishlistIds.size,
        isInWishlist,
        toggleWishlist: toggleItem,
        removeFromWishlist: removeItem,
        refreshWishlist: fetchWishlist,
        loading,
        error,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
