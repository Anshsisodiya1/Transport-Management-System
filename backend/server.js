const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const Trip = require("./models/Trip");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"], credentials: true },
  transports: ["polling", "websocket"],
  allowEIO3: true,
});

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/buses", require("./routes/busRoutes"));
app.use("/api/routes", require("./routes/routeRoutes"));
app.use("/api/applications", require("./routes/applicationRoutes"));
app.use("/api/assignments", require("./routes/assignmentRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/driver", require("./routes/driverRoutes"));
app.use("/api/fcm", require("./routes/fcmRoutes"));
app.use("/api/trip", require("./routes/tripRoutes"));
app.use("/api/student", require("./routes/studentRoutes"));

app.get("/", (req, res) => res.send("Backend running"));

// ── SOCKET.IO ──
io.on("connection", (socket) => {
  console.log("✅ Connected:", socket.id);

  // Student joins bus room
  socket.on("joinBusRoom", (busId) => {
    if (!busId) {
      console.log("❌ joinBusRoom: busId missing");
      return;
    }
    const room = String(busId).trim();
    socket.join(room);
    console.log(`📡 ${socket.id} joined room [${room}]`);

    // Confirm to client so student knows the join succeeded
    socket.emit("roomJoined", { room });

    // FIX: If there's already an active trip for this bus, tell the student immediately.
    // This handles the case where student opens the app AFTER driver started the trip.
    Trip.findOne({ bus: busId, active: true })
      .then((trip) => {
        if (trip) {
          socket.emit("tripStarted", {
            busId: room,
            message: "Trip already in progress",
          });
          console.log(`📤 Sent tripStarted to late-joining student for room [${room}]`);
        }
      })
      .catch((err) => console.error("Active trip lookup error:", err.message));
  });

  // Driver sends GPS → broadcast to students in that bus room
  socket.on("sendLocation", async (data) => {
    try {
      const { driverId, busId, routeId, latitude, longitude } = data;

      if (!busId) { console.log("❌ sendLocation: busId missing"); return; }
      if (latitude == null || longitude == null) { console.log("❌ sendLocation: lat/lng missing"); return; }

      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      if (isNaN(lat) || isNaN(lng)) { console.log("❌ sendLocation: lat/lng not numbers"); return; }

      const room = String(busId).trim();

      // Update DB (fire and don't await — don't block the broadcast)
      Trip.findOneAndUpdate(
        { bus: busId, active: true },
        { currentLocation: { lat, lng } },
        { new: true }
      ).catch((err) => console.error("DB update error:", err.message));

      // FIX: field names must match what StudentDashboard reads (loc.lat, loc.lng, loc.busId)
      const payload = {
        busId: room,
        driverId: String(driverId),
        routeId: routeId ? String(routeId) : null,
        lat,
        lng,
        timestamp: Date.now(),
      };

      io.to(room).emit("liveLocation", payload);
      console.log(`📍 liveLocation → room [${room}] lat=${lat} lng=${lng}`);
    } catch (err) {
      console.error("❌ sendLocation error:", err.message);
    }
  });

  // Driver starts trip
  socket.on("startTrip", async (data) => {
    try {
      const { busId, driverId, routeId } = data;
      if (!busId) { console.log("❌ startTrip: busId missing"); return; }

      const room = String(busId).trim();

      // Close any existing active trip
      await Trip.findOneAndUpdate(
        { bus: busId, active: true },
        { active: false, endTime: new Date() }
      );

      await Trip.create({
        bus: busId,
        driver: driverId,
        route: routeId || null,
        active: true,
        currentLocation: { lat: 0, lng: 0 },
        startTime: new Date(),
      });

      io.to(room).emit("tripStarted", { busId: room, message: "Bus trip started" });
      console.log(`🟢 tripStarted → room [${room}]`);
    } catch (err) {
      console.error("❌ startTrip error:", err.message);
    }
  });

  // Driver ends trip
  socket.on("endTrip", async (data) => {
    try {
      const { busId } = data;
      if (!busId) { console.log("❌ endTrip: busId missing", data); return; }

      const room = String(busId).trim();

      await Trip.findOneAndUpdate(
        { bus: busId, active: true },
        { active: false, endTime: new Date() }
      );

      io.to(room).emit("tripEnded", { busId: room, message: "Trip ended" });
      console.log(`🛑 tripEnded → room [${room}]`);
    } catch (err) {
      console.error("❌ endTrip error:", err.message);
    }
  });

  // Admin joins all bus rooms at once so it receives liveLocation from every bus
  socket.on("joinAllBusRooms", async (busIds) => {
    if (!Array.isArray(busIds) || busIds.length === 0) {
      console.log("❌ joinAllBusRooms: busIds missing or empty");
      return;
    }
    const rooms = busIds.map((id) => String(id).trim());
    await Promise.all(rooms.map((room) => socket.join(room)));
    console.log(`🛡️ Admin ${socket.id} joined ${rooms.length} bus rooms`);
    socket.emit("adminRoomsJoined", { rooms });
  });

  socket.on("disconnect", () => {
    console.log("🔌 Disconnected:", socket.id);
  });
});

app.use((req, res) => res.status(404).json({ message: "Route not found" }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong", error: err.message });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));