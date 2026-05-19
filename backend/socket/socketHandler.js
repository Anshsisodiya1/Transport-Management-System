const Trip = require("../models/Trip");

module.exports = (io) => {

  io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.id);

    // ─────────────────────────────────────────────────────────
    // STUDENT: join a bus-specific room
    // Client calls: socket.emit("joinBusRoom", busId)
    // ─────────────────────────────────────────────────────────
    socket.on("joinBusRoom", (busId) => {
      const room = String(busId);
      socket.join(room);
      console.log(`📡 Socket ${socket.id} joined room: ${room}`);
    });

    // ─────────────────────────────────────────────────────────
    // DRIVER: send live GPS location
    // ─────────────────────────────────────────────────────────
    socket.on("sendLocation", async (data) => {
      try {
        console.log("📍 LOCATION RECEIVED:", data);
    console.log("📍 LOCATION RECEIVED:", data);
    console.log("📡 DRIVER DATA:", data);
        const { driverId, busId, routeId, latitude, longitude } = data;

        // ── 1. Find the active trip ──────────────────────────
        const trip = await Trip.findOne({
          driver: driverId,
          status: "ongoing",
        });

        if (!trip) {
          console.log("❌ No ongoing trip found for driver:", driverId);
          return;
        }

        // ── 2. Persist location ──────────────────────────────
        trip.currentLocation = { lat: latitude, lng: longitude };
        if (busId)   trip.bus   = busId;
        if (routeId) trip.route = routeId;
        await trip.save();
        console.log("✅ Trip location saved to DB");

        // ── 3. Emit ONLY to students in this bus's room ──────
        //    Room name = String(busId) — matches what students
        //    join with in StudentDashboard.jsx
        const room = String(busId || trip.bus);

        io.to(room).emit("liveLocation", {
          busId:    String(busId   || trip.bus),
          routeId:  String(routeId || trip.route),
          driverId: String(driverId),
          lat:      latitude,
          lng:      longitude,
        });

        console.log(`📡 liveLocation emitted to room: ${room}`);

      } catch (err) {
        console.error("❌ sendLocation error:", err.message);
      }
    });

    // ─────────────────────────────────────────────────────────
    // DRIVER: start trip  (optional — emit from driver dashboard)
    // ─────────────────────────────────────────────────────────
    socket.on("startTrip", async ({ driverId, busId }) => {
      try {
        const room = String(busId);
        io.to(room).emit("tripStarted", { busId: room, driverId: String(driverId) });
        console.log(`🟢 tripStarted emitted to room: ${room}`);
      } catch (err) {
        console.error("❌ startTrip error:", err.message);
      }
    });

    // ─────────────────────────────────────────────────────────
    // DRIVER: end trip
    // ─────────────────────────────────────────────────────────
    socket.on("endTrip", async ({ driverId }) => {
      try {
        const trip = await Trip.findOne({
          driver: driverId,
          status: "ongoing",
        });

        if (!trip) {
          console.log("❌ No active trip to end for driver:", driverId);
          return;
        }

        // ── 1. Mark trip completed ───────────────────────────
        trip.status = "completed";
        await trip.save();
        console.log("🛑 Trip marked completed in DB");

        // ── 2. Notify only the students on this bus ──────────
        const room = String(trip.bus);

        io.to(room).emit("tripEnded", {
          busId:    room,
          driverId: String(driverId),
          message:  "Trip has ended",
        });

        console.log(`📡 tripEnded emitted to room: ${room}`);

      } catch (err) {
        console.error("❌ endTrip error:", err.message);
      }
    });

    // ─────────────────────────────────────────────────────────
    // DISCONNECT
    // ─────────────────────────────────────────────────────────
    socket.on("disconnect", () => {
      console.log("🔌 User disconnected:", socket.id);
    });
  });

};