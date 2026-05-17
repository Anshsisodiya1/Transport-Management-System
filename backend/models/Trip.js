const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema({
  driver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  bus: { type: mongoose.Schema.Types.ObjectId, ref: "Bus" },
  route: { type: mongoose.Schema.Types.ObjectId, ref: "Route" },

  status: {
    type: String,
    enum: ["ongoing", "completed"],
  },

  startTime: Date,
  endTime: Date,

  currentLocation: {
    lat: Number,
    lng: Number,
  },
}, { timestamps: true });

module.exports = mongoose.model("Trip", tripSchema);