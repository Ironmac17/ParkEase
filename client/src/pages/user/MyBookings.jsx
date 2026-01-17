import { useEffect, useState } from "react";
import axios from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { Clock, MapPin, Car, Calendar, DollarSign } from "lucide-react";

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading your bookings...
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
      case "CHECKED_IN":
        return "bg-green-500/20 border-green-500 text-green-400";
      case "COMPLETED":
        return "bg-blue-500/20 border-blue-500 text-blue-400";
      case "CANCELLED":
        return "bg-red-500/20 border-red-500 text-red-400";
      default:
        return "bg-gray-500/20 border-gray-500 text-gray-400";
    }
  };

  const activeBooking = bookings.find(
    (b) => b.status === "ACTIVE" || b.status === "CHECKED_IN"
  );
  const otherBookings = bookings.filter(
    (b) => b.status !== "ACTIVE" && b.status !== "CHECKED_IN"
  );

  return (
    <div className="min-h-screen bg-[#0b0f1a] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">My Bookings</h1>

        {error && (
          <div className="mb-6 text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Calendar size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">No bookings yet</p>
            <p className="text-sm">Go to Find Parking to book a spot</p>
          </div>
        ) : (
          <>
            {/* Active Booking */}
            {activeBooking && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-white mb-4">
                  Active Booking
                </h2>
                <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-2 border-green-500/50 rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {activeBooking.spotId?.label || "Spot"}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {activeBooking.parkingLotId?.name || "Parking Lot"}
                      </p>
                    </div>
                    <span
                      className={`px-4 py-2 rounded-full border text-sm font-semibold ${getStatusColor(
                        activeBooking.status
                      )}`}
                    >
                      {activeBooking.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Check In</p>
                      <p className="text-white font-semibold">
                        {new Date(activeBooking.startTime).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Check Out</p>
                      <p className="text-white font-semibold">
                        {new Date(activeBooking.endTime).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Vehicle</p>
                      <p className="text-white font-semibold">
                        {activeBooking.vehicleId?.registrationNumber || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Amount</p>
                      <p className="text-green-400 font-bold text-lg">
                        ₹{activeBooking.amount?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Other Bookings */}
            {otherBookings.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-white mb-4">
                  Booking History
                </h2>
                <div className="space-y-4">
                  {otherBookings.map((booking) => (
                    <div
                      key={booking._id}
                      className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-white/20 transition"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-white">
                            {booking.spotId?.label || "Spot"}
                          </h3>
                          <p className="text-gray-400 text-sm flex items-center gap-1">
                            <MapPin size={14} />
                            {booking.parkingLotId?.name || "Parking Lot"}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full border text-xs font-semibold ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-300">
                          <Calendar size={14} />
                          <span>
                            {new Date(booking.startTime).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <Clock size={14} />
                          <span>
                            {new Date(booking.startTime).toLocaleTimeString()} -{" "}
                            {new Date(booking.endTime).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <Car size={14} />
                          <span>
                            {booking.vehicleId?.registrationNumber || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-green-400 font-semibold">
                          <DollarSign size={14} />
                          <span>₹{booking.amount?.toFixed(2) || "0.00"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
