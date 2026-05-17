const express = require("express");
const router = express.Router();
const {
  startTrip,
  endTrip,
  updateLocation,
} = require("../controllers/tripController");

const auth = require("../middleware/authMiddleware");

router.post("/start", auth, startTrip);
router.post("/end", auth, endTrip);
router.post("/location", auth, updateLocation);

module.exports = router;