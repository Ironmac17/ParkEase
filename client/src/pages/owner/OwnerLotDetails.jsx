import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getOwnerLotDetails } from "../../api/owner";
import { useSocket } from "../../hooks/useSocket";
import SpotStatusBadge from "./SpotStatusBadge";
import LotBookingRow from "./LotBookingRow";

const OwnerLotDetails = () => {
  const { lotId } = useParams();
  const socket = useSocket();
  const [lot, setLot] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLot = async () => {
    try {
      const res = await getOwnerLotDetails(lotId);
      setLot(res.data);
    } catch (err) {
      console.error("Failed to fetch lot details", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLot();
  }, [lotId]);

  useEffect(() => {
    socket?.emit("join", `parking_lot_${lotId}`);
    socket?.on("booking:updated", fetchLot);

    return () => {
      socket?.off("booking:updated", fetchLot);
    };
  }, [lotId]);

  if (loading) {
    return <p className="p-6">Loading lot details…</p>;
  }

  if (!lot) {
    return <p className="p-6">Lot not found</p>;
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">{lot.name}</h2>
        <p className="text-gray-600">{lot.address}</p>
      </div>

      {/* Spots grid */}
      <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
        {lot.spots.map((spot) => (
          <div key={spot._id} className="border rounded-lg p-2 text-center">
            <p className="text-sm font-medium">#{spot.number}</p>
            <SpotStatusBadge status={spot.status} />
          </div>
        ))}
      </div>

      {/* Active bookings */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="font-semibold mb-3">Active Bookings</h3>

        {lot.activeBookings.length === 0 ? (
          <p className="text-sm text-gray-500">No active bookings</p>
        ) : (
          lot.activeBookings.map((b) => (
            <LotBookingRow key={b._id} booking={b} />
          ))
        )}
      </div>
    </div>
  );
};

export default OwnerLotDetails;
