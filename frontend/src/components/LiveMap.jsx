import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";

// Fix marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

// 🧠 Auto center logic
function AutoCenter({ location }) {
  const map = useMap();

  useEffect(() => {
    if (location) {
      map.setView(location, 15, { animate: true });
    }
  }, [location, map]);

  return null;
}

function LiveMap({ location }) {
  const defaultPosition = [20.5937, 78.9629];

  return (
    <div style={{ position: "relative" }}>
      <MapContainer
        center={location || defaultPosition}
        zoom={13}
        style={{ height: "300px", width: "100%", borderRadius: "10px" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
        />

        <AutoCenter location={location} />

        {/* 🚌 Show only when location exists */}
        {location && (
          <Marker position={location}>
            <Popup>🚌 Your Bus is here</Popup>
          </Marker>
        )}
      </MapContainer>

      {/* ⏳ Overlay */}
      {!location && (
        <div style={styles.overlay}>
          ⏳ Waiting for driver location...
        </div>
      )}
    </div>
  );
}

const styles = {
  overlay: {
    position: "absolute",
    top: "10px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#000000cc",
    color: "white",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "14px",
  },
};

export default LiveMap;