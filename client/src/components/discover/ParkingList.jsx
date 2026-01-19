import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { MapPin, Zap, Shield, Video, ChevronRight } from "lucide-react";

export default function ParkingList({ parkingLots = [] }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleClick = (id) => {
    if (!user) navigate("/login");
    else navigate(`/parking/${id}`);
  };

  if (!parkingLots.length) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            No Parking Found
          </h3>
          <p className="text-gray-400 text-sm">
            Try adjusting your filters, search location, or price range
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full w-full bg-[#0b0f1a]">
      <div className="p-6 space-y-4">
        {parkingLots.map((lot) => {
          const free = lot?.stats?.freeSpots ?? 0;
          const total = lot?.stats?.totalSpots ?? 0;
          const isAvailable = free > 0;
          const occupancyPercent =
            total > 0 ? Math.round((free / total) * 100) : 0;

          const amenities = [];
          if (lot.amenities?.covered) amenities.push("🏠");
          if (lot.amenities?.ev) amenities.push("⚡");
          if (lot.amenities?.security) amenities.push("🔒");
          if (lot.amenities?.cctv) amenities.push("📹");

          return (
            <div
              key={lot._id}
              onClick={() => handleClick(lot._id)}
              className="bg-gradient-to-r from-white/8 to-white/4 border border-white/15 rounded-xl p-5 hover:from-white/12 hover:to-white/8 hover:border-blue-500/50 transition cursor-pointer shadow-lg"
            >
              <div className="grid grid-cols-2 lg:grid-cols-12 gap-4 items-center">
                {/* Name and Address */}
                <div className="lg:col-span-3">
                  <h3 className="text-white font-bold text-lg">{lot.name}</h3>
                  <p className="text-gray-400 text-xs flex items-center gap-1 mt-2">
                    <MapPin size={14} />
                    {lot.address}
                  </p>
                </div>

                {/* Price */}
                <div className="lg:col-span-1 text-center lg:text-left">
                  <p className="text-blue-400 font-bold text-2xl">
                    ₹{lot.baseRate}
                  </p>
                  <p className="text-gray-500 text-xs">/hr</p>
                </div>

                {/* Availability */}
                <div className="lg:col-span-2">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-green-500/30 to-green-600/30 border border-green-500/50 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-green-400 font-bold text-sm">
                          {free}/{total}
                        </p>
                        <p className="text-green-400 text-xs font-semibold">
                          free
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg">
                        {occupancyPercent}%
                      </p>
                      <p
                        className={`text-xs font-semibold ${
                          occupancyPercent >= 70
                            ? "text-red-400"
                            : occupancyPercent >= 40
                              ? "text-yellow-400"
                              : "text-green-400"
                        }`}
                      >
                        {occupancyPercent >= 70
                          ? "Nearly Full"
                          : occupancyPercent >= 40
                            ? "Moderate"
                            : "Available"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Amenities */}
                <div className="lg:col-span-2">
                  {amenities.length > 0 ? (
                    <div className="flex gap-3">
                      {amenities.map((emoji, idx) => (
                        <span key={idx} className="text-2xl" title={emoji}>
                          {emoji}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No amenities</p>
                  )}
                </div>

                {/* Distance/Rating */}
                <div className="lg:col-span-2 text-center lg:text-left">
                  <p className="text-white font-semibold text-sm">
                    Premium Parking
                  </p>
                  <p className="text-gray-400 text-xs">24/7 Availability</p>
                </div>

                {/* Button */}
                <div className="col-span-2 lg:col-span-2">
                  <button
                    onClick={() => handleClick(lot._id)}
                    disabled={!isAvailable}
                    className={`w-full py-3 px-4 rounded-lg font-bold text-sm transition flex items-center justify-center gap-2 ${
                      isAvailable
                        ? "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg"
                        : "bg-gray-700/50 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {isAvailable ? "Book Now" : "Full"}
                    {isAvailable && <ChevronRight size={18} />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
