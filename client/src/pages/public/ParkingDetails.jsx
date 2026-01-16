import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import socket from "../../sockets/socket";

export default function ParkingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [lot, setLot] = useState(null);
  const [spots, setSpots] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [loading, setLoading] = useState(true);

  // booking inputs
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [vehicleId, setVehicleId] = useState("");

  // fetch lot + spots
  useEffect(() => {
    fetchData();

    socket.emit("join_parking_lot", id);

    socket.on("spot_update", handleSpotUpdate);

    return () => {
      socket.emit("leave_parking_lot", id);
      socket.off("spot_update", handleSpotUpdate);
    };
  }, [id]);

  const fetchData = async () => {
    try {
      const [lotRes, spotRes] = await Promise.all([
        axios.get(`/parking-lots/${id}`),
        axios.get(`/parking-spots?parkingLot=${id}`),
      ]);

      setLot(lotRes.data);
      setSpots(spotRes.data);
    } finally {
      setLoading(false);
    }
  };

  const handleSpotUpdate = ({ spotId, status }) => {
    setSpots((prev) =>
      prev.map((s) =>
        s._id === spotId ? { ...s, status } : s
      )
    );
  };

  const selectSpot = (spot) => {
    if (spot.status !== "available") return;
    setSelectedSpot(spot);
  };

  const proceedToCheckout = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!selectedSpot || !startTime || !endTime || !vehicleId) {
      alert("Please complete all booking details");
      return;
    }

    try {
      await axios.post(
        `/parking-lots/${id}/spots/${selectedSpot._id}/hold`
      );

      navigate("/checkout", {
        state: {
          spotId: selectedSpot._id,
          parkingLotId: id,
          startTime,
          endTime,
          vehicleId,
        },
      });
    } catch (err) {
      alert("Spot already taken");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading parking details...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 mb-2"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold">{lot.name}</h1>
        <p className="text-gray-400">{lot.address}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Spot grid */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">
            Select a Parking Spot
          </h2>

          <div className="grid grid-cols-4 gap-4">
            {spots.map((spot) => (
              <div
                key={spot._id}
                onClick={() => selectSpot(spot)}
                className={`h-20 rounded-lg flex items-center justify-center cursor-pointer border transition
                  ${
                    spot.status === "available"
                      ? "border-green-400 text-green-400"
                      : spot.status === "held"
                      ? "border-yellow-400 text-yellow-400"
                      : spot.status === "occupied"
                      ? "border-red-500 text-red-500"
                      : "border-gray-600 text-gray-600"
                  }
                  ${
                    selectedSpot?._id === spot._id
                      ? "ring-2 ring-blue-500"
                      : ""
                  }
                `}
              >
                {spot.label}
              </div>
            ))}
          </div>
        </div>

        {/* Booking panel */}
        <div className="bg-black/40 border border-white/10 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold">Booking Details</h3>

          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full bg-black border border-white/10 px-3 py-2 rounded"
          />

          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full bg-black border border-white/10 px-3 py-2 rounded"
          />

          <select
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            className="w-full bg-black border border-white/10 px-3 py-2 rounded"
          >
            <option value="">Select Vehicle</option>
            {user?.vehicles?.map((v) => (
              <option key={v._id} value={v._id}>
                {v.plate}
              </option>
            ))}
          </select>

          <button
            onClick={proceedToCheckout}
            className="w-full bg-blue-500 hover:bg-blue-600 py-3 rounded-lg mt-4"
          >
            Proceed to Checkout →
          </button>

          {!user && (
            <p className="text-xs text-gray-400 text-center">
              Login required to book
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
