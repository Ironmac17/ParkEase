import { useState } from "react";
import SearchBar from "../../components/discover/SearchBar";
import Filters from "../../components/discover/Filters";
import ParkingMap from "../../components/discover/ParkingMap";
import ParkingList from "../../components/discover/ParkingList";
import ViewToggle from "../../components/discover/ViewToggle";
import useParkingSearch from "../../hooks/useParkingSearch";

export default function Discover() {
  const [view, setView] = useState("map");
  const [mapCenter, setMapCenter] = useState([28.7041, 77.1025]); // Delhi
  const [radiusKm, setRadiusKm] = useState(5);
  const { parkingLots, filters, setFilters, search, setSearch, loading } =
    useParkingSearch();

  return (
    <div className="min-h-screen bg-[#0b0f1a]">
      <SearchBar
        search={search}
        setSearch={setSearch}
        setMapCenter={setMapCenter}
        radiusKm={radiusKm}
      />

      <div className="px-6 py-4 flex items-center justify-between bg-black/40 backdrop-blur">
        <Filters filters={filters} setFilters={setFilters} />
        <ViewToggle view={view} setView={setView} />
      </div>

      <div className="px-6 py-4" style={{ height: "calc(100vh - 280px)" }}>
        {view === "map" ? (
          <ParkingMap
            parkingLots={parkingLots}
            loading={loading}
            center={mapCenter}
          />
        ) : (
          <div className="h-full flex gap-4">
            <ParkingList parkingLots={parkingLots} loading={loading} />
          </div>
        )}
      </div>
    </div>
  );
}
