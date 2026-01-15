const FILTERS = [
  { key: "covered", label: "Covered" },
  { key: "ev", label: "EV Charging" },
  { key: "security", label: "Security" },
];

export default function Filters({ filters, setFilters }) {
  const toggle = (key) => {
    setFilters({ ...filters, [key]: !filters[key] });
  };

  return (
    <div className="flex gap-3">
      {FILTERS.map((f) => (
        <button
          key={f.key}
          onClick={() => toggle(f.key)}
          className={`px-4 py-2 rounded-lg border transition ${
            filters[f.key]
              ? "bg-blue-500/20 border-blue-500 text-white"
              : "border-white/10 text-gray-400 hover:text-white"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
