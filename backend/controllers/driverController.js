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


// Get all students assigned to the driver's route

const Student = require("../models/Student");

exports.getBusStudents = async (req, res) => {
  try {
    const driverId = req.user.id;

    // Step 1: find driver's bus
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

    // Step 2: fetch students in same bus
    const studentAssignments = await Assignment.find({
      bus: driverAssignment.bus,
      type: "student",
    })
      .populate("student", "name phone")
      .sort({ seatNumber: 1 });

    // Step 3: branch fetch from Student model
    const formattedStudents = await Promise.all(
      studentAssignments.map(async (assign) => {
        const studentData = await Student.findOne({
          user: assign.student._id,
        });

        return {
          _id: assign._id,
          name: assign.student?.name,
          phone: assign.student?.phone,
          seatNumber: assign.seatNumber,
          stopName: assign.stopName,
          branch: studentData?.branch || "-",
        };
      })
    );

    res.status(200).json({
      success: true,
      totalStudents: formattedStudents.length,
      students: formattedStudents,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};