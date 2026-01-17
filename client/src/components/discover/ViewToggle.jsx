import { MapPin, List } from "lucide-react";

export default function ViewToggle({ view, setView }) {
  return (
    <div className="flex items-center gap-2 border border-white/20 rounded-lg overflow-hidden bg-black/40 backdrop-blur">
      <button
        onClick={() => setView("map")}
        className={`flex items-center gap-2 px-4 py-2 transition ${
          view === "map"
            ? "bg-blue-500/20 border-r border-white/10 text-blue-400"
            : "text-gray-400 hover:text-white"
        }`}
      >
        <MapPin size={18} />
        Map View
      </button>
      <button
        onClick={() => setView("list")}
        className={`flex items-center gap-2 px-4 py-2 transition ${
          view === "list"
            ? "bg-blue-500/20 text-blue-400"
            : "text-gray-400 hover:text-white"
        }`}
      >
        <List size={18} />
        List View
      </button>
    </div>
  );
}
