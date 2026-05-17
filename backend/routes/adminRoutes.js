const express = require("express");
const router = express.Router();

const { registerStudent, registerDriver } = require("../controllers/adminController");
const { getAdminStats } = require("../controllers/adminController");
const { getStudents,getDrivers } = require("../controllers/adminController");
const verifyToken = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");

// Only ADMIN can access
router.post("/register-student", verifyToken, checkRole("admin"), registerStudent);
router.post("/register-driver", verifyToken, checkRole("admin"), registerDriver);

router.get("/stats", verifyToken, checkRole("admin"), getAdminStats);
router.get("/students", getStudents);
router.get("/drivers", verifyToken, checkRole("admin"), getDrivers);    

module.exports = router;