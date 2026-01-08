import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("parkease_user");
    return stored ? JSON.parse(stored) : null;
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
        setUser(res.data);
        localStorage.setItem("parkease_user", JSON.stringify(res.data));
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

    const { token, user } = res.data;

    localStorage.setItem("parkease_token", token);
    localStorage.setItem("parkease_user", JSON.stringify(user));
    setUser(user);

    return user;
  };

  // Register
  const register = async (data) => {
    const res = await api.post("/auth/register", data);

    const { token, user } = res.data;

    localStorage.setItem("parkease_token", token);
    localStorage.setItem("parkease_user", JSON.stringify(user));
    setUser(user);

    return user;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("parkease_token");
    localStorage.removeItem("parkease_user");
    setUser(null);
    window.location.href = "/login";
  };

  const value = {
    user,
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
