const express = require("express");
const router = express.Router();

const {
  createRoute,
  getRoutes,
  updateRoute,
  deleteRoute,
} = require("../controllers/routeController");

const verifyToken = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");

router.post("/", verifyToken, checkRole("admin"), createRoute);
router.get("/", verifyToken, getRoutes);
router.put("/:id", verifyToken, checkRole("admin"), updateRoute);
router.delete("/:id", verifyToken, checkRole("admin"), deleteRoute);

module.exports = router;