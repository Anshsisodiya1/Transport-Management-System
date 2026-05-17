const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },

  // Optional (used only for driver)
  userId: {
    type: String,
    sparse: true, // ✅ prevents duplicate null error
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
});

module.exports = mongoose.model("User", userSchema);