import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  MapPin,
  BookOpen,
  Wallet,
  LogOut,
  TrendingUp,
  Clock,
  ArrowRight,
  ParkingCircle,
  Eye,
  Zap,
  BarChart3,
  PieChart,
} from "lucide-react";
import { useState, useEffect } from "react";
import axios from "../../api/axios";

// Simple Chart Components
function SimpleBarChart({ data, label }) {
  const max = Math.max(...data.values);
  return (
    <div className="space-y-3">
      {data.labels.map((l, i) => (
        <div key={i}>
          <p className="text-xs text-gray-400 mb-1">{l}</p>
          <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
              style={{ width: `${(data.values[i] / max) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {data.values[i]} bookings
          </p>
        </div>
      ))}
    </div>
  );
}

function PieChartSimple({ data }) {
  const total = data.values.reduce((a, b) => a + b, 0);
  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

  // If no data, show empty state
  if (total === 0) {
    return (
      <div className="flex items-center justify-center">
        <div className="relative w-32 h-32 flex items-center justify-center">
          <p className="text-gray-400 text-sm">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <div className="relative w-32 h-32">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full transform -rotate-90"
        >
          {data.values.map((val, i) => {
            const percentage = (val / total) * 100;
            const offset =
              (data.values.slice(0, i).reduce((a, b) => a + b, 0) / total) *
              360;
            return (
              <circle
                key={i}
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={colors[i % colors.length]}
                strokeWidth="8"
                strokeDasharray={`${percentage * 2.51} 251`}
                strokeDashoffset={(-offset * 2.51) / 360}
                className="transition-all duration-500"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{total}</p>
            <p className="text-xs text-gray-400">Total</p>
          </div>
        </div>
      </div>
      <div className="ml-6 space-y-2">
        {data.labels.map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: colors[i % colors.length] }}
            ></div>
            <span className="text-sm text-gray-400">{label}</span>
            <span className="text-sm font-semibold text-white ml-auto">
              {data.values[i]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    walletBalance: 0,
    completedBookings: 0,
    cancelledBookings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [bookingsRes, walletRes] = await Promise.all([
        axios.get("/bookings").catch(() => ({ data: [] })),
        axios.get("/wallet/balance").catch(() => ({ data: { balance: 0 } })),
      ]);

      const allBookings = Array.isArray(bookingsRes.data)
        ? bookingsRes.data
        : bookingsRes.data.bookings || [];

      const active = allBookings.filter(
        (b) => b.status === "ACTIVE" || b.status === "CHECKED_IN",
      ).length;

      const completed = allBookings.filter(
        (b) => b.status === "COMPLETED",
      ).length;
      const cancelled = allBookings.filter(
        (b) => b.status === "CANCELLED",
      ).length;

      setStats({
        totalBookings: allBookings.length,
        activeBookings: active,
        walletBalance: walletRes.data.balance || 0,
        completedBookings: completed,
        cancelledBookings: cancelled,
      });
    } catch (err) {
      console.error("Failed to load stats", err);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Find Parking",
      description: "Search and book parking spaces near you",
      icon: MapPin,
      link: "/discover",
      color: "from-blue-600 to-cyan-500",
      bgColor: "bg-blue-500/20",
      borderColor: "border-blue-500/30",
      hoverColor: "hover:border-blue-500/60",
      textColor: "text-blue-400",
    },
    {
      title: "My Bookings",
      description: "Track your active and past bookings",
      icon: BookOpen,
      link: "/my-bookings",
      color: "from-purple-600 to-pink-500",
      bgColor: "bg-purple-500/20",
      borderColor: "border-purple-500/30",
      hoverColor: "hover:border-purple-500/60",
      textColor: "text-purple-400",
    },
    {
      title: "Wallet",
      description: "Manage your balance and payments",
      icon: Wallet,
      link: "/wallet",
      color: "from-green-600 to-emerald-500",
      bgColor: "bg-green-500/20",
      borderColor: "border-green-500/30",
      hoverColor: "hover:border-green-500/60",
      textColor: "text-green-400",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0f1a] via-[#1a1f2e] to-[#0b0f1a] pt-8 px-6 pb-10">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-10">
          <div className="flex items-end justify-between mb-2">
            <div>
              <h1 className="text-5xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-1">
                Welcome back, {user?.username}! 👋
              </h1>
              <p className="text-gray-400 text-lg">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Main Stats Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Total Bookings Card */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 p-8 hover:border-blue-500/60 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <BookOpen
                    className="text-blue-300 group-hover:text-blue-200"
                    size={28}
                  />
                  <TrendingUp
                    className="text-blue-400 group-hover:scale-110 transition-transform"
                    size={20}
                  />
                </div>
                <p className="text-gray-400 text-sm mb-2 font-medium">
                  Total Bookings
                </p>
                <h3 className="text-4xl font-black text-white mb-2">
                  {stats.totalBookings}
                </h3>
                <p className="text-xs text-gray-500">All time bookings</p>
              </div>
            </div>

            {/* Active Bookings Card */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 p-8 hover:border-green-500/60 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <Clock
                    className="text-green-300 group-hover:text-green-200"
                    size={28}
                  />
                  <Eye
                    className="text-green-400 group-hover:scale-110 transition-transform"
                    size={20}
                  />
                </div>
                <p className="text-gray-400 text-sm mb-2 font-medium">
                  Active Now
                </p>
                <h3 className="text-4xl font-black text-white mb-2">
                  {stats.activeBookings}
                </h3>
                <p className="text-xs text-gray-500">Currently parked</p>
              </div>
            </div>

            {/* Completed Bookings */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 p-8 hover:border-purple-500/60 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <BarChart3
                    className="text-purple-300 group-hover:text-purple-200"
                    size={28}
                  />
                  <Zap
                    className="text-purple-400 group-hover:scale-110 transition-transform"
                    size={20}
                  />
                </div>
                <p className="text-gray-400 text-sm mb-2 font-medium">
                  Completed
                </p>
                <h3 className="text-4xl font-black text-white mb-2">
                  {stats.completedBookings}
                </h3>
                <p className="text-xs text-gray-500">Finished bookings</p>
              </div>
            </div>

            {/* Wallet Balance Card */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-600/20 to-orange-600/20 border border-amber-500/30 p-8 hover:border-amber-500/60 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <Wallet
                    className="text-amber-300 group-hover:text-amber-200"
                    size={28}
                  />
                  <TrendingUp
                    className="text-amber-400 group-hover:scale-110 transition-transform"
                    size={20}
                  />
                </div>
                <p className="text-gray-400 text-sm mb-2 font-medium">
                  Wallet Balance
                </p>
                <h3 className="text-3xl font-black text-white mb-2">
                  ₹{stats.walletBalance?.toFixed(2) || "0.00"}
                </h3>
                <p className="text-xs text-gray-500">Available balance</p>
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Booking Status Chart */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-8">
                <PieChart className="text-purple-400" size={24} />
                <h3 className="text-xl font-bold text-white">
                  Booking Status Distribution
                </h3>
              </div>
              <PieChartSimple
                data={{
                  labels: ["Active", "Completed", "Cancelled"],
                  values: [
                    stats.activeBookings,
                    stats.completedBookings,
                    stats.cancelledBookings,
                  ],
                }}
              />
            </div>

            {/* Booking Trend */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-8">
                <BarChart3 className="text-blue-400" size={24} />
                <h3 className="text-xl font-bold text-white">
                  Booking Breakdown
                </h3>
              </div>
              <SimpleBarChart
                data={{
                  labels: ["Total", "Active", "Completed"],
                  values: [
                    stats.totalBookings,
                    stats.activeBookings,
                    stats.completedBookings,
                  ],
                }}
              />
            </div>
          </div>
        )}

        {/* Quick Actions Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-black text-white mb-8">Get Started</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.title}
                  to={action.link}
                  className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${action.color} ${action.bgColor} border ${action.borderColor} ${action.hoverColor} p-8 transition-all duration-300 hover:shadow-lg`}
                >
                  {/* Background shimmer effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute -left-full group-hover:left-full transition-all duration-700 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                      <div
                        className={`${action.bgColor} p-4 rounded-xl border ${action.borderColor} group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-300`}
                      >
                        <Icon
                          className={`${action.textColor} group-hover:brightness-125`}
                          size={32}
                        />
                      </div>
                      <ArrowRight
                        className={`${action.textColor} group-hover:translate-x-2 transition-transform`}
                        size={20}
                      />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2 group-hover:brightness-125 transition-all">
                      {action.title}
                    </h3>
                    <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">
                      {action.description}
                    </p>
                    <div className="mt-6 flex items-center gap-2">
                      <span
                        className={`${action.textColor} font-bold group-hover:translate-x-1 transition-transform`}
                      >
                        Start exploring
                      </span>
                      <ArrowRight
                        className={`${action.textColor} group-hover:translate-x-2 transition-transform`}
                        size={16}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Role-Based Sections */}
        {user?.role === "owner" && (
          <div className="mb-12 bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-500/30 rounded-2xl p-8 hover:border-amber-500/60 transition-all duration-300">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-black text-white mb-2">
                  Owner Dashboard
                </h3>
                <p className="text-gray-400">
                  Manage your parking lots, track revenue, and monitor bookings
                </p>
              </div>
              <ParkingCircle
                className="text-amber-400 hidden md:block"
                size={32}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/owner/lots"
                className="group bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 hover:border-amber-500/60 text-white px-6 py-4 rounded-xl transition-all duration-300 font-semibold text-center hover:shadow-lg hover:shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                <ParkingCircle size={18} />
                <span>My Parking Lots</span>
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
              <Link
                to="/owner/bookings"
                className="group bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 hover:border-amber-500/60 text-white px-6 py-4 rounded-xl transition-all duration-300 font-semibold text-center hover:shadow-lg hover:shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                <BookOpen size={18} />
                <span>View Bookings</span>
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
              <Link
                to="/owner/revenue"
                className="group bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 hover:border-amber-500/60 text-white px-6 py-4 rounded-xl transition-all duration-300 font-semibold text-center hover:shadow-lg hover:shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                <TrendingUp size={18} />
                <span>Revenue</span>
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>
          </div>
        )}

        {user?.role === "admin" && (
          <div className="bg-gradient-to-r from-red-600/20 to-pink-600/20 border border-red-500/30 rounded-2xl p-8 hover:border-red-500/60 transition-all duration-300">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-black text-white mb-2">
                  Admin Control Panel
                </h3>
                <p className="text-gray-400">
                  Manage users, parkings, festivals, and system settings
                </p>
              </div>
              <Eye className="text-red-400 hidden md:block" size={32} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/admin/dashboard"
                className="group bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/60 text-white px-6 py-4 rounded-xl transition-all duration-300 font-semibold text-center hover:shadow-lg hover:shadow-red-500/20 flex items-center justify-center gap-2"
              >
                <TrendingUp size={18} />
                <span>Dashboard</span>
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
              <Link
                to="/admin/users"
                className="group bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/60 text-white px-6 py-4 rounded-xl transition-all duration-300 font-semibold text-center hover:shadow-lg hover:shadow-red-500/20 flex items-center justify-center gap-2"
              >
                <Eye size={18} />
                <span>Users</span>
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
              <Link
                to="/admin/parkings"
                className="group bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/60 text-white px-6 py-4 rounded-xl transition-all duration-300 font-semibold text-center hover:shadow-lg hover:shadow-red-500/20 flex items-center justify-center gap-2"
              >
                <ParkingCircle size={18} />
                <span>Parkings</span>
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
