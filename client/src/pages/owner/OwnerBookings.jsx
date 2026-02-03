import { useEffect, useState } from "react";
import { getOwnerBookings, getOwnerLots } from "../../api/owner";
import BookingFilterBar from "../../components/owner/BookingFilterBar";
import OwnerBookingRow from "../../components/owner/OwnerBookingRow";
import { exportToCSV } from "../../utils/exportCsv";
import { FileDown, Calendar, MapPin, TrendingUp } from "lucide-react";
import { useSocket } from "../../hooks/useSocket";

const OwnerBookings = () => {
  const socket = useSocket();
  const [lots, setLots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [filters, setFilters] = useState({
    lotId: "",
    status: "",
    from: "",
    to: "",
  });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    revenue: 0,
  });

  useEffect(() => {
    const loadLots = async () => {
      const res = await getOwnerLots();
      setLots(res.data.lots);
    };

    loadLots();
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const res = await getOwnerBookings(filters);
        const bookingsData = res.data.bookings;
        setBookings(bookingsData);
        updateStats(bookingsData);
      } catch (err) {
        console.error("Failed to load bookings", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [filters]);

  const updateStats = (bookingsData) => {
    const active = bookingsData.filter((b) => b.status === "active").length;
    const completed = bookingsData.filter(
      (b) => b.status === "completed",
    ).length;
    const totalRevenue = bookingsData.reduce(
      (sum, b) => sum + (b.totalAmount || 0) + (b.overtimeAmount || 0),
      0,
    );

    setStats({
      total: bookingsData.length,
      active,
      completed,
      revenue: totalRevenue,
    });
  };

  // Real-time socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleBookingCreated = (booking) => {
      setBookings((prev) => [booking, ...prev]);
      setStats((prev) => ({
        ...prev,
        total: prev.total + 1,
        active: booking.status === "active" ? prev.active + 1 : prev.active,
        revenue: prev.revenue + (booking.totalAmount || 0),
      }));
    };

    const handleBookingUpdated = (booking) => {
      setBookings((prev) => {
        const updated = prev.map((b) => (b._id === booking._id ? booking : b));
        updateStats(updated);
        return updated;
      });
    };

    const handleBookingExtended = (booking) => {
      setBookings((prev) => {
        const updated = prev.map((b) => (b._id === booking._id ? booking : b));
        updateStats(updated);
        return updated;
      });
    };

    socket.on("booking:created", handleBookingCreated);
    socket.on("booking:updated", handleBookingUpdated);
    socket.on("booking:completed", handleBookingUpdated);
    socket.on("booking:extended", handleBookingExtended);
    socket.on("booking:status_changed", handleBookingUpdated);

    return () => {
      socket.off("booking:created", handleBookingCreated);
      socket.off("booking:updated", handleBookingUpdated);
      socket.off("booking:completed", handleBookingUpdated);
      socket.off("booking:extended", handleBookingExtended);
      socket.off("booking:status_changed", handleBookingUpdated);
    };
  }, [socket]);

  const handleExport = () => {
    const rows = bookings.map((b) => ({
      parking: b.parkingLot?.name,
      spot: b.spot?.number,
      startTime: new Date(b.startTime).toLocaleString(),
      endTime: new Date(b.endTime).toLocaleString(),
      status: b.status,
      totalAmount: b.totalAmount,
      overtimeAmount: b.overtimeAmount,
    }));

    exportToCSV(rows, "owner-bookings.csv");
  };

  const StatCard = ({ icon: Icon, label, value }) => (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700/50 shadow-lg hover:border-blue-500/30 transition">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-300 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
        </div>
        <div className="bg-blue-500/20 p-3 rounded-lg">
          <Icon className="w-6 h-6 text-blue-400" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white">Booking History</h1>
            <p className="text-gray-300 mt-2">
              Manage and track all bookings across your parking lots
            </p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold transition shadow-lg"
          >
            <FileDown className="w-5 h-5" />
            Export CSV
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            icon={Calendar}
            label="Total Bookings"
            value={stats.total}
          />
          <StatCard icon={TrendingUp} label="Active" value={stats.active} />
          <StatCard icon={MapPin} label="Completed" value={stats.completed} />
          <StatCard
            icon={TrendingUp}
            label="Total Revenue"
            value={`$${stats.revenue.toFixed(2)}`}
          />
        </div>

        {/* Filter Bar */}
        <BookingFilterBar lots={lots} filters={filters} onChange={setFilters} />

        {/* Bookings Table */}
        <div className="rounded-xl overflow-hidden shadow-xl border border-slate-700/50 bg-slate-800">
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4">
            <div className="grid grid-cols-6 gap-4 text-xs font-semibold text-gray-200 uppercase tracking-wider">
              <div>Parking Lot</div>
              <div>Spot Number</div>
              <div>Check-in Date</div>
              <div>Total Amount</div>
              <div>Status</div>
              <div>Check-out Time</div>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
              <p className="text-gray-300 mt-4">Loading bookings…</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-4 opacity-50" />
              <p className="text-gray-300 text-lg">No bookings found</p>
              <p className="text-gray-400 text-sm mt-1">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700/50">
              {bookings.map((b) => (
                <OwnerBookingRow key={b._id} booking={b} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerBookings;
