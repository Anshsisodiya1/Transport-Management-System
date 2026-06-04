import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import {
  MapContainer, TileLayer, Marker, Popup, Polyline, useMap,
} from "react-leaflet";
import L from "leaflet";
import {
  FaUserGraduate, FaRoute, FaMapMarkerAlt, FaClock,
  FaEnvelope, FaIdCard, FaChair, FaSignOutAlt, FaPhone,
  FaLock, FaEye, FaEyeSlash, FaKey,
} from "react-icons/fa";
import { MdDashboard, MdGpsFixed, MdGpsOff, MdNavigateNext, MdEmail } from "react-icons/md";
import {
  IoCheckmarkCircle, IoCloseCircle, IoWifiOutline, IoClose,
} from "react-icons/io5";
import { HiChevronDown, HiChevronUp } from "react-icons/hi";
import { RiSteering2Fill, RiMapPinTimeLine, RiShieldUserLine } from "react-icons/ri";
import { TbCurrentLocation } from "react-icons/tb";
import { BiSolidBus } from "react-icons/bi";
import { PiStudentBold } from "react-icons/pi";
import "../styles/student-dashboard.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

const busIcon = L.divIcon({
  className: "",
  html: `<div class="sd-bus-marker">🚌</div>`,
  iconSize: [36, 36], iconAnchor: [18, 18],
});
const stopIcon = L.divIcon({
  className: "",
  html: `<div class="sd-stop-marker"></div>`,
  iconSize: [12, 12], iconAnchor: [6, 6],
});
const myStopIcon = L.divIcon({
  className: "",
  html: `<div class="sd-mystop-marker">📍</div>`,
  iconSize: [28, 28], iconAnchor: [14, 28],
});

function MapPanner({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.panTo(position, { animate: true, duration: 0.8 });
  }, [position, map]);
  return null;
}

const SERVER = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
let notifId = 0;

