import { useEffect, useState } from "react";
import { getOwnerBookings, getOwnerLots } from "../../api/owner";
import BookingFilterBar from "../../components/owner/BookingFilterBar";
import OwnerBookingRow from "../../components/owner/OwnerBookingRow";
import { exportToCSV } from "../../utils/exportCsv";

const OwnerBookings = () => {
  const [lots, setLots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [filters, setFilters] = useState({
    lotId: "",
    status: "",
    from: "",
    to: ""
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLots = async () => {
      const res = await getOwnerLots();
      setLots(res.data.lots);
    };

    loadLots();
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const res = await getOwnerBookings(filters);
        setBookings(res.data.bookings);
      } catch (err) {
        console.error("Failed to load bookings", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [filters]);

  const handleExport = () => {
    const rows = bookings.map(b => ({
      parking: b.parkingLot?.name,
      spot: b.spot?.number,
      startTime: new Date(b.startTime).toLocaleString(),
      endTime: new Date(b.endTime).toLocaleString(),
      status: b.status,
      totalAmount: b.totalAmount,
      overtimeAmount: b.overtimeAmount
    }));

    exportToCSV(rows, "owner-bookings.csv");
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Booking History</h2>

        <button
          onClick={handleExport}
          className="bg-black text-white px-4 py-2 rounded text-sm"
        >
          Export CSV
        </button>
      </div>

      <BookingFilterBar
        lots={lots}
        filters={filters}
        onChange={setFilters}
      />

      <div className="bg-white rounded-xl shadow-sm">
        <div className="grid grid-cols-6 text-xs text-gray-500 px-4 py-2 border-b">
          <div>Lot</div>
          <div>Spot</div>
          <div>Date</div>
          <div>Amount</div>
          <div>Status</div>
          <div>End Time</div>
        </div>

        {loading ? (
          <p className="p-4">Loading bookings…</p>
        ) : bookings.length === 0 ? (
          <p className="p-4 text-gray-500">No bookings found</p>
        ) : (
          bookings.map(b => (
            <OwnerBookingRow key={b._id} booking={b} />
          ))
        )}
      </div>
    </div>
  );
};

export default OwnerBookings;
