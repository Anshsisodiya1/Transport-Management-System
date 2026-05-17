const express = require("express");
const router = express.Router();

const {
  approveApplication,
  rejectApplication,
} = require("../controllers/applicationController");

const verifyToken = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");

router.put("/approve/:id", verifyToken, checkRole("admin"), approveApplication);
router.put("/reject/:id", verifyToken, checkRole("admin"), rejectApplication);

module.exports = router;