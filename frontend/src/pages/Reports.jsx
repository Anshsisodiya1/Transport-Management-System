import { useState, useEffect } from "react";
import API from "../services/api";
import Layout from "../components/Layout";
import {
  MdOutlineBarChart,
  MdDirectionsBus,
  MdPerson,
  MdAltRoute,
  MdSchool,
  MdEventSeat,
  MdSearch,
  MdCheck,
  MdChevronRight,
  MdPictureAsPdf,
  MdPhone,
  MdLocationPin,
  MdSpeed,
  MdGroup,
  MdGpsFixed,
  MdRefresh,
  MdTableRows,
  MdGridView,
  MdExpandMore,
  MdExpandLess,
  MdDownload,
  MdAssessment,
} from "react-icons/md";
import { HiSparkles } from "react-icons/hi2";
import "../styles/reports.css";

/* ─── Config ────────────────────────────────────────────────────── */
const UNIVERSITY_NAME = "Graphic Era Hill University";
const REPORT_TYPES = [
  { value: "buses/all",            Icon: MdDirectionsBus,  label: "All Buses",       sub: "Complete fleet list",   color: "#3b82f6", accent: "#dbeafe" },
  { value: "buses/with-driver",    Icon: MdPerson,         label: "Bus + Driver",    sub: "Driver assignments",    color: "#8b5cf6", accent: "#ede9fe" },
  { value: "buses/with-route",     Icon: MdAltRoute,       label: "Bus + Route",     sub: "Route allocations",     color: "#10b981", accent: "#d1fae5" },
  { value: "buses/with-students",  Icon: MdSchool,         label: "Bus + Students",  sub: "Passenger manifest",    color: "#f59e0b", accent: "#fef3c7" },
  { value: "buses/seat-occupancy", Icon: MdEventSeat,      label: "Seat Occupancy",  sub: "Capacity utilisation",  color: "#ef4444", accent: "#fee2e2" },
];

/* ─── Helpers ───────────────────────────────────────────────────── */
const initials = (name) =>
  name ? name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "?";

const occClass = (pct) => {
  if (pct >= 90) return "occ-danger";
  if (pct >= 65) return "occ-warn";
  return "occ-safe";
};

const formatRoute = (item) => {
  if (item.route && typeof item.route === "object")
    return `${item.route.routeNumber} – ${item.route.routeName}`;
  if (item.routeNumber) return `${item.routeNumber} – ${item.routeName}`;
  return null;
};

