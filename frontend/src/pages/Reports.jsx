import { useState } from "react";
import API from "../services/api";
import Layout from "../components/Layout";

function Reports() {
  const [type, setType] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // ================= FETCH =================
  const generateReport = async () => {
    if (!type) return alert("Select report type");

    try {
      setLoading(true);
      const res = await API.get(`/reports/${type}`);
      setData(res.data || []);
    } catch (err) {
      console.log(err);
      alert("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  // ================= HELPERS =================
  const formatRoute = (route) => {
    if (!route) return "-";
    if (typeof route === "object") {
      return `${route.routeNumber} - ${route.routeName}`;
    }
    return route;
  };

  return (
    <Layout>
      <h2>📊 Reports Center</h2>

      {/* ================= SELECT ================= */}
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="">Select Report</option>

        <option value="buses/all">🚌 All Buses</option>
        <option value="buses/with-driver">👨‍✈️ Bus with Driver</option>
        <option value="buses/with-route">🛣 Bus with Route</option>
        <option value="buses/with-students">🎓 Bus with Students</option>
        <option value="buses/seat-occupancy">💺 Seat Occupancy</option>
      </select>

      <button onClick={generateReport} disabled={!type || loading}>
        {loading ? "Generating..." : "Generate Report"}
      </button>

      {/* ================= LOADING ================= */}
      {loading && <p>⏳ Loading...</p>}

      {/* ================= EMPTY ================= */}
      {!loading && data.length === 0 && <p>No report generated</p>}

      {/* ================= CARDS ================= */}
      <div style={{ marginTop: "20px", display: "grid", gap: "15px" }}>
        {data.map((item, i) => (
          <div
            key={i}
            style={{
              padding: "15px",
              borderRadius: "10px",
              background: "#fff",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              borderLeft: "5px solid #007bff",
            }}
          >
            {/* 🚌 BUS */}
            <h3>🚌 {item.busNumber}</h3>

            <p>
              <b>Capacity:</b> {item.capacity ?? item.totalSeats ?? "-"} <br />
              <b>GPS:</b> {item.gps || "-"}
            </p>

            {/* 🛣 ROUTE */}
            <p>
              <b>Route:</b>{" "}
              {item.route
                ? item.route
                : item.routeNumber
                  ? `${item.routeNumber} - ${item.routeName}`
                  : "-"}
            </p>

            {/* 👨‍✈️ DRIVER */}
            {item.driverName && (
              <p>
                <b>Driver:</b> {item.driverName} <br />
                <b>Mobile:</b> {item.mobile}
              </p>
            )}

            {/* 🎓 STUDENTS */}
            {item.students && item.students.length > 0 && (
              <div>
                <b>Students:</b>

                <div style={{ marginTop: "8px" }}>
                  {item.students.map((s, index) => (
                    <div
                      key={index}
                      style={{
                        padding: "8px",
                        marginBottom: "6px",
                        background: "#f8f9fa",
                        borderRadius: "6px",
                      }}
                    >
                      <div>
                        <b>Name:</b> {s.name}
                      </div>
                      <div>
                        <b>Enrollment:</b> {s.enrollmentNumber}
                      </div>
                      <div>
                        <b>Branch:</b> {s.branch}
                      </div>
                      <div>
                        <b>Stop:</b> {s.stopName}
                      </div>
                      <div>
                        <b>Seat:</b> {s.seat}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* 💺 SEAT OCCUPANCY */}
            {item.occupied !== undefined && (
              <p>
                <b>Occupied Seats:</b> {item.occupied} /{" "}
                {item.totalSeats || item.capacity}
              </p>
            )}
          </div>
        ))}
      </div>
    </Layout>
  );
}

export default Reports;
