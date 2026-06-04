import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import {
  FaBus, FaRoute, FaUserCircle, FaSignOutAlt,
  FaMapMarkerAlt, FaClock, FaIdCard, FaPhone, FaEnvelope, FaTachometerAlt,
  FaSort, FaSortUp, FaSortDown, FaUsers, FaSearch,
  FaLock, FaEye, FaEyeSlash, FaKey,
} from "react-icons/fa";
import { MdNavigation, MdGpsFixed, MdGpsOff, MdAssignment, MdEmail } from "react-icons/md";
import { IoCheckmarkCircle, IoCloseCircle, IoWifiOutline } from "react-icons/io5";
import { RiSteering2Fill } from "react-icons/ri";
import { HiChevronDown, HiChevronUp } from "react-icons/hi";
import { BiSolidBadgeCheck } from "react-icons/bi";
import "../styles/driver-dashboard.css";

const SERVER = "http://localhost:5000";

// ── SortIcon ──
function SortIcon({ colKey, sortConfig }) {
  if (sortConfig.key !== colKey)
    return <FaSort style={{ opacity: 0.3, fontSize: 11 }} />;
  return sortConfig.direction === "asc"
    ? <FaSortUp style={{ fontSize: 11, color: "var(--accent, #6366f1)" }} />
    : <FaSortDown style={{ fontSize: 11, color: "var(--accent, #6366f1)" }} />;
}

