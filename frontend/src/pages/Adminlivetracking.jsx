import { useEffect, useState, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import API from "../services/api";
import Layout from "../components/Layout";
import {
  RiBusLine,
  RiMapPinLine,
  RiWifiLine,
  RiUserLine,
  RiTimeLine,
  RiRefreshLine,
} from "react-icons/ri";
import { MdGpsFixed, MdGpsOff } from "react-icons/md";
import { IoWifiOutline } from "react-icons/io5";
import "../styles/AdminLiveTracking.css";

// ── Leaflet icon setup ──────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

// Each active bus gets a numbered marker so admin can identify them on the map
const makeBusIcon = (busNumber, isActive) =>
  L.divIcon({
    className: "",
    html: `<div class="alt-bus-marker ${isActive ? "active" : "idle"}">
             <span>${busNumber}</span>
           </div>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  });

const SERVER = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

// Fits map to show all active bus markers when they first load
function MapFitter({ positions }) {
  const map = useMap();
  const fitted = useRef(false);
  useEffect(() => {
    if (fitted.current || positions.length === 0) return;
    const bounds = L.latLngBounds(positions);
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
    fitted.current = true;
  }, [positions, map]);
  return null;
}

function AdminLiveTracking() {
  // busMap shape: { [busId]: { busNumber, active, location, driver, startTime, lastSeen } }
  const [busMap, setBusMap] = useState({});
  const [selectedBus, setSelectedBus] = useState(null);
  const [socketOnline, setSocketOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const socketRef = useRef(null);

  // ── Step 1: Fetch all buses from REST on mount ──────────
  // This gives us the initial state (which buses exist, which are active,
  // last known location from DB) before any socket events arrive.
  const fetchLiveBuses = useCallback(async () => {
    try {
      const res = await API.get("/admin/live-buses");
      const map = {};
      res.data.forEach((bus) => {
        map[bus.busId] = {
          ...bus,
          lastSeen: bus.location ? Date.now() : null,
        };
      });
      setBusMap(map);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch live buses:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveBuses();
  }, [fetchLiveBuses]);

  // ── Step 2: Connect socket + join all bus rooms ─────────
  // We wait until busMap is populated so we know which rooms to join.
  // Socket then keeps the map fresh in real-time without polling.
  useEffect(() => {
    const busIds = Object.keys(busMap);
    if (busIds.length === 0) return; // wait for REST fetch

    const s = io(SERVER, {
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
    });
    socketRef.current = s;

    s.on("connect", () => {
      console.log("✅ Admin socket connected:", s.id);
      setSocketOnline(true);
      // Join ALL bus rooms in one event — server does Promise.all(rooms.map(socket.join))
      s.emit("joinAllBusRooms", busIds);
    });

    s.on("disconnect", () => {
      console.log("🔌 Admin socket disconnected");
      setSocketOnline(false);
    });

    s.on("adminRoomsJoined", ({ rooms }) => {
      console.log(`🛡️ Admin joined ${rooms.length} bus rooms:`, rooms);
    });

    // This fires for EVERY bus because admin is in all rooms.
    // We use loc.busId to update only the correct entry in busMap.
    s.on("liveLocation", (loc) => {
      if (!loc?.busId) return;
      const lat = parseFloat(loc.lat);
      const lng = parseFloat(loc.lng);
      if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) return;

      setBusMap((prev) => {
        if (!prev[loc.busId]) return prev; // unknown bus, ignore
        return {
          ...prev,
          [loc.busId]: {
            ...prev[loc.busId],
            location: { lat, lng },
            lastSeen: Date.now(),
            active: true,
          },
        };
      });
      setLastUpdated(new Date());
    });

    s.on("tripStarted", (data) => {
      if (!data?.busId) return;
      setBusMap((prev) => {
        if (!prev[data.busId]) return prev;
        return {
          ...prev,
          [data.busId]: { ...prev[data.busId], active: true },
        };
      });
    });

    s.on("tripEnded", (data) => {
      if (!data?.busId) return;
      setBusMap((prev) => {
        if (!prev[data.busId]) return prev;
        return {
          ...prev,
          [data.busId]: {
            ...prev[data.busId],
            active: false,
            location: null,
            lastSeen: null,
          },
        };
      });
    });

    return () => s.disconnect();
  }, [Object.keys(busMap).join(",")]); // re-run only if bus list changes (new bus added)

  // ── Derived values ──────────────────────────────────────
  const buses = Object.values(busMap);
  const activeBuses = buses.filter((b) => b.active);
  const activeWithLocation = activeBuses.filter((b) => b.location);
  const mapPositions = activeWithLocation.map((b) => [b.location.lat, b.location.lng]);
  const defaultCenter = [28.6139, 77.209]; // fallback: New Delhi

  const timeStr = lastUpdated
    ? lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "—";

  if (loading) {
    return (
      <Layout>
        <div className="alt-loading">
          <div className="alt-spinner" />
          <span>Loading live bus data…</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="alt-root">

        {/* ── Header ── */}
        <div className="alt-header">
          <div className="alt-header-left">
            <div className="dashboard-eyebrow">University TMS</div>
            <h1 className="dashboard-title">
              Live <span>Tracking</span>
            </h1>
            <p className="dashboard-subtitle">
              Real-time location of all {buses.length} buses across the fleet.
            </p>
          </div>
          <div className="alt-header-right">
            <div className={`alt-socket-badge ${socketOnline ? "on" : "off"}`}>
              <IoWifiOutline />
              <span>{socketOnline ? "Live" : "Reconnecting…"}</span>
            </div>
            <button
              className="refresh-btn"
              onClick={fetchLiveBuses}
              title="Re-fetch all bus states"
            >
              <RiRefreshLine /> Refresh
            </button>
          </div>
        </div>

        {/* ── Summary stats ── */}
        <div className="alt-stat-row">
          <div className="alt-stat">
            <div className="alt-stat-icon blue"><RiBusLine /></div>
            <div>
              <div className="alt-stat-val">{buses.length}</div>
              <div className="alt-stat-lbl">Total Buses</div>
            </div>
          </div>
          <div className="alt-stat">
            <div className="alt-stat-icon green"><MdGpsFixed /></div>
            <div>
              <div className="alt-stat-val">{activeBuses.length}</div>
              <div className="alt-stat-lbl">Active Trips</div>
            </div>
          </div>
          <div className="alt-stat">
            <div className="alt-stat-icon orange"><RiMapPinLine /></div>
            <div>
              <div className="alt-stat-val">{activeWithLocation.length}</div>
              <div className="alt-stat-lbl">Broadcasting GPS</div>
            </div>
          </div>
          <div className="alt-stat">
            <div className="alt-stat-icon purple"><RiBusLine /></div>
            <div>
              <div className="alt-stat-val">{buses.length - activeBuses.length}</div>
              <div className="alt-stat-lbl">Idle Buses</div>
            </div>
          </div>
        </div>

        {/* ── Main content: map + sidebar ── */}
        <div className="alt-body">

          {/* Sidebar — bus list */}
          <div className="alt-sidebar">
            <div className="alt-sidebar-head">All Buses</div>
            <div className="alt-bus-list">
              {buses.map((bus) => (
                <div
                  key={bus.busId}
                  className={`alt-bus-item ${bus.active ? "active" : "idle"} ${selectedBus === bus.busId ? "selected" : ""}`}
                  onClick={() => setSelectedBus((prev) => prev === bus.busId ? null : bus.busId)}
                >
                  <div className="alt-bus-icon-wrap">
                    <RiBusLine />
                  </div>
                  <div className="alt-bus-info">
                    <div className="alt-bus-number">{bus.busNumber}</div>
                    <div className="alt-bus-status">
                      {bus.active ? (
                        <><span className="alt-dot green" /> Trip in progress</>
                      ) : (
                        <><span className="alt-dot gray" /> Idle</>
                      )}
                    </div>
                    {bus.driver && (
                      <div className="alt-bus-driver">
                        <RiUserLine /> {bus.driver.name}
                      </div>
                    )}
                  </div>
                  <div className="alt-bus-gps">
                    {bus.location ? (
                      <MdGpsFixed className="gps-on" title="GPS active" />
                    ) : (
                      <MdGpsOff className="gps-off" title="No GPS" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Map */}
          <div className="alt-map-wrap">
            <MapContainer
              center={defaultCenter}
              zoom={12}
              style={{ height: "100%", width: "100%" }}
              zoomControl={true}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="© OpenStreetMap"
              />
              {mapPositions.length > 0 && <MapFitter positions={mapPositions} />}

              {activeWithLocation.map((bus) => (
                <Marker
                  key={bus.busId}
                  position={[bus.location.lat, bus.location.lng]}
                  icon={makeBusIcon(bus.busNumber, true)}
                  eventHandlers={{
                    click: () => setSelectedBus(bus.busId),
                  }}
                >
                  <Popup>
                    <div className="alt-popup">
                      <strong>🚌 {bus.busNumber}</strong>
                      {bus.driver && <div>👤 {bus.driver.name}</div>}
                      <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>
                        {bus.location.lat.toFixed(5)}, {bus.location.lng.toFixed(5)}
                      </div>
                      {bus.lastSeen && (
                        <div style={{ fontSize: 11, opacity: 0.6 }}>
                          Updated {Math.round((Date.now() - bus.lastSeen) / 1000)}s ago
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {activeWithLocation.length === 0 && (
              <div className="alt-map-empty">
                <MdGpsOff />
                <span>No buses broadcasting GPS right now</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Selected bus detail panel ── */}
        {selectedBus && busMap[selectedBus] && (
          <div className="alt-detail-panel">
            {(() => {
              const bus = busMap[selectedBus];
              return (
                <>
                  <div className="alt-detail-head">
                    <div>
                      <div className="alt-detail-title">Bus {bus.busNumber}</div>
                      <div className={`alt-detail-status ${bus.active ? "active" : "idle"}`}>
                        {bus.active ? "● Trip in progress" : "● Idle"}
                      </div>
                    </div>
                    <button className="alt-close-btn" onClick={() => setSelectedBus(null)}>✕</button>
                  </div>
                  <div className="alt-detail-body">
                    <div className="alt-detail-row">
                      <RiUserLine />
                      <span>{bus.driver ? bus.driver.name : "No driver assigned"}</span>
                    </div>
                    {bus.driver?.phone && (
                      <div className="alt-detail-row">
                        <span>📞</span>
                        <span>{bus.driver.phone || bus.driver.contact}</span>
                      </div>
                    )}
                    <div className="alt-detail-row">
                      <RiMapPinLine />
                      <span>
                        {bus.location
                          ? `${bus.location.lat.toFixed(5)}, ${bus.location.lng.toFixed(5)}`
                          : "No GPS signal"}
                      </span>
                    </div>
                    {bus.startTime && (
                      <div className="alt-detail-row">
                        <RiTimeLine />
                        <span>
                          Started at{" "}
                          {new Date(bus.startTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    )}
                    {bus.lastSeen && (
                      <div className="alt-detail-row">
                        <RiWifiLine />
                        <span>
                          GPS updated {Math.round((Date.now() - bus.lastSeen) / 1000)}s ago
                        </span>
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* ── Footer strip ── */}
        <div className="info-strip" style={{ marginTop: 16 }}>
          <div className="info-item">
            <RiTimeLine /> Last updated <strong>{timeStr}</strong>
          </div>
          <div className="info-divider" />
          <div className="info-item">
            <RiWifiLine /> Socket: <strong>{socketOnline ? "connected" : "offline"}</strong>
          </div>
          <div className="info-divider" />
          <div className="info-item">
            <RiBusLine /> Tracking <strong>{buses.length} buses</strong>
          </div>
        </div>

      </div>
    </Layout>
  );
}

export default AdminLiveTracking;