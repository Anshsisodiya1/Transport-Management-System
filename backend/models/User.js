const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },

  // Optional (used only for driver)
  userId: {
    type: String,
    sparse: true,
  },

  // Used for student
  enrollmentNumber: {
    type: String,
    sparse: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  phone: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ["admin", "driver", "student"],
    required: true,
  },

  fcmToken: {
    type: String,
    default: null,
  },

  // For forgot password OTP
  otp:        { type: String, default: null },
  otpExpires: { type: Date,   default: null },
});

module.exports = mongoose.model("User", userSchema);