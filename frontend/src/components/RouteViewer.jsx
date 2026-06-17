import React from "react";
import { FaBus, FaMapMarkerAlt, FaClock, FaRoute, FaTimes } from "react-icons/fa";
import { MdLocationOn, MdLocationSearching } from "react-icons/md";
import { HiArrowNarrowRight } from "react-icons/hi";

function RouteViewer({ route, onClose }) {
  if (!route) return null;

  const allStops = [
    route.startPoint,
    ...(route.stops || []).map((s) => (typeof s === "object" ? s.name : s)),
    route.endPoint,
  ];

  return (
    <div style={styles.modal}>
      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerIcon}>
            <FaRoute size={18} color="#3b82f6" />
          </div>
          <div>
            <h2 style={styles.headerTitle}>
              Route {route.routeNumber}
            </h2>
            <p style={styles.headerSub}>{route.routeName}</p>
          </div>
        </div>
        <button onClick={onClose} style={styles.closeBtn}>
          <FaTimes size={13} />
        </button>
      </div>

      {/* JOURNEY FLOW */}
      <div style={styles.journeyRow}>
        <div style={styles.journeyPoint}>
          <MdLocationSearching size={16} color="#22c55e" />
          <span style={{ ...styles.endpoint, color: "#15803d" }}>
            {route.startPoint}
          </span>
        </div>
        <HiArrowNarrowRight size={20} color="#94a3b8" style={{ flexShrink: 0 }} />
        <div style={styles.journeyPoint}>
          <MdLocationOn size={16} color="#ef4444" />
          <span style={{ ...styles.endpoint, color: "#b91c1c" }}>
            {route.endPoint}
          </span>
        </div>
      </div>

      {/* STOPS */}
      <div style={styles.sectionHeader}>
        <FaBus size={13} color="#64748b" />
        <h4 style={styles.sectionTitle}>Stops</h4>
      </div>

      <div style={styles.container}>
        {allStops.map((stop, idx) => {
          const isFirst = idx === 0;
          const isLast = idx === allStops.length - 1;
          const dotColor = isFirst ? "#22c55e" : isLast ? "#ef4444" : "#3b82f6";

          return (
            <div key={idx} style={styles.row}>
              {/* LEFT TIMELINE */}
              <div style={styles.left}>
                <div style={{ ...styles.dot, background: dotColor }} />
                {!isLast && <div style={styles.line} />}
              </div>

              {/* STOP INFO */}
              <div style={styles.stopBody}>
                <div style={styles.stopName}>
                  <FaMapMarkerAlt
                    size={11}
                    color={dotColor}
                    style={{ marginRight: 6, flexShrink: 0, marginTop: 1 }}
                  />
                  {stop}
                </div>
                {route.timings?.[idx] && (
                  <div style={styles.stopTime}>
                    <FaClock size={10} color="#94a3b8" style={{ marginRight: 4 }} />
                    {route.timings[idx]}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
        
    </div>
  );
}

const styles = {
  modal: {
    background: "#fff",
    borderRadius: "14px",
    padding: "24px",
    width: "100%",
    maxHeight: "85vh",
    overflowY: "auto",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
    paddingBottom: "16px",
    borderBottom: "1px solid #f1f5f9",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  headerIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: 700,
    color: "#0f172a",
  },
  headerSub: {
    margin: "2px 0 0",
    fontSize: "13px",
    color: "#64748b",
  },
  closeBtn: {
    border: "none",
    background: "#fee2e2",
    color: "#ef4444",
    width: "30px",
    height: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    borderRadius: "8px",
    fontWeight: 700,
  },
  journeyRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    background: "#f8fafc",
    borderRadius: "10px",
    padding: "12px 16px",
    marginBottom: "24px",
    border: "1px solid #e2e8f0",
  },
  journeyPoint: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  endpoint: {
    fontWeight: 600,
    fontSize: "13px",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    marginBottom: "12px",
  },
  sectionTitle: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#475569",
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: "0.6px",
  },
  container: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "24px",
  },
  row: {
    display: "flex",
    alignItems: "flex-start",
  },
  left: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "24px",
    flexShrink: 0,
  },
  dot: {
    width: "11px",
    height: "11px",
    borderRadius: "50%",
    zIndex: 2,
    marginTop: "5px",
    flexShrink: 0,
  },
  line: {
    width: "2px",
    flex: 1,
    minHeight: "32px",
    background: "#e2e8f0",
    marginTop: "3px",
  },
  stopBody: {
    paddingLeft: "10px",
    paddingBottom: "20px",
    flex: 1,
  },
  stopName: {
    display: "flex",
    alignItems: "flex-start",
    fontWeight: 500,
    fontSize: "14px",
    color: "#1e293b",
  },
  stopTime: {
    display: "flex",
    alignItems: "center",
    fontSize: "12px",
    color: "#94a3b8",
    marginTop: "3px",
    marginLeft: "17px",
  },
  timeRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  timeBox: {
    display: "inline-flex",
    alignItems: "center",
    background: "#eff6ff",
    color: "#3b82f6",
    padding: "5px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 600,
    border: "1px solid #bfdbfe",
  },
};

export default RouteViewer;