/* ─── PDF Generator (jsPDF-free, pure HTML print) ───────────────── */
const generatePDF = (data, reportLabel) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const tableRows = data.map((item, idx) => {
    const totalSeats = item.totalSeats ?? item.capacity ?? "—";
    const occupied   = item.occupied ?? item.students?.length ?? "—";
    const pct        = (typeof totalSeats === "number" && typeof occupied === "number")
      ? Math.round((occupied / totalSeats) * 100) : null;
    const routeStr   = formatRoute(item) || "—";
    const barColor   = pct >= 90 ? "#ef4444" : pct >= 65 ? "#f59e0b" : "#16a34a";

    return `
    <tr class="${idx % 2 === 0 ? "even" : "odd"}">
      <td class="td-center bold">${idx + 1}</td>
      <td class="td-bus"><span class="bus-num">${item.busNumber ?? "—"}</span></td>
      <td>${item.driverName ?? "—"}</td>
      <td>${item.mobile ?? "—"}</td>
      <td>${routeStr}</td>
      <td class="td-center">${totalSeats}</td>
      <td class="td-center">${occupied}</td>
      <td class="td-center">
        ${pct !== null ? `
        <div class="occ-cell">
          <div class="occ-bar-wrap"><div class="occ-bar" style="width:${pct}%;background:${barColor}"></div></div>
          <span class="occ-pct" style="color:${barColor}">${pct}%</span>
        </div>` : "—"}
      </td>
    </tr>`;
  }).join("");

  // Student detail cards (if any bus has students)
  const hasStudents = data.some((d) => d.students?.length > 0);
  const studentSection = hasStudents ? `
    <div class="section-break"></div>
    <div class="section-title">Passenger Manifest Details</div>
    ${data.filter((d) => d.students?.length > 0).map((item) => `
      <div class="student-block">
        <div class="student-block-header">
          <span class="bus-num-sm">🚌 Bus ${item.busNumber}</span>
          <span class="student-count">${item.students.length} passengers</span>
        </div>
        <table class="inner-table">
          <thead>
            <tr>
              <th>#</th><th>Student Name</th><th>Enrollment No.</th>
              <th>Branch</th><th>Stop</th><th>Seat</th>
            </tr>
          </thead>
          <tbody>
            ${item.students.map((s, i) => `
              <tr class="${i % 2 === 0 ? "even" : "odd"}">
                <td class="td-center">${i + 1}</td>
                <td class="bold">${s.name}</td>
                <td>${s.enrollmentNumber}</td>
                <td>${s.branch}</td>
                <td>${s.stopName}</td>
                <td class="td-center">${s.seat}</td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>`).join("")}` : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>${UNIVERSITY_NAME} – ${reportLabel}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Segoe UI', 'Arial', sans-serif;
    color: #1e293b;
    background: #fff;
    font-size: 12px;
    line-height: 1.5;
  }

  /* ── Cover ── */
  .cover {
    background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1d4ed8 100%);
    color: #fff;
    padding: 36px 40px 28px;
    position: relative;
    overflow: hidden;
  }
  .cover::before {
    content: '';
    position: absolute;
    top: -40px; right: -40px;
    width: 220px; height: 220px;
    border-radius: 50%;
    background: rgba(255,255,255,0.05);
  }
  .cover::after {
    content: '';
    position: absolute;
    bottom: -20px; left: 30%;
    width: 120px; height: 120px;
    border-radius: 50%;
    background: rgba(255,255,255,0.04);
  }
  .cover-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
  }
  .univ-logo {
    width: 52px; height: 52px;
    background: rgba(255,255,255,0.15);
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 26px;
    flex-shrink: 0;
    border: 1px solid rgba(255,255,255,0.2);
  }
  .cover-text { flex: 1; }
  .univ-name {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: rgba(255,255,255,0.65);
    margin-bottom: 4px;
  }
  .report-title {
    font-size: 24px;
    font-weight: 800;
    color: #fff;
    letter-spacing: -0.5px;
    line-height: 1.2;
  }
  .report-subtitle {
    font-size: 13px;
    color: rgba(255,255,255,0.55);
    margin-top: 4px;
  }
  .cover-meta {
    text-align: right;
    font-size: 11px;
    color: rgba(255,255,255,0.5);
    line-height: 1.7;
    flex-shrink: 0;
  }
  .cover-meta strong { color: rgba(255,255,255,0.85); }
  .cover-divider {
    height: 1px;
    background: rgba(255,255,255,0.15);
    margin: 18px 0 14px;
  }
  .cover-stats {
    display: flex;
    gap: 24px;
  }
  .stat-item { }
  .stat-num {
    font-size: 22px;
    font-weight: 800;
    color: #fff;
  }
  .stat-label {
    font-size: 10px;
    color: rgba(255,255,255,0.5);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  /* ── Body ── */
  .body-wrap { padding: 28px 40px; }

  .section-title {
    font-size: 13px;
    font-weight: 800;
    color: #0f172a;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 2px solid #e2e8f0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .section-title::before {
    content: '';
    width: 4px; height: 16px;
    background: #2563eb;
    border-radius: 2px;
    display: inline-block;
  }

  /* ── Summary Table ── */
  .main-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11.5px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    border-radius: 10px;
    overflow: hidden;
  }
  .main-table thead tr {
    background: #0f172a;
    color: #fff;
  }
  .main-table thead th {
    padding: 11px 14px;
    text-align: left;
    font-weight: 700;
    font-size: 10.5px;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    white-space: nowrap;
  }
  .main-table tbody tr.even { background: #fff; }
  .main-table tbody tr.odd  { background: #f8fafc; }
  .main-table tbody tr:hover { background: #eff6ff; }
  .main-table td {
    padding: 10px 14px;
    border-bottom: 1px solid #f1f5f9;
    vertical-align: middle;
  }
  .main-table tbody tr:last-child td { border-bottom: none; }

  .td-center { text-align: center; }
  .bold { font-weight: 700; }
  .bus-num {
    background: #eff6ff;
    color: #1d4ed8;
    font-weight: 800;
    padding: 3px 10px;
    border-radius: 6px;
    font-size: 12px;
    display: inline-block;
  }
  .td-bus { white-space: nowrap; }

  /* Occupancy in table */
  .occ-cell { display: flex; align-items: center; gap: 6px; }
  .occ-bar-wrap { flex: 1; background: #e2e8f0; border-radius: 99px; height: 6px; min-width: 50px; overflow: hidden; }
  .occ-bar { height: 100%; border-radius: 99px; }
  .occ-pct { font-weight: 700; font-size: 11px; min-width: 30px; }

  /* ── Student blocks ── */
  .section-break { margin: 28px 0; border-top: 2px dashed #e2e8f0; }

  .student-block { margin-bottom: 20px; break-inside: avoid; }
  .student-block-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px 8px 0 0;
    padding: 9px 14px;
  }
  .bus-num-sm {
    font-size: 13px;
    font-weight: 800;
    color: #1d4ed8;
  }
  .student-count {
    font-size: 11px;
    color: #64748b;
    background: #e0f2fe;
    color: #0369a1;
    padding: 2px 9px;
    border-radius: 99px;
    font-weight: 600;
  }
  .inner-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
    border: 1px solid #e2e8f0;
    border-top: none;
    border-radius: 0 0 8px 8px;
    overflow: hidden;
  }
  .inner-table thead tr { background: #1e293b; color: #fff; }
  .inner-table thead th {
    padding: 8px 12px;
    text-align: left;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
  }
  .inner-table tbody tr.even { background: #fff; }
  .inner-table tbody tr.odd  { background: #f8fafc; }
  .inner-table td {
    padding: 8px 12px;
    border-bottom: 1px solid #f1f5f9;
  }
  .inner-table tbody tr:last-child td { border-bottom: none; }

  /* ── Footer ── */
  .pdf-footer {
    margin-top: 32px;
    padding: 14px 40px;
    background: #f8fafc;
    border-top: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 10.5px;
    color: #94a3b8;
  }
  .footer-left { font-weight: 600; color: #64748b; }
  .footer-right { color: #94a3b8; }

  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .cover { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>

<!-- Cover -->
<div class="cover">
  <div class="cover-top">
    <div class="univ-logo">🎓</div>
    <div class="cover-text">
      <div class="univ-name">${UNIVERSITY_NAME} · Transport Management System</div>
      <div class="report-title">${reportLabel}</div>
      <div class="report-subtitle">Official Fleet & Operations Report</div>
    </div>
    <div class="cover-meta">
      <strong>Generated</strong><br/>
      ${dateStr}<br/>
      ${timeStr}
    </div>
  </div>
  <div class="cover-divider"></div>
  <div class="cover-stats">
    <div class="stat-item">
      <div class="stat-num">${data.length}</div>
      <div class="stat-label">Total Buses</div>
    </div>
    ${data.some((d) => d.driverName) ? `
    <div class="stat-item">
      <div class="stat-num">${data.filter((d) => d.driverName).length}</div>
      <div class="stat-label">With Driver</div>
    </div>` : ""}
    ${data.some((d) => d.students?.length > 0) ? `
    <div class="stat-item">
      <div class="stat-num">${data.reduce((s, d) => s + (d.students?.length ?? 0), 0)}</div>
      <div class="stat-label">Total Students</div>
    </div>` : ""}
    ${data.some((d) => d.totalSeats ?? d.capacity) ? `
    <div class="stat-item">
      <div class="stat-num">${data.reduce((s, d) => s + (d.totalSeats ?? d.capacity ?? 0), 0)}</div>
      <div class="stat-label">Total Seats</div>
    </div>` : ""}
  </div>
</div>

<!-- Body -->
<div class="body-wrap">
  <div class="section-title">Fleet Summary — ${reportLabel}</div>
  <table class="main-table">
    <thead>
      <tr>
        <th>#</th>
        <th>Bus No.</th>
        <th>Driver</th>
        <th>Mobile</th>
        <th>Route</th>
        <th style="text-align:center">Seats</th>
        <th style="text-align:center">Occupied</th>
        <th style="text-align:center">Occupancy</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
  </table>

  ${studentSection}
</div>

<!-- Footer -->
<div class="pdf-footer">
  <span class="footer-left">🚌 ${UNIVERSITY_NAME} · Transport Management System</span>
  <span class="footer-right">Confidential — For internal use only · ${dateStr}</span>
</div>

<script>window.onload = () => window.print();</script>
</body>
</html>`;

  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
};

