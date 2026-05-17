const Assignment = require("../models/Assignment");
const Driver = require("../models/Driver");
const User = require("../models/User");

exports.getDriverData = async (req, res) => {
  try {
    const driverId = req.user._id;

    //  FETCH FULL USER FROM DB (IMPORTANT FIX)
    const user = await User.findById(driverId);

    //  DRIVER PROFILE
    const driverProfile = await Driver.findOne({
      user: driverId,
    });

    //  ASSIGNMENT
    const assignment = await Assignment.findOne({
      driver: driverId,
      type: "driver",
    }).populate({
      path: "bus",
      populate: { path: "route" },
    });

    return res.json({
      success: true,

      driver: {
        name: user?.name || "N/A",
        email: user?.email || "N/A",

        // NOW CONTACT WILL WORK
        contact: user?.phone || "N/A",

        license: driverProfile?.licenseNumber || "N/A",
        aadhar: driverProfile?.aadharNumber || "N/A",
      },

      assigned: !!assignment,

      bus: assignment?.bus || null,
      route: assignment?.bus?.route || null,
    });

  } catch (err) {
    console.log(" Driver API error:", err);
    return res.status(500).json({
      success: false,
      message: "Driver data failed",
    });
  }
};