import { Home, Zap, Shield, DollarSign } from "lucide-react";
import { useState } from "react";

const FILTERS = [
  { key: "covered", label: "Covered", icon: "🏠" },
  { key: "ev", label: "EV Charging", icon: "⚡" },
  { key: "security", label: "Security", icon: "🔒" },
];

export default function Filters({ filters, setFilters }) {
  const [priceRange, setPriceRange] = useState(filters.maxPrice || 500);
  const [showPriceFilter, setShowPriceFilter] = useState(false);

  const toggle = (key) => {
    setFilters({ ...filters, [key]: !filters[key] });
  };

  const handlePriceChange = (e) => {
    const value = parseInt(e.target.value);
    setPriceRange(value);
    setFilters({ ...filters, maxPrice: value });
  };

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <span className="text-sm text-gray-400">Filter by:</span>

      {/* Amenity Filters */}
      <div className="flex gap-3 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => toggle(f.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
              filters[f.key]
                ? "bg-blue-500/20 border-blue-500 text-white"
                : "border-white/10 text-gray-400 hover:text-white hover:border-white/30"
            }`}
          >
            <span>{f.icon}</span>
            {f.label}
          </button>
        ))}
      </div>

      {/* Price Range Slider */}
      <div className="relative">
        <button
          onClick={() => setShowPriceFilter(!showPriceFilter)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition"
        >
          <DollarSign size={16} />
          Price: ₹{priceRange}/hr
        </button>

        {showPriceFilter && (
          <div className="absolute top-full mt-2 left-0 bg-[#0b0f1a] border border-white/20 rounded-lg p-4 z-50 w-64 shadow-lg">
            <label className="block text-sm text-gray-300 mb-3">
              Max Price per Hour
            </label>
            <input
              type="range"
              min="10"
              max="500"
              value={priceRange}
              onChange={handlePriceChange}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between items-center mt-3 text-sm">
              <span className="text-gray-400">₹10</span>
              <span className="text-blue-400 font-semibold">₹{priceRange}</span>
              <span className="text-gray-400">₹500</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
