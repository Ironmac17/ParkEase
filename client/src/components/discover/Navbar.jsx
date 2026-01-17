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

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40 backdrop-blur">
      <div className="flex items-center gap-8">
        <Link
          to={user ? getDashboardLink() : "/"}
          className="text-xl font-bold text-white hover:text-blue-400 transition"
        >
          ParkEase
        </Link>
        <Link
          to="/discover"
          className="text-gray-300 hover:text-white transition"
        >
          Find Parking
        </Link>
        {user && (
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
            {user.role === "owner" && (
              <Link
                to="/owner/dashboard"
                className="text-gray-300 hover:text-white transition"
              >
                Owner Dashboard
              </Link>
            )}
            {user.role === "admin" && (
              <Link
                to="/admin/dashboard"
                className="text-gray-300 hover:text-white transition"
              >
                Admin Panel
              </Link>
            )}
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-white">{user.username}</p>
              <p className="text-xs text-gray-400 capitalize">{user.role}</p>
            </div>
          </div>
        )}
        {!user ? (
          <Link
            to="/login"
            className="bg-blue-500 hover:bg-blue-600 px-5 py-2 rounded-lg font-semibold text-white transition"
          >
            Sign In
          </Link>
        ) : (
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 px-5 py-2 rounded-lg font-semibold text-white transition"
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
}
