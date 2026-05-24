const express = require("express");
const router = express.Router();

const {
  registerStudent,
  registerDriver,
  getAdminStats,
  getStudents,
  getDrivers,
  getLiveBuses,
  getBusHistory,
} = require("../controllers/adminController");

const verifyToken = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");

router.post(
  "/register-student",
  verifyToken,
  checkRole("admin"),
  registerStudent,
);
router.post(
  "/register-driver",
  verifyToken,
  checkRole("admin"),
  registerDriver,
);
router.get("/stats", verifyToken, checkRole("admin"), getAdminStats);
router.get("/students", getStudents);
router.get("/drivers", verifyToken, checkRole("admin"), getDrivers);
router.get("/live-buses", verifyToken, checkRole("admin"), getLiveBuses); // NEW
router.get("/bus/:id/history", verifyToken, checkRole("admin"), getBusHistory);
module.exports = router;
