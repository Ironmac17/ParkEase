import { useState } from "react";

export default function SearchBar({
  search,
  setSearch,
  setMapCenter,
  radiusKm = 5,
}) {
  const [loadingLocation, setLoadingLocation] = useState(false);

  // 📍 Get current location
  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    setLoadingLocation(true);

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

  // 🔍 Manual search (city / address)
  const handleSearch = async () => {
    if (!search.trim()) return;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          search
        )}&format=json&limit=1`
      );
      const data = await res.json();

      if (data.length > 0) {
        setMapCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
      } else {
        alert("Location not found");
      }
    } catch {
      alert("Failed to search location");
    }
  };

  return (
    <div className="px-6 py-6 border-b border-white/10">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search location or address"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/40 border border-blue-500/40 rounded-xl px-5 py-4 pr-12 text-white text-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            onClick={useCurrentLocation}
            title="Use current location"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-300"
          >
            {loadingLocation ? "…" : "📍"}
          </button>
        </div>

        <button
          onClick={handleSearch}
          className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-xl font-semibold"
        >
          Search
        </button>
      </div>

      <p className="text-xs text-gray-400 mt-2">
        Showing parking within ~{radiusKm} km
      </p>
    </div>
  );
}
