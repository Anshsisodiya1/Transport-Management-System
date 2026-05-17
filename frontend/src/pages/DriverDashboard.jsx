import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

function DriverDashboard() {
  const [data, setData] = useState(null);
  const [openProfile, setOpenProfile] = useState(false);
  const [tripStarted, setTripStarted] = useState(false);

  const [socket, setSocket] = useState(null);
  const [watchId, setWatchId] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // ================= SOCKET INIT =================
  useEffect(() => {
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  // ================= FETCH DRIVER DATA =================
  useEffect(() => {
    const fetchDriver = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/driver/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("✅ Driver API DATA:", res.data);
        setData(res.data);
      } catch (err) {
        console.log("❌ API Error:", err.message);
      }
    };

    fetchDriver();
  }, [token]);

  // ================= LOGOUT =================
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  // ================= START / END TRIP =================
  const handleTripToggle = () => {
    if (!socket) {
      alert("Socket not connected yet");
      return;
    }

    if (!tripStarted) {
      // 🚀 START TRIP
      setTripStarted(true);

      if (!navigator.geolocation) {
        alert("Geolocation not supported");
        return;
      }

      const id = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          console.log("📍 Sending location:", latitude, longitude);

          socket.emit("sendLocation", {
            driverId: data?._id,
            busId: data?.bus?._id,
            routeId: data?.route?._id,
            latitude,
            longitude,
          });
        },
        (err) => {
          console.warn("GPS issue:", err.message);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000, // allow cached location
          timeout: 20000, //  increase timeout (20 sec)
        },
      );

      setWatchId(id);
    } else {
      // 🛑 END TRIP
      setTripStarted(false);

      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }

      socket.emit("endTrip", {
        driverId: data?._id,
      });

      console.log("🛑 Trip Ended");
    }
  };

  const driver = data?.driver;
  const bus = data?.bus;
  const route = data?.route;

  return (
    <div style={styles.container}>
      {/* 🔵 NAVBAR */}
      <div style={styles.navbar}>
        <h2>🚗 Driver Panel</h2>

        <div style={{ position: "relative" }}>
          <div
            style={styles.profileIcon}
            onClick={() => setOpenProfile(!openProfile)}
          >
            👤
          </div>

          {openProfile && (
            <div style={styles.dropdown}>
              <p>
                <b>{driver?.name || "Driver"}</b>
              </p>
              <p>{driver?.email}</p>
              <p>{driver?.contact}</p>
              <p>{driver?.license}</p>

              <hr />

              <button style={styles.logoutBtn} onClick={logout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 🚀 TRIP BAR */}
      <div style={styles.tripBar}>
        <button
          onClick={handleTripToggle}
          style={{
            ...styles.tripBtn,
            background: tripStarted ? "#dc2626" : "#16a34a",
          }}
        >
          {tripStarted ? "🟢 End Trip" : "🔴 Start Trip"}
        </button>

        <p style={{ marginTop: "5px", fontSize: "12px" }}>
          {tripStarted ? "Live Tracking Active 🚀" : "Trip Not Started"}
        </p>
      </div>

      {/* 📊 CONTENT */}
      <div style={styles.content}>
        <h1>Welcome 👋 {driver?.name || "Driver"}</h1>

        {/* 👤 PERSONAL */}
        <div style={styles.card}>
          <h2>👤 Personal Info</h2>
          <p>
            <b>Name:</b> {driver?.name}
          </p>
          <p>
            <b>Email:</b> {driver?.email}
          </p>
          <p>
            <b>Contact:</b> {driver?.contact}
          </p>
          <p>
            <b>License:</b> {driver?.license}
          </p>
          <p>
            <b>Aadhar:</b> {driver?.aadhar}
          </p>
        </div>

        {/* 🗺️ ROUTE */}
        <div style={styles.card}>
          <h2>🗺️ Route Info</h2>

          {route ? (
            <>
              <p>
                <b>
                  {route.routeNumber} - {route.routeName}
                </b>
              </p>
              <p>
                {route.startPoint} → {route.endPoint}
              </p>

              <h4>📍 Stops</h4>
              <ul>
                {route.stops?.map((s, i) => (
                  <li key={i}>{s}</li>
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

        {/* 🚌 BUS */}
        <div style={styles.card}>
          <h2>🚌 Bus Info</h2>

          {data?.assigned ? (
            <>
              <p>
                <b>Bus Number:</b> {bus?.busNumber || "N/A"}
              </p>
              <p>
                <b>Route:</b>{" "}
                {route
                  ? `${route.routeNumber} ${route.startPoint} → ${route.endPoint}`
                  : "N/A"}
              </p>
            </>
          ) : (
            <p style={{ color: "orange" }}>No bus assigned yet</p>
          )}
        </div>

        {/* 📊 STATUS */}
        <div style={styles.card}>
          <h2>📊 Status</h2>
          <p>
            <b>Assignment:</b>{" "}
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
    alignItems: "center",
    padding: "15px 20px",
    background: "#1f2937",
    color: "white",
  },

  profileIcon: {
    fontSize: "24px",
    cursor: "pointer",
    background: "#374151",
    padding: "8px 10px",
    borderRadius: "50%",
  },

  dropdown: {
    position: "absolute",
    right: 0,
    top: "40px",
    background: "white",
    color: "black",
    padding: "10px",
    borderRadius: "8px",
    width: "200px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  },

  logoutBtn: {
    width: "100%",
    padding: "8px",
    marginTop: "5px",
    background: "red",
    color: "white",
    border: "none",
    cursor: "pointer",
    borderRadius: "5px",
  },

  tripBar: {
    textAlign: "center",
    padding: "10px",
    background: "#e5e7eb",
  },

  tripBtn: {
    padding: "10px 20px",
    border: "none",
    color: "white",
    fontSize: "16px",
    borderRadius: "8px",
    cursor: "pointer",
  },

  content: {
    padding: "20px",
  },

  card: {
    background: "white",
    padding: "15px",
    marginTop: "15px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  },
};

export default DriverDashboard;
