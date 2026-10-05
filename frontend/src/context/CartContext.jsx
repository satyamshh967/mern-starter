import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useAuth } from "./AuthContext";
import {
  getCart,
  addToCart as apiAddToCart,
  updateCartQuantity as apiUpdateCartQuantity,
  removeFromCart as apiRemoveFromCart,
} from "../services/api";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load cart when user changes
  const fetchCart = async () => {
    if (!user) {
      setCartItems([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getCart();
      setCartItems(data.cart || []);
    } catch (err) {
      if (err.response?.status !== 401) {
        setError(
          err.response?.data?.message || "Failed to load shopping cart."
        );
      }
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  // Derived state calculations (Lab 05 requirement: compute, do not duplicate in state)
  const cartCount = useMemo(() => {
    return cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
  }, [cartItems]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const price = item.product?.price || 0;
      return total + price * (item.quantity || 0);
    }, 0);
  }, [cartItems]);

  const totalItems = cartItems.length;

  // Add to cart action
  const addToCart = async (productId) => {
    try {
      const data = await apiAddToCart(productId);
      setCartItems(data.cart || []);
      return { success: true, cart: data.cart };
    } catch (err) {
      const message =
        err.response?.data?.message || "Could not add product to cart.";
      throw new Error(message);
    }
  };

  // Update quantity action
  const updateQuantity = async (productId, quantity) => {
    try {
      const data = await apiUpdateCartQuantity(productId, quantity);
      setCartItems(data.cart || []);
      return { success: true, cart: data.cart };
    } catch (err) {
      const message =
        err.response?.data?.message || "Could not update item quantity.";
      throw new Error(message);
    }
  };

  // Remove from cart action
  const removeFromCart = async (productId) => {
    try {
      const data = await apiRemoveFromCart(productId);
      setCartItems(data.cart || []);
      return { success: true, cart: data.cart };
    } catch (err) {
      const message =
        err.response?.data?.message || "Could not remove item from cart.";
      throw new Error(message);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        error,
        cartCount,
        subtotal,
        totalItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
