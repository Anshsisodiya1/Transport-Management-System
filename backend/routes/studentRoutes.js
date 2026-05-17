const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");

const {
  getStudentDashboard,
} = require("../controllers/studentController");

// 🎓 Student Dashboard
router.get(
  "/dashboard",
  verifyToken,
  checkRole("student"),
  getStudentDashboard
);

module.exports = router;