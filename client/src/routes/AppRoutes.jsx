import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

// public
import Home from "../pages/public/Home";
import Discover from "../pages/public/Discover";
// import ParkingDetails from "../pages/public/ParkingDetails";

// // auth
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

// // user
// import Dashboard from "../pages/user/Dashboard";
// import MyBookings from "../pages/user/MyBookings";
// import Wallet from "../pages/user/Wallet";

// // owner
// import OwnerDashboard from "../pages/owner/OwnerDashboard";
// import ManageParking from "../pages/owner/ManageParking";

// // admin
// import AdminDashboard from "../pages/admin/AdminDashboard";
// import FestivalManager from "../pages/admin/FestivalManager";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      {/* <Route path="/parking/:id" element={<ParkingDetails />} /> */}

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/discover" element={<Discover />} />

      {/* User */}
      {/* <Route
        path="/dashboard"
        element={
          <ProtectedRoute roles={["user", "owner", "admin"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      /> */}
      {/* <Route
        path="/bookings"
        element={
          <ProtectedRoute roles={["user", "owner", "admin"]}>
            <MyBookings />
          </ProtectedRoute>
        }
      /> */}
      {/* <Route
        path="/wallet"
        element={
          <ProtectedRoute roles={["user", "owner", "admin"]}>
            <Wallet />
          </ProtectedRoute>
        }
      /> */}

      {/* Owner */}
      {/* <Route
        path="/owner"
        element={
          <ProtectedRoute roles={["owner", "admin"]}>
            <OwnerDashboard />
          </ProtectedRoute>
        }
      /> */}
      {/* <Route
        path="/owner/parking"
        element={
          <ProtectedRoute roles={["owner", "admin"]}>
            <ManageParking />
          </ProtectedRoute>
        }
      /> */}

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
