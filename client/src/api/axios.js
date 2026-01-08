import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
  withCredentials: false,
});

// Attach JWT before every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("parkease_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // token expired / invalid
      localStorage.removeItem("parkease_token");
      localStorage.removeItem("parkease_user");

      // hard redirect – safest option
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
