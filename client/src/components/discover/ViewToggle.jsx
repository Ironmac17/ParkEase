export default function ViewToggle({ view, setView }) {
  return (
    <div className="flex border border-white/10 rounded-lg overflow-hidden">
      <button
        onClick={() => setView("list")}
        className={`px-4 py-2 ${
          view === "list" ? "bg-white/10" : ""
        }`}
      >
        List
      </button>
      <button
        onClick={() => setView("map")}
        className={`px-4 py-2 ${
          view === "map" ? "bg-white/10" : ""
        }`}
      >
        Map
      </button>
    </div>
  );
}
