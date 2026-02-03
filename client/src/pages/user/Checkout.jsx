import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import axios from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { ToastContext } from "../../context/ToastContext";
import { formatCurrency } from "../../utils/formatCurrency";
import {
  Clock,
  MapPin,
  Car,
  AlertCircle,
  Lock,
  Loader,
  Info,
  Check,
} from "lucide-react";

export default function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const { showToast } = useContext(ToastContext);

  const [lot, setLot] = useState(null);
  const [spot, setSpot] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [estimatedAmount, setEstimatedAmount] = useState(0);
  const [holdTimeLeft, setHoldTimeLeft] = useState(600); // 10 minutes in seconds

  // Use wallet balance directly from user context - it's already set during login
  const walletBalance = Number(user?.walletBalance) || 0;

  const {
    spotId,
    parkingLotId,
    startTime,
    endTime,
    vehicleId,
    vehicle: vehicleFromState,
  } = state || {};

  useEffect(() => {
    if (!state) {
      navigate("/");
      return;
    }
    fetchDetails();
  }, []);

  // Countdown timer for hold (10 minutes in seconds)
  useEffect(() => {
    if (!loading && holdTimeLeft > 0) {
      const timer = setInterval(() => {
        setHoldTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [loading, holdTimeLeft]);

  const fetchDetails = async () => {
    try {
      // Use vehicle from state if available, otherwise fetch from user's list
      if (vehicleFromState) {
        setVehicle(vehicleFromState);
      } else if (vehicleId && user?.vehicles) {
        const selectedVehicle = user.vehicles.find((v) => v._id === vehicleId);
        if (selectedVehicle) {
          setVehicle(selectedVehicle);
        }
      }

      const [lotRes, spotRes] = await Promise.all([
        axios.get(`/parking-lots/${parkingLotId}`),
        axios.get(`/parking-lots/spot/${spotId}`),
      ]);

      setLot(lotRes.data);
      setSpot(spotRes.data);

      const start = new Date(startTime);
      const end = new Date(endTime);
      const minutes = Math.ceil((end - start) / (1000 * 60));
      const amount = (lotRes.data.baseRate / 60) * minutes;

      setEstimatedAmount(amount);
    } catch (err) {
      showToast("Failed to load parking details", "error");
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

      showToast("Booking confirmed!", "success");
      // Refresh full user object from server so UI stays in sync
      try {
        const me = await axios.get("/auth/me");
        if (me?.data && setUser) setUser(me.data);
      } catch (e) {
        console.warn("Failed to refresh user after booking", e);
      }

      const bookingId = res.data?.booking?._id || res.data?._id;
      navigate(`/booking-success/${bookingId}`);
    } catch (err) {
      const code = err.response?.data?.code;
      if (code === "CONFLICT") {
        showToast(
          err.response?.data?.message || "Spot already reserved",
          "error",
        );
      } else {
        showToast(err.response?.data?.message || "Booking failed", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ FIXED LOADING BLOCK
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f1a] flex items-center justify-center text-gray-400">
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

  const walletInsufficient = walletBalance < estimatedAmount;

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-white mb-4 flex items-center gap-2"
          >
            ← Back
          </button>
          <h1 className="text-4xl font-bold">Payment Review</h1>
          <p className="text-gray-400 mt-2">Complete your booking</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT SECTION - DETAILS */}
          <div className="lg:col-span-2 space-y-6">
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
              {vehicle ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Registration</p>
                      <p className="font-semibold">
                        {vehicle?.registrationNumber || vehicle?.licensePlate}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Model</p>
                      <p className="font-semibold">{vehicle?.model}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Color</p>
                      <p className="font-semibold">{vehicle?.color || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Type</p>
                      <p className="font-semibold capitalize">
                        {vehicle?.type || "Vehicle"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 text-sm">
                  Loading vehicle details...
                </p>
              )}
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
          </div>

          {/* RIGHT SECTION - SUMMARY */}
          <div className="space-y-6">
            {/* Price */}
            <div className="bg-green-600/20 border border-green-500/30 rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Price Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Hourly Rate</span>
                  <span className="font-semibold">
                    {formatCurrency(lot?.baseRate)}/hr
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Duration</span>
                  <span className="font-semibold">{calculateDuration()}</span>
                </div>
                <div className="border-t border-white/10 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold">Total Amount</span>
                    <span className="text-3xl font-bold text-green-300">
                      {formatCurrency(estimatedAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hold Warning */}
            <div className="bg-blue-600/20 border border-blue-500/50 rounded-xl p-4 flex gap-3">
              <Lock className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-blue-300 mb-1">
                  Spot is Reserved
                </p>
                <p className="text-sm text-blue-200">
                  Complete payment within{" "}
                  <span className="font-bold">
                    {Math.floor(holdTimeLeft / 60)}m {holdTimeLeft % 60}s
                  </span>{" "}
                  to confirm.
                </p>
              </div>
            </div>

            {/* Wallet Balance */}
            <div
              className={`border rounded-2xl p-6 ${
                walletBalance < estimatedAmount
                  ? "bg-red-600/20 border-red-500/30"
                  : "bg-blue-600/20 border-blue-500/30"
              }`}
            >
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Payment Method
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Wallet Balance</p>
                  <p className="text-3xl font-bold">
                    {formatCurrency(walletBalance)}
                  </p>
                </div>

                {walletBalance < estimatedAmount && (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 flex gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-red-300">
                      <p className="mb-2">
                        You need{" "}
                        {formatCurrency(estimatedAmount - walletBalance)} more
                      </p>
                      <button
                        onClick={() => navigate("/wallet")}
                        className="text-red-200 hover:text-red-100 underline font-semibold"
                      >
                        Add funds to wallet →
                      </button>
                    </div>
                  </div>
                )}

                {walletBalance >= estimatedAmount && (
                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 flex gap-2">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-300">
                      Remaining: ₹{(walletBalance - estimatedAmount).toFixed(2)}
                    </p>
                  </div>
                )}
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
                disabled={submitting || walletBalance < estimatedAmount}
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
    </div>
  );
}
