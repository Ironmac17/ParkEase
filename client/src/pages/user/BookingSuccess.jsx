import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import { QRCodeCanvas } from "qrcode.react";

export default function BookingSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooking();
  }, []);

  const fetchBooking = async () => {
    try {
      const res = await axios.get(`/bookings/${id}`);
      setBooking(res.data);
    } catch {
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading booking details…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-black/40 border border-white/10 rounded-2xl p-8 text-center space-y-6">
        {/* Success */}
        <div className="text-green-400 text-4xl">✓</div>
        <h1 className="text-2xl font-bold">Booking Confirmed</h1>
        <p className="text-gray-400 text-sm">
          Show this QR code at the parking entry
        </p>

        {/* QR */}
        <div className="bg-white p-4 rounded-xl inline-block">
          <QRCodeCanvas
            value={booking._id}
            size={200}
            level="H"
          />
        </div>

        {/* Details */}
        <div className="text-sm space-y-1">
          <div>
            <span className="text-gray-400">Parking:</span>{" "}
            {booking.parkingLot.name}
          </div>
          <div>
            <span className="text-gray-400">Spot:</span>{" "}
            {booking.parkingSpot.label}
          </div>
          <div>
            <span className="text-gray-400">From:</span>{" "}
            {new Date(booking.startTime).toLocaleString()}
          </div>
          <div>
            <span className="text-gray-400">To:</span>{" "}
            {new Date(booking.endTime).toLocaleString()}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-4">
          <button
            onClick={() => navigate("/bookings")}
            className="w-full bg-blue-500 hover:bg-blue-600 py-3 rounded-xl"
          >
            View My Bookings
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full border border-white/20 py-3 rounded-xl text-gray-300 hover:text-white"
          >
            Back to Home
          </button>
        </div>

        {/* Booking ID */}
        <p className="text-xs text-gray-500 pt-2">
          Booking ID: {booking._id}
        </p>
      </div>
    </div>
  );
}
