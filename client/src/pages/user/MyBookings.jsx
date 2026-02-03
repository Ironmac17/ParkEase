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
import { downloadReceiptAsImage } from "../../utils/receiptGenerator";
const MyBookings = () => {
  const { user } = useAuth();
  const { showToast } = useContext(ToastContext);

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const downloadReceipt = (booking) => {
    try {
      downloadReceiptAsImage(booking, booking.qrCode);
    } catch (err) {
      showToast("Failed to download receipt", "error");
    }
  };

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
    } catch (err) {
      showToast(
        err?.response?.data?.message || "Failed to extend booking",
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
      showToast("Booking cancelled. Amount refunded.", "success");
      setShowCancelModal(null);
    } catch (err) {
      showToast(
        err?.response?.data?.message || "Failed to cancel booking",
        "error",
      );
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

  const isUpcomingBooking = (booking) => {
    const endTime = new Date(booking.endTime);
    const now = new Date();
    return (
      endTime > now &&
      (booking.status === "active" || booking.status === "confirmed")
    );
  };

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
                  <div className="flex items-center justify-end gap-2">
                    {/* Download Receipt */}
                    <button
                      onClick={() => downloadReceipt(b)}
                      className="p-2 rounded-lg
                   bg-green-600/20 border border-green-500/40
                   hover:bg-green-600/35 hover:border-green-500
                   text-green-300 transition"
                      title="Download receipt"
                    >
                      <Download size={18} />
                    </button>

                    {/* Show QR for upcoming bookings */}
                    {isUpcomingBooking(b) && (
                      <button
                        onClick={() => setShowQRModal(b._id)}
                        className="p-2 rounded-lg
                     bg-blue-600/20 border border-blue-500/40
                     hover:bg-blue-600/35 hover:border-blue-500
                     text-blue-300 transition"
                        title="Show QR Code"
                      >
                        <QrCode size={18} />
                      </button>
                    )}

                    {/* Extend for upcoming bookings */}
                    {isUpcomingBooking(b) && (
                      <button
                        onClick={() => setShowExtendModal(b._id)}
                        className="px-3 py-2 rounded-lg
                     bg-cyan-600/25 border border-cyan-500/40
                     hover:bg-cyan-600/40 hover:border-cyan-500
                     text-cyan-300 text-xs font-semibold
                     transition whitespace-nowrap"
                      >
                        Extend
                      </button>
                    )}

                    {/* Cancel for upcoming bookings */}
                    {isUpcomingBooking(b) && (
                      <button
                        onClick={() => setShowCancelModal(b._id)}
                        className="px-3 py-2 rounded-lg
                     bg-red-600/20 border border-red-500/40
                     hover:bg-red-600/35 hover:border-red-500
                     text-red-300 text-xs font-semibold
                     transition whitespace-nowrap"
                      >
                        Cancel
                      </button>
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0b0f1a] rounded-2xl w-full max-w-md border border-white/10 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border-b border-white/10 px-6 py-4 flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">Extend Booking</h2>
              <button
                onClick={() => setShowExtendModal(null)}
                className="text-gray-400 hover:text-white transition text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Select new end time
                </label>
                <input
                  type="datetime-local"
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none transition"
                />
              </div>

              {/* Booking info */}
              <div className="bg-white/4 border border-white/10 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Parking Lot</span>
                  <span className="text-white font-semibold">
                    {extendBooking.parkingLot?.name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Current End Time</span>
                  <span className="text-white font-semibold">
                    {new Date(extendBooking.endTime).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowExtendModal(null)}
                  className="flex-1 px-4 py-2 rounded-lg
                   bg-white/5 border border-white/10
                   hover:bg-white/10 hover:border-white/20
                   text-gray-300 text-sm font-semibold
                   transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExtendBooking}
                  disabled={extendingId === showExtendModal}
                  className="flex-1 px-4 py-2 rounded-lg
                   bg-cyan-600/30 border border-cyan-500/40
                   hover:bg-cyan-600/40 hover:border-cyan-500
                   text-cyan-300 text-sm font-semibold
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition"
                >
                  {extendingId === showExtendModal
                    ? "Extending..."
                    : "Extend Booking"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL MODAL */}
      {showCancelModal && cancelBooking && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0b0f1a] rounded-2xl w-full max-w-md border border-white/10 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600/20 to-red-700/20 border-b border-white/10 px-6 py-4 flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">Cancel Booking</h2>
              <button
                onClick={() => setShowCancelModal(null)}
                className="text-gray-400 hover:text-white transition text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="bg-red-600/20 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-400 text-center">
                  <span className="block text-sm text-gray-400 mb-1">
                    Amount to be refunded
                  </span>
                  <span className="text-2xl font-bold">
                    ₹{cancelBooking.amountPaid}
                  </span>
                </p>
              </div>

              <div className="bg-white/4 border border-white/10 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Parking Lot</span>
                  <span className="text-white font-semibold">
                    {cancelBooking.parkingLot?.name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Booking Time</span>
                  <span className="text-white font-semibold">
                    {new Date(cancelBooking.startTime).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-400 text-center">
                Are you sure you want to cancel this booking?
              </p>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowCancelModal(null)}
                  className="flex-1 px-4 py-2 rounded-lg
                   bg-white/5 border border-white/10
                   hover:bg-white/10 hover:border-white/20
                   text-gray-300 text-sm font-semibold
                   transition"
                >
                  Keep Booking
                </button>
                <button
                  onClick={handleCancelBooking}
                  disabled={cancelingId === showCancelModal}
                  className="flex-1 px-4 py-2 rounded-lg
                   bg-red-600/30 border border-red-500/40
                   hover:bg-red-600/40 hover:border-red-500
                   text-red-300 text-sm font-semibold
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition"
                >
                  {cancelingId === showCancelModal
                    ? "Cancelling..."
                    : "Confirm Cancel"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR MODAL */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0b0f1a] rounded-2xl border border-white/10 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-b border-white/10 px-6 py-4 flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">Booking QR Code</h2>
              <button
                onClick={() => setShowQRModal(null)}
                className="text-gray-400 hover:text-white transition text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="p-6 flex flex-col items-center gap-4">
              <QRCodeCanvas value={showQRModal} size={240} level="H" />
              <p className="text-sm text-gray-400 text-center">
                Show this QR code at the parking entrance
              </p>
              <button
                onClick={() => setShowQRModal(null)}
                className="w-full px-4 py-2 rounded-lg
                 bg-blue-600/30 border border-blue-500/40
                 hover:bg-blue-600/40 hover:border-blue-500
                 text-blue-300 text-sm font-semibold
                 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