// ─────────────────────────────────────────────────────────────────────────────
// Password Input Helper
// ─────────────────────────────────────────────────────────────────────────────
function PwdInput({ placeholder, value, onChange }) {
  const [show, setShow] = useState(false);
  return (
    <div className="sd-pwd-wrap">
      <input
        type={show ? "text" : "password"}
        className="sd-settings-input"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      <button type="button" className="sd-pwd-eye" onClick={() => setShow(p => !p)}>
        {show ? <FaEyeSlash /> : <FaEye />}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Profile Settings Component
// ─────────────────────────────────────────────────────────────────────────────
function ProfileSettings({ token, serverUrl, onEmailUpdate }) {
  const [settingsTab, setSettingsTab] = useState("change-password");

  const [oldPwd,     setOldPwd]     = useState("");
  const [newPwd,     setNewPwd]     = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMsg,     setPwdMsg]     = useState(null);

  const [newEmail,     setNewEmail]     = useState("");
  const [emailPwd,     setEmailPwd]     = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMsg,     setEmailMsg]     = useState(null);

  const [fpEmail,   setFpEmail]   = useState("");
  const [fpOtp,     setFpOtp]     = useState("");
  const [fpNewPwd,  setFpNewPwd]  = useState("");
  const [fpConfirm, setFpConfirm] = useState("");
  const [fpStep,    setFpStep]    = useState(1);
  const [fpLoading, setFpLoading] = useState(false);
  const [fpMsg,     setFpMsg]     = useState(null);

  const showMsg = (setter, text, type = "success") => {
    setter({ text, type });
    setTimeout(() => setter(null), 4000);
  };

  const handleChangePassword = async () => {
    if (!oldPwd || !newPwd || !confirmPwd)
      return showMsg(setPwdMsg, "All fields are required", "error");
    if (newPwd !== confirmPwd)
      return showMsg(setPwdMsg, "New passwords do not match", "error");
    if (newPwd.length < 6)
      return showMsg(setPwdMsg, "Password must be at least 6 characters", "error");
    setPwdLoading(true);
    try {
      await axios.post(
        `${serverUrl}/api/auth/change-password`,
        { oldPassword: oldPwd, newPassword: newPwd, confirmPassword: confirmPwd },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showMsg(setPwdMsg, "Password changed successfully! ✓");
      setOldPwd(""); setNewPwd(""); setConfirmPwd("");
    } catch (err) {
      showMsg(setPwdMsg, err.response?.data?.message || "Failed to change password", "error");
    } finally {
      setPwdLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!newEmail || !emailPwd)
      return showMsg(setEmailMsg, "All fields are required", "error");
    setEmailLoading(true);
    try {
      const res = await axios.post(
        `${serverUrl}/api/auth/update-email`,
        { newEmail, password: emailPwd },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showMsg(setEmailMsg, "Email updated successfully! ✓");
      setNewEmail(""); setEmailPwd("");
      if (onEmailUpdate) onEmailUpdate(res.data.email);
    } catch (err) {
      showMsg(setEmailMsg, err.response?.data?.message || "Failed to update email", "error");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!fpEmail) return showMsg(setFpMsg, "Enter your email", "error");
    setFpLoading(true);
    try {
      await axios.post(`${serverUrl}/api/auth/forgot-password`, { email: fpEmail });
      showMsg(setFpMsg, "OTP sent to your email ✓");
      setFpStep(2);
    } catch (err) {
      showMsg(setFpMsg, err.response?.data?.message || "Failed to send OTP", "error");
    } finally {
      setFpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!fpOtp) return showMsg(setFpMsg, "Enter the OTP", "error");
    setFpLoading(true);
    try {
      await axios.post(`${serverUrl}/api/auth/verify-otp`, { email: fpEmail, otp: fpOtp });
      showMsg(setFpMsg, "OTP verified ✓");
      setFpStep(3);
    } catch (err) {
      showMsg(setFpMsg, err.response?.data?.message || "Invalid OTP", "error");
    } finally {
      setFpLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!fpNewPwd || !fpConfirm)
      return showMsg(setFpMsg, "All fields are required", "error");
    if (fpNewPwd !== fpConfirm)
      return showMsg(setFpMsg, "Passwords do not match", "error");
    if (fpNewPwd.length < 6)
      return showMsg(setFpMsg, "Password must be at least 6 characters", "error");
    setFpLoading(true);
    try {
      await axios.post(`${serverUrl}/api/auth/reset-password`, {
        email: fpEmail, otp: fpOtp,
        newPassword: fpNewPwd, confirmPassword: fpConfirm,
      });
      showMsg(setFpMsg, "Password reset successfully! ✓");
      setFpStep(1); setFpEmail(""); setFpOtp(""); setFpNewPwd(""); setFpConfirm("");
      setTimeout(() => setSettingsTab("change-password"), 1500);
    } catch (err) {
      showMsg(setFpMsg, err.response?.data?.message || "Failed to reset password", "error");
    } finally {
      setFpLoading(false);
    }
  };

  const settingsTabs = [
    { id: "change-password", label: "Change Password", icon: <FaLock />  },
    { id: "update-email",    label: "Update Email",    icon: <MdEmail /> },
    { id: "forgot-password", label: "Forgot Password", icon: <FaKey />   },
  ];

  return (
    <div className="sd-settings-wrap">
      <div className="sd-settings-tabs">
        {settingsTabs.map(t => (
          <button
            key={t.id}
            className={`sd-settings-tab ${settingsTab === t.id ? "active" : ""}`}
            onClick={() => { setSettingsTab(t.id); setPwdMsg(null); setEmailMsg(null); setFpMsg(null); }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {settingsTab === "change-password" && (
        <div className="sd-settings-card">
          <h3 className="sd-settings-title"><FaLock /> Change Password</h3>
          <p className="sd-settings-desc">Enter your current password, then set a new one.</p>
          {pwdMsg && <div className={`sd-settings-msg ${pwdMsg.type}`}>{pwdMsg.text}</div>}
          <label className="sd-settings-label">Current Password</label>
          <PwdInput placeholder="Enter current password" value={oldPwd} onChange={e => setOldPwd(e.target.value)} />
          <label className="sd-settings-label">New Password</label>
          <PwdInput placeholder="Min. 6 characters" value={newPwd} onChange={e => setNewPwd(e.target.value)} />
          <label className="sd-settings-label">Confirm New Password</label>
          <PwdInput placeholder="Repeat new password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} />
          <button className="sd-settings-btn" onClick={handleChangePassword} disabled={pwdLoading}>
            {pwdLoading ? <span className="sd-btn-spinner" /> : <FaLock />}
            {pwdLoading ? "Updating…" : "Update Password"}
          </button>
        </div>
      )}

      {settingsTab === "update-email" && (
        <div className="sd-settings-card">
          <h3 className="sd-settings-title"><MdEmail /> Update Email</h3>
          <p className="sd-settings-desc">Enter your new email and confirm with your current password.</p>
          {emailMsg && <div className={`sd-settings-msg ${emailMsg.type}`}>{emailMsg.text}</div>}
          <label className="sd-settings-label">New Email Address</label>
          <input
            type="email"
            className="sd-settings-input"
            placeholder="newemail@example.com"
            value={newEmail}
            onChange={e => setNewEmail(e.target.value)}
          />
          <label className="sd-settings-label">Current Password</label>
          <PwdInput placeholder="Confirm with your password" value={emailPwd} onChange={e => setEmailPwd(e.target.value)} />
          <button className="sd-settings-btn" onClick={handleUpdateEmail} disabled={emailLoading}>
            {emailLoading ? <span className="sd-btn-spinner" /> : <MdEmail />}
            {emailLoading ? "Updating…" : "Update Email"}
          </button>
        </div>
      )}

      {settingsTab === "forgot-password" && (
        <div className="sd-settings-card">
          <h3 className="sd-settings-title"><FaKey /> Forgot Password</h3>
          <div className="sd-fp-steps">
            {["Email", "OTP", "New Password"].map((s, i) => (
              <div key={i} className={`sd-fp-step ${fpStep > i ? "done" : ""} ${fpStep === i + 1 ? "active" : ""}`}>
                <div className="sd-fp-step-dot">{fpStep > i + 1 ? "✓" : i + 1}</div>
                <span>{s}</span>
              </div>
            ))}
          </div>
          {fpMsg && <div className={`sd-settings-msg ${fpMsg.type}`}>{fpMsg.text}</div>}

          {fpStep === 1 && (
            <>
              <p className="sd-settings-desc">Enter your registered email to receive an OTP.</p>
              <label className="sd-settings-label">Email Address</label>
              <input type="email" className="sd-settings-input" placeholder="your@email.com" value={fpEmail} onChange={e => setFpEmail(e.target.value)} />
              <button className="sd-settings-btn" onClick={handleSendOtp} disabled={fpLoading}>
                {fpLoading ? <span className="sd-btn-spinner" /> : <FaEnvelope />}
                {fpLoading ? "Sending OTP…" : "Send OTP"}
              </button>
            </>
          )}

          {fpStep === 2 && (
            <>
              <p className="sd-settings-desc">Enter the 6-digit OTP sent to <b>{fpEmail}</b></p>
              <label className="sd-settings-label">OTP</label>
              <input
                type="text"
                className="sd-settings-input sd-otp-input"
                placeholder="• • • • • •"
                maxLength={6}
                value={fpOtp}
                onChange={e => setFpOtp(e.target.value.replace(/\D/g, ""))}
              />
              <button className="sd-settings-btn" onClick={handleVerifyOtp} disabled={fpLoading}>
                {fpLoading ? <span className="sd-btn-spinner" /> : <IoCheckmarkCircle />}
                {fpLoading ? "Verifying…" : "Verify OTP"}
              </button>
              <button className="sd-settings-link" onClick={() => { setFpStep(1); setFpOtp(""); }}>← Change email</button>
              <button className="sd-settings-link" onClick={handleSendOtp} disabled={fpLoading}>Resend OTP</button>
            </>
          )}

          {fpStep === 3 && (
            <>
              <p className="sd-settings-desc">Set your new password.</p>
              <label className="sd-settings-label">New Password</label>
              <PwdInput placeholder="Min. 6 characters" value={fpNewPwd} onChange={e => setFpNewPwd(e.target.value)} />
              <label className="sd-settings-label">Confirm Password</label>
              <PwdInput placeholder="Repeat new password" value={fpConfirm} onChange={e => setFpConfirm(e.target.value)} />
              <button className="sd-settings-btn" onClick={handleResetPassword} disabled={fpLoading}>
                {fpLoading ? <span className="sd-btn-spinner" /> : <FaLock />}
                {fpLoading ? "Resetting…" : "Reset Password"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main StudentDashboard
// ─────────────────────────────────────────────────────────────────────────────
function StudentDashboard() {
  const [data,        setData]        = useState(null);
  const [busLocation, setBusLocation] = useState(null);
  const [eta,         setEta]         = useState(null);
  const [tripActive,  setTripActive]  = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [activeTab,   setActiveTab]   = useState("overview");
  const [socketOnline,setSocketOnline]= useState(false);
  const [notifs,      setNotifs]      = useState([]);
  const [mapFollow,   setMapFollow]   = useState(true);
  const [locationAge, setLocationAge] = useState(null);
  const [profileSub,  setProfileSub]  = useState("info");

  const navigate      = useNavigate();
  const token         = localStorage.getItem("studentToken");
  const locationTimer = useRef(null);
  const socketRef     = useRef(null);

  const pushNotif = useCallback((msg, type = "info") => {
    const n = { id: ++notifId, msg, type };
    setNotifs((p) => [n, ...p].slice(0, 5));
    setTimeout(() => setNotifs((p) => p.filter((x) => x.id !== n.id)), 5000);
  }, []);

  useEffect(() => {
    const s = io(SERVER, {
      transports: ["polling", "websocket"],
      withCredentials: false,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      timeout: 20000,
    });
    socketRef.current = s;
    s.on("connect",    () => setSocketOnline(true));
    s.on("disconnect", () => setSocketOnline(false));
    if (s.connected) setSocketOnline(true);
    return () => { s.disconnect(); clearTimeout(locationTimer.current); };
  }, []);

  useEffect(() => {
    if (!token) { navigate("/"); return; }
    axios
      .get(`${SERVER}/api/student/dashboard`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error("Dashboard fetch error:", err.message);
        if (err.response?.status === 401) navigate("/");
      });
  }, [token, navigate]);

  useEffect(() => {
    const s     = socketRef.current;
    const busId = data?.bus?._id;
    if (!s || !busId) return;

    const room     = String(busId).trim();
    const joinRoom = () => s.emit("joinBusRoom", room);
    if (s.connected) joinRoom();
    s.on("connect", joinRoom);

    const onLiveLocation = (loc) => {
      if (!loc || String(loc.busId).trim() !== room) return;
      const lat = parseFloat(loc.lat);
      const lng = parseFloat(loc.lng);
      if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) return;
      setBusLocation([lat, lng]);
      setLocationAge(Date.now());
      clearTimeout(locationTimer.current);
      locationTimer.current = setTimeout(() => setLocationAge(null), 30_000);
    };
    const onTripStarted = () => { setTripActive(true);  pushNotif("🚌 Bus trip started!", "success"); };
    const onTripEnded   = () => {
      setTripActive(false); setBusLocation(null); setEta(null); setLocationAge(null);
      pushNotif("🛑 Trip ended", "warning");
    };

    s.on("liveLocation", onLiveLocation);
    s.on("tripStarted",  onTripStarted);
    s.on("tripEnded",    onTripEnded);
    return () => {
      s.off("connect",      joinRoom);
      s.off("liveLocation", onLiveLocation);
      s.off("tripStarted",  onTripStarted);
      s.off("tripEnded",    onTripEnded);
    };
  }, [data, pushNotif]);

  useEffect(() => {
    const busId = data?.bus?._id;
    if (!busId || !token) return;
    axios
      .get(`${SERVER}/api/student/active-trip/${busId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (res.data.active) {
          setTripActive(true);
          const { lat, lng } = res.data.location || {};
          if (lat != null && lng != null) {
            const pLat = parseFloat(lat), pLng = parseFloat(lng);
            if (!isNaN(pLat) && !isNaN(pLng) && !(pLat === 0 && pLng === 0)) {
              setBusLocation([pLat, pLng]);
              setLocationAge(Date.now());
            }
          }
          pushNotif("🚌 Trip already in progress", "info");
        }
      })
      .catch((err) => console.error("Active trip check failed:", err.message));
  }, [data, token, pushNotif]);

  useEffect(() => {
    if (!busLocation || !data?.route?.stops) return;
    const stop = data.route.stops.find(
      (s) => s.name?.trim().toLowerCase() === data?.stopName?.trim().toLowerCase() && s.lat && s.lng
    );
    if (!stop) return;
    const dist = getDistance(busLocation[0], busLocation[1], parseFloat(stop.lat), parseFloat(stop.lng));
    setEta(Math.max(1, Math.round((dist / 30) * 60)));
  }, [busLocation, data]);

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371, dLat = (lat2 - lat1) * (Math.PI / 180), dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  useEffect(() => {
    const h = (e) => { if (!e.target.closest(".sd-profile-wrap")) setOpenProfile(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const logout = () => { localStorage.clear(); navigate("/"); };

  if (!data)
    return (
      <div className="sd-loading">
        <div className="sd-spinner" />
        <span>Loading your dashboard…</span>
      </div>
    );

  const { student, bus, driver, route } = data;
  const routeCoords  = route?.stops?.filter((s) => s.lat && s.lng).map((s) => [parseFloat(s.lat), parseFloat(s.lng)]) || [];
  const myStop       = route?.stops?.find((s) => s.name?.trim().toLowerCase() === data?.stopName?.trim().toLowerCase() && s.lat && s.lng);
  const locationFresh = locationAge && Date.now() - locationAge < 30_000;

  const navItems = [
    { id: "overview", icon: <MdDashboard />,      label: "Overview"  },
    { id: "tracking", icon: <TbCurrentLocation />, label: "Track Bus" },
    { id: "route",    icon: <FaRoute />,           label: "Route"     },
    { id: "contacts", icon: <FaPhone />,           label: "Contacts"  },
    { id: "profile",  icon: <FaUserGraduate />,    label: "Profile"   },
  ];

  return (
    <div className="sd-root">

      {/* ── Toasts ── */}
      <div className="sd-notif-stack">
        {notifs.map((n) => (
          <div key={n.id} className={`sd-notif ${n.type}`}>
            <span>{n.msg}</span>
            <button onClick={() => setNotifs((p) => p.filter((x) => x.id !== n.id))}><IoClose /></button>
          </div>
        ))}
      </div>

      {/* ── Navbar ── */}
      <header className="sd-navbar">
        <div className="sd-navbar-brand">
          <PiStudentBold className="sd-brand-icon" />
          <span>Student Panel</span>
        </div>
        <div className="sd-navbar-right">
          <div className={`sd-socket-badge ${socketOnline ? "on" : "off"}`}>
            <IoWifiOutline /><span>{socketOnline ? "Live" : "Offline"}</span>
          </div>
          {eta && tripActive && (
            <div className="sd-eta-pill"><RiMapPinTimeLine /><span>{eta} min</span></div>
          )}
          <div className="sd-profile-wrap">
            <button className="sd-profile-btn" onClick={() => setOpenProfile((p) => !p)}>
              <div className="sd-avatar">{student?.name?.[0]?.toUpperCase() || "S"}</div>
              <span className="sd-profile-name">{student?.name?.split(" ")[0]}</span>
              {openProfile ? <HiChevronUp /> : <HiChevronDown />}
            </button>
            {openProfile && (
              <div className="sd-dropdown">
                <div className="sd-dropdown-head">
                  <div className="sd-dropdown-avatar">{student?.name?.[0]?.toUpperCase()}</div>
                  <div>
                    <div className="sd-dropdown-name">{student?.name}</div>
                    <div className="sd-dropdown-role">{data?.branch} · {student?.enrollmentNumber}</div>
                  </div>
                </div>
                <div className="sd-dropdown-info">
                  <span><FaEnvelope /> {student?.email}</span>
                  {/* <span><FaIdCard /> {student?.enrollmentNumber}</span>
                  <span><FaMapMarkerAlt /> Stop: {data?.stopName}</span> */}
                </div>
                <button className="sd-logout-btn" onClick={logout}><FaSignOutAlt /> Sign Out</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {tripActive && (
        <div className="sd-trip-banner">
          <div className="sd-trip-pulse" />
          <span>Your bus is on the way</span>
          {eta && <span className="sd-banner-eta">· ETA {eta} min</span>}
        </div>
      )}

      <div className="sd-layout">
        {/* ── Sidebar ── */}
        <nav className="sd-sidebar">
          {navItems.map((n) => (
            <button
              key={n.id}
              className={`sd-nav-btn ${activeTab === n.id ? "active" : ""}`}
              onClick={() => setActiveTab(n.id)}
            >
              {n.icon}<span>{n.label}</span>
            </button>
          ))}
        </nav>

        <main className="sd-main">

          {/* ══════════════════════════════════
              OVERVIEW
          ══════════════════════════════════ */}
          {activeTab === "overview" && (
            <div className="sd-section">
              <h2 className="sd-section-title">Welcome, {student?.name?.split(" ")[0]} 👋</h2>
              <div className="sd-stat-grid">
                <div className="sd-stat accent">
                  <div className="sd-stat-icon"><BiSolidBus /></div>
                  <div><div className="sd-stat-val">{bus?.busNumber || "—"}</div><div className="sd-stat-lbl">My Bus</div></div>
                </div>
                <div className="sd-stat green">
                  <div className="sd-stat-icon"><FaChair /></div>
                  <div><div className="sd-stat-val">{data?.seatNumber || "—"}</div><div className="sd-stat-lbl">My Seat</div></div>
                </div>
                <div className="sd-stat purple">
                  <div className="sd-stat-icon"><FaRoute /></div>
                  <div><div className="sd-stat-val">{route?.routeNumber || "—"}</div><div className="sd-stat-lbl">Route No.</div></div>
                </div>
                <div className="sd-stat orange">
                  <div className="sd-stat-icon"><FaMapMarkerAlt /></div>
                  <div><div className="sd-stat-val">{data?.stopName || "—"}</div><div className="sd-stat-lbl">My Stop</div></div>
                </div>
              </div>

              <div className="sd-card">
                <div className="sd-card-head"><IoCheckmarkCircle /> Transport Status</div>
                <div className="sd-status-body">
                  <div className={`sd-status-badge ${data?.assigned ? "yes" : "no"}`}>
                    {data?.assigned ? <><IoCheckmarkCircle /> Assigned &amp; Active</> : <><IoCloseCircle /> Not Assigned</>}
                  </div>
                  <div className="sd-status-row">
                    <span><b>Bus:</b> {bus?.busNumber || "—"}</span>
                    <span><b>Seat:</b> {data?.seatNumber || "—"}</span>
                    <span><b>Stop:</b> {data?.stopName || "—"}</span>
                    <span><b>Trip:</b> {tripActive ? "In Progress 🟢" : "Not Started"}</span>
                  </div>
                </div>
              </div>

              <div className="sd-card">
                <div className="sd-card-head"><RiSteering2Fill /> My Driver</div>
                {driver ? (
                  <div className="sd-driver-row">
                    <div className="sd-driver-avatar">{driver?.name?.charAt(0)?.toUpperCase() || "D"}</div>
                    <div className="sd-driver-info">
                      <div className="sd-driver-name">{driver?.name || "Driver"}</div>
                      <div className="sd-driver-phone"><FaPhone /> {driver?.phone || "N/A"}</div>
                    </div>
                    <div className="sd-driver-tag">Driver</div>
                  </div>
                ) : <div className="sd-empty-inline">No driver assigned yet</div>}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════
              TRACKING
          ══════════════════════════════════ */}
          {activeTab === "tracking" && (
            <div className="sd-section">
              <h2 className="sd-section-title"><TbCurrentLocation /> Live Tracking</h2>
              <div className={`sd-eta-card ${busLocation ? "active" : ""}`}>
                <div className="sd-eta-icon">{busLocation ? <MdGpsFixed /> : <MdGpsOff />}</div>
                <div className="sd-eta-body">
                  {busLocation ? (
                    <>
                      <div className="sd-eta-val">{eta ?? "…"} min</div>
                      <div className="sd-eta-lbl">Estimated arrival at your stop</div>
                      <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>
                        Bus at: {busLocation[0].toFixed(5)}, {busLocation[1].toFixed(5)}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="sd-eta-val">—</div>
                      <div className="sd-eta-lbl">{tripActive ? "Bus location updating…" : "Waiting for bus to start…"}</div>
                    </>
                  )}
                </div>
                {locationFresh && (
                  <div className="sd-location-fresh"><span className="sd-fresh-dot" /> Live</div>
                )}
              </div>
              <div className="sd-map-toolbar">
                <button className={`sd-follow-btn ${mapFollow ? "on" : ""}`} onClick={() => setMapFollow((p) => !p)}>
                  <TbCurrentLocation /> {mapFollow ? "Following Bus" : "Follow Bus"}
                </button>
              </div>
              <div className="sd-map-wrap">
                <MapContainer
                  center={busLocation || routeCoords[0] || [28.6139, 77.209]}
                  zoom={14}
                  style={{ height: "100%", width: "100%" }}
                  zoomControl={false}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
                  {mapFollow && busLocation && <MapPanner position={busLocation} />}
                  {routeCoords.length > 0 && (
                    <Polyline positions={routeCoords} pathOptions={{ color: "#3b82f6", weight: 4, opacity: 0.7 }} />
                  )}
                  {route?.stops?.filter((s) => s.lat && s.lng).map((s, i) => (
                    <Marker key={i} position={[parseFloat(s.lat), parseFloat(s.lng)]} icon={stopIcon}>
                      <Popup>{s.name}</Popup>
                    </Marker>
                  ))}
                  {myStop && (
                    <Marker position={[parseFloat(myStop.lat), parseFloat(myStop.lng)]} icon={myStopIcon}>
                      <Popup>📍 Your Stop: {myStop.name}</Popup>
                    </Marker>
                  )}
                  {busLocation && (
                    <Marker position={busLocation} icon={busIcon}>
                      <Popup>🚌 {bus?.busNumber}<br />{busLocation[0].toFixed(5)}, {busLocation[1].toFixed(5)}</Popup>
                    </Marker>
                  )}
                </MapContainer>
              </div>
              {!busLocation && (
                <div className="sd-map-waiting">
                  <MdGpsOff />
                  <span>{tripActive ? "Waiting for bus GPS signal…" : "Waiting for driver to start the trip…"}</span>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════
              ROUTE
          ══════════════════════════════════ */}
          {activeTab === "route" && (
            <div className="sd-section">
              <h2 className="sd-section-title"><FaRoute /> Route Info</h2>
              {route ? (
                <>
                  {/* Route hero card */}
                  <div className="sd-card">
                    <div className="sd-card-head"><FaRoute /> Route Details</div>
                    <div className="sd-route-hero">
                      <div className="sd-route-num-badge">
                        <div className="sd-route-num">{route.routeNumber}</div>
                        <div className="sd-route-name">{route.routeName}</div>
                      </div>
                      <div className="sd-route-path">
                        <span className="sd-endpoint start">{route.startPoint}</span>
                        <div className="sd-route-dashes" />
                        <MdNavigateNext className="sd-route-arrow" />
                        <span className="sd-endpoint end">{route.endPoint}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stops timeline card */}
                  <div className="sd-card">
                    <div className="sd-card-head"><FaMapMarkerAlt /> Stops &amp; Timings</div>

                    <div className="sd-tl-header">
                      <span className="sd-tl-header-stop">Stop</span>
                      <span className="sd-tl-header-time">Time</span>
                    </div>

                    <div className="sd-stops-timeline">
                      {route.stops?.map((s, i) => {
                        const isMine  = s.name?.trim().toLowerCase() === data?.stopName?.trim().toLowerCase();
                        const isFirst = i === 0;
                        const isLast  = i === route.stops.length - 1;
                        const timing  = route.timings?.[i];

                        const dotClass = isMine
                          ? "sd-tl-dot mine"
                          : (isFirst || isLast)
                          ? "sd-tl-dot endpoint"
                          : "sd-tl-dot";

                        return (
                          <div key={i} className={`sd-tl-row ${isMine ? "mine" : ""}`}>
                            {/* Stop number */}
                            <div className="sd-tl-num">{i + 1}</div>

                            {/* Dot + connector line */}
                            <div className="sd-tl-track">
                              <div className="sd-tl-dot-wrap">
                                <div className={dotClass} />
                              </div>
                              {!isLast && <div className="sd-tl-line" />}
                            </div>

                            {/* Stop name + your-stop badge */}
                            <div className="sd-tl-body">
                              <span className="sd-tl-name">{s.name}</span>
                              {isMine && <span className="sd-tl-mytag">Your stop</span>}
                            </div>

                            {/* Timing chip */}
                            <div className="sd-tl-timing">
                              {timing ? (
                                <span className="sd-tl-chip">
                                  <FaClock className="sd-tl-chip-icon" />
                                  {timing}
                                </span>
                              ) : (
                                <span className="sd-tl-chip muted">—</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
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

          {/* ══════════════════════════════════
              CONTACTS
          ══════════════════════════════════ */}
          {activeTab === "contacts" && (
            <div className="sd-section">
              <h2 className="sd-section-title"><FaPhone /> Contacts</h2>

              {/* Driver card */}
              <div className="sd-card">
                <div className="sd-card-head"><RiSteering2Fill /> Driver</div>
                {driver ? (
                  <>
                    <div className="sd-contact-wrap">
                      <div className="sd-contact-avatar driver">
                        {driver?.name?.charAt(0)?.toUpperCase() || "D"}
                      </div>
                      <div className="sd-contact-info">
                        <div className="sd-contact-name">{driver?.name || "—"}</div>
                        <div className="sd-contact-role driver">
                          <RiSteering2Fill /> Bus Driver
                        </div>
                        <div className="sd-contact-rows">
                          <div className="sd-contact-row">
                            <FaPhone />
                            <span>{driver?.phone || "Not available"}</span>
                          </div>
                          <div className="sd-contact-row">
                            <FaEnvelope />
                            {driver?.email
                              ? <a href={`mailto:${driver.email}`} className="sd-contact-link">{driver.email}</a>
                              : <span>Not available</span>
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="sd-contact-actions">
                      {driver?.phone && (
                        <a href={`tel:${driver.phone}`} className="sd-cta call">
                          <FaPhone /> Call
                        </a>
                      )}
                      {driver?.email && (
                        <a href={`mailto:${driver.email}`} className="sd-cta mail">
                          <FaEnvelope /> Email
                        </a>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="sd-empty-inline">No driver assigned yet</div>
                )}
              </div>

              {/* Admin card */}
              <div className="sd-card">
                <div className="sd-card-head"><FaIdCard /> Administrator</div>
                {data?.admin ? (
                  <>
                    <div className="sd-contact-wrap">
                      <div className="sd-contact-avatar admin">
                        {data.admin?.name?.charAt(0)?.toUpperCase() || "A"}
                      </div>
                      <div className="sd-contact-info">
                        <div className="sd-contact-name">{data.admin?.name || "—"}</div>
                        <div className="sd-contact-role admin">
                          <RiShieldUserLine /> System Administrator
                        </div>
                        <div className="sd-contact-rows">
                          <div className="sd-contact-row">
                            <FaPhone />
                            {data.admin?.phone
                              ? <a href={`tel:${data.admin.phone}`} className="sd-contact-link">{data.admin.phone}</a>
                              : <span>Not available</span>
                            }
                          </div>
                          <div className="sd-contact-row">
                            <FaEnvelope />
                            {data.admin?.email
                              ? <a href={`mailto:${data.admin.email}`} className="sd-contact-link">{data.admin.email}</a>
                              : <span>Not available</span>
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="sd-contact-actions">
                      {data.admin?.phone && (
                        <a href={`tel:${data.admin.phone}`} className="sd-cta call">
                          <FaPhone /> Call
                        </a>
                      )}
                      {data.admin?.email && (
                        <a href={`mailto:${data.admin.email}`} className="sd-cta mail">
                          <FaEnvelope /> Email
                        </a>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="sd-empty-inline">Admin info not available</div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════
              PROFILE
          ══════════════════════════════════ */}
          {activeTab === "profile" && (
            <div className="sd-section">
              <h2 className="sd-section-title"><FaUserGraduate /> My Profile</h2>

              <div className="sd-profile-toggle">
                <button
                  className={`sd-profile-toggle-btn ${profileSub === "info" ? "active" : ""}`}
                  onClick={() => setProfileSub("info")}
                >
                  <FaIdCard /> Info
                </button>
                <button
                  className={`sd-profile-toggle-btn ${profileSub === "settings" ? "active" : ""}`}
                  onClick={() => setProfileSub("settings")}
                >
                  <FaLock /> Account Settings
                </button>
              </div>

              {profileSub === "info" && (
                <div className="sd-card">
                  <div className="sd-profile-card-head">
                    <div className="sd-profile-avatar-lg">{student?.name?.[0]?.toUpperCase()}</div>
                    <div>
                      <div className="sd-profile-fullname">{student?.name}</div>
                      <div className="sd-profile-tag">Student · {data?.branch}</div>
                    </div>
                  </div>
                  <div className="sd-profile-kv">
                    <div className="sd-kv"><span className="sd-key"><FaEnvelope /> Email</span><span className="sd-val">{student?.email}</span></div>
                    <div className="sd-kv"><span className="sd-key"><FaIdCard /> Enrollment</span><span className="sd-val">{student?.enrollmentNumber}</span></div>
                    <div className="sd-kv"><span className="sd-key"><FaIdCard /> Branch</span><span className="sd-val">{data?.branch}</span></div>
                    <div className="sd-kv"><span className="sd-key"><FaMapMarkerAlt /> My Stop</span><span className="sd-val">{data?.stopName}</span></div>
                    <div className="sd-kv"><span className="sd-key"><FaChair /> Seat No.</span><span className="sd-val">{data?.seatNumber}</span></div>
                    <div className="sd-kv"><span className="sd-key"><BiSolidBus /> Bus No.</span><span className="sd-val">{bus?.busNumber || "—"}</span></div>
                  </div>
                </div>
              )}

              {profileSub === "settings" && (
                <ProfileSettings
                  token={token}
                  serverUrl={SERVER}
                  onEmailUpdate={(newEmail) =>
                    setData(prev => ({ ...prev, student: { ...prev.student, email: newEmail } }))
                  }
                />
              )}

              <button className="sd-logout-card-btn" onClick={logout}><FaSignOutAlt /> Sign Out</button>
            </div>
          )}

        </main>
      </div>

      {/* ── Bottom Nav (mobile) ── */}
      <nav className="sd-bottom-nav">
        {navItems.map((n) => (
          <button
            key={n.id}
            className={`sd-bottom-btn ${activeTab === n.id ? "active" : ""}`}
            onClick={() => setActiveTab(n.id)}
          >
            {n.icon}<span>{n.label}</span>
          </button>
        ))}
      </nav>

    </div>
  );
}

export default StudentDashboard;