import React from "react";

function RouteViewer({ route, onClose }) {
  if (!route) return null;

  const allStops = [
    route.startPoint,
    ...(route.stops || []),
    route.endPoint,
  ];

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* HEADER */}
        <div style={styles.header}>
          <h2>
            🚆 Route {route.routeNumber} - {route.routeName}
          </h2>
          <button onClick={onClose} style={styles.closeBtn}>
            ✖
          </button>
        </div>

        <h3 style={{ marginTop: "10px" }}>Live Route Map</h3>

        {/* TRAIN STYLE ROUTE */}
        <div style={styles.container}>
          {allStops.map((stop, idx) => (
            <div key={idx} style={styles.row}>
              {/* LEFT LINE */}
              <div style={styles.left}>
                <div style={styles.dot}></div>
                {idx !== allStops.length - 1 && (
                  <div style={styles.line}></div>
                )}
              </div>

              {/* STOP NAME */}
              <div style={styles.stopName}>{stop}</div>

              {/* TIME RIGHT SIDE */}
              <div style={styles.time}>
                {route.timings?.[idx] ? `(${route.timings[idx]})` : "( )"}
              </div>
            </div>
          ))}
        </div>

        {/* RAW TIMINGS */}
        <h3 style={{ marginTop: "20px" }}>All Timings</h3>
        <div style={styles.timeRow}>
          {route.timings?.map((t, i) => (
            <span key={i} style={styles.timeBox}>
              {t || ""}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },

  modal: {
    width: "700px",
    maxHeight: "85vh",
    overflowY: "auto",
    background: "#fff",
    borderRadius: "12px",
    padding: "20px",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  closeBtn: {
    border: "none",
    background: "red",
    color: "#fff",
    padding: "6px 10px",
    cursor: "pointer",
    borderRadius: "5px",
  },

  container: {
    marginTop: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "0px",
  },

  row: {
    display: "flex",
    alignItems: "center",
    position: "relative",
    paddingBottom: "20px",
  },

  left: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "30px",
  },

  dot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    background: "#007bff",
    zIndex: 2,
  },

  line: {
    width: "2px",
    height: "40px",
    background: "#ccc",
    marginTop: "2px",
  },

  stopName: {
    flex: 1,
    paddingLeft: "10px",
    fontWeight: "500",
    fontSize: "15px",
  },

  time: {
    width: "80px",
    textAlign: "right",
    fontSize: "12px",
    color: "#666",
  },

  timeRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },

  timeBox: {
    background: "#e6f0ff",
    padding: "5px 10px",
    borderRadius: "6px",
    fontSize: "12px",
  },
};

export default RouteViewer;