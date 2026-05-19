const Assignment = require("../models/Assignment");
const Driver = require("../models/Driver");
const User = require("../models/User");
const Route = require("../models/Route");

exports.getDriverData = async (req, res) => {
  try {
    const driverId = req.user._id;

    // FETCH USER
    const user = await User.findById(driverId);

    // FETCH DRIVER PROFILE
    const driverProfile = await Driver.findOne({
      user: driverId,
    });

    // FETCH ASSIGNMENT WITH BUS + ROUTE
    const assignment = await Assignment.findOne({
      driver: driverId,
      type: "driver",
    }).populate({
      path: "bus",
      populate: {
        path: "route",
      },
    });

    // FORMAT ROUTE STOPS
    let formattedRoute = null;

    if (assignment?.bus?.route) {
      formattedRoute = {
        ...assignment.bus.route.toObject(),

        // FIXED STOPS
        stops: assignment.bus.route.stops.map((s) => s.name),
      };
    }
    console.log(assignment?.bus?.route);
    return res.json({
      success: true,

      driver: {
        _id: user?._id,
        name: user?.name || "N/A",
        email: user?.email || "N/A",
        contact: user?.phone || "N/A",
        license: driverProfile?.licenseNumber || "N/A",
        aadhar: driverProfile?.aadharNumber || "N/A",
      },

      assigned: !!assignment,

      bus: assignment?.bus || null,

      // UPDATED ROUTE
      route: formattedRoute,
    });
  } catch (err) {
    console.log("Driver API error:", err);

    return res.status(500).json({
      success: false,
      message: "Driver data failed",
    });
  }
};
