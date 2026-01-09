import { Routes, Route } from "react-router-dom";
import Home from "../pages/public/Home";

// placeholders for now
const Login = () => <div className="text-white p-20">Login</div>;
const Register = () => <div className="text-white p-20">Register</div>;
const Discover = () => <div className="text-white p-20">Discover Parking</div>;
const BookSlot = () => <div className="text-white p-20">Book Slot</div>;

import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/discover" element={<Discover />} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected */}
      <Route
        path="/book/:lotId/:spotId"
        element={
          <ProtectedRoute>
            <BookSlot />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route
        path="*"
        element={<div className="text-white p-20">Page not found</div>}
      />
    </Routes>
  );
}
