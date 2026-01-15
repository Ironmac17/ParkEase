import { useState } from "react";
import Navbar from "../../components/discover/Navbar";
import SearchBar from "../../components/discover/SearchBar";
import Filters from "../../components/discover/Filters";
import ParkingMap from "../../components/discover/ParkingMap";
import ParkingList from "../../components/discover/ParkingList";
import ViewToggle from "../../components/discover/ViewToggle";
import useParkingSearch from "../../hooks/useParkingSearch";

export default function Discover() {
  const [view, setView] = useState("map");
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);
  const [radiusKm, setRadiusKm] = useState(5);
  const {
    parkingLots,
    filters,
    setFilters,
    search,
    setSearch,
    loading,
  } = useParkingSearch();

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white">
      <Navbar />
      <SearchBar
        search={search}
        setSearch={setSearch}
        setMapCenter={setMapCenter}
        radiusKm={radiusKm}
      />

      <div className="px-6 py-4 flex items-center justify-between">
        <Filters filters={filters} setFilters={setFilters} />
        <ViewToggle view={view} setView={setView} />
      </div>

      <div className="h-[calc(100vh-220px)]">
        {view === "map" ? (
          <ParkingMap parkingLots={parkingLots} loading={loading}  center={mapCenter}/>
        ) : (
          <ParkingList parkingLots={parkingLots} loading={loading} />
        )}
      </div>
    </div>
  );
}
