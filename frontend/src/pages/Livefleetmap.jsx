import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Layout from "../components/Layout";
import API from "../services/api";
import "../styles/LiveFleetMap.css";

import {
  RiBusLine,
  RiMapPinLine,
  RiUserLine,
  RiTimeLine,
  RiCloseCircleLine,
  RiArrowLeftLine,
  RiRefreshLine,
  RiSearchLine,
  RiAlertLine,
  RiCheckboxCircleLine,
  RiPhoneLine,
  RiHistoryLine,
  RiArrowDownSLine ,
} from "react-icons/ri";
import { MdMyLocation, MdOutlineWifiOff, MdOutlineBusAlert } from "react-icons/md";
import { TbBus, TbClockPause } from "react-icons/tb";
import { PiEngineBold } from "react-icons/pi";

/* ─── FIX: Leaflet default icon broken asset path fix ────── */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* ─── Bus marker SVG factory ──────────────────────────────── */
const makeBusIcon = (status) => {
  const colors = {
    active:  { bg: "#10b981", border: "#fff", text: "#fff" },
    late:    { bg: "#f59e0b", border: "#fff", text: "#fff" },
    offline: { bg: "#94a3b8", border: "#fff", text: "#fff" },
  };
  const c = colors[status] || colors.offline;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="48" viewBox="0 0 40 48">
      <circle cx="20" cy="18" r="16" fill="${c.bg}" stroke="${c.border}" stroke-width="2.5"/>
      <text x="20" y="23" text-anchor="middle" font-size="13" fill="${c.text}" font-family="sans-serif">🚌</text>
      <polygon points="14,32 26,32 20,46" fill="${c.bg}"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [40, 48],
    iconAnchor: [20, 46],
    popupAnchor: [0, -48],
  });
};

/* ─── Helpers ─────────────────────────────────────────────── */
const getBusStatus = (bus, scheduledDeparture) => {
  if (!bus.active) return "offline";
  if (!scheduledDeparture || !bus.startTime) return "active";
  const [h, m] = scheduledDeparture.split(":").map(Number);
  const sched = new Date(bus.startTime);
  sched.setHours(h, m, 0, 0);
  return new Date(bus.startTime) > sched ? "late" : "active";
};

const fmtTime = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const fmtDuration = (startIso) => {
  if (!startIso) return "—";
  const mins = Math.floor((Date.now() - new Date(startIso)) / 60000);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
};

