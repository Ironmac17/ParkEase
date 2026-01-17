import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { MapPin, Zap, Shield, Video } from "lucide-react";

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
        const occupancyPercent =
          total > 0 ? Math.round((free / total) * 100) : 0;

        const amenities = [];
        if (lot.amenities?.covered)
          amenities.push({ icon: "🏠", label: "Covered" });
        if (lot.amenities?.ev) amenities.push({ icon: "⚡", label: "EV" });
        if (lot.amenities?.security)
          amenities.push({ icon: "🔒", label: "24/7" });
        if (lot.amenities?.cctv) amenities.push({ icon: "📹", label: "CCTV" });

        return (
          <div
            key={lot._id}
            className="p-5 border-b border-white/10 hover:bg-white/5 transition cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">{lot.name}</h3>
                <div className="flex items-center gap-1 text-gray-400 text-sm mt-1">
                  <MapPin size={14} />
                  {lot.address}
                </div>
              </div>
              <span className="text-lg font-bold text-blue-400 whitespace-nowrap ml-2">
                ₹{lot.baseRate}/hr
              </span>
            </div>

            {/* Availability Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">
                  {free} / {total} spots available
                </span>
                <span
                  className={`text-xs font-semibold ${
                    occupancyPercent >= 70
                      ? "text-red-400"
                      : occupancyPercent >= 40
                      ? "text-yellow-400"
                      : "text-green-400"
                  }`}
                >
                  {occupancyPercent}% free
                </span>
              </div>
              <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden border border-white/10">
                <div
                  className={`h-full transition-all ${
                    occupancyPercent >= 70
                      ? "bg-red-500"
                      : occupancyPercent >= 40
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                  style={{ width: `${occupancyPercent}%` }}
                />
              </div>
            </div>

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {amenities.map((am) => (
                  <span
                    key={am.label}
                    className="text-xs bg-white/10 border border-white/10 text-gray-300 px-2 py-1 rounded"
                  >
                    {am.icon} {am.label}
                  </span>
                ))}
              </div>
            )}

            <button
              onClick={() => handleClick(lot._id)}
              disabled={!isAvailable}
              className={`w-full py-2 rounded-lg font-semibold transition text-sm ${
                isAvailable
                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                  : "bg-gray-600/40 text-gray-400 cursor-not-allowed"
              }`}
            >
              {isAvailable ? "View & Book" : "No Spots Available"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
