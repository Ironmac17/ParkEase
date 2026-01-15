import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ParkingList({ parkingLots = [] }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleClick = (id) => {
    if (!user) navigate("/login");
    else navigate(`/parking/${id}`);
  };

  if (!parkingLots.length) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400 text-sm">
        No parking lots found for this area
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full border-r border-white/10">
      {parkingLots.map((lot) => {
        const free = lot?.stats?.freeSpots ?? 0;
        const total = lot?.stats?.totalSpots ?? 0;
        const isAvailable = free > 0;

        return (
          <div
            key={lot._id}
            className="p-6 border-b border-white/10 hover:bg-white/5 transition"
          >
            <h3 className="text-lg font-semibold text-white">
              {lot.name}
            </h3>

            <p className="text-gray-400 text-sm mt-1">
              {lot.address}
            </p>

            <div className="flex items-center justify-between mt-3">
              <span className="text-blue-400 text-sm">
                ₹{lot.baseRate}/hr
              </span>

              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  isAvailable
                    ? "bg-green-500/10 text-green-400"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                {free}/{total} available
              </span>
            </div>

            <button
              onClick={() => handleClick(lot._id)}
              disabled={!isAvailable}
              className={`mt-4 w-full py-2 rounded-lg transition ${
                isAvailable
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-gray-600 cursor-not-allowed"
              }`}
            >
              View & Book
            </button>
          </div>
        );
      })}
    </div>
  );
}
