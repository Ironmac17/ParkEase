import { useEffect, useState } from "react";
import { getOwnerLots } from "../../api/owner";
import axios from "../../api/axios";
import { Plus, MapPin, Loader } from "lucide-react";
import AddParkingModal from "../../components/owner/AddParkingModal";

const OwnerLots = () => {
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLots();
  }, []);

  const fetchLots = async () => {
    try {
      const res = await getOwnerLots();
      setLots(res.data.lots || []);
    } catch (err) {
      console.error("Failed to fetch lots", err);
      setError("Failed to load parking lots");
    } finally {
      setLoading(false);
    }
  };

  const handleAddParking = async (data) => {
    setAdding(true);
    setError("");
    try {
      const res = await axios.post("/parking-lots", data);
      setLots([...lots, res.data]);
      setShowAddModal(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add parking");
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading your parking lots…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f1a] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              My Parking Lots
            </h1>
            <p className="text-gray-400">Manage your parking spaces</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg text-white font-semibold transition"
          >
            <Plus size={20} />
            Add Parking
          </button>
        </div>

        {error && (
          <div className="mb-6 text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {/* Lots Grid */}
        {lots.length === 0 ? (
          <div className="text-center py-16">
            <MapPin size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 mb-6">No parking lots yet</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg text-white font-semibold transition"
            >
              Create your first parking lot
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lots.map((lot) => (
              <div
                key={lot._id}
                className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-white/20 transition"
              >
                <h3 className="text-lg font-bold text-white mb-2">
                  {lot.name}
                </h3>
                <p className="text-gray-400 text-sm mb-4">{lot.address}</p>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-300">
                    <span className="text-gray-400">Base Rate:</span> ₹
                    {lot.baseRate}/hr
                  </p>
                  <p className="text-gray-300">
                    <span className="text-gray-400">Total Spots:</span>{" "}
                    {lot.totalSpots || 0}
                  </p>
                  {lot.location && (
                    <p className="text-blue-400">
                      📍 {lot.location.coordinates[1].toFixed(4)},{" "}
                      {lot.location.coordinates[0].toFixed(4)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Parking Modal */}
      {showAddModal && (
        <AddParkingModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddParking}
          isLoading={adding}
        />
      )}
    </div>
  );
};

export default OwnerLots;
