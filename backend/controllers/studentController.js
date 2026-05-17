const Assignment = require("../models/Assignment");
const User = require("../models/User");
const StudentProfile = require("../models/Student"); 

exports.getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user._id;

    //  BASIC USER
    const student = await User.findById(studentId).select("-password");

    // EXTRA DATA (BRANCH + STOP)
    const profile = await StudentProfile.findOne({
      user: studentId,
    });

    //  ASSIGNMENT
    const assignment = await Assignment.findOne({
      student: studentId,
      type: "student",
    }).populate({
      path: "bus",
      populate: {
        path: "route",
      },
    });

    // IF NOT ASSIGNED
    if (!assignment) {
      return res.json({
        student,
        branch: profile?.branch || "N/A",
        stopName: profile?.stopName || "N/A",
        assigned: false,
      });
    }

    // DRIVER
    const driverAssignment = await Assignment.findOne({
      bus: assignment.bus._id,
      type: "driver",
    }).populate("driver");

    res.json({
      student,

      // NOW CORRECT
      branch: profile?.branch || "N/A",
      stopName: profile?.stopName || "N/A",

      assigned: true,
      seatNumber: assignment.seatNumber,

      bus: assignment.bus,
      route: assignment.bus?.route || null,
      driver: driverAssignment?.driver || null,
    });

  } catch (err) {
    console.error("Student Dashboard Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};