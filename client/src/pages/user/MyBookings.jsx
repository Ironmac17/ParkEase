import { useEffect, useState } from "react";
import { getMyBookings } from "../../api/booking";
import BookingCard from "../../components/booking/BookingCard";
import { useAuth } from "../../context/AuthContext";
import socket from "../../hooks/useSocket";


const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const res = await getMyBookings();
      setBookings(res.data.bookings);
    } catch (err) {
      console.error("Failed to fetch bookings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    if (!user) return;

    socket.emit("join", `user_${user._id}`);

    socket.on("booking:updated", fetchBookings);
    socket.on("booking:overtime_started", fetchBookings);
    socket.on("booking:auto_checked_out", fetchBookings);

    return () => {
      socket.off("booking:updated", fetchBookings);
      socket.off("booking:overtime_started", fetchBookings);
      socket.off("booking:auto_checked_out", fetchBookings);
    };
  }, [user]);

  if (loading) {
    return <p className="p-6">Loading your bookings…</p>;
  }

  if (bookings.length === 0) {
    return <p className="p-6">You don’t have any bookings yet.</p>;
  }

  // 🔑 PIN ACTIVE BOOKING
  const activeBooking = bookings.find(b => b.status === "ACTIVE");
  const otherBookings = bookings.filter(b => b.status !== "ACTIVE");

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      {activeBooking && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 mb-2">
            Active Booking
          </h2>
          <div className="ring-2 ring-black rounded-xl">
            <BookingCard booking={activeBooking} />
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-gray-500 mb-2">
          Booking History
        </h2>

        <div className="space-y-4">
          {otherBookings.map(booking => (
            <BookingCard
              key={booking._id}
              booking={booking}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyBookings;