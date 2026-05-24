const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    bus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bus",
    },

    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
    },

    status: {
      type: String,
      enum: ["ongoing", "completed"],
      default: "ongoing",
    },

    // ADD THIS
    active: {
      type: Boolean,
      default: true,
    },

    startTime: {
      type: Date,
      default: Date.now,
    },

    endTime: Date,

    currentLocation: {
      lat: {
        type: Number,
        default: 0,
      },

      lng: {
        type: Number,
        default: 0,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trip", tripSchema);