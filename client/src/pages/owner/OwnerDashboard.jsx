import { useEffect, useState } from "react";
import { getOwnerDashboard } from "../../api/owner";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../hooks/useSocket";
import StatCard from "../../components/owner/StateCard";
import ActiveBookingRow from "../../components/owner/ActiveBookingRow";

const OwnerDashboard = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await getOwnerDashboard();
      setData(res.data);
    } catch (err) {
      console.error("Failed to load owner dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (!user || !socket) return;

    socket.emit("join", `owner_${user._id}`);
    socket.on("booking:updated", fetchDashboard);

    return () => {
      socket.off("booking:updated", fetchDashboard);
    };
  }, [user, socket]);

  if (loading) {
    return <p className="p-6">Loading dashboard…</p>;
  }

  if (!data) {
    return <p className="p-6">Unable to load dashboard</p>;
  }

  const { totalLots, totalSpots, occupiedSpots, todayRevenue, activeBookings } =
    data;

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Parking Lots" value={totalLots} />
        <StatCard label="Total Spots" value={totalSpots} />
        <StatCard label="Occupied" value={occupiedSpots} />
        <StatCard label="Today’s Revenue" value={`₹${todayRevenue}`} />
      </div>

      {/* Active bookings */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="font-semibold mb-3">Active Bookings</h2>

        {activeBookings.length === 0 ? (
          <p className="text-sm text-gray-500">No active bookings right now</p>
        ) : (
          activeBookings.map((b) => (
            <ActiveBookingRow key={b._id} booking={b} />
          ))
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;