/* ─── History modal ───────────────────────────────────────── */
function HistoryModal({ bus, onClose }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/admin/bus/${bus.busId}/history`)
      .then((r) => setTrips(r.data))
      .catch(() => setTrips([]))
      .finally(() => setLoading(false));
  }, [bus.busId]);

  return (
    <div className="lf-modal-overlay" onClick={onClose}>
      <div className="lf-modal" onClick={(e) => e.stopPropagation()}>
        <div className="lf-modal-header">
          <div className="lf-modal-title">
            <TbBus size={20} />
            <span>Bus {bus.busNumber} — Trip History</span>
          </div>
          <button className="lf-modal-close" onClick={onClose}>
            <RiCloseCircleLine size={22} />
          </button>
        </div>
        <div className="lf-modal-body">
          {loading ? (
            <div className="lf-modal-loading">
              <div className="lf-spinner" />
              <span>Loading history…</span>
            </div>
          ) : trips.length === 0 ? (
            <div className="lf-modal-empty">
              <RiHistoryLine size={36} />
              <p>No trip history available</p>
            </div>
          ) : (
            <table className="lf-history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Driver</th>
                  <th>Departed</th>
                  <th>Arrived</th>
                  <th>Duration</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {trips.map((t, i) => {
                  const dur = t.endTime
                    ? Math.floor((new Date(t.endTime) - new Date(t.startTime)) / 60000)
                    : null;
                  return (
                    <tr key={i}>
                      <td>
                        {new Date(t.startTime).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </td>
                      <td>{t.driver?.name || "—"}</td>
                      <td>{fmtTime(t.startTime)}</td>
                      <td>
                        {t.endTime ? fmtTime(t.endTime) : (
                          <span className="lf-live-pill">Live</span>
                        )}
                      </td>
                      <td>{dur != null ? `${dur}m` : "—"}</td>
                      <td>
                        <span className={`lf-status-pill ${t.active ? "active" : "done"}`}>
                          {t.active ? "In Progress" : "Completed"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────── */
export default function LiveFleetMap() {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const socketRef = useRef(null);

  const [buses, setBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [historyBus, setHistoryBus] = useState(null);
  const [connected, setConnected] = useState(false);
  const [lastPing, setLastPing] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Collapsible sidebar sections
  const [busListOpen, setBusListOpen] = useState(true);
  const [driverSearchOpen, setDriverSearchOpen] = useState(false);
  const [driverSearch, setDriverSearch] = useState("");

  // FIX: Refresh spin state
  const [refreshSpinning, setRefreshSpinning] = useState(false);

  /* ── Init map ─────────────────────────────────────────── */
  useEffect(() => {
    if (mapInstanceRef.current) return;

    // FIX: ensure the container has dimensions before init
    const container = mapRef.current;
    if (!container) return;

    mapInstanceRef.current = L.map(container, {
      center: [27.1767, 78.0081],
      zoom: 14,
      // FIX: Disable zoom control here — we re-add it at topright below
      zoomControl: false,
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        attribution: "© OpenStreetMap © CARTO",
        maxZoom: 19,
      }
    ).addTo(mapInstanceRef.current);

    // FIX: Zoom control at topright
    L.control.zoom({ position: "topright" }).addTo(mapInstanceRef.current);

    // FIX: invalidateSize after a tick so Leaflet measures the real container size
    // (fixes the black/grey tile rendering bug when the container size isn't known at mount)
    requestAnimationFrame(() => {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize({ animate: false });
      }, 150);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  /* ── Fetch initial bus data ──────────────────────────── */
  const fetchBuses = useCallback(async () => {
    try {
      const res = await API.get("/admin/live-buses");
      setBuses(res.data);
      setLoading(false);

      res.data.forEach((bus) => {
        const status = getBusStatus(bus, bus.scheduledDeparture);
        if (bus.location && mapInstanceRef.current) {
          const { lat, lng } = bus.location;
          if (markersRef.current[bus.busId]) {
            markersRef.current[bus.busId].setLatLng([lat, lng]);
            markersRef.current[bus.busId].setIcon(makeBusIcon(status));
          } else {
            const marker = L.marker([lat, lng], { icon: makeBusIcon(status) })
              .addTo(mapInstanceRef.current)
              .bindTooltip(`Bus ${bus.busNumber}`, {
                permanent: false,
                className: "lf-map-tooltip",
              });
            marker.on("click", () =>
              setSelectedBus((prev) =>
                prev?.busId === bus.busId ? null : bus
              )
            );
            markersRef.current[bus.busId] = marker;
          }
        }
      });
    } catch (err) {
      console.error("fetchBuses error:", err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBuses();
  }, [fetchBuses]);

  // FIX: Refresh handler with spin animation
  const handleRefresh = useCallback(() => {
    if (refreshSpinning) return;
    setRefreshSpinning(true);
    fetchBuses().finally(() => {
      // Remove class after animation completes (0.6s)
      setTimeout(() => setRefreshSpinning(false), 650);
    });
  }, [fetchBuses, refreshSpinning]);

  /* ── Socket.io ───────────────────────────────────────── */
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      setBuses((prev) => {
        const ids = prev.map((b) => b.busId);
        if (ids.length) socket.emit("joinAllBusRooms", ids);
        return prev;
      });
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("liveLocation", ({ busId, lat, lng, timestamp }) => {
      setLastPing(new Date());
      if (mapInstanceRef.current) {
        if (markersRef.current[busId]) {
          markersRef.current[busId].setLatLng([lat, lng]);
        } else {
          const marker = L.marker([lat, lng], { icon: makeBusIcon("active") })
            .addTo(mapInstanceRef.current)
            .bindTooltip(`Bus ${busId}`, {
              permanent: false,
              className: "lf-map-tooltip",
            });
          marker.on("click", () =>
            setSelectedBus((prev) =>
              prev?.busId === busId ? null : buses.find((b) => b.busId === busId)
            )
          );
          markersRef.current[busId] = marker;
        }
      }
      setBuses((prev) =>
        prev.map((b) =>
          b.busId === busId ? { ...b, location: { lat, lng }, lastSeen: timestamp } : b
        )
      );
      setSelectedBus((prev) =>
        prev?.busId === busId ? { ...prev, location: { lat, lng }, lastSeen: timestamp } : prev
      );
    });

    socket.on("tripStarted", ({ busId }) => {
      setBuses((prev) =>
        prev.map((b) =>
          b.busId === busId ? { ...b, active: true, startTime: new Date().toISOString() } : b
        )
      );
      if (markersRef.current[busId]) {
        markersRef.current[busId].setIcon(makeBusIcon("active"));
      }
    });

    socket.on("tripEnded", ({ busId }) => {
      setBuses((prev) =>
        prev.map((b) =>
          b.busId === busId ? { ...b, active: false, location: null } : b
        )
      );
      if (markersRef.current[busId]) {
        markersRef.current[busId].setIcon(makeBusIcon("offline"));
      }
      setSelectedBus((prev) =>
        prev?.busId === busId ? { ...prev, active: false } : prev
      );
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    if (buses.length && socketRef.current?.connected) {
      socketRef.current.emit("joinAllBusRooms", buses.map((b) => b.busId));
    }
  }, [buses.length]);

  /* ── Focus bus on map ────────────────────────────────── */
  const focusBus = (bus) => {
    setSelectedBus(bus);
    if (bus.location && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([bus.location.lat, bus.location.lng], 16, {
        duration: 1.2,
      });
    }
  };

  /* ── Filter & search (bus number) ───────────────────── */
  const filtered = buses.filter((b) => {
    const status = getBusStatus(b, b.scheduledDeparture);
    const matchSearch =
      !search ||
      b.busNumber?.toLowerCase().includes(search.toLowerCase()) ||
      b.driver?.name?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "active" && status === "active") ||
      (filter === "late" && status === "late") ||
      (filter === "offline" && status === "offline");
    return matchSearch && matchFilter;
  });

  /* ── Driver search filter ────────────────────────────── */
  // const driverFiltered = driverSearch
  //   ? buses.filter((b) =>
  //       b.driver?.name?.toLowerCase().includes(driverSearch.toLowerCase())
  //     )
  //   : [];

  /* ── Counts ──────────────────────────────────────────── */
  const activeCnt  = buses.filter((b) => b.active).length;
  const lateCnt    = buses.filter((b) => getBusStatus(b, b.scheduledDeparture) === "late").length;
  const offlineCnt = buses.filter((b) => !b.active).length;

  /* ── Render ──────────────────────────────────────────── */
  return (
    <Layout>
      <div className="lf-root">

        {/* ── Top bar ── */}
        <div className="lf-topbar">
          <div className="lf-topbar-left">
            <button className="lf-back-btn" onClick={() => navigate("/admin-dashboard")} aria-label="Go back">
              <RiArrowLeftLine size={17} />
            </button>
            <div className="lf-page-title">
              <TbBus size={20} className="lf-title-icon" />
              <div>
                <h1>Live Fleet Monitor</h1>
                <p>Real-time tracking · University Transport</p>
              </div>
            </div>
          </div>

          <div className="lf-topbar-right">
            <div className={`lf-conn-badge ${connected ? "on" : "off"}`}>
              {connected ? (
                <>
                  <span className="lf-pulse-dot" />
                  Live
                </>
              ) : (
                <>
                  <MdOutlineWifiOff size={13} />
                  Reconnecting…
                </>
              )}
            </div>

            {lastPing && (
              <div className="lf-ping-badge">
                <RiTimeLine size={12} />
                {lastPing.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </div>
            )}

            {/* FIX: Refresh button with spin class toggled on click */}
            <button
              className={`lf-refresh-btn ${refreshSpinning ? "spinning" : ""}`}
              onClick={handleRefresh}
              title="Refresh data"
              aria-label="Refresh fleet data"
            >
              <span className="lf-refresh-icon">
                <RiRefreshLine size={16} />
              </span>
            </button>
          </div>
        </div>

        {/* ── Stat strip ── */}
        <div className="lf-stat-strip">
          {[
            { key: "all",     icon: <RiBusLine size={15} />,           count: buses.length, label: "Total"   },
            { key: "active",  icon: <RiCheckboxCircleLine size={15} />, count: activeCnt,   label: "On-Time" },
            { key: "late",    icon: <RiAlertLine size={15} />,          count: lateCnt,     label: "Late"    },
            { key: "offline", icon: <TbClockPause size={15} />,         count: offlineCnt,  label: "Offline" },
          ].map(({ key, icon, count, label }) => (
            <button
              key={key}
              className={`lf-stat-chip ${key} ${filter === key ? "active" : ""}`}
              onClick={() => setFilter(key)}
            >
              {icon}
              <span className="lf-chip-num">{count}</span>
              <span className="lf-chip-label">{label}</span>
            </button>
          ))}
        </div>

        {/* ── Main body ── */}
        <div className="lf-body">

          {/* ── Sidebar ── */}
          <aside className="lf-sidebar">

            {/* ── Driver Search (collapsible) ── */}
            <div className="lf-collapse-section">
              {/* <button
                className="lf-collapse-header"
                onClick={() => setDriverSearchOpen((p) => !p)}
                aria-expanded={driverSearchOpen}
              >
                <div className="lf-collapse-header-left">
                  <RiUserLine size={14} />
                  <span>Driver Search</span>
                </div>
                <RiArrowDownSLine 
                  size={15}
                  className={`lf-collapse-chevron ${driverSearchOpen ? "open" : ""}`}
                />
              </button> */}
{/* 
              <div className={`lf-collapse-body ${driverSearchOpen ? "open" : ""}`}>
                <div className="lf-collapse-inner">
                  <div className="lf-search-wrap">
                    <RiSearchLine size={14} className="lf-search-icon" />
                    <input
                      className="lf-search"
                      placeholder="Search by driver name…"
                      value={driverSearch}
                      onChange={(e) => setDriverSearch(e.target.value)}
                      aria-label="Search drivers"
                    />
                    {driverSearch && (
                      <button className="lf-search-clear" onClick={() => setDriverSearch("")} aria-label="Clear search">
                        <RiCloseCircleLine size={14} />
                      </button>
                    )}
                  </div>

                  {driverSearch && (
                    <div className="lf-driver-results">
                      {driverFiltered.length === 0 ? (
                        <div className="lf-driver-no-result">No drivers found</div>
                      ) : (
                        driverFiltered.map((bus) => {
                          const status = getBusStatus(bus, bus.scheduledDeparture);
                          return (
                            <div
                              key={bus.busId}
                              className="lf-driver-result-row"
                              onClick={() => focusBus(bus)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => e.key === "Enter" && focusBus(bus)}
                            >
                              <div className={`lf-driver-dot ${status}`} />
                              <div className="lf-driver-result-info">
                                <span className="lf-driver-result-name">{bus.driver?.name || "Unassigned"}</span>
                                <span className="lf-driver-result-bus">Bus {bus.busNumber}</span>
                              </div>
                              <span className={`lf-status-tag ${status}`}>
                                {status === "active"  && "On Time"}
                                {status === "late"    && "Late"}
                                {status === "offline" && "Offline"}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              </div> */}
            </div>

            {/* ── Bus List (collapsible) ── */}
            <div className="lf-collapse-section lf-bus-section">
              <button
                className="lf-collapse-header"
                onClick={() => setBusListOpen((p) => !p)}
                aria-expanded={busListOpen}
              >
                <div className="lf-collapse-header-left">
                  <TbBus size={14} />
                  <span>All Buses</span>
                  <span className="lf-section-count">{filtered.length}</span>
                </div>
                <RiArrowDownSLine 
                  size={15}
                  className={`lf-collapse-chevron ${busListOpen ? "open" : ""}`}
                />
              </button>

              <div className={`lf-collapse-body ${busListOpen ? "open" : ""}`}>
                <div className="lf-collapse-inner">
                  {/* Bus search */}
                  <div className="lf-search-wrap">
                    <RiSearchLine size={14} className="lf-search-icon" />
                    <input
                      className="lf-search"
                      placeholder="Search bus or driver…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      aria-label="Search buses"
                    />
                    {search && (
                      <button className="lf-search-clear" onClick={() => setSearch("")} aria-label="Clear search">
                        <RiCloseCircleLine size={14} />
                      </button>
                    )}
                  </div>

                  {/* Bus list */}
                  <div className="lf-bus-list" role="list">
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="lf-bus-skeleton" />
                      ))
                    ) : filtered.length === 0 ? (
                      <div className="lf-no-results">
                        <MdOutlineBusAlert size={28} />
                        <p>No buses found</p>
                      </div>
                    ) : (
                      filtered.map((bus) => {
                        const status = getBusStatus(bus, bus.scheduledDeparture);
                        const isSelected = selectedBus?.busId === bus.busId;
                        return (
                          <div
                            key={bus.busId}
                            className={`lf-bus-card ${status} ${isSelected ? "selected" : ""}`}
                            onClick={() => focusBus(bus)}
                            role="listitem"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === "Enter" && focusBus(bus)}
                          >
                            <div className="lf-bus-card-left">
                              <div className={`lf-bus-icon-wrap ${status}`}>
                                <TbBus size={16} />
                                {status === "active" && <span className="lf-active-ring" />}
                              </div>
                              <div className="lf-bus-info">
                                <div className="lf-bus-number">Bus {bus.busNumber}</div>
                                <div className="lf-bus-driver">
                                  <RiUserLine size={10} />
                                  {bus.driver?.name || "Unassigned"}
                                </div>
                              </div>
                            </div>

                            <div className="lf-bus-card-right">
                              <span className={`lf-status-tag ${status}`}>
                                {status === "active"  && "On Time"}
                                {status === "late"    && "Late"}
                                {status === "offline" && "Offline"}
                              </span>
                              {bus.active && (
                                <div className="lf-bus-duration">
                                  <RiTimeLine size={10} />
                                  {fmtDuration(bus.startTime)}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* ── Map ── */}
          <div className="lf-map-wrap">
            <div ref={mapRef} className="lf-map" />

            <div className="lf-map-legend" aria-label="Map legend">
              <div className="lf-legend-item"><span className="lf-legend-dot green" />On Time</div>
              <div className="lf-legend-item"><span className="lf-legend-dot amber" />Late</div>
              <div className="lf-legend-item"><span className="lf-legend-dot gray"  />Offline</div>
            </div>

            <button
              className="lf-fit-btn"
              title="Fit all buses"
              aria-label="Fit all buses on map"
              onClick={() => {
                const pts = buses
                  .filter((b) => b.location)
                  .map((b) => [b.location.lat, b.location.lng]);
                if (pts.length && mapInstanceRef.current) {
                  mapInstanceRef.current.fitBounds(L.latLngBounds(pts), { padding: [40, 40] });
                }
              }}
            >
              <MdMyLocation size={18} />
            </button>

            {!loading && activeCnt === 0 && (
              <div className="lf-map-empty">
                <TbBus size={38} />
                <p>No active buses right now</p>
                <span>Buses will appear here once drivers start their trips</span>
              </div>
            )}
          </div>

          {/* ── Detail panel ── */}
          {selectedBus && (
            <aside className="lf-detail-panel">
              <div className="lf-detail-header">
                <div className="lf-detail-title">
                  <div className={`lf-detail-bus-icon ${getBusStatus(selectedBus, selectedBus.scheduledDeparture)}`}>
                    <TbBus size={18} />
                  </div>
                  <div>
                    <h2>Bus {selectedBus.busNumber}</h2>
                    <span className={`lf-status-tag ${getBusStatus(selectedBus, selectedBus.scheduledDeparture)}`}>
                      {getBusStatus(selectedBus, selectedBus.scheduledDeparture) === "active"  && <><RiCheckboxCircleLine size={10} /> On Time</>}
                      {getBusStatus(selectedBus, selectedBus.scheduledDeparture) === "late"    && <><RiAlertLine size={10} /> Late</>}
                      {getBusStatus(selectedBus, selectedBus.scheduledDeparture) === "offline" && <><TbClockPause size={10} /> Offline</>}
                    </span>
                  </div>
                </div>
                <button className="lf-detail-close" onClick={() => setSelectedBus(null)} aria-label="Close detail panel">
                  <RiCloseCircleLine size={19} />
                </button>
              </div>

              <div className="lf-detail-body">
                {/* Driver */}
                <div className="lf-detail-section">
                  <div className="lf-detail-section-label">
                    <RiUserLine size={12} /> Driver
                  </div>
                  {selectedBus.driver ? (
                    <div className="lf-driver-card">
                      <div className="lf-driver-avatar">
                        {selectedBus.driver.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="lf-driver-name">{selectedBus.driver.name}</div>
                        {selectedBus.driver.phone && (
                          <div className="lf-driver-phone">
                            <RiPhoneLine size={10} />
                            {selectedBus.driver.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="lf-detail-empty">No driver assigned</div>
                  )}
                </div>

                {/* Trip info */}
                <div className="lf-detail-section">
                  <div className="lf-detail-section-label">
                    <PiEngineBold size={12} /> Trip Info
                  </div>
                  <div className="lf-info-grid">
                    <div className="lf-info-cell">
                      <span className="lf-info-label">Departed</span>
                      <span className="lf-info-val">{fmtTime(selectedBus.startTime)}</span>
                    </div>
                    <div className="lf-info-cell">
                      <span className="lf-info-label">Duration</span>
                      <span className="lf-info-val">{fmtDuration(selectedBus.startTime)}</span>
                    </div>
                    <div className="lf-info-cell">
                      <span className="lf-info-label">Status</span>
                      <span className="lf-info-val">{selectedBus.active ? "Running" : "Stopped"}</span>
                    </div>
                    <div className="lf-info-cell">
                      <span className="lf-info-label">Last Ping</span>
                      <span className="lf-info-val">
                        {selectedBus.lastSeen ? fmtTime(new Date(selectedBus.lastSeen).toISOString()) : "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* GPS Location */}
                {selectedBus.location && (
                  <div className="lf-detail-section">
                    <div className="lf-detail-section-label">
                      <RiMapPinLine size={12} /> GPS Location
                    </div>
                    <div className="lf-coords">
                      <div className="lf-coord">
                        <span>LAT</span>
                        {selectedBus.location.lat.toFixed(5)}
                      </div>
                      <div className="lf-coord">
                        <span>LNG</span>
                        {selectedBus.location.lng.toFixed(5)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="lf-detail-actions">
                  <button
                    className="lf-action-btn primary"
                    disabled={!selectedBus.location}
                    onClick={() => {
                      if (selectedBus.location && mapInstanceRef.current) {
                        mapInstanceRef.current.flyTo(
                          [selectedBus.location.lat, selectedBus.location.lng],
                          17,
                          { duration: 1.2 }
                        );
                      }
                    }}
                  >
                    <MdMyLocation size={14} />
                    Track on Map
                  </button>
                  <button
                    className="lf-action-btn secondary"
                    onClick={() => setHistoryBus(selectedBus)}
                  >
                    <RiHistoryLine size={14} />
                    View History
                  </button>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* ── History modal ── */}
      {historyBus && (
        <HistoryModal bus={historyBus} onClose={() => setHistoryBus(null)} />
      )}
    </Layout>
  );
}