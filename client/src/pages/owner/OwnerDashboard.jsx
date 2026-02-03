import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOwnerDashboard, getOwnerRevenue } from "../../api/owner";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../hooks/useSocket";
import { TrendingUp, ParkingCircle, DollarSign, Calendar } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const OwnerDashboard = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const [dashRes, revRes] = await Promise.all([
        getOwnerDashboard(),
        getOwnerRevenue(),
      ]);
      setData(dashRes.data);
      setRevenueData(revRes.data);
    } catch (err) {
      console.error("Failed to load owner dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (!user || !socket) return;

    socket.emit("join_owner", user._id);
    socket.on("booking:created", fetchDashboard);
    socket.on("booking:completed", fetchDashboard);
    socket.on("booking:updated", fetchDashboard);
    socket.on("spot_update", fetchDashboard);

    return () => {
      socket.off("booking:created", fetchDashboard);
      socket.off("booking:completed", fetchDashboard);
      socket.off("booking:updated", fetchDashboard);
      socket.off("spot_update", fetchDashboard);
    };
  }, [user, socket]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b0f1a] to-[#1a1f2e] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-300">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b0f1a] to-[#1a1f2e] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Unable to load dashboard</p>
          <button
            onClick={fetchDashboard}
            className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-lg text-white"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { totalLots, totalSpots, occupiedSpots, todayRevenue, activeBookings } =
    data;
  const occupancyRate =
    totalSpots > 0 ? Math.round((occupiedSpots / totalSpots) * 100) : 0;

  const chartData = revenueData
    ? [
        { name: "Today", revenue: revenueData.today },
        { name: "7 Days", revenue: revenueData.last7Days },
        { name: "30 Days", revenue: revenueData.last30Days },
      ]
    : [];

  const pieData = [
    { name: "Occupied", value: occupiedSpots, color: "#ef4444" },
    { name: "Available", value: totalSpots - occupiedSpots, color: "#10b981" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0f1a] to-[#1a1f2e] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Owner Dashboard
          </h1>
          <p className="text-gray-400">
            Welcome back, {user?.username}! Manage your parking lots and track
            revenue.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Lots */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:border-white/20 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-2">Parking Lots</p>
                <p className="text-3xl font-bold text-white">{totalLots}</p>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <ParkingCircle size={28} className="text-blue-400" />
              </div>
            </div>
          </div>

          {/* Total Spots */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:border-white/20 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-2">Total Spots</p>
                <p className="text-3xl font-bold text-white">{totalSpots}</p>
              </div>
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <Calendar size={28} className="text-purple-400" />
              </div>
            </div>
          </div>

          {/* Occupancy Rate */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:border-white/20 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-2">Occupancy Rate</p>
                <p className="text-3xl font-bold text-white">
                  {occupancyRate}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {occupiedSpots} of {totalSpots} spots
                </p>
              </div>
              <div className="bg-orange-500/20 p-3 rounded-lg">
                <TrendingUp size={28} className="text-orange-400" />
              </div>
            </div>
          </div>

          {/* Today's Revenue */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:border-white/20 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-2">Today's Revenue</p>
                <p className="text-3xl font-bold text-white">
                  ₹{todayRevenue.toLocaleString()}
                </p>
              </div>
              <div className="bg-green-500/20 p-3 rounded-lg">
                <DollarSign size={28} className="text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Revenue Trends
            </h2>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.8)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-center py-8">
                No revenue data available
              </p>
            )}
          </div>

          {/* Occupancy Pie Chart */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Occupancy Overview
            </h2>
            {totalSpots > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.8)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#fff" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-center py-8">
                No occupancy data available
              </p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => navigate("/owner/lots")}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 px-6 rounded-xl font-semibold transition transform hover:scale-105"
          >
            📍 Manage Parking Lots
          </button>
          <button
            onClick={() => navigate("/owner/bookings")}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-4 px-6 rounded-xl font-semibold transition transform hover:scale-105"
          >
            📋 View Bookings
          </button>
          <button
            onClick={() => navigate("/owner/revenue")}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 px-6 rounded-xl font-semibold transition transform hover:scale-105"
          >
            📊 Revenue Analytics
          </button>
        </div>

        {/* Active Bookings */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Active Bookings
          </h2>

          {activeBookings && activeBookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-gray-400">Lot</th>
                    <th className="text-left py-3 px-4 text-gray-400">Spot</th>
                    <th className="text-left py-3 px-4 text-gray-400">User</th>
                    <th className="text-left py-3 px-4 text-gray-400">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-gray-400">
                      Check-in
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {activeBookings.slice(0, 5).map((booking) => (
                    <tr
                      key={booking._id}
                      className="border-b border-white/5 hover:bg-white/5 transition"
                    >
                      <td className="py-3 px-4 text-white">
                        {booking.parkingLot?.name || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-white">
                        {booking.parkingSpot?.label || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        {booking.user?.username || "N/A"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            booking.status === "active"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-blue-500/20 text-blue-400"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        {new Date(booking.startTime).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {activeBookings.length > 5 && (
                <p className="text-gray-400 text-sm mt-4">
                  Showing 5 of {activeBookings.length} active bookings
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">
              No active bookings at the moment
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
