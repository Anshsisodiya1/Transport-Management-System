const Bus = require("../models/Bus");
const Route = require("../models/Route");

// ➕ Add Bus
exports.addBus = async (req, res) => {
  try {
    const { busNumber, capacity, route, gpsDeviceId } = req.body;

    if (!busNumber || !capacity || !route) {
      return res.status(400).json({ message: "All fields required" });
    }

    const routeData = await Route.findById(route);

    if (!routeData) {
      return res.status(404).json({ message: "Route not found" });
    }

    const bus = await Bus.create({
      busNumber,
      capacity,
      route: routeData._id,
      gpsDeviceId,
    });

    res.status(201).json({ message: "Bus added", bus });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📄 Get All Buses
exports.getBuses = async (req, res) => {
  const buses = await Bus.find().populate("route");
  res.json(buses);
};

// ✏️ Update Bus
exports.updateBus = async (req, res) => {
  const bus = await Bus.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(bus);
};

// ❌ Delete Bus
exports.deleteBus = async (req, res) => {
  await Bus.findByIdAndDelete(req.params.id);
  res.json({ message: "Bus deleted" });
};