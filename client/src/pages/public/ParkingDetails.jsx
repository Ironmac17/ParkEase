import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../hooks/useSocket";

export default function ParkingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const socket = useSocket();

  const [lot, setLot] = useState(null);
  const [spots, setSpots] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [loading, setLoading] = useState(true);

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [vehicleId, setVehicleId] = useState("");

  useEffect(() => {
    fetchData();

    // Socket is optional - real-time updates are nice to have but not required
    if (socket) {
      socket.emit("join_parking_lot", id);
      socket.on("spot_update", handleSpotUpdate);

      return () => {
        socket.emit("leave_parking_lot", id);
        socket.off("spot_update", handleSpotUpdate);
      };
    }
  }, [id, socket]);

  const fetchData = async () => {
    try {
      const [lotRes, spotRes, vehicleRes] = await Promise.all([
        axios.get(`/parking-lots/${id}`),
        axios.get(`/parking-lots/${id}/spots`),
        user
          ? axios.get("/vehicles").catch(() => Promise.resolve({ data: [] }))
          : Promise.resolve({ data: [] }),
      ]);

      setLot(lotRes.data);
      setSpots(
        Array.isArray(spotRes.data) ? spotRes.data : spotRes.data.spots || []
      );
      setVehicles(Array.isArray(vehicleRes.data) ? vehicleRes.data : []);
    } catch (err) {
      console.error("Error fetching data:", err);
      alert("Failed to load parking details. Please try again.");
      navigate("/discover");
    } finally {
      setLoading(false);
    }
  };

  const handleSpotUpdate = ({ spotId, status }) => {
    setSpots((prev) =>
      prev.map((s) => (s._id === spotId ? { ...s, status } : s))
    );
  };

  const selectSpot = (spot) => {
    if (spot.status !== "available") return;
    setSelectedSpot(spot);
  };

  const proceedToCheckout = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!selectedSpot || !startTime || !endTime || !vehicleId) {
      alert("Please complete all booking details");
      return;
    }

    if (new Date(startTime) < new Date()) {
      alert("Start time cannot be in the past");
      return;
    }

    if (new Date(endTime) <= new Date(startTime)) {
      alert("End time must be after start time");
      return;
    }

    navigate("/checkout", {
      state: {
        spotId: selectedSpot._id,
        parkingLotId: id,
        startTime,
        endTime,
        vehicleId,
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading parking details...</p>
        </div>
      </div>
    );
  }

  if (!lot) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        <div className="text-center">
          <p className="text-xl mb-4">Parking lot not found</p>
          <button
            onClick={() => navigate("/discover")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Back to Discover
          </button>
        </div>
      </div>
    );
  }

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
              {spots.map((spot) => (
                <div
                  key={spot._id}
                  onClick={() => selectSpot(spot)}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center cursor-pointer border-2 transition-all duration-300 font-bold text-sm
                    ${
                      spot.status === "available"
                        ? "border-green-500/50 bg-green-500/10 text-green-400 hover:border-green-500 hover:bg-green-500/20"
                        : spot.status === "held"
                        ? "border-yellow-500/50 bg-yellow-500/10 text-yellow-400 cursor-not-allowed opacity-60"
                        : spot.status === "occupied"
                        ? "border-red-500/50 bg-red-500/10 text-red-400 cursor-not-allowed opacity-60"
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
                    {spot.status === "available" ? "✓ Free" : spot.status}
                  </span>
                </div>
              ))}
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
    </div>
  );
}
