import React, { createContext, useContext, useState, useEffect } from "react";
import { getMyProfile, loginCustomer, logoutCustomer } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const data = await getMyProfile();
      // Handle either direct customer object or data.customer / data
      const profile = data.customer || data;
      setUser(profile);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const login = async (credentials) => {
    await loginCustomer(credentials);
    await fetchProfile();
  };

  const logout = async () => {
    try {
      await logoutCustomer();
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout, refreshUser: fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
