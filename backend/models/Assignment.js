const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  bus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bus",
  },

  seatNumber: {
    type: Number,
  },

  // 🔥 NEW FIELD (VERY IMPORTANT)
  stopName: {
    type: String,
    default: "-",
  },

  type: {
    type: String,
    enum: ["student", "driver"],
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("Assignment", assignmentSchema);