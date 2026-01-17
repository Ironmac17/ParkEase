import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { X, MapPin, Navigation } from "lucide-react";

// Fix marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

export default function AddParkingModal({ onClose, onAdd, isLoading }) {
  const [step, setStep] = useState(1); // 1: details, 2: location
  const [form, setForm] = useState({
    name: "",
    address: "",
    baseRate: "",
    totalSpots: "",
    coordinates: [20.5937, 78.9629], // Default India center
    amenities: {
      covered: false,
      ev: false,
      security: false,
      cctv: false,
    },
  });
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleAmenityToggle = (key) => {
    setForm({
      ...form,
      amenities: { ...form.amenities, [key]: !form.amenities[key] },
    });
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm({
          ...form,
          coordinates: [pos.coords.latitude, pos.coords.longitude],
        });
        setUseCurrentLocation(true);
      },
      () => {
        alert("Failed to get your location");
      },
      { enableHighAccuracy: true }
    );
  };

  const handleLocationSelect = (coordinates) => {
    setForm({ ...form, coordinates });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.address || !form.baseRate || !form.totalSpots) {
      alert("Please fill all required fields");
      return;
    }

    const payload = {
      name: form.name,
      address: form.address,
      baseRate: parseFloat(form.baseRate),
      totalSpots: parseInt(form.totalSpots),
      location: {
        type: "Point",
        coordinates: [form.coordinates[1], form.coordinates[0]], // [lng, lat]
      },
      amenities: form.amenities,
    };

    onAdd(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0b0f1a] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-8 py-6 border-b border-white/10 bg-[#0b0f1a]">
          <h2 className="text-2xl font-bold text-white">Add Parking Lot</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="px-8 py-6">
          {/* Step 1: Details */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="text-sm text-gray-400 mb-6">
                Step 1 of 2: Basic Information
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Parking Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g., Central Mall Parking"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="e.g., 123 Main St, New Delhi"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Base Rate (₹/hr) *
                  </label>
                  <input
                    type="number"
                    name="baseRate"
                    value={form.baseRate}
                    onChange={handleChange}
                    placeholder="e.g., 50"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Total Spots *
                  </label>
                  <input
                    type="number"
                    name="totalSpots"
                    value={form.totalSpots}
                    onChange={handleChange}
                    placeholder="e.g., 50"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-3">
                  Amenities
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries({
                    covered: "🏠 Covered",
                    ev: "⚡ EV Charging",
                    security: "🔒 24/7 Security",
                    cctv: "📹 CCTV",
                  }).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleAmenityToggle(key)}
                      className={`p-3 rounded-lg border transition ${
                        form.amenities[key]
                          ? "bg-blue-500/20 border-blue-500 text-white"
                          : "border-white/10 text-gray-400 hover:text-white"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg font-semibold text-white transition"
              >
                Next: Select Location
              </button>
            </div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="text-sm text-gray-400 mb-6">
                Step 2 of 2: Select Location
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-gray-300">
                <p className="text-sm mb-3">
                  Click on the map to select location, or:
                </p>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="flex items-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500 text-blue-400 px-4 py-2 rounded-lg transition"
                >
                  <Navigation size={16} />
                  Use My Current Location
                </button>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <p className="text-sm text-gray-400 mb-2">
                  Current coordinates:
                </p>
                <p className="text-white font-mono">
                  📍 {form.coordinates[0].toFixed(6)},{" "}
                  {form.coordinates[1].toFixed(6)}
                </p>
              </div>

              <div className="border border-white/10 rounded-lg overflow-hidden h-96">
                <MapContainer
                  center={form.coordinates}
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                  scrollWheelZoom={true}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MapClickHandler onLocationSelect={handleLocationSelect} />
                  <Marker position={form.coordinates} />
                </MapContainer>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-3 rounded-lg font-semibold text-white transition"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-50 px-6 py-3 rounded-lg font-semibold text-white transition"
                >
                  {isLoading ? "Adding..." : "Add Parking"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
