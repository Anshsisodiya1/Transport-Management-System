import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/sidebar.css";

// ── Icons ──────────────────────────────────────────────────────
const Icon = {
  Logo: () => (
    <svg viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="#3b77ed"/>
      <path d="M7 23 C9 17 11 14 16 10 C21 14 23 17 25 23" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <circle cx="16" cy="9" r="2" fill="#fff"/>
      <path d="M10 20h12" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  Dashboard: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  Buses: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="13" rx="2"/>
      <path d="M2 10h20"/>
      <path d="M7 18v2M17 18v2"/>
      <circle cx="7" cy="16" r="1" fill="currentColor"/>
      <circle cx="17" cy="16" r="1" fill="currentColor"/>
      <path d="M2 10V7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3"/>
    </svg>
  ),
  Register: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <line x1="19" y1="8" x2="19" y2="14"/>
      <line x1="16" y1="11" x2="22" y2="11"/>
    </svg>
  ),
  Assignments: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  Settings: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  Logout: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Moon: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  ),
  Sun: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  ),
  PanelLeft: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <line x1="9" y1="3" x2="9" y2="21"/>
    </svg>
  ),
  ChevronUp: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15"/>
    </svg>
  ),
  Email: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  Shield: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
};

// ── Nav items ─────────────────────────────────────────────────
const NAV = [
  { id: "dashboard",   label: "Dashboard",    icon: Icon.Dashboard,   path: "/admin-dashboard" },
  { id: "buses",       label: "Buses",         icon: Icon.Buses,       path: "/admin/buses" },
  { id: "register",    label: "Register User", icon: Icon.Register,    path: "/admin/register" },
  { id: "assignments", label: "Assignments",   icon: Icon.Assignments, path: "/admin/assignments" },
  { id: "settings",    label: "Settings",      icon: Icon.Settings,    path: "/admin/settings" },
];

// ── Read real admin info from JWT ─────────────────────────────
function getAdminInfo() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return { name: "Admin", email: "admin@rutms.edu", role: "Admin" };
    const base64Payload = token.split(".")[1];
    const padded = base64Payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
    const payload = JSON.parse(json);
    return {
      name:  payload.name  || payload.username || payload.user?.name  || "Admin",
      email: payload.email || payload.user?.email || "",
      role:  payload.role  || payload.user?.role  || "Admin",
    };
  } catch {
    return { name: "Admin", email: "", role: "Admin" };
  }
}

function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "A";
}

