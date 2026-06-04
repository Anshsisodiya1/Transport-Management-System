const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/authMiddleware");
const {
  register,
  login,
  getMe,
  changePassword,
  forgotPassword,
  verifyOtp,
  resetPassword,
  updateEmail,
} = require("../controllers/authController");

// Public routes
router.post("/register",        register);
router.post("/login",           login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp",      verifyOtp);
router.post("/reset-password",  resetPassword);

// Protected routes (token required)
router.get ("/me",              auth, getMe);
router.post("/change-password", auth, changePassword);
router.post("/update-email",    auth, updateEmail);

module.exports = router;