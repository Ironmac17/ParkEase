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
  Download,
  QrCode,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

const MyBookings = () => {
  const { user } = useAuth();
  const { showToast } = useContext(ToastContext);

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showExtendModal, setShowExtendModal] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(null);
  const [showQRModal, setShowQRModal] = useState(null);

  const [extendingId, setExtendingId] = useState(null);
  const [cancelingId, setCancelingId] = useState(null);
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
    } catch {
      showToast("Failed to load bookings", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleExtendBooking = async () => {
    if (!newEndTime) {
      showToast("Select a new end time", "warning");
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
            ? { ...b, endTime: res.data.newEndTime }
            : b,
        ),
      );

      showToast("Booking extended successfully", "success");
      setShowExtendModal(null);
      setNewEndTime("");
    } catch {
      showToast("Failed to extend booking", "error");
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
      showToast("Booking cancelled. Amount refunded.", "success");
      setShowCancelModal(null);
    } catch {
      showToast("Failed to cancel booking", "error");
    } finally {
      setCancelingId(null);
    }
  };

  const getStatusColor = (status) =>
    status === "active" || status === "confirmed"
      ? "bg-green-500/20 border-green-500 text-green-400"
      : status === "completed"
        ? "bg-blue-500/20 border-blue-500 text-blue-400"
        : "bg-red-500/20 border-red-500 text-red-400";

  const filteredBookings =
    filterStatus === "all"
      ? bookings
      : bookings.filter((b) =>
          filterStatus === "active"
            ? ["active", "confirmed"].includes(b.status)
            : b.status === filterStatus,
        );

  const extendBooking = bookings.find((b) => b._id === showExtendModal);
  const cancelBooking = bookings.find((b) => b._id === showCancelModal);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f1a] flex items-center justify-center text-gray-400">
        Loading bookings...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f1a] py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">My Bookings</h1>
          <p className="text-gray-400">Manage your parking bookings</p>
        </div>

        {/* FILTER */}
        <div className="mb-6 flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown((s) => !s)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-500/40
                         rounded-lg text-white font-semibold hover:bg-blue-600/30 transition"
            >
              <Filter size={16} />
              <span className="capitalize">{filterStatus}</span>
              <ChevronDown size={14} />
            </button>

            {showFilterDropdown && (
              <div className="absolute mt-2 w-40 bg-[#0b0f1a] border border-white/10 rounded-lg overflow-hidden z-40">
                {["all", "active", "completed", "cancelled"].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setFilterStatus(s);
                      setShowFilterDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left capitalize text-gray-300 hover:bg-white/5"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <span className="text-sm text-gray-400">
            {filteredBookings.length} booking
            {filteredBookings.length !== 1 && "s"}
          </span>
        </div>

        {/* BOOKINGS */}
        <div className="space-y-3">
          {filteredBookings.map((b) => (
            <div
              key={b._id}
              className="group bg-gradient-to-r from-white/6 to-white/3 border border-white/10
                         rounded-2xl p-5 hover:from-white/10 hover:to-white/6
                         hover:border-blue-500/40 hover:shadow-xl transition"
            >
              <div className="grid grid-cols-2 md:grid-cols-12 gap-5 items-center">
                {/* Spot */}
                <div className="md:col-span-3 flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/40
                                  flex items-center justify-center text-purple-300 font-bold"
                  >
                    {b.parkingSpot?.label}
                  </div>
                  <div>
                    <p className="text-white font-semibold">
                      {b.parkingLot?.name}
                    </p>
                    <p className="text-gray-500 text-xs flex items-center gap-1">
                      <MapPin size={12} />
                      {b.parkingLot?.address?.substring(0, 24)}…
                    </p>
                  </div>
                </div>

                {/* Time */}
                <div className="md:col-span-3 flex items-start gap-2">
                  <Clock size={16} className="text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-white text-sm font-semibold">
                      {new Date(b.startTime).toLocaleDateString()}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {new Date(b.startTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      →{" "}
                      {new Date(b.endTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                {/* Vehicle */}
                <div className="md:col-span-2 flex items-start gap-2">
                  <Car size={16} className="text-orange-400 mt-0.5" />
                  <div>
                    <p className="text-white text-sm font-semibold">
                      {b.vehicle?.registrationNumber}
                    </p>
                    <p className="text-gray-400 text-xs">{b.vehicle?.model}</p>
                  </div>
                </div>

                {/* Amount */}
                <div className="md:col-span-1">
                  <p className="text-green-400 font-bold text-lg">
                    ₹{b.amountPaid?.toFixed(0)}
                  </p>
                  <p className="text-gray-500 text-xs">paid</p>
                </div>

                {/* Status */}
                <div className="md:col-span-1">
                  <span
                    className={`px-3 py-1.5 rounded-full border text-xs font-semibold
                    ${getStatusColor(b.status)}`}
                  >
                    {b.status}
                  </span>
                </div>

                {/* Actions */}
                {/* Actions */}
                <div className="md:col-span-3">
                  <div
                    className="flex items-center justify-between gap-3
                  bg-white/4 border border-white/10 rounded-xl px-3 py-2"
                  >
                    {/* Utility actions */}
                    <div className="flex gap-2">
                      {(b.status === "active" || b.status === "confirmed") && (
                        <button
                          onClick={() => setShowQRModal(b._id)}
                          className="w-9 h-9 rounded-lg
                     bg-blue-600/20 border border-blue-500/40
                     hover:bg-blue-600/35 hover:border-blue-500
                     flex items-center justify-center
                     text-blue-300 transition"
                          title="Show QR"
                        >
                          <QrCode size={16} />
                        </button>
                      )}

                      <button
                        onClick={() => downloadReceipt(b)}
                        className="w-9 h-9 rounded-lg
                   bg-green-600/20 border border-green-500/40
                   hover:bg-green-600/35 hover:border-green-500
                   flex items-center justify-center
                   text-green-300 transition"
                        title="Download receipt"
                      >
                        <Download size={16} />
                      </button>
                    </div>

                    {/* Primary actions */}
                    {(b.status === "active" || b.status === "confirmed") && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowExtendModal(b._id)}
                          className="px-4 py-2 rounded-lg
                     bg-cyan-600/25 border border-cyan-500/40
                     hover:bg-cyan-600/40 hover:border-cyan-500
                     text-cyan-300 text-xs font-semibold
                     transition"
                        >
                          Extend
                        </button>

                        <button
                          onClick={() => setShowCancelModal(b._id)}
                          className="px-4 py-2 rounded-lg
                     bg-red-600/20 border border-red-500/40
                     hover:bg-red-600/35 hover:border-red-500
                     text-red-300 text-xs font-semibold
                     transition"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* EXTEND MODAL */}
      {showExtendModal && extendBooking && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#0b0f1a] p-6 rounded-xl w-full max-w-md border border-white/10">
            <input
              type="datetime-local"
              value={newEndTime}
              onChange={(e) => setNewEndTime(e.target.value)}
              className="w-full bg-white/10 p-3 rounded mb-4 text-white"
            />
            <button
              onClick={handleExtendBooking}
              className="w-full bg-blue-600 py-3 rounded text-white font-bold"
            >
              Extend Booking
            </button>
          </div>
        </div>
      )}

      {/* CANCEL MODAL */}
      {showCancelModal && cancelBooking && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#0b0f1a] p-6 rounded-xl w-full max-w-md border border-white/10">
            <p className="text-red-400 text-xl mb-4">
              Refund ₹{cancelBooking.amountPaid}
            </p>
            <button
              onClick={handleCancelBooking}
              className="w-full bg-red-600 py-3 rounded text-white font-bold"
            >
              Confirm Cancel
            </button>
          </div>
        </div>
      )}

      {/* QR MODAL */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl">
            <QRCodeCanvas value={showQRModal} size={220} />
            <button
              onClick={() => setShowQRModal(null)}
              className="mt-4 w-full bg-blue-600 py-2 rounded text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
