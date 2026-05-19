import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";

import {
  FaUserGraduate,
  FaBus,
  FaRoute,
  FaMapMarkerAlt,
  FaClock,
  FaEnvelope,
  FaIdCard,
  FaChair,
  FaSignOutAlt,
  FaPhone,
} from "react-icons/fa";
import {
  MdDashboard,
  MdGpsFixed,
  MdGpsOff,
  MdNavigateNext,
} from "react-icons/md";
import {
  IoCheckmarkCircle,
  IoCloseCircle,
  IoWifiOutline,
  IoClose,
} from "react-icons/io5";
import { HiChevronDown, HiChevronUp } from "react-icons/hi";
import { RiSteering2Fill, RiMapPinTimeLine } from "react-icons/ri";
import { TbCurrentLocation } from "react-icons/tb";
import { BiSolidBus } from "react-icons/bi";
import { PiStudentBold } from "react-icons/pi";

import "../styles/student-dashboard.css";

// ── Leaflet icon fix ──
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

const busIcon = L.divIcon({
  className: "",
  html: `<div class="sd-bus-marker">🚌</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});
const stopIcon = L.divIcon({
  className: "",
  html: `<div class="sd-stop-marker"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});
const myStopIcon = L.divIcon({
  className: "",
  html: `<div class="sd-mystop-marker">📍</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

function MapPanner({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.panTo(position, { animate: true, duration: 0.8 });
  }, [position, map]);
  return null;
}

const SERVER = "http://localhost:5000";
let notifId = 0;

function StudentDashboard() {
  const [data, setData] = useState(null);
  const [busLocation, setBusLocation] = useState(null);
  const [eta, setEta] = useState(null);
  const [tripActive, setTripActive] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  // FIX 2: socketOnline is now properly updated via connect/disconnect listeners
  const [socketOnline, setSocketOnline] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [mapFollow, setMapFollow] = useState(true);
  const [locationAge, setLocationAge] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const locationTimer = useRef(null);

  // ── Create socket ONCE synchronously so it's never null ──
  const socket = useRef(
    io(SERVER, {
      transports: ["polling", "websocket"],
      withCredentials: false,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      timeout: 20000,
    })
  );

  // ── Toast helper ──
  const pushNotif = (msg, type = "info") => {
    const n = { id: ++notifId, msg, type };
    setNotifs((p) => [n, ...p].slice(0, 5));
    setTimeout(() => setNotifs((p) => p.filter((x) => x.id !== n.id)), 5000);
  };

  // ── Fetch dashboard data ──
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${SERVER}/api/student/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) {
        console.error("Fetch error:", err.message);
      }
    };
    fetchData();
  }, [token]);

  // ── FIX 2: Wire up socketOnline state via connect/disconnect events ──
  useEffect(() => {
    const s = socket.current;

    const onConnect = () => {
      console.log("✅ Socket connected");
      setSocketOnline(true);
    };
    const onDisconnect = () => {
      console.log("🔌 Socket disconnected");
      setSocketOnline(false);
    };

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);

    // If socket is already connected when this effect runs
    if (s.connected) setSocketOnline(true);

    return () => {
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
    };
  }, []);

  // ── Socket: join bus room + listen for live events ──
  useEffect(() => {
    const s = socket.current;
    const busId = data?.bus?._id;
    if (!busId) return;

    const roomName = String(busId);

    const joinRoom = () => {
      console.log("📡 Joining room:", roomName);
      s.emit("joinBusRoom", roomName);
    };

    // Join immediately (socket may already be connected)
    if (s.connected) joinRoom();

    // Rejoin after every reconnect
    s.on("connect", joinRoom);

    // ── LIVE LOCATION ──
    const onLiveLocation = (loc) => {
      console.log("📍 LIVE LOCATION received:", loc);
      if (!loc || String(loc.busId) !== roomName) return;

      const lat = Number(loc.lat);
      const lng = Number(loc.lng);
      if (isNaN(lat) || isNaN(lng)) return;

      setBusLocation([lat, lng]);
      setLocationAge(Date.now());

      clearTimeout(locationTimer.current);
      locationTimer.current = setTimeout(() => {
        setLocationAge(null);
      }, 30000);
    };

    const onTripStarted = () => {
      console.log("🚌 tripStarted received");
      setTripActive(true);
      pushNotif("🚌 Bus trip started", "success");
    };

    const onTripEnded = () => {
      console.log("🛑 tripEnded received");
      setTripActive(false);
      setBusLocation(null);
      setEta(null);
      setLocationAge(null);
      pushNotif("🛑 Trip ended", "warning");
    };

    s.on("liveLocation", onLiveLocation);
    s.on("tripStarted", onTripStarted);
    s.on("tripEnded", onTripEnded);

    return () => {
      s.off("connect", joinRoom);
      s.off("liveLocation", onLiveLocation);
      s.off("tripStarted", onTripStarted);
      s.off("tripEnded", onTripEnded);
    };
  }, [data]);

  // ── FIX 3: Check if a trip is already active when student opens dashboard ──
  useEffect(() => {
    if (!data?.bus?._id) return;

    const checkActiveTrip = async () => {
      try {
        const res = await axios.get(`${SERVER}/api/student/active-trip`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("🔍 Active trip check:", res.data);
        if (res.data.active) {
          setTripActive(true);
          if (res.data.location?.lat && res.data.location?.lng) {
            setBusLocation([
              Number(res.data.location.lat),
              Number(res.data.location.lng),
            ]);
            setLocationAge(Date.now());
          }
          pushNotif("🚌 A trip is already in progress", "info");
        }
      } catch (err) {
        console.error("Active trip check failed:", err.message);
      }
    };

    checkActiveTrip();
  }, [data, token]);

  // ── Disconnect on unmount ──
  useEffect(() => {
    return () => {
      clearTimeout(locationTimer.current);
      socket.current.disconnect();
    };
  }, []);

  // ── FIX 4: ETA calculation with normalized stop name comparison ──
  useEffect(() => {
    if (!busLocation || !data?.route?.stops) return;
    const stop = data.route.stops.find(
      (s) =>
        s.name?.trim().toLowerCase() ===
          data?.stopName?.trim().toLowerCase() && s.lat
    );
    if (!stop) return;
    const dist = getDistance(
      busLocation[0],
      busLocation[1],
      Number(stop.lat),
      Number(stop.lng)
    );
    setEta(Math.max(1, Math.round((dist / 30) * 60)));
  }, [busLocation, data]);

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // ── Close profile on outside click ──
  useEffect(() => {
    const h = (e) => {
      if (!e.target.closest(".sd-profile-wrap")) setOpenProfile(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  // ── Loading ──
  if (!data)
    return (
      <div className="sd-loading">
        <div className="sd-spinner" />
        <span>Loading your dashboard…</span>
      </div>
    );

  const { student, bus, driver, route } = data;
  const routeCoords =
    route?.stops
      ?.filter((s) => s.lat && s.lng)
      .map((s) => [Number(s.lat), Number(s.lng)]) || [];
  const myStop = route?.stops?.find(
    (s) =>
      s.name?.trim().toLowerCase() === data?.stopName?.trim().toLowerCase() &&
      s.lat &&
      s.lng
  );
  const locationFresh = locationAge && Date.now() - locationAge < 30_000;

  const navItems = [
    { id: "overview", icon: <MdDashboard />, label: "Overview" },
    { id: "tracking", icon: <TbCurrentLocation />, label: "Track Bus" },
    { id: "route", icon: <FaRoute />, label: "Route" },
    { id: "profile", icon: <FaUserGraduate />, label: "Profile" },
  ];

  return (
    <div className="sd-root">
      {/* Toasts */}
      <div className="sd-notif-stack">
        {notifs.map((n) => (
          <div key={n.id} className={`sd-notif ${n.type}`}>
            <span>{n.msg}</span>
            <button
              onClick={() =>
                setNotifs((p) => p.filter((x) => x.id !== n.id))
              }
            >
              <IoClose />
            </button>
          </div>
        ))}
      </div>

      {/* Navbar */}
      <header className="sd-navbar">
        <div className="sd-navbar-brand">
          <PiStudentBold className="sd-brand-icon" />
          <span>Student Panel</span>
        </div>

        <div className="sd-navbar-right">
          <div className={`sd-socket-badge ${socketOnline ? "on" : "off"}`}>
            <IoWifiOutline />
            <span>{socketOnline ? "Live" : "Offline"}</span>
          </div>

          {eta && tripActive && (
            <div className="sd-eta-pill">
              <RiMapPinTimeLine />
              <span>{eta} min</span>
            </div>
          )}

          <div className="sd-profile-wrap">
            <button
              className="sd-profile-btn"
              onClick={() => setOpenProfile((p) => !p)}
            >
              <div className="sd-avatar">
                {student?.name?.[0]?.toUpperCase() || "S"}
              </div>
              <span className="sd-profile-name">
                {student?.name?.split(" ")[0]}
              </span>
              {openProfile ? <HiChevronUp /> : <HiChevronDown />}
            </button>

            {openProfile && (
              <div className="sd-dropdown">
                <div className="sd-dropdown-head">
                  <div className="sd-dropdown-avatar">
                    {student?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="sd-dropdown-name">{student?.name}</div>
                    <div className="sd-dropdown-role">
                      {data?.branch} · {student?.enrollmentNumber}
                    </div>
                  </div>
                </div>
                <div className="sd-dropdown-info">
                  <span>
                    <FaEnvelope /> {student?.email}
                  </span>
                  <span>
                    <FaIdCard /> {student?.enrollmentNumber}
                  </span>
                  <span>
                    <FaMapMarkerAlt /> Stop: {data?.stopName}
                  </span>
                </div>
                <button className="sd-logout-btn" onClick={logout}>
                  <FaSignOutAlt /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Trip Banner */}
      {tripActive && (
        <div className="sd-trip-banner">
          <div className="sd-trip-pulse" />
          <span>Your bus is on the way</span>
          {eta && <span className="sd-banner-eta">· ETA {eta} min</span>}
        </div>
      )}

      {/* Layout */}
      <div className="sd-layout">
        <nav className="sd-sidebar">
          {navItems.map((n) => (
            <button
              key={n.id}
              className={`sd-nav-btn ${activeTab === n.id ? "active" : ""}`}
              onClick={() => setActiveTab(n.id)}
            >
              {n.icon}
              <span>{n.label}</span>
            </button>
          ))}
        </nav>

        <main className="sd-main">
          {/* Overview */}
          {activeTab === "overview" && (
            <div className="sd-section">
              <h2 className="sd-section-title">
                Welcome, {student?.name?.split(" ")[0]} 👋
              </h2>

              <div className="sd-stat-grid">
                <div className="sd-stat accent">
                  <div className="sd-stat-icon">
                    <BiSolidBus />
                  </div>
                  <div>
                    <div className="sd-stat-val">{bus?.busNumber || "—"}</div>
                    <div className="sd-stat-lbl">My Bus</div>
                  </div>
                </div>
                <div className="sd-stat green">
                  <div className="sd-stat-icon">
                    <FaChair />
                  </div>
                  <div>
                    <div className="sd-stat-val">{data?.seatNumber || "—"}</div>
                    <div className="sd-stat-lbl">My Seat</div>
                  </div>
                </div>
                <div className="sd-stat purple">
                  <div className="sd-stat-icon">
                    <FaRoute />
                  </div>
                  <div>
                    <div className="sd-stat-val">
                      {route?.routeNumber || "—"}
                    </div>
                    <div className="sd-stat-lbl">Route No.</div>
                  </div>
                </div>
                <div className="sd-stat orange">
                  <div className="sd-stat-icon">
                    <FaMapMarkerAlt />
                  </div>
                  <div>
                    <div className="sd-stat-val">{data?.stopName || "—"}</div>
                    <div className="sd-stat-lbl">My Stop</div>
                  </div>
                </div>
              </div>

              <div className="sd-card">
                <div className="sd-card-head">
                  <IoCheckmarkCircle /> Transport Status
                </div>
                <div className="sd-status-body">
                  <div
                    className={`sd-status-badge ${data?.assigned ? "yes" : "no"}`}
                  >
                    {data?.assigned ? (
                      <>
                        <IoCheckmarkCircle /> Assigned & Active
                      </>
                    ) : (
                      <>
                        <IoCloseCircle /> Not Assigned
                      </>
                    )}
                  </div>
                  <div className="sd-status-row">
                    <span>
                      <b>Bus:</b> {bus?.busNumber || "—"}
                    </span>
                    <span>
                      <b>Seat:</b> {data?.seatNumber || "—"}
                    </span>
                    <span>
                      <b>Stop:</b> {data?.stopName || "—"}
                    </span>
                    <span>
                      <b>Trip:</b>{" "}
                      {tripActive ? "In Progress 🟢" : "Not Started"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="sd-card">
                <div className="sd-card-head">
                  <RiSteering2Fill /> My Driver
                </div>
                {driver ? (
                  <div className="sd-driver-row">
                    <div className="sd-driver-avatar">
                      {driver?.name?.charAt(0)?.toUpperCase() || "D"}
                    </div>
                    <div className="sd-driver-info">
                      <div className="sd-driver-name">
                        {driver?.name || "Driver"}
                      </div>
                      <div className="sd-driver-phone">
                        <FaPhone />{" "}
                        {driver?.phone || driver?.contact || "N/A"}
                      </div>
                    </div>
                    <div className="sd-driver-tag">Driver</div>
                  </div>
                ) : (
                  <div className="sd-empty-inline">No driver assigned yet</div>
                )}
              </div>
            </div>
          )}

          {/* Tracking */}
          {activeTab === "tracking" && (
            <div className="sd-section">
              <h2 className="sd-section-title">
                <TbCurrentLocation /> Live Tracking
              </h2>

              <div className={`sd-eta-card ${busLocation ? "active" : ""}`}>
                <div className="sd-eta-icon">
                  {busLocation ? <MdGpsFixed /> : <MdGpsOff />}
                </div>
                <div className="sd-eta-body">
                  {busLocation ? (
                    <>
                      <div className="sd-eta-val">{eta ?? "…"} min</div>
                      <div className="sd-eta-lbl">
                        Estimated arrival at your stop
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="sd-eta-val">—</div>
                      <div className="sd-eta-lbl">
                        {tripActive
                          ? "Bus location updating…"
                          : "Waiting for bus to start…"}
                      </div>
                    </>
                  )}
                </div>
                {locationFresh && (
                  <div className="sd-location-fresh">
                    <span className="sd-fresh-dot" /> Live
                  </div>
                )}
              </div>

              <div className="sd-map-toolbar">
                <button
                  className={`sd-follow-btn ${mapFollow ? "on" : ""}`}
                  onClick={() => setMapFollow((p) => !p)}
                >
                  <TbCurrentLocation />{" "}
                  {mapFollow ? "Following Bus" : "Follow Bus"}
                </button>
              </div>

              <div className="sd-map-wrap">
                <MapContainer
                  center={
                    busLocation || routeCoords[0] || [28.6139, 77.209]
                  }
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                  zoomControl={false}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="© OpenStreetMap"
                  />
                  {mapFollow && busLocation && (
                    <MapPanner position={busLocation} />
                  )}
                  {routeCoords.length > 0 && (
                    <Polyline
                      positions={routeCoords}
                      pathOptions={{
                        color: "#3b82f6",
                        weight: 4,
                        opacity: 0.7,
                      }}
                    />
                  )}
                  {route?.stops
                    ?.filter((s) => s.lat && s.lng)
                    .map((s, i) => (
                      <Marker
                        key={i}
                        position={[Number(s.lat), Number(s.lng)]}
                        icon={stopIcon}
                      >
                        <Popup>{s.name}</Popup>
                      </Marker>
                    ))}
                  {myStop && (
                    <Marker
                      position={[Number(myStop.lat), Number(myStop.lng)]}
                      icon={myStopIcon}
                    >
                      <Popup>📍 Your Stop: {myStop.name}</Popup>
                    </Marker>
                  )}
                  {busLocation && (
                    <Marker position={busLocation} icon={busIcon}>
                      <Popup>🚌 Your Bus — {bus?.busNumber}</Popup>
                    </Marker>
                  )}
                </MapContainer>
              </div>

              {!busLocation && (
                <div className="sd-map-waiting">
                  <MdGpsOff />
                  <span>
                    {tripActive
                      ? "Waiting for bus location…"
                      : "Waiting for driver to start the trip…"}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Route */}
          {activeTab === "route" && (
            <div className="sd-section">
              <h2 className="sd-section-title">
                <FaRoute /> Route Info
              </h2>
              {route ? (
                <>
                  <div className="sd-card">
                    <div className="sd-card-head">Route Details</div>
                    <div className="sd-route-hero">
                      <div className="sd-route-num">{route.routeNumber}</div>
                      <div className="sd-route-name">{route.routeName}</div>
                      <div className="sd-route-path">
                        <span className="sd-endpoint start">
                          {route.startPoint}
                        </span>
                        <div className="sd-route-dashes" />
                        <MdNavigateNext className="sd-route-arrow" />
                        <span className="sd-endpoint end">
                          {route.endPoint}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="sd-card">
                    <div className="sd-card-head">
                      <FaMapMarkerAlt /> Stops
                    </div>
                    <div className="sd-stops-list">
                      {route.stops?.map((s, i) => (
                        <div
                          key={i}
                          className={`sd-stop-item ${
                            s.name?.trim().toLowerCase() ===
                            data?.stopName?.trim().toLowerCase()
                              ? "mine"
                              : ""
                          }`}
                        >
                          <div className="sd-stop-num">{i + 1}</div>
                          <span className="sd-stop-name">{s.name}</span>
                          {s.name?.trim().toLowerCase() ===
                            data?.stopName?.trim().toLowerCase() && (
                            <span className="sd-my-stop-tag">Your Stop</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="sd-card">
                    <div className="sd-card-head">
                      <FaClock /> Scheduled Timings
                    </div>
                    <div className="sd-timings-grid">
                      {route.timings?.map((t, i) => (
                        <div className="sd-timing-chip" key={i}>
                          <FaClock /> {t}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="sd-empty-state">
                  <FaRoute />
                  <p>No route assigned yet</p>
                  <span>Contact your administrator</span>
                </div>
              )}
            </div>
          )}

          {/* Profile */}
          {activeTab === "profile" && (
            <div className="sd-section">
              <h2 className="sd-section-title">
                <FaUserGraduate /> My Profile
              </h2>
              <div className="sd-card">
                <div className="sd-profile-card-head">
                  <div className="sd-profile-avatar-lg">
                    {student?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="sd-profile-fullname">{student?.name}</div>
                    <div className="sd-profile-tag">
                      Student · {data?.branch}
                    </div>
                  </div>
                </div>
                <div className="sd-profile-kv">
                  <div className="sd-kv">
                    <span className="sd-key">
                      <FaEnvelope /> Email
                    </span>
                    <span className="sd-val">{student?.email}</span>
                  </div>
                  <div className="sd-kv">
                    <span className="sd-key">
                      <FaIdCard /> Enrollment
                    </span>
                    <span className="sd-val">{student?.enrollmentNumber}</span>
                  </div>
                  <div className="sd-kv">
                    <span className="sd-key">
                      <FaIdCard /> Branch
                    </span>
                    <span className="sd-val">{data?.branch}</span>
                  </div>
                  <div className="sd-kv">
                    <span className="sd-key">
                      <FaMapMarkerAlt /> My Stop
                    </span>
                    <span className="sd-val">{data?.stopName}</span>
                  </div>
                  <div className="sd-kv">
                    <span className="sd-key">
                      <FaChair /> Seat No.
                    </span>
                    <span className="sd-val">{data?.seatNumber}</span>
                  </div>
                  <div className="sd-kv">
                    <span className="sd-key">
                      <BiSolidBus /> Bus No.
                    </span>
                    <span className="sd-val">{bus?.busNumber || "—"}</span>
                  </div>
                </div>
              </div>
              <button className="sd-logout-card-btn" onClick={logout}>
                <FaSignOutAlt /> Sign Out
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Bottom nav (mobile) */}
      <nav className="sd-bottom-nav">
        {navItems.map((n) => (
          <button
            key={n.id}
            className={`sd-bottom-btn ${activeTab === n.id ? "active" : ""}`}
            onClick={() => setActiveTab(n.id)}
          >
            {n.icon}
            <span>{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default StudentDashboard;