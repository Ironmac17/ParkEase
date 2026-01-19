import { useLocation, Link } from "react-router-dom";
import Navbar from "./discover/Navbar";
import ProfileNotificationMenu from "./ProfileNotificationMenu";
import { useAuth } from "../context/AuthContext";

export default function MainLayout({ children }) {
  const location = useLocation();
  const { user } = useAuth();

  // Routes where navbar should not appear
  const noNavbarRoutes = ["/login", "/register", "/"];

  const showNavbar = !noNavbarRoutes.includes(location.pathname);
  const showProfileMenu = user && !noNavbarRoutes.includes(location.pathname);
  const showSignInButton = !user && !noNavbarRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-[#0b0f1a]">
      {showNavbar && (
        <nav className="bg-[#0b0f1a] border-b border-white/10 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <Navbar />
            {showProfileMenu && <ProfileNotificationMenu />}
            {showSignInButton && (
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold text-white transition"
              >
                Sign In
              </Link>
            )}
          </div>
        </nav>
      )}
      <main>{children}</main>
    </div>
  );
}
