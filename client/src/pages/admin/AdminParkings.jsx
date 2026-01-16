import { useEffect, useState } from "react";
import { getAllParkings, approveParking, suspendParking } from "../../api/admin";
import ParkingRow from "../../components/admin/ParkingRow";

const AdminParkings = () => {
  const [parkings, setParkings] = useState([]);

  const loadParkings = async () => {
    const res = await getAllParkings();
    setParkings(res.data.parkings);
  };

  useEffect(() => {
    loadParkings();
  }, []);

  const handleAction = async (parking) => {
    if (parking.status === "PENDING") {
      await approveParking(parking._id);
    } else {
      await suspendParking(parking._id);
    }
    loadParkings();
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Parking Oversight</h2>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-4 text-xs text-gray-500 mb-2">
          <div>Name</div>
          <div>Owner</div>
          <div>Status</div>
          <div>Action</div>
        </div>

        {parkings.map(p => (
          <ParkingRow key={p._id} parking={p} onAction={handleAction} />
        ))}
      </div>
    </div>
  );
};

export default AdminParkings;
