import { useEffect, useState } from "react";
import { getOwnerLots, getRevenueAnalytics } from "../../api/owner";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { DollarSign, TrendingUp } from "lucide-react";
import {
  formatCurrency,
  formatCurrencyWhole,
} from "../../utils/formatCurrency";

const OwnerRevenue = () => {
  const [lots, setLots] = useState([]);
  const [lotId, setLotId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadLots = async () => {
      try {
        const res = await getOwnerLots();
        setLots(res.data.lots);
        if (res.data.lots.length > 0) {
          setLotId(res.data.lots[0]._id);
        }
      } catch (err) {
        console.error("Failed to fetch lots", err);
      }
    };

    loadLots();
  }, []);

  useEffect(() => {
    if (!lotId) return;

    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await getRevenueAnalytics({
          lotId,
          from,
          to,
        });
        setData(res.data);
      } catch (err) {
        console.error("Failed to load revenue", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [lotId, from, to]);

  const chartData =
    data && data.bookings
      ? data.bookings.map((b, i) => ({
          index: i + 1,
          amount: b.amountPaid + (b.extraAmountPaid || 0),
          overtime: b.extraAmountPaid || 0,
          date: new Date(b.checkedOutAt).toLocaleDateString(),
        }))
      : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0f1a] to-[#1a1f2e] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Revenue Analytics
          </h1>
          <p className="text-gray-400">
            Track and analyze your parking lot revenue over time
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                Parking Lot
              </label>
              <select
                value={lotId}
                onChange={(e) => setLotId(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {lots.map((lot) => (
                  <option key={lot._id} value={lot._id}>
                    {lot.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">
                From Date
              </label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">
                To Date
              </label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {loading || !data ? (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-300">Loading analytics…</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Total Revenue</p>
                    <p className="text-3xl font-bold text-white">
                      {formatCurrency(data.totalRevenue)}
                    </p>
                  </div>
                  <div className="bg-green-500/20 p-3 rounded-lg">
                    <DollarSign size={28} className="text-green-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-2">
                      Overtime Revenue
                    </p>
                    <p className="text-3xl font-bold text-white">
                      {formatCurrency(data.overtimeRevenue)}
                    </p>
                  </div>
                  <div className="bg-orange-500/20 p-3 rounded-lg">
                    <TrendingUp size={28} className="text-orange-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Total Bookings</p>
                    <p className="text-3xl font-bold text-white">
                      {data.totalBookings || 0}
                    </p>
                    {data.totalBookings > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Avg: {formatCurrency(data.averagePerBooking || 0)}
                      </p>
                    )}
                  </div>
                  <div className="bg-blue-500/20 p-3 rounded-lg">
                    <DollarSign size={28} className="text-blue-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            {chartData.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Bar Chart */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">
                    Revenue per Booking
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.1)"
                      />
                      <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(15, 23, 42, 0.8)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "#fff" }}
                      />
                      <Legend />
                      <Bar
                        dataKey="amount"
                        fill="#3b82f6"
                        name="Revenue"
                        radius={[8, 8, 0, 0]}
                      />
                      <Bar
                        dataKey="overtime"
                        fill="#ef4444"
                        name="Overtime"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Cumulative Revenue Line Chart */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">
                    Cumulative Revenue
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.1)"
                      />
                      <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(15, 23, 42, 0.8)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "#fff" }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#10b981"
                        name="Revenue"
                        strokeWidth={2}
                        dot={{ fill: "#10b981", r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-12 text-center">
                <p className="text-gray-400">
                  No booking data available for the selected period
                </p>
              </div>
            )}

            {/* Bookings Table */}
            {data.bookings && data.bookings.length > 0 && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 mt-8">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Booking Details
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-gray-400">
                          Booking ID
                        </th>
                        <th className="text-left py-3 px-4 text-gray-400">
                          User
                        </th>
                        <th className="text-left py-3 px-4 text-gray-400">
                          Amount
                        </th>
                        <th className="text-left py-3 px-4 text-gray-400">
                          Overtime
                        </th>
                        <th className="text-left py-3 px-4 text-gray-400">
                          Total
                        </th>
                        <th className="text-left py-3 px-4 text-gray-400">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.bookings.slice(0, 10).map((booking) => (
                        <tr
                          key={booking._id}
                          className="border-b border-white/5 hover:bg-white/5 transition"
                        >
                          <td className="py-3 px-4 text-white font-mono text-xs">
                            {booking._id.slice(0, 8)}
                          </td>
                          <td className="py-3 px-4 text-gray-300">
                            {booking.user?.username || "N/A"}
                          </td>
                          <td className="py-3 px-4 text-white">
                            {formatCurrency(booking.amountPaid)}
                          </td>
                          <td className="py-3 px-4 text-orange-400">
                            {formatCurrency(booking.extraAmountPaid || 0)}
                          </td>
                          <td className="py-3 px-4 text-green-400 font-semibold">
                            {formatCurrency(
                              booking.amountPaid +
                                (booking.extraAmountPaid || 0),
                            )}
                          </td>
                          <td className="py-3 px-4 text-gray-300">
                            {new Date(
                              booking.checkedOutAt,
                            ).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {data.bookings.length > 10 && (
                    <p className="text-gray-400 text-sm mt-4">
                      Showing 10 of {data.bookings.length} bookings
                    </p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OwnerRevenue;