// ── Password Input ──
function PwdInput({ placeholder, value, onChange, id }) {
  const [show, setShow] = useState(false);
  return (
    <div className="dd-pwd-wrap">
      <input
        id={id}
        type={show ? "text" : "password"}
        className="dd-settings-input"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete="new-password"
      />
      <button type="button" className="dd-pwd-eye" onClick={() => setShow((p) => !p)}>
        {show ? <FaEyeSlash /> : <FaEye />}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ProfileSettings Component
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
    <div className="dd-settings-wrap">
      <div className="dd-settings-tabs">
        {settingsTabs.map((t) => (
          <button
            key={t.id}
            className={`dd-settings-tab ${settingsTab === t.id ? "active" : ""}`}
            onClick={() => {
              setSettingsTab(t.id);
              setPwdMsg(null); setEmailMsg(null); setFpMsg(null);
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {settingsTab === "change-password" && (
        <div className="dd-settings-card">
          <h3 className="dd-settings-title"><FaLock /> Change Password</h3>
          <p className="dd-settings-desc">Enter your current password, then set a new one.</p>
          {pwdMsg && <div className={`dd-settings-msg ${pwdMsg.type}`}>{pwdMsg.text}</div>}
          <label className="dd-settings-label">Current Password</label>
          <PwdInput placeholder="Enter current password" value={oldPwd} onChange={(e) => setOldPwd(e.target.value)} />
          <label className="dd-settings-label">New Password</label>
          <PwdInput placeholder="Min. 6 characters" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
          <label className="dd-settings-label">Confirm New Password</label>
          <PwdInput placeholder="Repeat new password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} />
          <button className="dd-settings-btn" onClick={handleChangePassword} disabled={pwdLoading}>
            {pwdLoading ? <span className="dd-btn-spinner" /> : <FaLock />}
            {pwdLoading ? "Updating…" : "Update Password"}
          </button>
        </div>
      )}

      {settingsTab === "update-email" && (
        <div className="dd-settings-card">
          <h3 className="dd-settings-title"><MdEmail /> Update Email</h3>
          <p className="dd-settings-desc">Enter your new email and confirm with your current password.</p>
          {emailMsg && <div className={`dd-settings-msg ${emailMsg.type}`}>{emailMsg.text}</div>}
          <label className="dd-settings-label">New Email Address</label>
          <input
            type="email"
            className="dd-settings-input"
            placeholder="newemail@example.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          <label className="dd-settings-label">Current Password</label>
          <PwdInput placeholder="Confirm with your password" value={emailPwd} onChange={(e) => setEmailPwd(e.target.value)} />
          <button className="dd-settings-btn" onClick={handleUpdateEmail} disabled={emailLoading}>
            {emailLoading ? <span className="dd-btn-spinner" /> : <MdEmail />}
            {emailLoading ? "Updating…" : "Update Email"}
          </button>
        </div>
      )}

      {settingsTab === "forgot-password" && (
        <div className="dd-settings-card">
          <h3 className="dd-settings-title"><FaKey /> Forgot Password</h3>
          <div className="dd-fp-steps">
            {["Email", "OTP", "New Password"].map((s, i) => (
              <div
                key={i}
                className={`dd-fp-step ${fpStep > i + 1 ? "done" : ""} ${fpStep === i + 1 ? "active" : ""}`}
              >
                <div className="dd-fp-step-dot">{fpStep > i + 1 ? "✓" : i + 1}</div>
                <span>{s}</span>
              </div>
            ))}
          </div>
          {fpMsg && <div className={`dd-settings-msg ${fpMsg.type}`}>{fpMsg.text}</div>}
          {fpStep === 1 && (
            <>
              <p className="dd-settings-desc">Enter your registered email to receive an OTP.</p>
              <label className="dd-settings-label">Email Address</label>
              <input type="email" className="dd-settings-input" placeholder="your@email.com" value={fpEmail} onChange={(e) => setFpEmail(e.target.value)} />
              <button className="dd-settings-btn" onClick={handleSendOtp} disabled={fpLoading}>
                {fpLoading ? <span className="dd-btn-spinner" /> : <FaEnvelope />}
                {fpLoading ? "Sending OTP…" : "Send OTP"}
              </button>
            </>
          )}
          {fpStep === 2 && (
            <>
              <p className="dd-settings-desc">Enter the 6-digit OTP sent to <b>{fpEmail}</b></p>
              <label className="dd-settings-label">OTP</label>
              <input
                type="text"
                className="dd-settings-input dd-otp-input"
                placeholder="• • • • • •"
                maxLength={6}
                value={fpOtp}
                onChange={(e) => setFpOtp(e.target.value.replace(/\D/g, ""))}
              />
              <button className="dd-settings-btn" onClick={handleVerifyOtp} disabled={fpLoading}>
                {fpLoading ? <span className="dd-btn-spinner" /> : <IoCheckmarkCircle />}
                {fpLoading ? "Verifying…" : "Verify OTP"}
              </button>
              <button className="dd-settings-link" onClick={() => { setFpStep(1); setFpOtp(""); }}>← Change email</button>
              <button className="dd-settings-link" onClick={handleSendOtp} disabled={fpLoading}>Resend OTP</button>
            </>
          )}
          {fpStep === 3 && (
            <>
              <p className="dd-settings-desc">Set your new password.</p>
              <label className="dd-settings-label">New Password</label>
              <PwdInput placeholder="Min. 6 characters" value={fpNewPwd} onChange={(e) => setFpNewPwd(e.target.value)} />
              <label className="dd-settings-label">Confirm Password</label>
              <PwdInput placeholder="Repeat new password" value={fpConfirm} onChange={(e) => setFpConfirm(e.target.value)} />
              <button className="dd-settings-btn" onClick={handleResetPassword} disabled={fpLoading}>
                {fpLoading ? <span className="dd-btn-spinner" /> : <FaLock />}
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
// Main DriverDashboard
// ─────────────────────────────────────────────────────────────────────────────
function DriverDashboard() {
  const [data,            setData]            = useState(null);
  const [openProfile,     setOpenProfile]     = useState(false);
  const [tripStarted,     setTripStarted]     = useState(false);
  const [tripDuration,    setTripDuration]    = useState(0);
  const [coords,          setCoords]          = useState(null);
  const [gpsStatus,       setGpsStatus]       = useState("idle");
  const [socketConnected, setSocketConnected] = useState(false);
  const [stopsDone,       setStopsDone]       = useState([]);
  const [activeSection,   setActiveSection]   = useState("overview");
  const [locationCount,   setLocationCount]   = useState(0);
  const [profileSub,      setProfileSub]      = useState("info");

  const [students,        setStudents]        = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError,   setStudentsError]   = useState(null);
  const [rosterQuery,     setRosterQuery]     = useState("");
  const [sortConfig,      setSortConfig]      = useState({ key: "seatNumber", direction: "asc" });

  const navigate = useNavigate();
  const token    = localStorage.getItem("driverToken");

  const socketRef  = useRef(null);
  const watchIdRef = useRef(null);
  const timerRef   = useRef(null);

  useEffect(() => {
    const s = io(SERVER, {
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
    });
    s.on("connect",    () => setSocketConnected(true));
    s.on("disconnect", () => setSocketConnected(false));
    socketRef.current = s;
    return () => s.disconnect();
  }, []);

  useEffect(() => {
    axios
      .get(`${SERVER}/api/driver/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setData(res.data))
      .catch((err) => console.error("API Error:", err.message));
  }, [token]);

  useEffect(() => {
    if (activeSection !== "students") return;
    if (students.length > 0 || studentsLoading) return;
    setStudentsLoading(true);
    setStudentsError(null);
    axios
      .get(`${SERVER}/api/driver/students`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setStudents(res.data.students || []))
      .catch((err) => {
        console.error("Students fetch error:", err.message);
        setStudentsError("Failed to load student roster. Please try again.");
      })
      .finally(() => setStudentsLoading(false));
  }, [activeSection]);

  useEffect(() => {
    if (activeSection !== "profile") setProfileSub("info");
  }, [activeSection]);

  useEffect(() => {
    if (tripStarted) {
      timerRef.current = setInterval(() => setTripDuration((d) => d + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      setTripDuration(0);
    }
    return () => clearInterval(timerRef.current);
  }, [tripStarted]);

  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest(".dd-profile-wrap")) setOpenProfile(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      clearInterval(timerRef.current);
    };
  }, []);

  const formatDuration = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
  };

  const logout = () => {
    if (tripStarted && data?.bus?._id) {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      socketRef.current?.emit("endTrip", {
        busId:    String(data.bus._id),
        driverId: String(data.driver._id),
      });
    }
    localStorage.removeItem("driverToken");
    localStorage.removeItem("role");
    navigate("/");
  };

  const handleTripToggle = async () => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) { alert("Socket not connected. Please wait and try again."); return; }
    if (!data?.driver?._id || !data?.bus?._id) { alert("Driver or bus data missing. Please refresh."); return; }

    if (!tripStarted) {
      setTripStarted(true);
      setGpsStatus("active");
      setLocationCount(0);

      const busIdStr    = String(data.bus._id);
      const driverIdStr = String(data.driver._id);
      const routeIdStr  = data.route?._id ? String(data.route._id) : null;

      socket.emit("startTrip", { busId: busIdStr, driverId: driverIdStr, routeId: routeIdStr });

      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoords({ lat: latitude.toFixed(6), lng: longitude.toFixed(6) });
          setLocationCount((c) => c + 1);
          socket.emit("sendLocation", { busId: busIdStr, driverId: driverIdStr, routeId: routeIdStr, latitude, longitude });
        },
        (err) => { console.warn("GPS error:", err.code, err.message); setGpsStatus("error"); },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
      );
      watchIdRef.current = watchId;
    } else {
      setTripStarted(false);
      setGpsStatus("idle");
      setCoords(null);
      setStopsDone([]);
      setLocationCount(0);

      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }

      socket.emit("endTrip", { busId: String(data.bus._id), driverId: String(data.driver._id) });

      try {
        await axios.post(
          `${SERVER}/api/trip/end`,
          { busId: data.bus._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error("Trip end DB error:", err.response?.data || err.message);
      }
    }
  };

  // Helper: get stop display name regardless of shape
  const getStopName = (stop) =>
    typeof stop === "string" ? stop : stop?.name || stop?.stopName || "";

  // Helper: get stop timing if available
  const getStopTiming = (stop) =>
    typeof stop === "object" ? stop?.timing || stop?.time || null : null;

  const toggleStop = (stop) => {
    const name = getStopName(stop);
    setStopsDone((prev) =>
      prev.includes(name) ? prev.filter((st) => st !== name) : [...prev, name]
    );
  };

  const handleSort = (key) =>
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));

  const filteredStudents = students
    .filter((student) => {
      const q = rosterQuery.toLowerCase();
      if (!q) return true;
      return (
        student.name?.toLowerCase().includes(q) ||
        student.stopName?.toLowerCase().includes(q) ||
        student.branch?.toLowerCase().includes(q) ||
        String(student.seatNumber ?? "").includes(q)
      );
    })
    .sort((a, b) => {
      const { key, direction } = sortConfig;
      const valA = key === "seatNumber" ? Number(a[key] ?? 0) : (a[key] ?? "").toString().toLowerCase();
      const valB = key === "seatNumber" ? Number(b[key] ?? 0) : (b[key] ?? "").toString().toLowerCase();
      if (valA < valB) return direction === "asc" ? -1 : 1;
      if (valA > valB) return direction === "asc" ? 1 : -1;
      return 0;
    });

  const uniqueStops = [...new Set(students.map((st) => st.stopName).filter(Boolean))];

  const driver = data?.driver;
  const bus    = data?.bus;
  const route  = data?.route;
  const stops  = route?.stops || [];

  const navItems = [
    { id: "overview", icon: <FaTachometerAlt />, label: "Overview" },
    { id: "route",    icon: <FaRoute />,          label: "Route"    },
    { id: "students", icon: <FaUsers />,           label: "Students" },
    { id: "bus",      icon: <FaBus />,             label: "Bus"      },
    { id: "profile",  icon: <FaUserCircle />,      label: "Profile"  },
  ];

  const TABLE_COLS = [
    { key: "seatNumber", label: "Seat"    },
    { key: "name",       label: "Student" },
    { key: "phone",      label: "Phone"   },
    { key: "stopName",   label: "Stop"    },
    { key: "branch",     label: "Branch"  },
  ];

  if (!data)
    return (
      <div className="dd-loading">
        <div className="dd-spinner" />
        <span>Loading your dashboard…</span>
      </div>
    );

  return (
    <div className="dd-root">

      {/* ── Navbar ── */}
      <header className="dd-navbar">
        <div className="dd-navbar-brand">
          <RiSteering2Fill className="dd-brand-icon" />
          <span>Driver Panel</span>
        </div>
        <div className="dd-navbar-right">
          <div className={`dd-socket-badge ${socketConnected ? "on" : "off"}`}>
            <IoWifiOutline /><span>{socketConnected ? "Live" : "Offline"}</span>
          </div>
          <div className="dd-profile-wrap">
            <button className="dd-profile-btn" onClick={() => setOpenProfile((p) => !p)}>
              <div className="dd-avatar">{driver?.name?.[0]?.toUpperCase() || "D"}</div>
              <span className="dd-profile-name">{driver?.name || "Driver"}</span>
              {openProfile ? <HiChevronUp /> : <HiChevronDown />}
            </button>
            {openProfile && (
              <div className="dd-dropdown">
                <div className="dd-dropdown-head">
                  <div className="dd-dropdown-avatar">{driver?.name?.[0]?.toUpperCase() || "D"}</div>
                  <div>
                    <div className="dd-dropdown-name">{driver?.name}</div>
                    <div className="dd-dropdown-role">Bus Driver</div>
                  </div>
                </div>
                <div className="dd-dropdown-info">
                  <span><FaEnvelope /> {driver?.email}</span>
                  {/* <span><FaPhone /> {driver?.contact}</span>
                  <span><FaIdCard /> {driver?.license}</span> */}
                </div>
                <button className="dd-logout-btn" onClick={logout}><FaSignOutAlt /> Sign Out</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Trip Banner ── */}
      <div className={`dd-trip-banner ${tripStarted ? "active" : ""}`}>
        <div className="dd-trip-banner-inner">
          <div className="dd-trip-info">
            <div className={`dd-gps-dot ${gpsStatus}`} />
            <div>
              <div className="dd-trip-status-label">
                {tripStarted ? "Live Trip in Progress" : "Ready to Start"}
              </div>
              {tripStarted && <div className="dd-trip-timer">{formatDuration(tripDuration)}</div>}
              {coords && (
                <div className="dd-coords">
                  <MdGpsFixed /> {coords.lat}, {coords.lng}
                  {locationCount > 0 && <span style={{ marginLeft: 6, opacity: 0.7 }}>#{locationCount}</span>}
                </div>
              )}
            </div>
          </div>
          <button
            className={`dd-trip-btn ${tripStarted ? "end" : "start"}`}
            onClick={handleTripToggle}
            disabled={!socketConnected || !data?.assigned}
            title={!socketConnected ? "Waiting for connection…" : !data?.assigned ? "No bus/route assigned" : ""}
          >
            {tripStarted ? "End Trip" : <><MdNavigation /> Start Trip</>}
          </button>
        </div>
        {tripStarted && stops.length > 0 && (
          <div className="dd-stop-progress">
            <div className="dd-stop-progress-fill" style={{ width: `${(stopsDone.length / stops.length) * 100}%` }} />
          </div>
        )}
      </div>

      {/* ── Layout ── */}
      <div className="dd-layout">
        <nav className="dd-sidebar">
          {navItems.map((n) => (
            <button
              key={n.id}
              className={`dd-nav-btn ${activeSection === n.id ? "active" : ""}`}
              onClick={() => setActiveSection(n.id)}
            >
              {n.icon}<span>{n.label}</span>
            </button>
          ))}
        </nav>

        <main className="dd-main">

          {/* ══════════════════ OVERVIEW ══════════════════ */}
          {activeSection === "overview" && (
            <div className="dd-section">
              <h2 className="dd-section-title">Welcome back, {driver?.name?.split(" ")[0] || "Driver"} 👋</h2>
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
                    <div className="dd-stat-val">{data?.assigned ? "Active" : "None"}</div>
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
                <div className="dd-card-head"><BiSolidBadgeCheck /> Assignment Status</div>
                <div className="dd-assign-status">
                  <div className={`dd-assign-badge ${data?.assigned ? "yes" : "no"}`}>
                    {data?.assigned
                      ? <><IoCheckmarkCircle /> Fully Assigned</>
                      : <><IoCloseCircle /> Not Assigned Yet</>}
                  </div>
                  <div className="dd-assign-detail">
                    <span><b>Bus:</b> {bus?.busNumber || "—"}</span>
                    <span><b>Route:</b> {route ? `${route.routeNumber} – ${route.routeName}` : "—"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════ ROUTE ══════════════════ */}
          {activeSection === "route" && (
            <div className="dd-section">
              <h2 className="dd-section-title"><FaRoute /> Route Info</h2>

              {route ? (
                <>
                  {/* Summary pill row */}
                  <div className="dd-route-summary-row">
                    <div className="dd-route-summary-pill">
                      <FaRoute /> Route <strong>{route.routeNumber}</strong>
                    </div>
                    <div className="dd-route-summary-pill">
                      <FaBus /> Bus <strong>{bus?.busNumber || "—"}</strong>
                    </div>
                    <div className="dd-route-summary-pill">
                      <FaMapMarkerAlt /> <strong>{stops.length}</strong> stops
                    </div>
                    {tripStarted && (
                      <div className="dd-route-summary-pill" style={{ background: "#eef2ff", borderColor: "#c7d2fe", color: "#4338ca" }}>
                        <IoCheckmarkCircle /> <strong>{stopsDone.length}</strong> / {stops.length} done
                      </div>
                    )}
                  </div>

                  {/* Route Details card */}
                  <div className="dd-card">
                    <div className="dd-card-head">Route Details</div>
                    <div className="dd-route-hero">
                      <div className="dd-route-num">{route.routeNumber}</div>
                      <div className="dd-route-meta">
                        <div className="dd-route-name">{route.routeName}</div>
                        <div className="dd-route-path">
                          <span className="dd-endpoint start">
                            <FaMapMarkerAlt style={{ fontSize: 10 }} />
                            {route.startPoint}
                          </span>
                          <div className="dd-route-line" />
                          <span className="dd-endpoint end">
                            <FaMapMarkerAlt style={{ fontSize: 10 }} />
                            {route.endPoint}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stops card */}
                  <div className="dd-card">
                    <div className="dd-card-head" style={{ justifyContent: "space-between" }}>
                      <span><FaMapMarkerAlt /> Stops</span>
                      {tripStarted && (
                        <span className="dd-stops-progress-label">
                          {stopsDone.length}/{stops.length} done
                        </span>
                      )}
                    </div>

                    <div className="dd-stops-list">
                      {stops.map((stop, i) => {
                        const stopName   = getStopName(stop);
                        const stopTiming = getStopTiming(stop);
                        const isDone     = stopsDone.includes(stopName);
                        const isLast     = i === stops.length - 1;

                        return (
                          <div
                            key={i}
                            className={`dd-stop-item ${isDone ? "done" : ""} ${isLast ? "last-stop" : ""} ${tripStarted ? "clickable" : ""}`}
                            onClick={() => tripStarted && toggleStop(stop)}
                          >
                            {/* Dot + vertical line */}
                            <div className="dd-stop-connector">
                              <div className={`dd-stop-dot ${isDone ? "done" : ""} ${isLast && !isDone ? "last" : ""}`}>
                                {isDone
                                  ? <IoCheckmarkCircle style={{ fontSize: 14 }} />
                                  : <span>{i + 1}</span>}
                              </div>
                              {!isLast && <div className="dd-stop-line-seg" />}
                            </div>

                            {/* Pill + timing chip */}
                            <div className="dd-stop-content">
                              <div className="dd-stop-name-pill">
                                <FaMapMarkerAlt className="icon" />
                                {stopName}
                              </div>

                              {/* Show timing from stop object OR from route.timings array */}
                              {(stopTiming || route.timings?.[i]) && (
                                <div className="dd-stop-timing-chip">
                                  <FaClock className="icon" />
                                  {stopTiming || route.timings[i]}
                                </div>
                              )}

                              {tripStarted && !isDone && (
                                <span className="dd-stop-tap-hint">tap to mark</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="dd-empty-state">
                  <FaRoute />
                  <p>No route assigned yet</p>
                  <span>Contact your administrator</span>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════ STUDENTS ══════════════════ */}
          {activeSection === "students" && (
            <div className="dd-section">
              <h2 className="dd-section-title"><FaUsers /> Student Roster</h2>

              {!data?.assigned ? (
                <div className="dd-empty-state">
                  <FaUsers /><p>No bus assigned</p>
                  <span>You need a bus assignment to view the roster</span>
                </div>
              ) : studentsLoading ? (
                <div className="dd-loading" style={{ minHeight: 200 }}>
                  <div className="dd-spinner" /><span>Loading roster…</span>
                </div>
              ) : studentsError ? (
                <div className="dd-empty-state">
                  <FaUsers /><p>Failed to load</p><span>{studentsError}</span>
                  <button
                    className="dd-logout-card-btn"
                    style={{ marginTop: 12 }}
                    onClick={() => { setStudents([]); setStudentsError(null); setStudentsLoading(false); }}
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <>
                  <div className="dd-roster-summary">
                    <div className="dd-roster-summary-item"><FaUsers /><span><strong>{students.length}</strong> students</span></div>
                    <div className="dd-roster-summary-item"><FaMapMarkerAlt /><span><strong>{uniqueStops.length}</strong> stops</span></div>
                    <div className="dd-roster-summary-item"><FaBus /><span>Bus <strong>{bus?.busNumber || "—"}</strong></span></div>
                  </div>
                  <div className="dd-card">
                    <div className="dd-roster-search-bar">
                      <FaSearch className="dd-search-icon" />
                      <input
                        type="text"
                        className="dd-roster-input"
                        placeholder="Search by name, stop, branch, or seat…"
                        value={rosterQuery}
                        onChange={(e) => setRosterQuery(e.target.value)}
                      />
                      {rosterQuery && (
                        <button className="dd-search-clear" onClick={() => setRosterQuery("")} aria-label="Clear search">×</button>
                      )}
                    </div>
                    {rosterQuery && (
                      <div className="dd-roster-result-count">
                        Showing {filteredStudents.length} of {students.length} students
                      </div>
                    )}
                    <div className="dd-table-wrap">
                      <table className="dd-roster-table">
                        <thead>
                          <tr>
                            {TABLE_COLS.map((col) => (
                              <th key={col.key} className="dd-roster-th" onClick={() => handleSort(col.key)}>
                                <span className="dd-th-inner">
                                  {col.label}
                                  <SortIcon colKey={col.key} sortConfig={sortConfig} />
                                </span>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredStudents.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="dd-roster-empty-row">
                                <FaSearch style={{ marginRight: 6, opacity: 0.4 }} />
                                No students match your search
                              </td>
                            </tr>
                          ) : (
                            filteredStudents.map((student, idx) => {
                              const initials = (student.name || "?")
                                .split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
                              return (
                                <tr key={student._id || idx} className="dd-roster-row">
                                  <td className="dd-roster-td">
                                    <span className="dd-seat-badge">{student.seatNumber ?? "—"}</span>
                                  </td>
                                  <td className="dd-roster-td">
                                    <div className="dd-student-cell">
                                      <div className="dd-student-avatar">{initials}</div>
                                      <span className="dd-student-name">{student.name || "—"}</span>
                                    </div>
                                  </td>
                                  <td className="dd-roster-td dd-phone-cell">
                                    <FaPhone style={{ fontSize: 10, marginRight: 5, opacity: 0.5 }} />
                                    {student.phone || "—"}
                                  </td>
                                  <td className="dd-roster-td">
                                    <span className="dd-stop-pill">
                                      <FaMapMarkerAlt style={{ fontSize: 10 }} />
                                      {student.stopName || "—"}
                                    </span>
                                  </td>
                                  <td className="dd-roster-td">
                                    <span className="dd-branch-tag">{student.branch || "—"}</span>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ══════════════════ BUS ══════════════════ */}
          {activeSection === "bus" && (
            <div className="dd-section">
              <h2 className="dd-section-title"><FaBus /> Bus Info</h2>
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
                        {route ? `${route.routeNumber} · ${route.startPoint} → ${route.endPoint}` : "—"}
                      </span>
                    </div>
                    <div className="dd-kv">
                      <span className="dd-key">GPS Status</span>
                      <span className={`dd-val gps-${gpsStatus}`}>
                        {gpsStatus === "active"
                          ? <><MdGpsFixed /> Active ({locationCount} updates sent)</>
                          : gpsStatus === "error"
                          ? <><MdGpsOff /> Error</>
                          : "Idle"}
                      </span>
                    </div>
                    <div className="dd-kv">
                      <span className="dd-key">Trip Status</span>
                      <span className="dd-val">{tripStarted ? "🟢 In Progress" : "⚪ Not Started"}</span>
                    </div>
                    {coords && (
                      <div className="dd-kv">
                        <span className="dd-key">Current GPS</span>
                        <span className="dd-val" style={{ fontFamily: "monospace", fontSize: 12 }}>
                          {coords.lat}, {coords.lng}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="dd-empty-state">
                  <FaBus /><p>No bus assigned yet</p>
                  <span>Your administrator hasn't assigned a bus to you</span>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════ PROFILE ══════════════════ */}
          {activeSection === "profile" && (
            <div className="dd-section">
              <h2 className="dd-section-title"><FaUserCircle /> My Profile</h2>

              <div className="dd-profile-toggle">
                <button
                  className={`dd-profile-toggle-btn ${profileSub === "info" ? "active" : ""}`}
                  onClick={() => setProfileSub("info")}
                >
                  <FaIdCard /> Info
                </button>
                <button
                  className={`dd-profile-toggle-btn ${profileSub === "settings" ? "active" : ""}`}
                  onClick={() => setProfileSub("settings")}
                >
                  <FaLock /> Account Settings
                </button>
              </div>

              {profileSub === "info" && (
                <div className="dd-card">
                  <div className="dd-profile-card-head">
                    <div className="dd-profile-avatar-lg">{driver?.name?.[0]?.toUpperCase() || "D"}</div>
                    <div>
                      <div className="dd-profile-fullname">{driver?.name}</div>
                      <div className="dd-profile-tag">Bus Driver</div>
                    </div>
                  </div>
                  <div className="dd-profile-details">
                    <div className="dd-kv"><span className="dd-key"><FaEnvelope /> Email</span><span className="dd-val">{driver?.email || "—"}</span></div>
                    <div className="dd-kv"><span className="dd-key"><FaPhone /> Contact</span><span className="dd-val">{driver?.contact || "—"}</span></div>
                    <div className="dd-kv"><span className="dd-key"><FaIdCard /> License No.</span><span className="dd-val">{driver?.license || "—"}</span></div>
                    <div className="dd-kv"><span className="dd-key"><FaIdCard /> Aadhar No.</span><span className="dd-val">{driver?.aadhar || "—"}</span></div>
                  </div>
                </div>
              )}

              {profileSub === "settings" && (
                <ProfileSettings
                  token={token}
                  serverUrl={SERVER}
                  onEmailUpdate={(newEmail) =>
                    setData((prev) => ({
                      ...prev,
                      driver: { ...prev.driver, email: newEmail },
                    }))
                  }
                />
              )}

              <button className="dd-logout-card-btn" onClick={logout}><FaSignOutAlt /> Sign Out</button>
            </div>
          )}

        </main>
      </div>

      {/* ── Bottom Nav (mobile) ── */}
      <nav className="dd-bottom-nav">
        {navItems.map((n) => (
          <button
            key={n.id}
            className={`dd-bottom-btn ${activeSection === n.id ? "active" : ""}`}
            onClick={() => setActiveSection(n.id)}
          >
            {n.icon}<span>{n.label}</span>
          </button>
        ))}
      </nav>

    </div>
  );
}

export default DriverDashboard;