import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

export default function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [lot, setLot] = useState(null);
  const [spot, setSpot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [estimatedAmount, setEstimatedAmount] = useState(0);

  const { spotId, parkingLotId, startTime, endTime, vehicleId } = state || {};

  useEffect(() => {
    if (!state) {
      navigate("/");
      return;
    }

    fetchDetails();
  }, []);

  const fetchDetails = async () => {
    try {
      const [lotRes, spotRes] = await Promise.all([
        axios.get(`/parking-lots/${parkingLotId}`),
        axios.get(`/parking-lots/spot/${spotId}`),
      ]);

      setLot(lotRes.data);
      setSpot(spotRes.data);

      // Calculate amount based on duration and base rate
      const start = new Date(startTime);
      const end = new Date(endTime);
      const hours = Math.ceil((end - start) / (1000 * 60 * 60));
      const amount = hours * lotRes.data.baseRate;
      setEstimatedAmount(amount);
    } catch (err) {
      console.error("Error fetching checkout details:", err);
      alert("Failed to load parking details");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const confirmBooking = async () => {
    setSubmitting(true);
    try {
      const res = await axios.post("/bookings", {
        spotId,
        vehicleId,
        startTime,
        endTime,
      });

      navigate(`/booking-success/${res.data._id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Booking failed");
      navigate(-1);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Preparing checkout…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="max-w-3xl mx-auto grid grid-cols-1 gap-6">
        {/* Parking info */}
        <div className="bg-black/40 border border-white/10 rounded-xl p-6 space-y-2">
          <h2 className="text-lg font-semibold">{lot.name}</h2>
          <p className="text-gray-400">{lot.address}</p>
          <p className="text-sm text-blue-400">Spot: {spot.label}</p>
        </div>

        {/* Time */}
        <div className="bg-black/40 border border-white/10 rounded-xl p-6 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">From</span>
            <span>{new Date(startTime).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">To</span>
            <span>{new Date(endTime).toLocaleString()}</span>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-black/40 border border-white/10 rounded-xl p-6 space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-400">Rate</span>
            <span>₹{lot.baseRate}/hr</span>
          </div>

          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span className="text-blue-400">₹{estimatedAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Wallet */}
        <div className="bg-black/40 border border-white/10 rounded-xl p-6">
          <p className="text-sm text-gray-400 mb-1">Paying from wallet</p>
          <p>
            Balance:{" "}
            <span className="text-green-400">₹{user.walletBalance}</span>
          </p>
        </div>

        {/* Action */}
        <button
          disabled={submitting}
          onClick={confirmBooking}
          className="w-full bg-blue-500 hover:bg-blue-600 py-4 rounded-xl text-lg disabled:opacity-50"
        >
          {submitting ? "Confirming…" : "Confirm & Pay"}
        </button>
      </div>
    </div>
  );
}
