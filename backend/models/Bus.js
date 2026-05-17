const mongoose = require("mongoose");

const busSchema = new mongoose.Schema({
  busNumber: {
    type: String,
    required: true,
    unique: true,
  },

  capacity: {
    type: Number,
    required: true,
  },

  gpsDeviceId: {
    type: String,
  },

  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Route",
  },

  currentLocation: {
    lat: Number,
    lng: Number,
  },
}, { timestamps: true,currentCapacity: { type: Number, default: 0 } });

module.exports = mongoose.model("Bus", busSchema);