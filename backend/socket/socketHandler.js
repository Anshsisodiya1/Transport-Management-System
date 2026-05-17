const Trip = require("../models/Trip");

module.exports = (io) => {

  io.on("connection", (socket) => {
    console.log(" User connected:", socket.id);

    // DRIVER SEND LOCATION
    socket.on("sendLocation", async (data) => {
      try {
        const { driverId, lat, lng } = data;

        const trip = await Trip.findOne({
          driver: driverId,
          status: "ongoing",
        });

        if (!trip) return;

        // SAVE TO DB
        trip.currentLocation = { lat, lng };
        await trip.save();

        //  BROADCAST TO EVERYONE
        io.emit("liveLocation", {
          driverId,
          busId: trip.bus,
          lat,
          lng,
        });

      } catch (err) {
        console.log("Socket error:", err.message);
      }
    });

    socket.on("disconnect", () => {
      console.log(" Disconnected:", socket.id);
    });
  });

};