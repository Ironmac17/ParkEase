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
// import Dashboard from "../pages/user/Dashboard";
import Checkout from "../pages/user/Checkout";
import BookingSuccess from "../pages/user/BookingSuccess";
import MyBookings from "../pages/user/MyBookings";

// import Wallet from "../pages/user/Wallet";

// // owner
import OwnerDashboard from "../pages/owner/OwnerDashboard";
import OwnerLots from "../pages/owner/OwnerLots";
import OwnerLotDetails from "../pages/owner/OwnerLotDetails";
import OwnerBookings from "../pages/owner/OwnerBookings";
import OwnerRevenue from "../pages/owner/OwnerRevenue";

// // admin
// import AdminDashboard from "../pages/admin/AdminDashboard";
// import FestivalManager from "../pages/admin/FestivalManager";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/parking/:id" element={<ParkingDetails />} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/discover" element={<Discover />} />

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

      {/* <Route
        path="/wallet"
        element={
          <ProtectedRoute roles={["user", "owner", "admin"]}>
            <Wallet />
          </ProtectedRoute>
        }
      /> */}

      {/* Owner */}
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


      {/* Admin */}
      {/* <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      /> */}
      {/* <Route
        path="/admin/festivals"
        element={
          <ProtectedRoute roles={["admin"]}>
            <FestivalManager />
          </ProtectedRoute>
        }
      /> */}
    </Routes>
  );
};

export default AppRoutes;
