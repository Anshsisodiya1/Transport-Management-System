const mongoose = require("mongoose");

// SUB-SCHEMA FOR STOPS
const stopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  lat: {
    type: Number,
    required: true,
  },
  lng: {
    type: Number,
    required: true,
  },
  time: {
    type: String, // optional
  },
});

const routeSchema = new mongoose.Schema(
  {
    routeNumber: {
      type: String,
      required: true,
    },

    routeName: {
      type: String,
      required: true,
    },

    //  UPDATED STOPS (IMPORTANT)
    stops: [stopSchema],

    startPoint: {
      type: String,
      required: true,
    },

    endPoint: {
      type: String,
      required: true,
    },

    timings: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Route", routeSchema);