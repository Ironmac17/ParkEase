import { useLocation } from "react-router-dom";
import Navbar from "./discover/Navbar";

export default function MainLayout({ children }) {
  const location = useLocation();

  // Routes where navbar should not appear
  const noNavbarRoutes = ["/login", "/register", "/"];

  const showNavbar = !noNavbarRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-[#0b0f1a]">
      {showNavbar && <Navbar />}
      <main>{children}</main>
    </div>
  );
}
