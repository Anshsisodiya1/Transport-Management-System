const Assignment = require("../models/Assignment");
const User = require("../models/User");
const StudentProfile = require("../models/Student");
const Trip = require("../models/Trip");

exports.getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user._id;

    const student = await User.findById(studentId).select("-password");
    const profile = await StudentProfile.findOne({ user: studentId });

    // ✅ Fetch admin details
    const admin = await User.findOne({ role: "admin" }).select(
      "name email phone phoneNumber"
    );

    const assignment = await Assignment.findOne({
      student: studentId,
      type: "student",
    }).populate({
      path: "bus",
      populate: { path: "route" },
    });

    if (!assignment) {
      return res.json({
        student,
        branch:   profile?.branch   || "N/A",
        stopName: profile?.stopName || "N/A",
        assigned: false,
        admin:    admin || null,
        driver:   null,
      });
    }

    // ✅ Populate driver with name, email, phone
    const driverAssignment = await Assignment.findOne({
      bus:  assignment.bus._id,
      type: "driver",
    }).populate("driver", "name email phone phoneNumber contact");

    res.json({
      student,
      branch:     profile?.branch   || "N/A",
      stopName:   profile?.stopName || "N/A",
      assigned:   true,
      seatNumber: assignment.seatNumber,
      bus:        assignment.bus,
      route:      assignment.bus?.route || null,
      driver:     driverAssignment?.driver || null,
      admin:      admin || null,          // ✅ admin added
    });
  } catch (err) {
    console.error("Student Dashboard Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Active trip check — for page refresh recovery
exports.getActiveTrip = async (req, res) => {
  try {
    const { busId } = req.params;

    if (!busId) {
      return res.status(400).json({ message: "busId is required" });
    }

    const trip = await Trip.findOne({ bus: busId, active: true });

    if (!trip) {
      return res.json({ active: false });
    }

    return res.json({
      active: true,
      location: {
        lat: trip.currentLocation?.lat || null,
        lng: trip.currentLocation?.lng || null,
      },
      startTime: trip.startTime,
    });
  } catch (err) {
    console.error("Active trip check error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};