import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

// React Icons
import {
  FaBus,
  FaRoute,
  FaUserCircle,
  FaSignOutAlt,
  FaMapMarkerAlt,
  FaClock,
  FaIdCard,
  FaPhone,
  FaEnvelope,
  FaTachometerAlt,
} from "react-icons/fa";
import {
  MdNavigation,
  MdGpsFixed,
  MdGpsOff,
  MdAssignment,
} from "react-icons/md";
import {
  IoCheckmarkCircle,
  IoCloseCircle,
  IoWifiOutline,
} from "react-icons/io5";
import { RiSteering2Fill } from "react-icons/ri";
import { HiChevronDown, HiChevronUp } from "react-icons/hi";
import { BiSolidBadgeCheck } from "react-icons/bi";

import "../styles/driver-dashboard.css";

const SERVER = "http://localhost:5000";

function DriverDashboard() {
  const [data, setData] = useState(null);
  const [openProfile, setOpenProfile] = useState(false);
  const [tripStarted, setTripStarted] = useState(false);
  const [tripDuration, setTripDuration] = useState(0);
  const [coords, setCoords] = useState(null);
  const [gpsStatus, setGpsStatus] = useState("idle"); // idle | active | error
  const [socketConnected, setSocketConnected] = useState(false);
  const [stopsDone, setStopsDone] = useState([]);
  const [activeSection, setActiveSection] = useState("overview");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // FIX: Use refs for socket and watchId so they are always stable
  // (previously socket was in state which caused stale closure issues)
  const socketRef = useRef(null);
  const watchIdRef = useRef(null);
  const timerRef = useRef(null);

  // ── Socket Init (useRef instead of useState to avoid stale closures) ──
  useEffect(() => {
    const s = io(SERVER, {
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
    });
    s.on("connect", () => {
      console.log("✅ Driver socket connected");
      setSocketConnected(true);
    });
    s.on("disconnect", () => {
      console.log("🔌 Driver socket disconnected");
      setSocketConnected(false);
    });
    socketRef.current = s;

    return () => s.disconnect();
  }, []);

  // ── Fetch Driver Data ──
  useEffect(() => {
    const fetchDriver = async () => {
      try {
        const res = await axios.get(`${SERVER}/api/driver/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Driver API Response:", res.data);
        setData(res.data);
      } catch (err) {
        console.error("API Error:", err.message);
      }
    };
    fetchDriver();
  }, [token]);

  // ── Trip Timer ──
  useEffect(() => {
    if (tripStarted) {
      timerRef.current = setInterval(
        () => setTripDuration((d) => d + 1),
        1000
      );
    } else {
      clearInterval(timerRef.current);
      setTripDuration(0);
    }
    return () => clearInterval(timerRef.current);
  }, [tripStarted]);

  // ── Close profile on outside click ──
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest(".dd-profile-wrap")) setOpenProfile(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Cleanup on unmount ──
  useEffect(() => {
    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      clearInterval(timerRef.current);
    };
  }, []);

  const formatDuration = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return [h, m, sec].map((v) => String(v).padStart(2, "0")).join(":");
  };

  const logout = () => {
    // If trip is active, end it before logging out
    if (tripStarted) {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      socketRef.current?.emit("endTrip", { driverId: data?.driver?._id });
    }
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  const handleTripToggle = () => {
    const socket = socketRef.current;

    if (!socket || !socket.connected) {
      alert("Socket not connected. Please wait a moment and try again.");
      return;
    }

    if (!data?.driver?._id || !data?.bus?._id) {
      alert("Driver or bus data not loaded yet. Please wait.");
      return;
    }

    if (!tripStarted) {
      // ── START TRIP ──
      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
      }

      setTripStarted(true);
      setGpsStatus("active");

      // FIX: Emit startTrip so students receive the tripStarted event
      socket.emit("startTrip", {
        driverId: data.driver._id,
        busId: data.bus._id,
      });
      console.log("🟢 startTrip emitted for bus:", data.bus._id);

      // Start watching GPS position
      const id = navigator.geolocation.watchPosition(
        ({ coords: c }) => {
          console.log("📍 Sending location:", c.latitude, c.longitude);

          setCoords({
            lat: c.latitude.toFixed(5),
            lng: c.longitude.toFixed(5),
          });

          socket.emit("sendLocation", {
            driverId: data.driver._id,
            busId: data.bus._id,
            routeId: data.route?._id,
            latitude: c.latitude,
            longitude: c.longitude,
          });
        },
        (err) => {
          console.warn("GPS error:", err.message);
          setGpsStatus("error");
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
      );

      watchIdRef.current = id;

    } else {
      // ── END TRIP ──
      setTripStarted(false);
      setGpsStatus("idle");
      setCoords(null);
      setStopsDone([]);

      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }

      socket.emit("endTrip", {
        driverId: data.driver._id,
      });
      console.log("🛑 endTrip emitted");
    }
  };

  const toggleStop = (stop) => {
    setStopsDone((prev) =>
      prev.includes(stop) ? prev.filter((s) => s !== stop) : [...prev, stop]
    );
  };

  const driver = data?.driver;
  const bus = data?.bus;
  const route = data?.route;
  const stops = route?.stops || [];

  const navItems = [
    { id: "overview", icon: <FaTachometerAlt />, label: "Overview" },
    { id: "route",    icon: <FaRoute />,         label: "Route"    },
    { id: "bus",      icon: <FaBus />,            label: "Bus"      },
    { id: "profile",  icon: <FaUserCircle />,     label: "Profile"  },
  ];

  // ── Loading ──
  if (!data)
    return (
      <div className="dd-loading">
        <div className="dd-spinner" />
        <span>Loading your dashboard…</span>
      </div>
    );

  return (
    <div className="dd-root">
      {/* ── TOP NAVBAR ── */}
      <header className="dd-navbar">
        <div className="dd-navbar-brand">
          <RiSteering2Fill className="dd-brand-icon" />
          <span>Driver Panel</span>
        </div>

        <div className="dd-navbar-right">
          {/* Socket status */}
          <div className={`dd-socket-badge ${socketConnected ? "on" : "off"}`}>
            <IoWifiOutline />
            <span>{socketConnected ? "Live" : "Offline"}</span>
          </div>

          {/* Profile dropdown */}
          <div className="dd-profile-wrap">
            <button
              className="dd-profile-btn"
              onClick={() => setOpenProfile((p) => !p)}
            >
              <div className="dd-avatar">
                {driver?.name?.[0]?.toUpperCase() || "D"}
              </div>
              <span className="dd-profile-name">
                {driver?.name || "Driver"}
              </span>
              {openProfile ? <HiChevronUp /> : <HiChevronDown />}
            </button>

            {openProfile && (
              <div className="dd-dropdown">
                <div className="dd-dropdown-head">
                  <div className="dd-dropdown-avatar">
                    {driver?.name?.[0]?.toUpperCase() || "D"}
                  </div>
                  <div>
                    <div className="dd-dropdown-name">{driver?.name}</div>
                    <div className="dd-dropdown-role">Bus Driver</div>
                  </div>
                </div>
                <div className="dd-dropdown-info">
                  <span><FaEnvelope /> {driver?.email}</span>
                  <span><FaPhone /> {driver?.contact}</span>
                  <span><FaIdCard /> {driver?.license}</span>
                </div>
                <button className="dd-logout-btn" onClick={logout}>
                  <FaSignOutAlt /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── TRIP HERO BANNER ── */}
      <div className={`dd-trip-banner ${tripStarted ? "active" : ""}`}>
        <div className="dd-trip-banner-inner">
          <div className="dd-trip-info">
            <div className={`dd-gps-dot ${gpsStatus}`} />
            <div>
              <div className="dd-trip-status-label">
                {tripStarted ? "Live Trip in Progress" : "Ready to Start"}
              </div>
              {tripStarted && (
                <div className="dd-trip-timer">
                  {formatDuration(tripDuration)}
                </div>
              )}
              {coords && (
                <div className="dd-coords">
                  <MdGpsFixed /> {coords.lat}, {coords.lng}
                </div>
              )}
            </div>
          </div>

          <button
            className={`dd-trip-btn ${tripStarted ? "end" : "start"}`}
            onClick={handleTripToggle}
            disabled={!socketConnected || !data?.assigned}
            title={
              !socketConnected
                ? "Waiting for connection…"
                : !data?.assigned
                ? "No bus/route assigned"
                : ""
            }
          >
            {tripStarted ? (
              <>End Trip</>
            ) : (
              <><MdNavigation /> Start Trip</>
            )}
          </button>
        </div>

        {/* Stop progress bar */}
        {tripStarted && stops.length > 0 && (
          <div className="dd-stop-progress">
            <div
              className="dd-stop-progress-fill"
              style={{ width: `${(stopsDone.length / stops.length) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div className="dd-layout">
        {/* Sidebar nav */}
        <nav className="dd-sidebar">
          {navItems.map((n) => (
            <button
              key={n.id}
              className={`dd-nav-btn ${activeSection === n.id ? "active" : ""}`}
              onClick={() => setActiveSection(n.id)}
            >
              {n.icon}
              <span>{n.label}</span>
            </button>
          ))}
        </nav>

        {/* Content */}
        <main className="dd-main">

          {/* ── OVERVIEW ── */}
          {activeSection === "overview" && (
            <div className="dd-section">
              <h2 className="dd-section-title">
                Welcome back, {driver?.name?.split(" ")[0] || "Driver"} 👋
              </h2>

              <div className="dd-stat-grid">
                <div className="dd-stat-card accent">
                  <div className="dd-stat-icon"><FaBus /></div>
                  <div className="dd-stat-body">
                    <div className="dd-stat-val">{bus?.busNumber || "—"}</div>
                    <div className="dd-stat-lbl">Assigned Bus</div>
                  </div>
                </div>

                <div className="dd-stat-card green">
                  <div className="dd-stat-icon"><MdAssignment /></div>
                  <div className="dd-stat-body">
                    <div className="dd-stat-val">
                      {data?.assigned ? "Active" : "None"}
                    </div>
                    <div className="dd-stat-lbl">Assignment</div>
                  </div>
                </div>

                <div className="dd-stat-card purple">
                  <div className="dd-stat-icon"><FaRoute /></div>
                  <div className="dd-stat-body">
                    <div className="dd-stat-val">{route?.routeNumber || "—"}</div>
                    <div className="dd-stat-lbl">Route No.</div>
                  </div>
                </div>

                <div className="dd-stat-card orange">
                  <div className="dd-stat-icon"><FaMapMarkerAlt /></div>
                  <div className="dd-stat-body">
                    <div className="dd-stat-val">{stops.length}</div>
                    <div className="dd-stat-lbl">Total Stops</div>
                  </div>
                </div>
              </div>

              <div className="dd-card">
                <div className="dd-card-head">
                  <BiSolidBadgeCheck /> Assignment Status
                </div>
                <div className="dd-assign-status">
                  <div className={`dd-assign-badge ${data?.assigned ? "yes" : "no"}`}>
                    {data?.assigned ? (
                      <><IoCheckmarkCircle /> Fully Assigned</>
                    ) : (
                      <><IoCloseCircle /> Not Assigned Yet</>
                    )}
                  </div>
                  <div className="dd-assign-detail">
                    <span><b>Bus:</b> {bus?.busNumber || "—"}</span>
                    <span>
                      <b>Route:</b>{" "}
                      {route ? `${route.routeNumber} – ${route.routeName}` : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── ROUTE ── */}
          {activeSection === "route" && (
            <div className="dd-section">
              <h2 className="dd-section-title">
                <FaRoute /> Route Info
              </h2>

              {route ? (
                <>
                  <div className="dd-card">
                    <div className="dd-card-head">Route Details</div>
                    <div className="dd-route-hero">
                      <div className="dd-route-num">{route.routeNumber}</div>
                      <div className="dd-route-name">{route.routeName}</div>
                      <div className="dd-route-path">
                        <span className="dd-endpoint start">{route.startPoint}</span>
                        <div className="dd-route-line" />
                        <span className="dd-endpoint end">{route.endPoint}</span>
                      </div>
                    </div>
                  </div>

                  <div className="dd-card">
                    <div className="dd-card-head">
                      <FaMapMarkerAlt /> Stops
                      {tripStarted && (
                        <span className="dd-stops-progress-label">
                          {stopsDone.length}/{stops.length} done
                        </span>
                      )}
                    </div>
                    <div className="dd-stops-list">
                      {stops.map((s, i) => (
                        <div
                          key={i}
                          className={`dd-stop-item ${stopsDone.includes(s) ? "done" : ""}`}
                          onClick={() => tripStarted && toggleStop(s)}
                          style={{ cursor: tripStarted ? "pointer" : "default" }}
                        >
                          <div className="dd-stop-dot">
                            {stopsDone.includes(s) ? (
                              <IoCheckmarkCircle />
                            ) : (
                              <span>{i + 1}</span>
                            )}
                          </div>
                          <span className="dd-stop-name">
                            {typeof s === "string" ? s : s.name || s.stopName}
                          </span>
                          {tripStarted && !stopsDone.includes(s) && (
                            <span className="dd-stop-tap">tap to mark</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="dd-card">
                    <div className="dd-card-head">
                      <FaClock /> Timings
                    </div>
                    <div className="dd-timings-grid">
                      {route.timings?.map((t, i) => (
                        <div className="dd-timing-chip" key={i}>
                          <FaClock /> {t}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="dd-empty-state">
                  <FaRoute />
                  <p>No route assigned yet</p>
                  <span>Contact your administrator to get a route assigned</span>
                </div>
              )}
            </div>
          )}

          {/* ── BUS ── */}
          {activeSection === "bus" && (
            <div className="dd-section">
              <h2 className="dd-section-title">
                <FaBus /> Bus Info
              </h2>

              {data?.assigned ? (
                <div className="dd-card">
                  <div className="dd-card-head">Assigned Bus</div>
                  <div className="dd-bus-hero">
                    <div className="dd-bus-icon-wrap"><FaBus /></div>
                    <div className="dd-bus-number">{bus?.busNumber}</div>
                  </div>
                  <div className="dd-bus-details">
                    <div className="dd-kv">
                      <span className="dd-key">Bus Number</span>
                      <span className="dd-val">{bus?.busNumber || "—"}</span>
                    </div>
                    <div className="dd-kv">
                      <span className="dd-key">Route</span>
                      <span className="dd-val">
                        {route
                          ? `${route.routeNumber} · ${route.startPoint} → ${route.endPoint}`
                          : "—"}
                      </span>
                    </div>
                    <div className="dd-kv">
                      <span className="dd-key">GPS Status</span>
                      <span className={`dd-val gps-${gpsStatus}`}>
                        {gpsStatus === "active" ? (
                          <><MdGpsFixed /> Active</>
                        ) : gpsStatus === "error" ? (
                          <><MdGpsOff /> Error</>
                        ) : (
                          "Idle"
                        )}
                      </span>
                    </div>
                    <div className="dd-kv">
                      <span className="dd-key">Trip Status</span>
                      <span className="dd-val">
                        {tripStarted ? "🟢 In Progress" : "⚪ Not Started"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="dd-empty-state">
                  <FaBus />
                  <p>No bus assigned yet</p>
                  <span>Your administrator hasn't assigned a bus to you</span>
                </div>
              )}
            </div>
          )}

          {/* ── PROFILE ── */}
          {activeSection === "profile" && (
            <div className="dd-section">
              <h2 className="dd-section-title">
                <FaUserCircle /> My Profile
              </h2>

              <div className="dd-card">
                <div className="dd-profile-card-head">
                  <div className="dd-profile-avatar-lg">
                    {driver?.name?.[0]?.toUpperCase() || "D"}
                  </div>
                  <div>
                    <div className="dd-profile-fullname">{driver?.name}</div>
                    <div className="dd-profile-tag">Bus Driver</div>
                  </div>
                </div>
                <div className="dd-profile-details">
                  <div className="dd-kv">
                    <span className="dd-key"><FaEnvelope /> Email</span>
                    <span className="dd-val">{driver?.email || "—"}</span>
                  </div>
                  <div className="dd-kv">
                    <span className="dd-key"><FaPhone /> Contact</span>
                    <span className="dd-val">{driver?.contact || "—"}</span>
                  </div>
                  <div className="dd-kv">
                    <span className="dd-key"><FaIdCard /> License No.</span>
                    <span className="dd-val">{driver?.license || "—"}</span>
                  </div>
                  <div className="dd-kv">
                    <span className="dd-key"><FaIdCard /> Aadhar No.</span>
                    <span className="dd-val">{driver?.aadhar || "—"}</span>
                  </div>
                </div>
              </div>

              <button className="dd-logout-card-btn" onClick={logout}>
                <FaSignOutAlt /> Sign Out
              </button>
            </div>
          )}

        </main>
      </div>

      {/* ── BOTTOM NAV (mobile) ── */}
      <nav className="dd-bottom-nav">
        {navItems.map((n) => (
          <button
            key={n.id}
            className={`dd-bottom-btn ${activeSection === n.id ? "active" : ""}`}
            onClick={() => setActiveSection(n.id)}
          >
            {n.icon}
            <span>{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default DriverDashboard;