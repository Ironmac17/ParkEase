import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("parkease_user");
      return stored && stored !== "undefined" ? JSON.parse(stored) : null;
    } catch (err) {
      localStorage.removeItem("parkease_user");
      localStorage.removeItem("parkease_token");
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // Check auth on app load
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("parkease_token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get("/auth/me");
        const userData = {
          ...res.data,
          walletBalance: Number(res.data?.walletBalance) || 0,
        };
        setUser(userData);
        localStorage.setItem("parkease_user", JSON.stringify(userData));
      } catch (err) {
        localStorage.removeItem("parkease_token");
        localStorage.removeItem("parkease_user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login
  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });

    const userData = {
      _id: res.data._id,
      username: res.data.username,
      email: res.data.email,
      role: res.data.role,
      walletBalance: Number(res.data?.walletBalance) || 0,
    };

    localStorage.setItem("parkease_token", res.data.token);
    localStorage.setItem("parkease_user", JSON.stringify(userData));
    setUser(userData);

    return userData;
  };

  // Register
  const register = async (data) => {
    const res = await api.post("/auth/register", data);

    const userData = {
      _id: res.data._id,
      username: res.data.username,
      email: res.data.email,
      role: res.data.role,
      walletBalance: Number(res.data?.walletBalance) || 0,
    };

    localStorage.setItem("parkease_token", res.data.token);
    localStorage.setItem("parkease_user", JSON.stringify(userData));
    setUser(userData);

    return userData;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("parkease_token");
    localStorage.removeItem("parkease_user");
    setUser(null);
    window.location.href = "/login";
  };

  // Custom setUser that also updates localStorage
  const updateUser = (newUserData) => {
    const updatedUser = {
      ...user,
      ...newUserData,
      walletBalance:
        Number(newUserData?.walletBalance) || Number(user?.walletBalance) || 0,
    };
    setUser(updatedUser);
    localStorage.setItem("parkease_user", JSON.stringify(updatedUser));
  };

  const value = {
    user,
    setUser: updateUser, // Allow other components to update user (e.g., after profile updates)
    isAuthenticated: !!user,
    role: user?.role || null,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
};
