const express = require("express");
const router = express.Router();

const {
  addBus,
  getBuses,
  updateBus,
  deleteBus,
} = require("../controllers/busController");

const verifyToken = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");

// ================= 🚌 BUS ROUTES =================

// ➕ Create Bus (Admin only)
router.post("/", verifyToken, checkRole("admin"), addBus);

// 📄 Get All Buses (Admin + Driver access if needed)
router.get("/", verifyToken, checkRole("admin", "driver"), getBuses);

// ✏️ Update Bus (Admin only)
router.put("/:id", verifyToken, checkRole("admin"), updateBus);

// ❌ Delete Bus (Admin only)
router.delete("/:id", verifyToken, checkRole("admin"), deleteBus);

module.exports = router;