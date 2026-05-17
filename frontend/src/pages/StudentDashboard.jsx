import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L from "leaflet";

// ================= FIX LEAFLET ICON =================
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

// ================= SOCKET =================
const socket = io("http://localhost:5000");

function StudentDashboard() {
  const [data, setData] = useState(null);
  const [busLocation, setBusLocation] = useState(null);
  const [eta, setEta] = useState(null);
  const [openProfile, setOpenProfile] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // ================= FETCH DATA =================
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/student/dashboard",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setData(res.data);
      } catch (err) {
        console.log("❌ Fetch Error:", err.message);
      }
    };

    fetchStudent();
  }, [token]);

  // ================= SOCKET =================
  useEffect(() => {
    if (!data?.bus?._id) return;

    socket.emit("joinBusRoom", data.bus._id);

    socket.on("liveLocation", (loc) => {
      if (String(loc.busId) === String(data.bus._id)) {
        setBusLocation([loc.lat, loc.lng]);
      }
    });

    socket.on("tripStarted", () => {
      alert("🚌 Bus has started!");
    });

    socket.on("tripEnded", () => {
      alert("🛑 Trip ended!");
    });

    return () => {
      socket.off("liveLocation");
      socket.off("tripStarted");
      socket.off("tripEnded");
    };
  }, [data]);

  // ================= ETA =================
  useEffect(() => {
    if (!busLocation || !data?.route?.stops) return;

    const stop = data.route.stops.find(
      (s) => s.name === data.stopName
    );

    if (!stop) return;

    const distance = getDistance(
      busLocation[0],
      busLocation[1],
      stop.lat,
      stop.lng
    );

    const speed = 30; // km/h
    const time = (distance / speed) * 60;

    setEta(Math.max(1, Math.round(time)));
  }, [busLocation, data]);

  // ================= DISTANCE =================
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  if (!data) return <h2 style={{ padding: 20 }}>Loading...</h2>;

  const { student, bus, driver, route } = data;

  const routeCoords =
    route?.stops?.map((s) => [s.lat, s.lng]) || [];

  return (
    <div style={styles.container}>
      {/* NAVBAR */}
      <div style={styles.navbar}>
        <h3>🎓 Student Panel</h3>

        <div style={{ position: "relative" }}>
          <div
            style={styles.profileIcon}
            onClick={() => setOpenProfile(!openProfile)}
          >
            👤
          </div>

          {openProfile && (
            <div style={styles.dropdown}>
              <p><b>{student?.name}</b></p>
              <p>{student?.email}</p>
              <p>{student?.enrollmentNumber}</p>
              <hr />
              <button onClick={logout} style={styles.logoutBtn}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div style={styles.content}>
        <h2>Welcome 👋 {student?.name}</h2>

        {/* PERSONAL */}
        <div style={styles.card}>
          <h3>👤 Personal Info</h3>
          <p><b>Name:</b> {student?.name}</p>
          <p><b>Email:</b> {student?.email}</p>
          <p><b>Enrollment:</b> {student?.enrollmentNumber}</p>
          <p><b>Branch:</b> {data?.branch}</p>
          <p><b>Stop:</b> {data?.stopName}</p>
        </div>

        {/* BUS */}
        <div style={styles.card}>
          <h3>🚌 Bus Info</h3>
          {bus ? (
            <>
              <p><b>Bus Number:</b> {bus.busNumber}</p>
              <p><b>Seat:</b> {data?.seatNumber}</p>
            </>
          ) : (
            <p>No bus assigned</p>
          )}
        </div>

        {/* DRIVER */}
        <div style={styles.card}>
          <h3>🧑‍✈️ Driver Info</h3>
          {driver ? (
            <>
              <p><b>Name:</b> {driver.name}</p>
              <p><b>Phone:</b> {driver.phone || "N/A"}</p>
            </>
          ) : (
            <p>No driver assigned</p>
          )}
        </div>

        {/* LIVE MAP */}
        <div style={styles.card}>
          <h3>📍 Live Tracking</h3>

          <MapContainer
            center={busLocation || [20.5937, 78.9629]}
            zoom={13}
            style={{ height: "350px", borderRadius: "10px" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {/* ROUTE LINE */}
            {routeCoords.length > 0 && (
              <Polyline positions={routeCoords} />
            )}

            {/* STOPS */}
            {route?.stops?.map((stop, i) => (
              <Marker key={i} position={[stop.lat, stop.lng]}>
                <Popup>{stop.name}</Popup>
              </Marker>
            ))}

            {/* BUS */}
            {busLocation && (
              <Marker position={busLocation}>
                <Popup>🚌 Live Bus</Popup>
              </Marker>
            )}
          </MapContainer>

          {!busLocation && (
            <p style={{ marginTop: 10 }}>
              Waiting for driver location...
            </p>
          )}

          {eta && (
            <h4 style={{ color: "green" }}>
              🕒 Bus arriving in {eta} mins
            </h4>
          )}
        </div>

        {/* ROUTE */}
        <div style={styles.card}>
          <h3>🗺 Route Info</h3>
          {route ? (
            <>
              <p>
                <b>
                  {route.routeNumber} - {route.routeName}
                </b>
              </p>
              <p>{route.startPoint} → {route.endPoint}</p>

              <h4>📍 Stops</h4>
              <ul>
                {route.stops?.map((s, i) => (
                  <li key={i}>{s.name}</li>
                ))}
              </ul>

              <h4>⏰ Timings</h4>
              <ul>
                {route.timings?.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </>
          ) : (
            <p>No route assigned</p>
          )}
        </div>

        {/* STATUS */}
        <div style={styles.card}>
          <h3>📊 Status</h3>
          <p>
            <b>Transport:</b>{" "}
            {data?.assigned ? "Active ✅" : "Not Assigned ❌"}
          </p>
        </div>
      </div>
    </div>
  );
}

// ================= STYLES =================
const styles = {
  container: {
    fontFamily: "Arial",
    background: "#f4f6f8",
    minHeight: "100vh",
  },
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    padding: "15px",
    background: "#1f2937",
    color: "white",
  },
  profileIcon: {
    cursor: "pointer",
    background: "#374151",
    padding: "8px",
    borderRadius: "50%",
  },
  dropdown: {
    position: "absolute",
    right: 0,
    top: "40px",
    background: "white",
    padding: "10px",
    borderRadius: "8px",
    width: "200px",
  },
  logoutBtn: {
    width: "100%",
    background: "red",
    color: "white",
    border: "none",
    padding: "6px",
    borderRadius: "5px",
  },
  content: {
    padding: "15px",
  },
  card: {
    background: "white",
    padding: "15px",
    marginTop: "12px",
    borderRadius: "10px",
  },
};

export default StudentDashboard;