const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  licenseNumber: {
    type: String,
    required: true,
  },

  aadharNumber: {
    type: String,
    required: true,
  },

  assignedBus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bus",
  },
}, { timestamps: true });

module.exports = mongoose.model("Driver", driverSchema);