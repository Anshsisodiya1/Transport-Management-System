const express = require("express");
const router = express.Router();

const { getDriverData, getBusStudents  } = require("../controllers/driverController");
const verifyToken = require("../middleware/authMiddleware");

// Driver dashboard API
router.get("/me", verifyToken, getDriverData);
router.get("/students", verifyToken, getBusStudents);

module.exports = router;