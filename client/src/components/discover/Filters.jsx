import { Home, Zap, Shield } from "lucide-react";

const FILTERS = [
  { key: "covered", label: "Covered", icon: "🏠" },
  { key: "ev", label: "EV Charging", icon: "⚡" },
  { key: "security", label: "Security", icon: "🔒" },
];

export default function Filters({ filters, setFilters }) {
  const toggle = (key) => {
    setFilters({ ...filters, [key]: !filters[key] });
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-400">Filter by:</span>
      <div className="flex gap-3">
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
    </div>
  );
}