/* ─── Reports Page ───────────────────────────────────────────────── */
function Reports() {
  const [type, setType]               = useState("");
  const [data, setData]               = useState([]);
  const [loading, setLoading]         = useState(false);
  const [generated, setGenerated]     = useState(false);
  const [activeLabel, setActiveLabel] = useState("");
  const [activeColor, setActiveColor] = useState("#3b82f6");
  const [search, setSearch]           = useState("");
  const [viewMode, setViewMode]       = useState("grid");
  const [mounted, setMounted]         = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const generateReport = async () => {
    if (!type) return;
    try {
      setLoading(true);
      setGenerated(false);
      setSearch("");
      const res = await API.get(`/reports/${type}`);
      setData(res.data || []);
      setGenerated(true);
      const rt = REPORT_TYPES.find((r) => r.value === type);
      setActiveLabel(rt?.label || "");
      setActiveColor(rt?.color || "#3b82f6");
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

  const totalSeatsSum = data.reduce((s, d) => s + (d.totalSeats ?? d.capacity ?? 0), 0);
  const totalOccupied = data.reduce((s, d) => s + (d.occupied ?? d.students?.length ?? 0), 0);

  return (
    <Layout>
      <div className={`rp-page${mounted ? " rp-mounted" : ""}`}>

        {/* ── Header ── */}
        <div className="rp-header">
          <div className="rp-header-left">
            <div className="rp-header-icon-wrap">
              <MdAssessment size={24} />
            </div>
            <div>
              <div className="rp-header-eyebrow">Transport Management System</div>
              <h1 className="rp-header-title">Reports Centre</h1>
            </div>
          </div>
          {generated && (
            <div className="rp-header-badge" style={{ background: activeColor + "15", color: activeColor, borderColor: activeColor + "40" }}>
              <MdCheck size={13} />
              <span>{filtered.length} record{filtered.length !== 1 ? "s" : ""} found</span>
            </div>
          )}
        </div>

        {/* ── Stat Summary (when generated) ── */}
        {generated && (
          <div className="rp-stats-row">
            {[
              { label: "Buses", value: data.length, icon: MdDirectionsBus },
              { label: "Total Seats", value: totalSeatsSum || "—", icon: MdEventSeat },
              { label: "Occupied", value: totalOccupied || "—", icon: MdGroup },
              { label: "Avg Occupancy", value: totalSeatsSum ? `${Math.round((totalOccupied / totalSeatsSum) * 100)}%` : "—", icon: MdSpeed },
            ].map(({ label, value, icon: Icon }) => (
              <div className="rp-stat-card" key={label}>
                <div className="rp-stat-icon"><Icon size={18} /></div>
                <div className="rp-stat-body">
                  <div className="rp-stat-value">{value}</div>
                  <div className="rp-stat-label">{label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Control Panel ── */}
        <div className="rp-panel">
          <div className="rp-panel-header">
            <span className="rp-panel-title">Select Report Type</span>
            <span className="rp-panel-hint">Choose a category to generate a fleet report</span>
          </div>

          <div className="rp-type-grid">
            {REPORT_TYPES.map((rt) => {
              const active = type === rt.value;
              return (
                <button
                  key={rt.value}
                  className={`rp-type-btn${active ? " active" : ""}`}
                  style={active ? {
                    borderColor: rt.color,
                    background: rt.accent,
                    boxShadow: `0 0 0 3px ${rt.color}22`,
                  } : {}}
                  onClick={() => setType(rt.value)}
                >
                  <div
                    className="rp-type-icon"
                    style={{
                      background: active ? rt.color : "#f1f5f9",
                      color: active ? "#fff" : rt.color,
                    }}
                  >
                    <rt.Icon size={20} />
                  </div>
                  <div className="rp-type-info">
                    <span className="rp-type-label" style={{ color: active ? rt.color : "#0f172a" }}>
                      {rt.label}
                    </span>
                    <span className="rp-type-sub">{rt.sub}</span>
                  </div>
                  {active && (
                    <span className="rp-type-check" style={{ background: rt.color }}>
                      <MdCheck size={11} color="#fff" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="rp-panel-footer">
            {generated && (
              <button className="rp-btn-reset" onClick={() => { setGenerated(false); setData([]); setType(""); }}>
                <MdRefresh size={15} /> Reset
              </button>
            )}
            <button
              className="rp-btn-generate"
              onClick={generateReport}
              disabled={!type || loading}
            >
              {loading ? (
                <><span className="rp-spinner" /> Generating…</>
              ) : (
                <><HiSparkles size={15} /> Generate Report</>
              )}
            </button>
          </div>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="rp-loading">
            <div className="rp-loading-ring" />
            <span>Fetching report data…</span>
          </div>
        )}

        {/* ── Results ── */}
        {!loading && generated && (
          <div className="rp-results-section">
            {/* Toolbar */}
            <div className="rp-toolbar">
              <div className="rp-toolbar-left">
                <div className="rp-toolbar-title">
                  <span className="rp-toolbar-dot" style={{ background: activeColor }} />
                  {activeLabel}
                </div>
                <span className="rp-toolbar-count">{filtered.length} / {data.length}</span>
              </div>
              <div className="rp-toolbar-right">
                <div className="rp-search">
                  <MdSearch size={15} color="#94a3b8" />
                  <input
                    className="rp-search-input"
                    placeholder="Search bus or driver…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="rp-view-toggle">
                  <button className={`rp-vtbtn${viewMode === "grid" ? " active" : ""}`} onClick={() => setViewMode("grid")} title="Grid">
                    <MdGridView size={15} />
                  </button>
                  <button className={`rp-vtbtn${viewMode === "table" ? " active" : ""}`} onClick={() => setViewMode("table")} title="Table">
                    <MdTableRows size={15} />
                  </button>
                </div>
                <button className="rp-btn-pdf" onClick={() => generatePDF(filtered, activeLabel)}>
                  <MdDownload size={15} /> Export PDF
                </button>
              </div>
            </div>

            {/* Empty */}
            {filtered.length === 0 ? (
              <div className="rp-empty">
                <MdSearch size={36} color="#cbd5e1" />
                <p>No results match your search</p>
                <span>Try clearing the filter</span>
              </div>
            ) : viewMode === "grid" ? (
              <div className="rp-grid">
                {filtered.map((item, i) => (
                  <BusCard key={i} item={item} index={i} />
                ))}
              </div>
            ) : (
              <TableView data={filtered} />
            )}
          </div>
        )}

        {/* ── Placeholder ── */}
        {!loading && !generated && (
          <div className="rp-placeholder">
            <div className="rp-placeholder-bg" />
            <div className="rp-placeholder-icon">
              <MdOutlineBarChart size={32} color="#6366f1" />
            </div>
            <p className="rp-placeholder-title">No Report Generated</p>
            <span className="rp-placeholder-sub">Select a report type above and click Generate Report to view fleet data</span>
          </div>
        )}

      </div>
    </Layout>
  );
}

/* ─── Bus Card ───────────────────────────────────────────────────── */
function BusCard({ item, index }) {
  const [expanded, setExpanded] = useState(false);

  const totalSeats = item.totalSeats ?? item.capacity;
  const occupied   = item.occupied ?? item.students?.length;
  const pct        = totalSeats ? Math.round((occupied / totalSeats) * 100) : null;
  const routeStr   = formatRoute(item);
  const occ        = pct !== null ? occClass(pct) : "";

  return (
    <div className="rp-card" style={{ animationDelay: `${index * 40}ms` }}>
      {/* Top strip */}
      <div className={`rp-card-strip${pct !== null ? ` strip-${occ}` : ""}`} />

      {/* Header */}
      <div className="rp-card-top">
        <div className="rp-card-bus-icon">
          <MdDirectionsBus size={20} />
        </div>
        <div className="rp-card-bus-info">
          <span className="rp-card-bus-num">{item.busNumber}</span>
          {item.gps && (
            <span className="rp-card-gps">
              <MdGpsFixed size={10} /> {item.gps}
            </span>
          )}
        </div>
        {totalSeats && (
          <div className="rp-card-seats">
            <MdEventSeat size={12} />
            <span>{totalSeats} seats</span>
          </div>
        )}
      </div>

      <div className="rp-card-body">
        {/* Route */}
        {routeStr && (
          <div className="rp-info-row">
            <span className="rp-info-key"><MdAltRoute size={12} /> Route</span>
            <span className="rp-route-tag">{routeStr}</span>
          </div>
        )}

        {/* Driver */}
        {item.driverName && (
          <div className="rp-driver-row">
            <div className="rp-avatar rp-driver-avatar">{initials(item.driverName)}</div>
            <div className="rp-driver-info">
              <span className="rp-driver-name">{item.driverName}</span>
              <span className="rp-driver-phone"><MdPhone size={10} /> {item.mobile || "—"}</span>
            </div>
            <span className="rp-driver-chip">Driver</span>
          </div>
        )}

        {/* Students toggle */}
        {item.students?.length > 0 && (
          <div className="rp-students-block">
            <button className="rp-students-toggle" onClick={() => setExpanded(!expanded)}>
              <span className="rp-students-toggle-l">
                <MdGroup size={13} color="#6366f1" />
                <span>Passengers</span>
                <span className="rp-count-chip">{item.students.length}</span>
              </span>
              {expanded ? <MdExpandLess size={16} color="#94a3b8" /> : <MdExpandMore size={16} color="#94a3b8" />}
            </button>

            {expanded && (
              <div className="rp-students-list">
                {item.students.map((s, idx) => (
                  <div className="rp-student-row" key={idx}>
                    <div className="rp-avatar rp-student-avatar">{initials(s.name)}</div>
                    <div className="rp-student-info">
                      <span className="rp-student-name">{s.name}</span>
                      <span className="rp-student-sub">{s.enrollmentNumber} · {s.branch}</span>
                      <span className="rp-student-stop"><MdLocationPin size={9} /> {s.stopName}</span>
                    </div>
                    <span className="rp-seat-chip"><MdEventSeat size={10} /> {s.seat}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Occupancy bar */}
        {pct !== null && occupied !== undefined && (
          <div className={`rp-occ ${occ}`}>
            <div className="rp-occ-top">
              <span className="rp-occ-label"><MdSpeed size={12} /> Seat Occupancy</span>
              <span className="rp-occ-nums">{occupied} / {totalSeats}</span>
            </div>
            <div className="rp-occ-track">
              <div className="rp-occ-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="rp-occ-pct">{pct}% occupied</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Table View ─────────────────────────────────────────────────── */
function TableView({ data }) {
  return (
    <div className="rp-table-wrap">
      <table className="rp-table">
        <thead>
          <tr>
            {["#", "Bus No.", "Driver", "Mobile", "Route", "Seats", "Occupied", "Occupancy"].map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, i) => {
            const totalSeats = item.totalSeats ?? item.capacity;
            const occupied   = item.occupied ?? item.students?.length;
            const pct        = totalSeats ? Math.round((occupied / totalSeats) * 100) : null;
            const occ        = pct !== null ? occClass(pct) : "";
            const routeStr   = formatRoute(item);

            return (
              <tr key={i}>
                <td className="rp-td-num">{i + 1}</td>
                <td>
                  <div className="rp-td-bus">
                    <MdDirectionsBus size={14} color="#6366f1" />
                    <strong>{item.busNumber}</strong>
                  </div>
                </td>
                <td>
                  {item.driverName ? (
                    <div className="rp-td-driver">
                      <div className="rp-avatar rp-td-avatar">{initials(item.driverName)}</div>
                      {item.driverName}
                    </div>
                  ) : <span className="rp-dash">—</span>}
                </td>
                <td>{item.mobile || <span className="rp-dash">—</span>}</td>
                <td>
                  {routeStr ? (
                    <span className="rp-route-tag-sm">{routeStr}</span>
                  ) : <span className="rp-dash">—</span>}
                </td>
                <td className="rp-td-center">{totalSeats ?? <span className="rp-dash">—</span>}</td>
                <td className="rp-td-center">{occupied ?? <span className="rp-dash">—</span>}</td>
                <td>
                  {pct !== null ? (
                    <div className="rp-td-occ">
                      <div className="rp-td-occ-track">
                        <div className={`rp-td-occ-fill ${occ}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className={`rp-td-pct ${occ}`}>{pct}%</span>
                    </div>
                  ) : <span className="rp-dash">—</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default Reports;