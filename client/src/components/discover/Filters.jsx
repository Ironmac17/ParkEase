import { Home, Zap, Shield, DollarSign } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

const FILTERS = [
  { key: "covered", label: "Covered", icon: "🏠" },
  { key: "ev", label: "EV Charging", icon: "⚡" },
  { key: "security", label: "Security", icon: "🔒" },
];

export default function Filters({ filters, setFilters }) {
  const [priceRange, setPriceRange] = useState(filters.maxPrice || 500);
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [timeWindowOpen, setTimeWindowOpen] = useState(false);
  const priceBtnRef = useRef(null);
  const timeBtnRef = useRef(null);
  const [pricePos, setPricePos] = useState(null);
  const [timePos, setTimePos] = useState(null);
  const [start, setStart] = useState(filters.startTime || "");
  const [end, setEnd] = useState(filters.endTime || "");

  const toggle = (key) => {
    setFilters({ ...filters, [key]: !filters[key] });
  };

  const handlePriceChange = (e) => {
    const value = parseInt(e.target.value);
    setPriceRange(value);
    setFilters({ ...filters, maxPrice: value });
  };

  const applyTimeWindow = () => {
    setFilters({ ...filters, startTime: start, endTime: end });
    setTimeWindowOpen(false);
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
      {/* Time Window */}
      <div className="relative z-[9999]">
        <button
          ref={timeBtnRef}
          onClick={() => {
            if (!timeWindowOpen) {
              const r = timeBtnRef.current.getBoundingClientRect();
              setTimePos({
                top: r.bottom + window.scrollY,
                left: r.left + window.scrollX,
                width: r.width,
              });
            }
            setTimeWindowOpen((s) => !s);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition"
        >
          <span className="text-sm">Time</span>
        </button>

        {timeWindowOpen &&
          timePos &&
          createPortal(
            <div
              style={{
                position: "absolute",
                top: timePos.top + "px",
                left: timePos.left + "px",
                width: "max(280px, " + timePos.width + "px)",
              }}
              className="bg-[#0b0f1a] border border-white/20 rounded-lg p-4 z-[99999] shadow-lg"
            >
              <label className="block text-sm text-gray-300 mb-2">Start</label>
              <input
                type="datetime-local"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full bg-white/5 p-2 rounded mb-3 text-white"
              />
              <label className="block text-sm text-gray-300 mb-2">End</label>
              <input
                type="datetime-local"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full bg-white/5 p-2 rounded mb-3 text-white"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setStart("");
                    setEnd("");
                    setFilters({ ...filters, startTime: "", endTime: "" });
                    setTimeWindowOpen(false);
                  }}
                  className="px-3 py-1 rounded bg-gray-700 text-sm text-white"
                >
                  Clear
                </button>
                <button
                  onClick={() => {
                    applyTimeWindow();
                    setTimeWindowOpen(false);
                  }}
                  className="px-3 py-1 rounded bg-blue-600 text-sm text-white"
                >
                  Apply
                </button>
              </div>
            </div>,
            document.body,
          )}
      </div>
      <div className="relative z-[9999]">
        <button
          ref={priceBtnRef}
          onClick={() => {
            if (!showPriceFilter) {
              const r = priceBtnRef.current.getBoundingClientRect();
              setPricePos({
                top: r.bottom + window.scrollY,
                left: r.left + window.scrollX,
                width: r.width,
              });
            }
            setShowPriceFilter((s) => !s);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition"
        >
          <DollarSign size={16} />
          Price: ₹{priceRange}/hr
        </button>

        {showPriceFilter &&
          pricePos &&
          createPortal(
            <div
              style={{
                position: "absolute",
                top: pricePos.top + "px",
                left: pricePos.left + "px",
                width: "max(260px, " + pricePos.width + "px)",
              }}
              className="bg-[#0b0f1a] border border-white/20 rounded-lg p-4 z-[99999] shadow-lg"
            >
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
                <span className="text-blue-400 font-semibold">
                  ₹{priceRange}
                </span>
                <span className="text-gray-400">₹500</span>
              </div>
            </div>,
            document.body,
          )}
      </div>
    </div>
  );
}
