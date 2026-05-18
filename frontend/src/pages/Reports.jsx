import { useState } from "react";
import API from "../services/api";
import Layout from "../components/Layout";
import "../styles/reports.css";

/* ─── Report Type Config ─────────────────────────────────────────── */
const REPORT_TYPES = [
  { value: "buses/all",            icon: "🚌", label: "All Buses",      sub: "Complete fleet list"     },
  { value: "buses/with-driver",    icon: "👤", label: "Bus + Driver",   sub: "Driver assignments"      },
  { value: "buses/with-route",     icon: "🛣️", label: "Bus + Route",    sub: "Route allocations"       },
  { value: "buses/with-students",  icon: "🎓", label: "Bus + Students", sub: "Passenger manifest"      },
  { value: "buses/seat-occupancy", icon: "💺", label: "Seat Occupancy", sub: "Capacity utilisation"    },
];

/* ─── Helpers ────────────────────────────────────────────────────── */
const initials = (name) =>
  name ? name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "?";

const occupancyColor = (pct) => {
  if (pct >= 90) return "occ-danger";
  if (pct >= 65) return "occ-warning";
  return "occ-safe";
};

const formatRoute = (item) => {
  if (item.route && typeof item.route === "object")
    return `${item.route.routeNumber} – ${item.route.routeName}`;
  if (item.routeNumber) return `${item.routeNumber} – ${item.routeName}`;
  return null;
};

/* ─── SVG Icons ──────────────────────────────────────────────────── */
const IcoSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const IcoChevron = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);
const IcoCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IcoSpin = () => (
  <svg className="spin-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);
const IcoBarChart = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
);
const IcoPhone = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.95 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.88 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);
const IcoPin = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const IcoSeat = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 20h12M8 20v-4a4 4 0 0 1 8 0v4M12 4v8M8 8l4-4 4 4"/>
  </svg>
);
const IcoRoute = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>
  </svg>
);
const IcoGps = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
  </svg>
);
const IcoUsers = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

