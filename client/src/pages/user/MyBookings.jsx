import { useEffect, useState, useContext } from "react";
import axios from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { ToastContext } from "../../context/ToastContext";
import {
  Clock,
  MapPin,
  Car,
  DollarSign,
  Filter,
  ChevronDown,
} from "lucide-react";

const MyBookings = () => {
  const { user } = useAuth();
  const { showToast } = useContext(ToastContext);

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [extendingId, setExtendingId] = useState(null);
  const [cancelingId, setCancelingId] = useState(null);

  const [showExtendModal, setShowExtendModal] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(null);

  const [newEndTime, setNewEndTime] = useState("");

  const [filterStatus, setFilterStatus] = useState("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/bookings");
      setBookings(Array.isArray(res.data) ? res.data : res.data.bookings || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load bookings");
      showToast("Failed to load bookings", "error");
    } finally {
      setLoading(false);
    }
  };

  const calculateDuration = (start, end) => {
    const diff = new Date(end) - new Date(start);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const handleExtendBooking = async () => {
    if (!newEndTime) {
      showToast("Please select a new end time", "warning");
      return;
    }

    const booking = bookings.find((b) => b._id === showExtendModal);
    if (!booking) return;

    const selected = new Date(newEndTime);
    const max = new Date(booking.endTime);
    max.setHours(max.getHours() + 12);

    if (selected > max) {
      showToast("Cannot extend more than 12 hours", "warning");
      return;
    }

    setExtendingId(showExtendModal);
    try {
      const res = await axios.post(`/bookings/${showExtendModal}/extend`, {
        newEndTime,
      });

      setBookings((prev) =>
        prev.map((b) =>
          b._id === showExtendModal
            ? {
                ...b,
                endTime: res.data.newEndTime,
                amountPaid: res.data.amountPaid ?? b.amountPaid,
              }
            : b,
        ),
      );

      showToast(
        `Booking extended. Extra charge ₹${res.data.extraAmountPaid?.toFixed(2) || "0.00"}`,
        "success",
      );

      setShowExtendModal(null);
      setNewEndTime("");
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to extend booking",
        "error",
      );
    } finally {
      setExtendingId(null);
    }
  };

  const handleCancelBooking = async () => {
    setCancelingId(showCancelModal);
    try {
      await axios.post(`/bookings/${showCancelModal}/cancel`);

      setBookings((prev) =>
        prev.map((b) =>
          b._id === showCancelModal ? { ...b, status: "cancelled" } : b,
        ),
      );

      showToast("Booking cancelled. Amount refunded to wallet.", "success");
      setShowCancelModal(null);
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to cancel booking",
        "error",
      );
    } finally {
      setCancelingId(null);
    }
  };

  const getStatusColor = (status) => {
    if (status === "active" || status === "confirmed")
      return "bg-green-500/20 border-green-500 text-green-400";
    if (status === "completed")
      return "bg-blue-500/20 border-blue-500 text-blue-400";
    if (status === "cancelled")
      return "bg-red-500/20 border-red-500 text-red-400";
    return "bg-gray-500/20 border-gray-500 text-gray-400";
  };

  const filteredBookings =
    filterStatus === "all"
      ? bookings
      : bookings.filter((b) =>
          filterStatus === "active"
            ? b.status === "active" || b.status === "confirmed"
            : b.status === filterStatus,
        );

  const extendBooking = bookings.find((b) => b._id === showExtendModal);
  const cancelBooking = bookings.find((b) => b._id === showCancelModal);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f1a] flex items-center justify-center text-gray-400">
        Loading your bookings...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f1a] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">My Bookings</h1>

          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown((s) => !s)}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            >
              <Filter size={18} />
              <span className="capitalize">{filterStatus}</span>
              <ChevronDown size={16} />
            </button>

            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-[#0b0f1a] border border-white/10 rounded-lg z-40">
                {["active", "completed", "cancelled", "all"].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setFilterStatus(s);
                      setShowFilterDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left capitalize hover:bg-white/5 text-gray-300"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bookings */}
        {filteredBookings.length === 0 ? (
          <p className="text-center text-gray-400 py-16">No bookings found</p>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((b) => (
              <div
                key={b._id}
                className="bg-white/5 border border-white/10 rounded-xl p-5"
              >
                <div className="flex justify-between mb-3">
                  <div>
                    <h3 className="text-white font-bold">
                      {b.parkingSpot?.label}
                    </h3>
                    <p className="text-gray-400 text-sm flex items-center gap-1">
                      <MapPin size={14} />
                      {b.parkingLot?.name}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full border text-xs ${getStatusColor(b.status)}`}
                  >
                    {b.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
                  <span className="flex items-center gap-2 text-gray-300">
                    <Clock size={14} />
                    {new Date(b.startTime).toLocaleTimeString()} –{" "}
                    {new Date(b.endTime).toLocaleTimeString()}
                  </span>
                  <span className="flex items-center gap-2 text-gray-300">
                    <Car size={14} />
                    {b.vehicle?.registrationNumber}
                  </span>
                  <span className="flex items-center gap-2 text-green-400">
                    <DollarSign size={14} /> ₹{b.amountPaid?.toFixed(2)}
                  </span>
                </div>

                {(b.status === "active" || b.status === "confirmed") && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowExtendModal(b._id)}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg"
                    >
                      Extend
                    </button>
                    <button
                      onClick={() => setShowCancelModal(b._id)}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EXTEND MODAL */}
      {showExtendModal && extendBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#0b0f1a] p-6 rounded-xl max-w-md w-full">
            <h2 className="text-white text-xl mb-4">Extend Booking</h2>

            <input
              type="datetime-local"
              value={newEndTime}
              onChange={(e) => setNewEndTime(e.target.value)}
              min={new Date(extendBooking.endTime).toISOString().slice(0, 16)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white mb-4"
            />

            <button
              onClick={handleExtendBooking}
              className="w-full bg-blue-600 text-white py-2 rounded-lg"
            >
              Extend
            </button>
          </div>
        </div>
      )}

      {/* CANCEL MODAL */}
      {showCancelModal && cancelBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#0b0f1a] p-6 rounded-xl max-w-md w-full">
            <h2 className="text-white text-xl mb-4">Cancel Booking?</h2>

            <p className="text-red-300 mb-6">
              ₹{cancelBooking.amountPaid?.toFixed(2)} will be refunded to wallet
            </p>

            <button
              onClick={handleCancelBooking}
              className="w-full bg-red-600 text-white py-2 rounded-lg"
            >
              Confirm Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
