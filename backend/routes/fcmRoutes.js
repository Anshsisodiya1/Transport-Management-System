const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Save FCM Token
router.post("/save-token", async (req, res) => {
  try {
    const { userId, token } = req.body;

    await User.findByIdAndUpdate(userId, {
      fcmToken: token,
    });

    res.json({ message: "Token saved" });
  } catch (err) {
    res.status(500).json({ message: "Error saving token" });
  }
});

module.exports = router;