/* ─── Component ──────────────────────────────────────────────────── */
function Reports() {
  const [type, setType]           = useState("");
  const [data, setData]           = useState([]);
  const [loading, setLoading]     = useState(false);
  const [generated, setGenerated] = useState(false);
  const [activeLabel, setActiveLabel] = useState("");
  const [search, setSearch]       = useState("");

  const generateReport = async () => {
    if (!type) return;
    try {
      setLoading(true);
      setGenerated(false);
      setSearch("");
      const res = await API.get(`/reports/${type}`);
      setData(res.data || []);
      setGenerated(true);
      setActiveLabel(REPORT_TYPES.find((r) => r.value === type)?.label || "");
    } catch {
      alert("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const filtered = data.filter((item) =>
    item.busNumber?.toLowerCase().includes(search.toLowerCase()) ||
    item.driverName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="rp-page">

        {/* ── Page Header ── */}
        <div className="rp-header">
          <div className="rp-header-left">
            <div className="rp-header-icon"><IcoBarChart /></div>
            <div>
              <h1>Reports Centre</h1>
              <p>Generate and analyse transport data across the entire fleet</p>
            </div>
          </div>
          {generated && (
            <div className="rp-result-pill">
              <IcoCheck />
              {filtered.length} record{filtered.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        {/* ── Control Bar ── */}
        <div className="rp-control-card">
          <div className="rp-control-label">Select Report Type</div>
          <div className="rp-type-grid">
            {REPORT_TYPES.map((rt) => (
              <button
                key={rt.value}
                className={`rp-type-btn${type === rt.value ? " active" : ""}`}
                onClick={() => setType(rt.value)}
              >
                <span className="rp-type-icon">{rt.icon}</span>
                <span className="rp-type-text">
                  <span className="rp-type-label">{rt.label}</span>
                  <span className="rp-type-sub">{rt.sub}</span>
                </span>
                {type === rt.value && (
                  <span className="rp-type-check"><IcoCheck /></span>
                )}
              </button>
            ))}
          </div>

          <div className="rp-control-footer">
            <button
              className="rp-btn-generate"
              onClick={generateReport}
              disabled={!type || loading}
            >
              {loading ? (
                <><IcoSpin /> Generating…</>
              ) : (
                <>Generate Report <IcoChevron /></>
              )}
            </button>
          </div>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="rp-loading">
            <div className="rp-spinner" />
            <span>Fetching report data…</span>
          </div>
        )}

        {/* ── Results ── */}
        {!loading && generated && (
          <>
            {/* Results toolbar */}
            <div className="rp-results-bar">
              <div className="rp-results-title">
                <span className="rp-active-label">{activeLabel}</span>
                <span className="rp-results-count">
                  {filtered.length} of {data.length} records
                </span>
              </div>
              <div className="rp-search-wrap">
                <IcoSearch />
                <input
                  className="rp-search"
                  placeholder="Filter by bus or driver…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Cards */}
            {filtered.length === 0 ? (
              <div className="rp-empty">
                <div className="rp-empty-icon">🔍</div>
                <p>No results match your filter</p>
                <span>Try clearing the search field</span>
              </div>
            ) : (
              <div className="rp-cards-grid">
                {filtered.map((item, i) => {
                  const totalSeats = item.totalSeats ?? item.capacity;
                  const occupied   = item.occupied ?? item.students?.length;
                  const pct        = totalSeats ? Math.round((occupied / totalSeats) * 100) : null;
                  const routeStr   = formatRoute(item);

                  return (
                    <div className="rp-bus-card" key={i}>

                      {/* Card top strip */}
                      <div className="rp-card-strip" />

                      {/* Card header */}
                      <div className="rp-card-head">
                        <div className="rp-bus-icon">🚌</div>
                        <div className="rp-bus-meta">
                          <span className="rp-bus-number">{item.busNumber}</span>
                          {item.gps && (
                            <span className="rp-bus-gps">
                              <IcoGps /> {item.gps}
                            </span>
                          )}
                        </div>
                        {totalSeats && (
                          <div className="rp-cap-badge">
                            <span className="rp-cap-num">{totalSeats}</span>
                            <span className="rp-cap-lbl">seats</span>
                          </div>
                        )}
                      </div>

                      {/* Route */}
                      {routeStr && (
                        <div className="rp-info-row">
                          <span className="rp-info-key"><IcoRoute /> Route</span>
                          <span className="rp-route-chip">{routeStr}</span>
                        </div>
                      )}

                      {/* Driver */}
                      {item.driverName && (
                        <div className="rp-driver-row">
                          <div className="rp-driver-avatar">{initials(item.driverName)}</div>
                          <div className="rp-driver-details">
                            <span className="rp-driver-name">{item.driverName}</span>
                            <span className="rp-driver-phone">
                              <IcoPhone /> {item.mobile || "—"}
                            </span>
                          </div>
                          <span className="rp-driver-badge">Driver</span>
                        </div>
                      )}

                      {/* Students */}
                      {item.students?.length > 0 && (
                        <div className="rp-students-section">
                          <div className="rp-students-head">
                            <span className="rp-students-label">
                              <IcoUsers /> Passengers
                            </span>
                            <span className="rp-students-pill">
                              {item.students.length} students
                            </span>
                          </div>
                          <div className="rp-students-list">
                            {item.students.map((s, idx) => (
                              <div className="rp-student-row" key={idx}>
                                <div className="rp-student-avatar">{initials(s.name)}</div>
                                <div className="rp-student-info">
                                  <span className="rp-student-name">{s.name}</span>
                                  <span className="rp-student-meta">
                                    {s.enrollmentNumber} · {s.branch}
                                  </span>
                                  <span className="rp-student-stop">
                                    <IcoPin /> {s.stopName}
                                  </span>
                                </div>
                                <span className="rp-seat-tag">
                                  <IcoSeat /> {s.seat}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Occupancy */}
                      {pct !== null && occupied !== undefined && (
                        <div className="rp-occ-section">
                          <div className="rp-occ-row">
                            <span className="rp-occ-label">Seat Occupancy</span>
                            <span className="rp-occ-nums">{occupied} / {totalSeats}</span>
                          </div>
                          <div className="rp-occ-track">
                            <div
                              className={`rp-occ-fill ${occupancyColor(pct)}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className={`rp-occ-pct ${occupancyColor(pct)}`}>
                            {pct}% full
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── Pre-generate placeholder ── */}
        {!loading && !generated && (
          <div className="rp-placeholder">
            <div className="rp-placeholder-icon">📊</div>
            <p>No report generated yet</p>
            <span>Choose a report type above and click Generate Report</span>
          </div>
        )}

      </div>
    </Layout>
  );
}

export default Reports;