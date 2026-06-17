const Assignment = require("../models/Assignment");
const Driver = require("../models/Driver");
const User = require("../models/User");
const Route = require("../models/Route");
const Student = require("../models/Student");

// =========================================
// DRIVER DASHBOARD DATA
// =========================================
exports.getDriverData = async (req, res) => {
  try {
    const driverId = req.user._id;

    const user = await User.findById(driverId);

    const driverProfile = await Driver.findOne({
      user: driverId,
    });

    const assignment = await Assignment.findOne({
      driver: driverId,
      type: "driver",
    }).populate({
      path: "bus",
      populate: {
        path: "route",
      },
    });

    let formattedRoute = null;

    if (assignment?.bus?.route) {
      formattedRoute = {
        ...assignment.bus.route.toObject(),
        stops: assignment.bus.route.stops.map((s) => s.name),
      };
    }

    return res.status(200).json({
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

// =========================================
// GET ALL STUDENTS OF DRIVER BUS
// =========================================
exports.getBusStudents = async (req, res) => {
  try {
    const driverId = req.user._id;

    // Driver assignment
    const driverAssignment = await Assignment.findOne({
      driver: driverId,
      type: "driver",
    });

    if (!driverAssignment) {
      return res.status(404).json({
        success: false,
        message: "No bus assigned to driver",
      });
    }

    // Student assignments
    const studentAssignments = await Assignment.find({
      bus: driverAssignment.bus,
      type: "student",
    })
      .populate("student", "name phone email")
      .sort({ seatNumber: 1 });

    // Get all user ids
    const userIds = studentAssignments
      .map((item) => item.student?._id)
      .filter(Boolean);

    // Get student profiles
    const studentProfiles = await Student.find({
      user: { $in: userIds },
    });

    // Create branch map
    const branchMap = {};

    studentProfiles.forEach((student) => {
      branchMap[student.user.toString()] = {
        branch: student.branch,
        stopName: student.stopName,
      };
    });

    const formattedStudents = studentAssignments.map((assign) => {
      const profile =
        branchMap[assign.student?._id?.toString()] || {};

      return {
        _id: assign._id,
        name: assign.student?.name || "-",
        phone: assign.student?.phone || "-",
        seatNumber: assign.seatNumber || "-",
        stopName: assign.stopName || profile.stopName || "-",
        branch: profile.branch || "-",
      };
    });

    return res.status(200).json({
      success: true,
      totalStudents: formattedStudents.length,
      students: formattedStudents,
    });
  } catch (err) {
    console.error("getBusStudents Error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};