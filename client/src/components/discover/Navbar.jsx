import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  const getDashboardLink = () => {
    if (!user) return null;

    switch (user.role) {
      case "admin":
        return "/admin/dashboard";
      case "owner":
        return "/owner/dashboard";
      case "user":
        return "/dashboard";
      default:
        return "/discover";
    }
  };

  // For owners/admins, hide booking-related nav items
  const isOwnerOrAdmin = user?.role === "owner" || user?.role === "admin";

  return (
    <div className="flex items-center justify-between px-6 py-4 backdrop-blur">
      <div className="flex items-center gap-8">
        <Link
          to={user ? getDashboardLink() : "/"}
          className="text-xl font-bold text-white hover:text-blue-400 transition"
        >
          ParkEase
        </Link>
        {!isOwnerOrAdmin && (
          <Link
            to="/discover"
            className="text-gray-300 hover:text-white transition"
          >
            Find Parking
          </Link>
        )}
        {user && !isOwnerOrAdmin && (
          <>
            <Link
              to="/my-bookings"
              className="text-gray-300 hover:text-white transition"
            >
              My Bookings
            </Link>
            <Link
              to="/wallet"
              className="text-gray-300 hover:text-white transition"
            >
              Wallet
            </Link>
          </>
        )}
        {user?.role === "owner" && (
          <Link
            to="/owner/dashboard"
            className="text-gray-300 hover:text-white transition"
          >
            Owner Dashboard
          </Link>
        )}
        {user?.role === "admin" && (
          <Link
            to="/admin/dashboard"
            className="text-gray-300 hover:text-white transition"
          >
            Admin Panel
          </Link>
        )}
      </div>
    </div>
  );
}