// ── Component ─────────────────────────────────────────────────
export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed,   setCollapsed]   = useState(() => localStorage.getItem("sb_collapsed") === "true");
  const [dark,        setDark]        = useState(() => localStorage.getItem("sb_dark") === "true");
  const [profileOpen, setProfileOpen] = useState(false);
  const [tooltip,     setTooltip]     = useState(null);

  const profileRef = useRef(null);
  const admin      = getAdminInfo();
  const initials   = getInitials(admin.name);

  useEffect(() => { localStorage.setItem("sb_collapsed", collapsed); }, [collapsed]);
  useEffect(() => { localStorage.setItem("sb_dark", dark); }, [dark]);

  useEffect(() => {
    const h = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside className={`asb ${dark ? "asb--dark" : "asb--light"} ${collapsed ? "asb--collapsed" : "asb--expanded"}`}>

      {/* ─── TOP: logo + toggle ─── */}
      <div className="asb__top">
        <div className="asb__logo">
          <span className="asb__logo-icon"><Icon.Logo /></span>
          <span className="asb__logo-name">RUTMS</span>
        </div>

        <div
          className="asb__tip-wrap"
          onMouseEnter={() => setTooltip("__toggle")}
          onMouseLeave={() => setTooltip(null)}
        >
          <button
            className="asb__collapse-btn"
            onClick={() => { setCollapsed(c => !c); setTooltip(null); }}
            aria-label="Toggle sidebar"
          >
            <Icon.PanelLeft />
          </button>
          {tooltip === "__toggle" && (
            <span className="asb__tooltip">
              {collapsed ? "Expand" : "Collapse"}
            </span>
          )}
        </div>
      </div>

      <div className="asb__rule" />

      {/* ─── NAV GROUP LABEL ─── */}
      {!collapsed && <span className="asb__group-label">Main Menu</span>}

      {/* ─── NAV ITEMS ─── */}
      <nav className="asb__nav">
        {NAV.map((item) => {
          const NavIcon = item.icon;
          const active  = isActive(item.path);
          return (
            <div
              key={item.id}
              className="asb__tip-wrap"
              onMouseEnter={() => collapsed && setTooltip(item.id)}
              onMouseLeave={() => setTooltip(null)}
            >
              <button
                className={`asb__nav-btn ${active ? "asb__nav-btn--active" : ""}`}
                onClick={() => navigate(item.path)}
              >
                {active && <span className="asb__active-bar" />}
                <span className="asb__nav-icon"><NavIcon /></span>
                <span className="asb__nav-label">{item.label}</span>
              </button>

              {collapsed && tooltip === item.id && (
                <span className="asb__tooltip">{item.label}</span>
              )}
            </div>
          );
        })}
      </nav>

      {/* ─── SPACER ─── */}
      <div className="asb__flex-gap" />

      <div className="asb__rule" />

      {/* ─── PROFILE ─── */}
      <div
        className="asb__profile-wrap"
        ref={profileRef}
        onMouseEnter={() => collapsed && setTooltip("__profile")}
        onMouseLeave={() => collapsed && setTooltip(null)}
      >
        <button
          className={`asb__profile-btn ${profileOpen ? "asb__profile-btn--open" : ""}`}
          onClick={() => setProfileOpen(o => !o)}
          aria-label="Profile menu"
        >
          <span className="asb__avatar">{initials}</span>
          <span className="asb__profile-text">
            <span className="asb__profile-name">{admin.name}</span>
            <span className="asb__profile-role">{admin.role}</span>
          </span>
          <span className={`asb__profile-chevron ${profileOpen ? "asb__profile-chevron--up" : ""}`}>
            <Icon.ChevronUp />
          </span>
        </button>

        {collapsed && tooltip === "__profile" && (
          <span className="asb__tooltip">{admin.name}</span>
        )}

        {/* ── Popover ── */}
        {profileOpen && (
          <div className="asb__popover">

            <div className="asb__popover-head">
              <span className="asb__popover-avatar">{initials}</span>
              <div className="asb__popover-info">
                <span className="asb__popover-name">{admin.name}</span>
                <span className="asb__popover-email">
                  <Icon.Email />
                  <span>{admin.email || "No email found"}</span>
                </span>
              </div>
            </div>

            <div className="asb__popover-divider" />

            <div className="asb__popover-row asb__popover-row--meta">
              <span className="asb__popover-row-icon"><Icon.Shield /></span>
              <span className="asb__popover-row-text">Role</span>
              <span className="asb__role-badge">{admin.role}</span>
            </div>

            <div className="asb__popover-divider" />

            <button
              className="asb__popover-row asb__popover-row--btn"
              onClick={() => setDark(d => !d)}
            >
              <span className="asb__popover-row-icon">
                {dark ? <Icon.Sun /> : <Icon.Moon />}
              </span>
              <span className="asb__popover-row-text">
                {dark ? "Light Mode" : "Dark Mode"}
              </span>
              <span className={`asb__theme-pill ${dark ? "asb__theme-pill--on" : ""}`}>
                <span className="asb__theme-pill-knob" />
              </span>
            </button>

            <div className="asb__popover-divider" />

            <button
              className="asb__popover-row asb__popover-row--btn asb__popover-row--danger"
              onClick={handleLogout}
            >
              <span className="asb__popover-row-icon"><Icon.Logout /></span>
              <span className="asb__popover-row-text">Log out</span>
            </button>

          </div>
        )}
      </div>

    </aside>
  );
}