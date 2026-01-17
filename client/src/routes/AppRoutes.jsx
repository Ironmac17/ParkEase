import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

// public
import Home from "../pages/public/Home";
import Discover from "../pages/public/Discover";
import ParkingDetails from "../pages/public/ParkingDetails";

// // auth
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

// // user
import Dashboard from "../pages/user/Dashboard";
import Checkout from "../pages/user/Checkout";
import BookingSuccess from "../pages/user/BookingSuccess";
import MyBookings from "../pages/user/MyBookings";

import Wallet from "../pages/user/Wallet";
import OwnerWallet from "../pages/owner/OwnerWallet";
import AdminWallets from "../pages/admin/AdminWallets";

// // owner
import OwnerDashboard from "../pages/owner/OwnerDashboard";
import OwnerLots from "../pages/owner/OwnerLots";
import OwnerLotDetails from "../pages/owner/OwnerLotDetails";
import OwnerBookings from "../pages/owner/OwnerBookings";
import OwnerRevenue from "../pages/owner/OwnerRevenue";

// // admin
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminParkings from "../pages/admin/AdminParkings";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/parking/:id" element={<ParkingDetails />} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Public Discover */}
      <Route path="/discover" element={<Discover />} />

      {/* User Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* User */}
      <Route
        path="/checkout"
        element={
          <ProtectedRoute roles={["user", "owner", "admin"]}>
            <Checkout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-bookings"
        element={
          <ProtectedRoute>
            <MyBookings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/booking-success/:id"
        element={
          <ProtectedRoute roles={["user", "owner", "admin"]}>
            <BookingSuccess />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/dashboard"
        element={
          <ProtectedRoute roles={["owner"]}>
            <OwnerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/lots"
        element={
          <ProtectedRoute roles={["owner"]}>
            <OwnerLots />
          </ProtectedRoute>
        }
      />

      <Route
        path="/owner/lots/:lotId"
        element={
          <ProtectedRoute roles={["owner"]}>
            <OwnerLotDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/bookings"
        element={
          <ProtectedRoute roles={["owner"]}>
            <OwnerBookings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/owner/revenue"
        element={
          <ProtectedRoute roles={["owner"]}>
            <OwnerRevenue />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminUsers />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/parkings"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminParkings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/wallet"
        element={
          <ProtectedRoute>
            <Wallet />
          </ProtectedRoute>
        }
      />

      <Route
        path="/owner/wallet"
        element={
          <ProtectedRoute roles={["owner"]}>
            <OwnerWallet />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/wallets"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminWallets />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
