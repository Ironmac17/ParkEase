import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../hooks/useSocket";
import { ToastContext } from "../../context/ToastContext";
import { X } from "lucide-react";

export default function ParkingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user } = useAuth();
  const socket = useSocket();
  const { showToast } = useContext(ToastContext);

  const [loading, setLoading] = useState(true);
  const [lot, setLot] = useState(null);
  const [spots, setSpots] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const [selectedSpot, setSelectedSpot] = useState(null);
  const [spotDetailsModal, setSpotDetailsModal] = useState(null);

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [vehicleId, setVehicleId] = useState("");

  /* ---------------- FETCH DATA ---------------- */

  const fetchLot = async () => {
    const res = await axios.get(`/parking-lots/${id}`, {
      params: startTime || endTime ? { startTime, endTime } : {},
    });
    setLot(res.data);
  };

  const fetchSpots = async () => {
    const res = await axios.get(`/parking-lots/${id}/spots`, {
      params: { startTime, endTime },
    });
    setSpots(res.data);
  };

  const fetchVehicles = async () => {
    if (!user) return;
    try {
      const res = await axios.get("/vehicles");
      setVehicles(res.data);
    } catch (err) {
      // If vehicles endpoint isn't available or returns 404, gracefully continue
      if (err.response && err.response.status !== 404) console.error(err);
      setVehicles([]);
    }
  };

  const selectSpot = (spot) => {
    // Open the spot details modal and load today's schedule for the spot
    fetchSpotSchedule(spot._id, spot);
  };

  const fetchSpotSchedule = async (spotId, spotObj = null) => {
    try {
      const params = {};
      if (startTime) {
        const d = new Date(startTime);
        params.date = d.toISOString().slice(0, 10);
      }

      const res = await axios.get(`/parking-lots/spot/${spotId}/schedule`, {
        params,
      });

      if (spotObj) {
        setSpotDetailsModal({ ...spotObj, schedule: res.data });
      } else {
        setSpotDetailsModal((prev) =>
          prev && prev._id === spotId
            ? { ...prev, schedule: res.data }
            : { _id: spotId, schedule: res.data },
        );
      }
    } catch (err) {
      console.error("Failed to fetch spot schedule:", err);
    }
  };

  /* ---------------- EFFECTS ---------------- */

  useEffect(() => {
    (async () => {
      try {
        await Promise.all([fetchLot(), fetchSpots(), fetchVehicles()]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!loading) fetchSpots();
  }, [startTime, endTime]);

  /* ---------------- HELPERS ---------------- */

  const renderSchedule = ({ start, end, bookings }) => {
    try {
      const windowStart = new Date(start);
      const windowEnd = new Date(end);

      if (!bookings || bookings.length === 0) {
        return (
          <p className="text-sm text-gray-400">
            No bookings — spot free all day
          </p>
        );
      }

      const items = [];
      let cursor = new Date(windowStart);

      bookings.forEach((b) => {
        const bStart = new Date(b.startTime);
        const bEnd = new Date(b.endTime);

        if (bStart > cursor) {
          items.push({ type: "free", start: cursor, end: bStart });
        }

        items.push({
          type: "booked",
          start: bStart,
          end: bEnd,
          by: b.user?.username,
        });

        if (bEnd > cursor) cursor = bEnd;
      });

      if (cursor < windowEnd) {
        items.push({ type: "free", start: cursor, end: windowEnd });
      }

      return (
        <div className="space-y-2">
          {items.map((it, idx) => (
            <div
              key={idx}
              className={`p-2 rounded border ${
                it.type === "free"
                  ? "bg-green-500/10 border-green-500/20"
                  : "bg-red-500/10 border-red-500/20"
              }`}
            >
              <div className="flex justify-between text-xs">
                <span
                  className={
                    it.type === "free"
                      ? "text-green-300 font-semibold"
                      : "text-red-300 font-semibold"
                  }
                >
                  {it.type === "free" ? "Free" : "Booked"}
                  {it.by && ` · ${it.by}`}
                </span>
                <span className="text-gray-300">
                  {it.start.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  -{" "}
                  {it.end.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      );
    } catch {
      return <p className="text-sm text-gray-400">Schedule unavailable</p>;
    }
  };

  const proceedToCheckout = () => {
    if (!user) return navigate("/login");

    if (!selectedSpot || !startTime || !endTime || !vehicleId) {
      showToast("Please complete all booking details", "warning");
      return;
    }

    if (new Date(startTime) < new Date()) {
      showToast("Start time cannot be in the past", "warning");
      return;
    }

    if (new Date(endTime) <= new Date(startTime)) {
      showToast("End time must be after start time", "warning");
      return;
    }

    // Find the selected vehicle object to pass it along
    const selectedVehicle = vehicles.find((v) => v._id === vehicleId);

    navigate("/checkout", {
      state: {
        spotId: selectedSpot._id,
        parkingLotId: id,
        startTime,
        endTime,
        vehicleId,
        vehicle: selectedVehicle, // Pass full vehicle object
      },
    });
  };

  /* ---------------- RENDER GUARDS ---------------- */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading parking details...
      </div>
    );
  }

  if (!lot) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Parking lot not found
      </div>
    );
  }

  /* ---------------- JSX ---------------- */

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0f1a] via-[#1a1f2e] to-[#0b0f1a] text-white px-6 py-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-white mb-4 flex items-center gap-2 transition"
        >
          ← Back to Discover
        </button>
        <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-2xl p-6">
          <h1 className="text-4xl font-bold mb-2">{lot.name}</h1>
          <p className="text-gray-400 text-lg mb-4">{lot.address}</p>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm text-gray-400">Base Rate</p>
              <p className="text-2xl font-bold text-blue-400">
                ₹{lot.baseRate}/hr
              </p>
            </div>
            <div className="w-px h-12 bg-white/10"></div>
            <div>
              <p className="text-sm text-gray-400">Available Spots</p>
              <p className="text-2xl font-bold text-green-400">
                {lot.stats?.freeSpots || 0}/{lot.stats?.totalSpots || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Spot grid */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-6">Select a Parking Spot</h2>

          {spots.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center text-gray-400">
              No parking spots available for this location
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-3">
              {spots.map((spot) => {
                // Priority: if startTime/endTime are set, use isBookedForWindow
                // Otherwise fall back to spot.status
                let effectiveStatus = spot.status;

                if (startTime && endTime && "isBookedForWindow" in spot) {
                  // When a time window is provided, override status with booking info
                  effectiveStatus = spot.isBookedForWindow
                    ? "booked"
                    : "available";
                } else if (!startTime || !endTime) {
                  // If no time window set, don't show spot status yet (require user to set times first)
                  effectiveStatus = "unknown";
                }

                return (
                  <div
                    key={spot._id}
                    onClick={() => {
                      if (
                        (startTime && endTime) ||
                        effectiveStatus === "available"
                      ) {
                        selectSpot(spot);
                      }
                    }}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center border-2 transition-all duration-300 font-bold text-sm
                      ${
                        effectiveStatus === "available"
                          ? "border-green-500/50 bg-green-500/10 text-green-400 hover:border-green-500 hover:bg-green-500/20 cursor-pointer"
                          : effectiveStatus === "held" ||
                              effectiveStatus === "booked"
                            ? "border-yellow-500/50 bg-yellow-500/10 text-yellow-400 cursor-not-allowed opacity-60"
                            : effectiveStatus === "occupied"
                              ? "border-red-500/50 bg-red-500/10 text-red-400 cursor-not-allowed opacity-60"
                              : effectiveStatus === "unknown"
                                ? "border-gray-500/50 bg-gray-500/10 text-gray-400 cursor-default opacity-50"
                                : "border-gray-600/50 bg-gray-600/10 text-gray-400 cursor-not-allowed opacity-60"
                      }
                      ${
                        selectedSpot?._id === spot._id
                          ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-[#0b0f1a]"
                          : ""
                      }
                    `}
                  >
                    <span>{spot.label}</span>
                    <span className="text-xs mt-1 opacity-70">
                      {effectiveStatus === "available"
                        ? "✓ Free"
                        : effectiveStatus === "unknown"
                          ? "Set time"
                          : effectiveStatus}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Booking panel */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-8 h-fit sticky top-8">
          <h3 className="text-2xl font-bold mb-6">Booking Details</h3>

          {!selectedSpot && (
            <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm">
              Please select a parking spot first
            </div>
          )}

          <div className="space-y-4">
            {/* Spot Info */}
            {selectedSpot && (
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-1">Selected Spot</p>
                <p className="text-xl font-bold text-green-400">
                  {selectedSpot.label}
                </p>
              </div>
            )}

            {/* Start Time */}
            <div>
              <label className="block text-sm text-gray-300 mb-2 font-semibold">
                Check-in Time
              </label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full bg-black/40 border border-white/20 px-4 py-2 rounded-lg text-white focus:border-blue-500 focus:outline-none transition"
              />
            </div>

            {/* End Time */}
            <div>
              <label className="block text-sm text-gray-300 mb-2 font-semibold">
                Check-out Time
              </label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                min={startTime || new Date().toISOString().slice(0, 16)}
                className="w-full bg-black/40 border border-white/20 px-4 py-2 rounded-lg text-white focus:border-blue-500 focus:outline-none transition"
              />
            </div>

            {/* Vehicle Selection */}
            <div>
              <label className="block text-sm text-gray-300 mb-2 font-semibold">
                Select Vehicle
              </label>
              {vehicles.length === 0 ? (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
                  <p className="mb-2">No vehicles found</p>
                  <p className="text-xs text-gray-400">
                    Please add a vehicle first in your profile
                  </p>
                </div>
              ) : (
                <select
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  className="w-full bg-black/40 border border-white/20 px-4 py-2 rounded-lg text-white focus:border-blue-500 focus:outline-none transition"
                >
                  <option value="">Choose a vehicle...</option>
                  {vehicles.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.registrationNumber} - {v.model}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Checkout Button */}
            <button
              onClick={proceedToCheckout}
              disabled={
                !selectedSpot ||
                !startTime ||
                !endTime ||
                !vehicleId ||
                vehicles.length === 0
              }
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold transition-all duration-300 mt-6"
            >
              Proceed to Checkout →
            </button>

            {!user && (
              <p className="text-xs text-gray-400 text-center mt-4 p-3 bg-white/5 rounded-lg">
                You need to login to book a spot
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Spot Details Modal */}
      {spotDetailsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white">
                Spot {spotDetailsModal.label}
              </h2>
              <button
                onClick={() => setSpotDetailsModal(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition"
              >
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Status - use isBookedForWindow if time window is selected, otherwise use raw status */}
              <div className="bg-black/40 rounded-lg p-5 border border-white/10">
                <p className="text-gray-400 text-sm mb-2">
                  Status for Selected Time
                </p>
                <div className="flex items-center gap-3">
                  {(() => {
                    // Determine effective status based on time window
                    let effectiveStatus = spotDetailsModal.status;
                    let effectiveColor = "bg-gray-500";

                    if (
                      startTime &&
                      endTime &&
                      "isBookedForWindow" in spotDetailsModal
                    ) {
                      // Time window is set, use booking info
                      effectiveStatus = spotDetailsModal.isBookedForWindow
                        ? "Booked"
                        : "Available";
                      effectiveColor = spotDetailsModal.isBookedForWindow
                        ? "bg-red-500"
                        : "bg-green-500";
                    } else {
                      // No time window, show raw status
                      effectiveColor =
                        spotDetailsModal.status === "available"
                          ? "bg-green-500"
                          : spotDetailsModal.status === "occupied"
                            ? "bg-red-500"
                            : spotDetailsModal.status === "held"
                              ? "bg-yellow-500"
                              : "bg-gray-500";
                    }

                    return (
                      <>
                        <div
                          className={`w-4 h-4 rounded-full ${effectiveColor}`}
                        />
                        <span className="text-white font-semibold capitalize text-lg">
                          {effectiveStatus}
                        </span>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Status Description */}
              <div
                className={`${
                  startTime && endTime && !spotDetailsModal.isBookedForWindow
                    ? "bg-green-500/20 border-green-500/30"
                    : "bg-blue-500/20 border-blue-500/30"
                } rounded-lg p-4 border`}
              >
                <p
                  className={`${
                    startTime && endTime && !spotDetailsModal.isBookedForWindow
                      ? "text-green-300"
                      : "text-blue-300"
                  } text-sm`}
                >
                  {(() => {
                    if (
                      startTime &&
                      endTime &&
                      "isBookedForWindow" in spotDetailsModal
                    ) {
                      return spotDetailsModal.isBookedForWindow
                        ? "× This spot is booked for the selected time"
                        : "✓ This spot is available for your selected time";
                    }
                    return spotDetailsModal.status === "available"
                      ? "✓ This spot is available for booking"
                      : spotDetailsModal.status === "occupied"
                        ? "× This spot is currently occupied"
                        : spotDetailsModal.status === "held"
                          ? "⏱ This spot is reserved by another user"
                          : "This spot is unavailable";
                  })()}
                </p>
              </div>

              {/* Spot Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 rounded-lg p-4 border border-white/10">
                  <p className="text-gray-400 text-xs mb-1">Type</p>
                  <p className="text-white font-semibold">
                    {spotDetailsModal.type || "Standard"}
                  </p>
                </div>
                <div className="bg-black/40 rounded-lg p-4 border border-white/10">
                  <p className="text-gray-400 text-xs mb-1">Floor</p>
                  <p className="text-white font-semibold">
                    {spotDetailsModal.floor || "N/A"}
                  </p>
                </div>
              </div>

              {(() => {
                // Show Select button if available for the time window or if no time window set but spot is generally available
                const canSelect =
                  startTime &&
                  endTime &&
                  "isBookedForWindow" in spotDetailsModal
                    ? !spotDetailsModal.isBookedForWindow
                    : spotDetailsModal.status === "available";

                return canSelect ? (
                  <button
                    onClick={() => {
                      setSelectedSpot(spotDetailsModal);
                      setSpotDetailsModal(null);
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-3 rounded-lg font-bold transition"
                  >
                    Select This Spot
                  </button>
                ) : null;
              })()}

              <button
                onClick={() => setSpotDetailsModal(null)}
                className="w-full border border-white/20 hover:border-white/40 hover:bg-white/5 text-white py-3 rounded-lg font-semibold transition"
              >
                Close
              </button>
            </div>
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-3">Today's Schedule</h4>
              {spotDetailsModal.schedule ? (
                <div className="space-y-2 text-sm text-gray-300">
                  {renderSchedule(spotDetailsModal.schedule)}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No schedule loaded</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
