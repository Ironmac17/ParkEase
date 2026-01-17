import { useState } from "react";
import { Search, MapPin } from "lucide-react";

export default function SearchBar({
  search,
  setSearch,
  setMapCenter,
  radiusKm = 5,
}) {
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [searchBy, setSearchBy] = useState("location"); // location or name

  // 📍 Get current location
  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    setLoadingLocation(true);
    setSearchBy("location");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setMapCenter([latitude, longitude]);
        setLoadingLocation(false);
      },
      () => {
        alert("Location access denied");
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true }
    );
  };

  // 🔍 Manual search (city / address or parking name)
  const handleSearch = async () => {
    if (!search.trim()) return;

    if (searchBy === "location") {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            search
          )}&format=json&limit=1&bounded=1&viewbox=68.0,8.0,97.0,35.0`
        );
        const data = await res.json();

        if (data.length > 0) {
          setMapCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        } else {
          alert("Location not found in India");
        }
      } catch {
        alert("Failed to search location");
      }
    }
    // For parking name search, it's handled by parent component's useParkingSearch hook
  };

  return (
    <div className="px-6 py-6 border-b border-white/10 bg-black/40 backdrop-blur">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm text-gray-400 mb-2">Search by</label>
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setSearchBy("location")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                searchBy === "location"
                  ? "bg-blue-500/20 border border-blue-500 text-white"
                  : "border border-white/10 text-gray-400 hover:text-white"
              }`}
            >
              <MapPin size={16} />
              Location
            </button>
            <button
              onClick={() => setSearchBy("name")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                searchBy === "name"
                  ? "bg-blue-500/20 border border-blue-500 text-white"
                  : "border border-white/10 text-gray-400 hover:text-white"
              }`}
            >
              <Search size={16} />
              Parking Name
            </button>
          </div>
        </div>

        <div className="relative flex-1">
          <input
            type="text"
            placeholder={
              searchBy === "location"
                ? "Enter city or address..."
                : "Enter parking name..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            className="w-full bg-black/40 border border-blue-500/40 rounded-xl px-5 py-4 pr-12 text-white text-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            onClick={useCurrentLocation}
            disabled={searchBy !== "location"}
            title="Use current location (location search only)"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-300 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loadingLocation ? "…" : "📍"}
          </button>
        </div>

        <button
          onClick={handleSearch}
          className="bg-blue-500 hover:bg-blue-600 px-6 py-4 rounded-xl font-semibold flex items-center gap-2 text-white transition w-full md:w-auto justify-center"
        >
          <Search size={18} />
          Search
        </button>
      </div>

      <p className="text-xs text-gray-400 mt-3">
        💡 Tip: You can search by location to center the map, or search by
        parking name to filter results
      </p>
    </div>
  );
}
