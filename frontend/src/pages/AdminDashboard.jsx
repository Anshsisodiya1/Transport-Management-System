import { useEffect, useState, useCallback } from "react";
import API from "../services/api";
import Layout from "../components/Layout";
import "../styles/AdminDashboard.css";
import { useNavigate } from "react-router-dom";

import {
  RiUserLine,
  RiGraduationCapLine,
  RiCarLine,
  RiBusLine,
  RiMapPinLine,
  RiArrowRightLine,
  RiRefreshLine,
  RiRoadMapLine,
  RiBarChartBoxLine,
  RiTimeLine,
  RiWifiLine,
  RiShieldCheckLine,
  RiCalendarCheckLine,
  RiArrowUpLine,
} from "react-icons/ri";

/* ─── tiny helpers ──────────────────────────────────────── */
const fmt = (n) => (n >= 1000 ? (n / 1000).toFixed(1) + "k" : n);

const statConfig = [
  {
    key: "users",
    label: "Total Users",
    icon: <RiUserLine />,
    color: "blue",
    bar: 72,
    barColor: "#4f8ef7",
    trend: "+4%",
  },
  {
    key: "students",
    label: "Students",
    icon: <RiGraduationCapLine />,
    color: "green",
    bar: 88,
    barColor: "#38d9a9",
    trend: "+12%",
  },
  {
    key: "drivers",
    label: "Drivers",
    icon: <RiCarLine />,
    color: "orange",
    bar: 55,
    barColor: "#f7934f",
    trend: "Active",
  },
  {
    key: "buses",
    label: "Fleet Buses",
    icon: <RiBusLine />,
    color: "purple",
    bar: 65,
    barColor: "#c084fc",
    trend: "+2%",
  },
  {
    key: "assignments",
    label: "Assignments",
    icon: <RiMapPinLine />,
    color: "pink",
    bar: 80,
    barColor: "#fb7185",
    trend: "Live",
  },
];

const actionCards = [
  {
    key: "routes",
    className: "routes",
    icon: <RiRoadMapLine />,
    title: "Routes Management",
    desc: "Create, update & optimise all university bus routes and stop schedules.",
    chip: "Routes",
    path: "/admin/routes",
  },
  {
    key: "buses",
    className: "buses",
    icon: <RiBusLine />,
    title: "Buses Management",
    desc: "Add vehicles, track fleet status and assign buses to active routes.",
    chip: "Fleet",
    path: "/admin/buses",
  },
  {
    key: "reports",
    className: "reports",
    icon: <RiBarChartBoxLine />,
    title: "Reports & Analytics",
    desc: "Generate ridership, route efficiency & compliance reports with exports.",
    chip: "Analytics",
    path: "/admin/reports",
  },
];

/* ─── AnimatedNumber ────────────────────────────────────── */
function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (value === 0) return;
    const start = display;
    const diff = value - start;
    const duration = 600;
    const startTime = performance.now();
    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + diff * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <>{fmt(display)}</>;
}

/* ─── Main component ────────────────────────────────────── */
function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    students: 0,
    drivers: 0,
    buses: 0,
    assignments: 0,
  });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const navigate = useNavigate();

  const fetchStats = useCallback(async (manual = false) => {
    if (manual) setSpinning(true);
    try {
      const res = await API.get("/admin/stats");
      setStats(res.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      if (manual) setTimeout(() => setSpinning(false), 600);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30_000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const timeStr = lastUpdated
    ? lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "—";

  return (
    <Layout>
      <div className="dashboard-container">

        {/* ── Header ── */}
        <div className="dashboard-header">
          <div className="header-left">
            <div className="dashboard-eyebrow">University TMS</div>
            <h1 className="dashboard-title">
              Admin <span>Dashboard</span>
            </h1>
            <p className="dashboard-subtitle">
              Monitor fleet, routes and student transport in real-time.
            </p>
          </div>

          <div className="header-right">
            <div className="header-badge">
              <span className="live-dot" />
              Live data
            </div>
            <button
              className="refresh-btn"
              onClick={() => fetchStats(true)}
              title="Refresh stats"
            >
              <RiRefreshLine
                style={{
                  transition: "transform 0.6s ease",
                  transform: spinning ? "rotate(360deg)" : "rotate(0deg)",
                }}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="section-label">Overview</div>

        <div className="stats-grid">
          {statConfig.map((s) => (
            <div className="stat-card" key={s.key}>
              <div className="stat-card-top">
                <div className={`stat-icon-wrap ${s.color}`}>{s.icon}</div>
                <span className={`stat-trend ${s.trend.startsWith("+") ? "up" : "neutral"}`}>
                  {s.trend.startsWith("+") && <RiArrowUpLine size={10} />}
                  {s.trend}
                </span>
              </div>

              <div className="stat-value">
                <AnimatedNumber value={stats[s.key]} />
              </div>
              <div className="stat-label">{s.label}</div>

              <div className="stat-bar">
                <div
                  className="stat-bar-fill"
                  style={{
                    width: `${s.bar}%`,
                    background: s.barColor,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* ── Quick actions ── */}
        <div className="section-label" style={{ marginTop: 40 }}>Quick Actions</div>

        <div className="actions-grid">
          {actionCards.map((card) => (
            <div
              key={card.key}
              className={`action-card ${card.className}`}
              onClick={() => navigate(card.path)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && navigate(card.path)}
            >
              <div className={`action-icon-wrap`}>{card.icon}</div>

              <div className="action-card-body">
                <div className="action-card-title">{card.title}</div>
                <div className="action-card-desc">{card.desc}</div>
              </div>

              <div className="action-card-footer">
                <span className="action-chip">{card.chip}</span>
                <span className="action-arrow">
                  <RiArrowRightLine />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Info strip ── */}
        <div className="info-strip" style={{ marginTop: 32 }}>
          <div className="info-item">
            <RiTimeLine />
            Last updated <strong>{timeStr}</strong>
          </div>
          <div className="info-divider" />
          <div className="info-item">
            <RiWifiLine />
            Auto-refresh every <strong>30s</strong>
          </div>
          <div className="info-divider" />
          <div className="info-item">
            <RiShieldCheckLine />
            Role: <strong>Administrator</strong>
          </div>
          <div className="info-divider" />
          <div className="info-item">
            <RiCalendarCheckLine />
            Session active
          </div>
        </div>

      </div>
    </Layout>
  );
}

export default AdminDashboard;