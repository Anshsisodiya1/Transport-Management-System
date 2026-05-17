const Trip = require("../models/Trip");
const Assignment = require("../models/Assignment");

// START TRIP
exports.startTrip = async (req, res) => {
  try {
    const driverId = req.user._id;

    const assignment = await Assignment.findOne({
      driver: driverId,
      type: "driver",
    }).populate("bus");

    if (!assignment) {
      return res.status(400).json({ message: "No bus assigned" });
    }

    const trip = await Trip.create({
      driver: driverId,
      bus: assignment.bus._id,
      route: assignment.bus.route,
      status: "ongoing",
      startTime: new Date(),
    });

    res.json({ success: true, trip });

  } catch (err) {
    res.status(500).json({ message: "Start trip failed" });
  }
};

//  END TRIP
exports.endTrip = async (req, res) => {
  try {
    const driverId = req.user._id;

    const trip = await Trip.findOne({
      driver: driverId,
      status: "ongoing",
    });

    if (!trip) {
      return res.status(400).json({ message: "No active trip" });
    }

    trip.status = "completed";
    trip.endTime = new Date();
    await trip.save();

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ message: "End trip failed" });
  }
};

// OPTIONAL (fallback API)
exports.updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const driverId = req.user._id;

    const trip = await Trip.findOne({
      driver: driverId,
      status: "ongoing",
    });

    if (!trip) return res.status(400).json({ message: "Trip not started" });

    trip.currentLocation = { lat, lng };
    await trip.save();

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ message: "Location update failed" });
  }
};