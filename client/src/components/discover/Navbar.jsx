import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40 backdrop-blur">
      <div className="flex items-center gap-8">
        <Link to="/" className="text-xl font-bold text-white">
          ParkEase
        </Link>
        <Link to="/discover" className="text-gray-300 hover:text-white">
          Find Parking
        </Link>
        {user && (
          <Link to="/bookings" className="text-gray-300 hover:text-white">
            My Bookings
          </Link>
        )}
      </div>

      <div>
        {!user ? (
          <Link
            to="/login"
            className="bg-blue-500 hover:bg-blue-600 px-5 py-2 rounded-lg font-semibold"
          >
            Sign In
          </Link>
        ) : (
          <button
            onClick={logout}
            className="text-gray-300 hover:text-white"
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
}
