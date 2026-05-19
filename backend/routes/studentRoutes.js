const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");

const {
  getStudentDashboard,
} = require("../controllers/studentController");

// ── Models (needed for active-trip check) ──
const Trip = require("../models/Trip");
const Assignment = require("../models/Assignment");

// 🎓 Student Dashboard
router.get(
  "/dashboard",
  verifyToken,
  checkRole("student"),
  getStudentDashboard
);

// 🚌 Active Trip Check
// Called on student dashboard mount to detect if a trip is already in progress
router.get(
  "/active-trip",
  verifyToken,
  checkRole("student"),
  async (req, res) => {
    try {
      // Find this student's bus via their assignment
      const assignment = await Assignment.findOne({ student: req.user.id })
        .populate("bus");

      if (!assignment || !assignment.bus) {
        return res.json({ active: false, location: null });
      }

      // Check if an ongoing trip exists for that bus
      const trip = await Trip.findOne({
        bus: assignment.bus._id,
        status: "ongoing",
      });

      if (!trip) {
        return res.json({ active: false, location: null });
      }

      return res.json({
        active: true,
        location: trip.currentLocation || null, // { lat, lng }
      });

    } catch (err) {
      console.error("❌ active-trip error:", err.message);
      res.status(500).json({ active: false, location: null });
    }
  }
);

module.exports = router;