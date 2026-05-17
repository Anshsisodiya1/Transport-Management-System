const express = require("express");
const router = express.Router();

const {
  allBuses,
  busWithDriver,
  busWithStudents,
  busWithRoute,
  seatOccupancy,
} = require("../controllers/reportController");

// 🚌 REPORT ROUTES
router.get("/buses/all", allBuses);
router.get("/buses/with-driver", busWithDriver);
router.get("/buses/with-students", busWithStudents);
router.get("/buses/with-route", busWithRoute);
router.get("/buses/seat-occupancy", seatOccupancy);

module.exports = router;