const express = require("express");
const router = express.Router();

const { getDriverData } = require("../controllers/driverController");
const verifyToken = require("../middleware/authMiddleware");

// Driver dashboard API
router.get("/me", verifyToken, getDriverData);

module.exports = router;