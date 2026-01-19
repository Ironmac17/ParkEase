import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import {
  Clock,
  MapPin,
  Car,
  AlertCircle,
  Lock,
  Loader,
  Info,
} from "lucide-react";

export default function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [lot, setLot] = useState(null);
  const [spot, setSpot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [estimatedAmount, setEstimatedAmount] = useState(0);
  const [holdTimeLeft, setHoldTimeLeft] = useState(5);
  const [vehicle, setVehicle] = useState(null);

  const { spotId, parkingLotId, startTime, endTime, vehicleId } = state || {};

  useEffect(() => {
    if (!state) {
      navigate("/");
      return;
    }

    fetchDetails();
  }, []);

  // Countdown timer for spot hold
  useEffect(() => {
    if (!loading && holdTimeLeft > 0) {
      const timer = setInterval(() => {
        setHoldTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [loading, holdTimeLeft]);

  const fetchDetails = async () => {
    try {
      const [lotRes, spotRes, vehicleRes] = await Promise.all([
        axios.get(`/parking-lots/${parkingLotId}`),
        axios.get(`/parking-lots/spot/${spotId}`),
        axios.get(`/vehicles/${vehicleId}`),
      ]);

      setLot(lotRes.data);
      setSpot(spotRes.data);
      setVehicle(vehicleRes.data);

      // Calculate amount based on duration and base rate
      const start = new Date(startTime);
      const end = new Date(endTime);
      const minutes = Math.ceil((end - start) / (1000 * 60));
      const amount = (lotRes.data.baseRate / 60) * minutes;
      setEstimatedAmount(amount);
    } catch (err) {
      console.error("Error fetching checkout details:", err);
      alert("Failed to load parking details");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const calculateDuration = () => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const hours = Math.floor((end - start) / (1000 * 60 * 60));
    const minutes = Math.floor(
      ((end - start) % (1000 * 60 * 60)) / (1000 * 60),
    );
    return `${hours}h ${minutes}m`;
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
      // Don't navigate back, let user retry or go back manually
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <Loader
            size={48}
            className="mx-auto mb-4 animate-spin text-blue-400"
          />
          <p>Preparing checkout…</p>
        </div>
      </div>
    );
  }

  const walletInsufficient = user?.walletBalance < estimatedAmount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-white mb-4 flex items-center gap-1"
          >
            ← Back
          </button>
          <h1 className="text-4xl font-bold">Payment Review</h1>
          <p className="text-gray-400 mt-2">Complete your booking</p>
        </div>

        {/* Spot Hold Warning */}
        <div className="mb-6 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/50 rounded-xl p-4 flex gap-3">
          <Lock className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-300 mb-1">Spot is Reserved</p>
            <p className="text-sm text-blue-200">
              This parking spot is held for you. Complete payment within{" "}
              <span className="font-bold">{holdTimeLeft}</span> minutes to
              confirm.
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Parking Location */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-400" />
              Parking Location
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm mb-1">Parking Lot</p>
                <p className="text-lg font-semibold">{lot?.name}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Address</p>
                <p className="text-gray-300">{lot?.address}</p>
              </div>
              <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3">
                <p className="text-gray-400 text-sm mb-1">Spot Number</p>
                <p className="text-2xl font-bold text-purple-300">
                  {spot?.label}
                </p>
              </div>
            </div>
          </div>

          {/* Vehicle Details */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Car className="w-5 h-5 text-green-400" />
              Vehicle Information
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Registration</p>
                  <p className="font-semibold">{vehicle?.registrationNumber}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Model</p>
                  <p className="font-semibold">{vehicle?.model}</p>
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Color</p>
                <p className="font-semibold">{vehicle?.color}</p>
              </div>
            </div>
          </div>

          {/* Booking Duration */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-400" />
              Booking Duration
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Check-In</p>
                  <p className="font-semibold">
                    {new Date(startTime).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Check-Out</p>
                  <p className="font-semibold">
                    {new Date(endTime).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-3">
                <p className="text-gray-400 text-sm mb-1">Total Duration</p>
                <p className="text-2xl font-bold text-orange-300">
                  {calculateDuration()}
                </p>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-2xl p-6">
            <h2 className="font-semibold text-lg mb-4">Price Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Hourly Rate</span>
                <span className="font-semibold">₹{lot?.baseRate}/hour</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Duration</span>
                <span className="font-semibold">{calculateDuration()}</span>
              </div>
              <div className="border-t border-white/10 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Amount</span>
                  <span className="text-3xl font-bold text-green-300">
                    ₹{estimatedAmount.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-2 text-sm text-green-300">
                ✓ Dynamic pricing applied (weekends/festivals)
              </div>
            </div>
          </div>

          {/* Wallet Balance */}
          <div
            className={`border rounded-2xl p-6 ${walletInsufficient ? "bg-red-600/20 border-red-500/30" : "bg-blue-600/20 border-blue-500/30"}`}
          >
            <h2 className="font-semibold text-lg mb-4">Payment Method</h2>
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm mb-1">Wallet Balance</p>
                <p className="text-2xl font-bold">
                  ₹{user?.walletBalance?.toFixed(2) || "0.00"}
                </p>
              </div>

              {walletInsufficient && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-300 mb-1">
                      Insufficient Balance
                    </p>
                    <p className="text-sm text-red-200">
                      You need ₹
                      {(estimatedAmount - user?.walletBalance).toFixed(2)} more.
                      Please add funds to your wallet.
                    </p>
                  </div>
                </div>
              )}

              {!walletInsufficient && (
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 flex gap-2">
                  <AlertCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-300">
                    Balance after payment: ₹
                    {(user?.walletBalance - estimatedAmount).toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-200 space-y-1">
              <p>
                <strong>Note:</strong> Your spot is held for 5 minutes. Complete
                payment to confirm booking.
              </p>
              <p>
                If you arrive late, overtime charges will apply at the same
                hourly rate.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => navigate(-1)}
              disabled={submitting}
              className="flex-1 border border-white/20 hover:border-white/40 hover:bg-white/5 text-white py-4 rounded-xl font-semibold transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              disabled={submitting || walletInsufficient}
              onClick={confirmBooking}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 rounded-xl font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
            >
              {submitting && <Loader size={20} className="animate-spin" />}
              {submitting ? "Processing..." : "Confirm & Pay"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
