const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");

const { getStudentDashboard } = require("../controllers/studentController");
const Trip = require("../models/Trip");

// Student dashboard
router.get("/dashboard", verifyToken, checkRole("student"), getStudentDashboard);

// Active trip check — called on student dashboard mount for page-refresh recovery
router.get("/active-trip/:busId", verifyToken, checkRole("student"), async (req, res) => {
  try {
    const { busId } = req.params;

    // FIX: your server.js and tripController both use { active: true }
    // NOT { status: "ongoing" } — that field doesn't exist in your Trip model
    const trip = await Trip.findOne({ bus: busId, active: true });

    if (!trip) {
      return res.json({ active: false, location: null });
    }

    return res.json({
      active: true,
      location: {
        lat: trip.currentLocation?.lat || null,
        lng: trip.currentLocation?.lng || null,
      },
    });
  } catch (err) {
    console.error("❌ active-trip error:", err.message);
    res.status(500).json({ active: false, location: null });
  }
});

module.exports = router;