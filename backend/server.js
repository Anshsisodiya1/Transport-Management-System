const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const Trip = require("./models/Trip");

dotenv.config();
console.log("JWT_SECRET:", process.env.JWT_SECRET);
connectDB();

const app = express();

// CREATE HTTP SERVER
const server = http.createServer(app);

// SOCKET.IO SETUP
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());

// ================= ROUTES =================
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

// ================= TEST ROUTES =================
app.get("/", (req, res) => {
  res.send("Backend running ");
});

app.get("/api/driver/test", (req, res) => {
  console.log("Driver test route hit");
  res.json({ message: "Driver route working" });
});

// ================= SOCKET.IO LOGIC =================
io.on("connection", (socket) => {
  console.log(" User connected:", socket.id);


  //  STUDENT / ADMIN JOIN BUS ROOM

  socket.on("joinBusRoom", (busId) => {
    if (!busId) return;

    socket.join(busId);
    console.log(` Socket ${socket.id} joined bus room: ${busId}`);
  });


  // DRIVER SENDS LIVE LOCATION

  socket.on("sendLocation", async (data) => {
    try {
      const { driverId, lat, lng } = data;

      if (!driverId || lat == null || lng == null) return;

      const trip = await Trip.findOne({
        driver: driverId,
        status: "ongoing",
      });

      if (!trip) return;

      // SAVE LOCATION
      trip.currentLocation = { lat, lng };
      await trip.save();

      //  SEND ONLY TO THIS BUS USERS (IMPORTANT FIX)
      io.to(String(trip.bus)).emit("liveLocation", {
        driverId,
        busId: trip.bus,
        lat,
        lng,
      });

      console.log(` Location sent for bus ${trip.bus}`);

    } catch (err) {
      console.log("Socket error:", err.message);
    }
  });

// Driver starts trip

  socket.on("tripStarted", (data) => {
    const { busId } = data;

    if (!busId) return;

    io.to(String(busId)).emit("tripStarted", {
      message: "Your bus has started",
    });

    console.log(`Trip started for bus ${busId}`);
  });

// Driver ends trip
  socket.on("tripEnded", (data) => {
    const { busId } = data;

    if (!busId) return;

    io.to(String(busId)).emit("tripEnded", {
      message: " Trip ended",
    });

    console.log(` Trip ended for bus ${busId}`);
  });

// DISCONNECT
  socket.on("disconnect", () => {
    console.log(" Disconnected:", socket.id);
  });
});

// ================= ERROR HANDLING =================

//  404
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

//  Global Error
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong",
    error: err.message,
  });
});

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});