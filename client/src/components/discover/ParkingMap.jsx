import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function RecenterMap({ center }) {
  const map = useMap();
  map.setView(center, 13);
  return null;
}

export default function ParkingMap({ parkingLots, center }) {
  return (
    <div className="mx-auto w-full max-w-[1200px] h-[500px] rounded-2xl overflow-hidden border border-border shadow-md bg-background">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <RecenterMap center={center} />

        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {parkingLots.map((lot) => (
          <Marker
            key={lot._id}
            position={[
              lot.location.coordinates[1],
              lot.location.coordinates[0],
            ]}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">{lot.name}</div>
                <div className="text-muted-foreground">
                  ₹{lot.baseRate} / hr
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
