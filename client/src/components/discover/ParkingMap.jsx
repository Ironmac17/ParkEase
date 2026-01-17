import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom marker colors based on availability
function getParkingIcon(isAvailable) {
  return L.icon({
    iconUrl: isAvailable
      ? "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png"
      : "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
}

function RecenterMap({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom || 13);
  }, [center, zoom, map]);
  return null;
}

function ZoomBasedClusters({ parkingLots }) {
  const map = useMap();
  const [zoom, setZoom] = useState(13);

  useEffect(() => {
    const handleZoom = () => {
      setZoom(map.getZoom());
    };

    map.on("zoom", handleZoom);
    return () => {
      map.off("zoom", handleZoom);
    };
  }, [map]);

  // Show labels on high zoom
  const showLabels = zoom >= 15;

  return null;
}

export default function ParkingMap({ parkingLots, center, loading }) {
  const navigate = useNavigate();
  const defaultZoom = 13;

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-background">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-40 text-gray-400">
          Loading parking locations...
        </div>
      )}
      <MapContainer
        center={center || [28.7041, 77.1025]}
        zoom={defaultZoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <RecenterMap center={center || [28.7041, 77.1025]} zoom={defaultZoom} />
        <ZoomBasedClusters parkingLots={parkingLots} />

        {/* OpenStreetMap tiles - Good for India */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
        />

        {/* Parking lot markers */}
        {parkingLots.map((lot) => {
          if (!lot.location || !lot.location.coordinates) return null;

          const [lng, lat] = lot.location.coordinates;
          const free = lot?.stats?.freeSpots ?? 0;
          const total = lot?.stats?.totalSpots ?? 0;
          const isAvailable = free > 0;

          return (
            <Marker
              key={lot._id}
              position={[lat, lng]}
              icon={getParkingIcon(isAvailable)}
            >
              <Popup>
                <div className="text-sm font-semibold text-gray-800">
                  <div className="font-bold text-base mb-2">{lot.name}</div>
                  <div className="text-xs text-gray-600 mb-2">
                    {lot.address}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs my-2">
                    <div>
                      <span className="text-gray-600">Rate:</span>
                      <br />
                      <span className="font-semibold text-blue-600">
                        ₹{lot.baseRate}/hr
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Available:</span>
                      <br />
                      <span
                        className={`font-semibold ${
                          isAvailable ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {free}/{total}
                      </span>
                    </div>
                  </div>

                  {/* Amenities */}
                  {lot.amenities && (
                    <div className="text-xs mt-2 pt-2 border-t border-gray-300 space-y-1">
                      {lot.amenities.covered && <div>🏠 Covered Parking</div>}
                      {lot.amenities.ev && <div>⚡ EV Charging</div>}
                      {lot.amenities.security && <div>🔒 24/7 Security</div>}
                      {lot.amenities.cctv && <div>📹 CCTV</div>}
                    </div>
                  )}

                  <button
                    onClick={() => navigate(`/parking/${lot._id}`)}
                    className="block mt-2 w-full text-center bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold hover:bg-blue-600 transition"
                  >
                    Book Now
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map info */}
      <div className="absolute bottom-4 left-4 bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-xs text-gray-300 z-10 pointer-events-none">
        <p>📍 Showing {parkingLots.length} parking locations</p>
        <p className="text-gray-500 text-xs mt-1">Zoom in to see details</p>
      </div>
    </div>
  );
}
