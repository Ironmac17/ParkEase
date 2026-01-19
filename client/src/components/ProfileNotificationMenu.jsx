import React, { useState } from "react";
import { Bell, User, LogOut, Settings, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../hooks/useToast";

const ProfileNotificationMenu = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: "Booking confirmed",
      time: "2 min ago",
      read: false,
    },
    {
      id: 2,
      message: "Parking spot available",
      time: "5 min ago",
      read: false,
    },
  ]);

  const handleLogout = () => {
    logout();
    showToast("Logged out successfully", "success");
    navigate("/");
    setShowUserMenu(false);
  };

  const handleMarkRead = (id) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)),
    );
  };

  return (
    <div className="flex items-center gap-4">
      {/* Notification Bell */}
      <div className="relative">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2 hover:bg-white/5 rounded-lg transition"
        >
          <Bell size={20} className="text-gray-300" />
          {notifications.some((n) => !n.read) && (
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </button>

        {/* Notifications Dropdown */}
        {showNotifications && (
          <div className="absolute right-0 mt-2 w-80 bg-[#0b0f1a] border border-white/10 rounded-xl shadow-lg z-50">
            <div className="p-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">Notifications</h3>
            </div>
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                No notifications
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleMarkRead(notif.id)}
                    className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition ${
                      !notif.read ? "bg-blue-600/10" : ""
                    }`}
                  >
                    <p className="text-white text-sm font-medium">
                      {notif.message}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">{notif.time}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Menu */}
      <div className="relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="p-2 hover:bg-white/5 rounded-lg transition"
        >
          <User size={20} className="text-gray-300" />
        </button>

        {/* User Dropdown */}
        {showUserMenu && (
          <div className="absolute right-0 mt-2 w-56 bg-[#0b0f1a] border border-white/10 rounded-xl shadow-lg z-50">
            {/* User Info */}
            <div className="p-4 border-b border-white/10">
              <p className="text-white font-bold">{user?.name}</p>
              <p className="text-gray-400 text-sm">{user?.email}</p>
            </div>

            {/* Profile Option */}
            <button
              onClick={() => {
                navigate("/settings/profile");
                setShowUserMenu(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-blue-500/10 transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <User size={18} className="text-blue-400" />
                <span className="text-white">Edit Profile</span>
              </div>
              <ChevronRight
                size={18}
                className="text-gray-500 group-hover:text-gray-400"
              />
            </button>

            {/* Settings Option */}
            <button
              onClick={() => {
                navigate("/settings/general");
                setShowUserMenu(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-white/5 transition flex items-center justify-between group border-t border-white/10"
            >
              <div className="flex items-center gap-3">
                <Settings size={18} className="text-gray-400" />
                <span className="text-white">Settings</span>
              </div>
              <ChevronRight
                size={18}
                className="text-gray-500 group-hover:text-gray-400"
              />
            </button>

            {/* Logout Option */}
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 text-left hover:bg-red-500/10 transition flex items-center gap-3 border-t border-white/10"
            >
              <LogOut size={18} className="text-red-400" />
              <span className="text-red-400">Logout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileNotificationMenu;
