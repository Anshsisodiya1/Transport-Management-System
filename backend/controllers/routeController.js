const Route = require("../models/Route");

//  Create Route
exports.createRoute = async (req, res) => {
  const { routeNumber, routeName, stops, startPoint, endPoint } = req.body;

  const route = await Route.create({
    routeNumber,
    routeName,
    stops,
    startPoint,
    endPoint,
  });

  res.status(201).json(route);
};

// Get Routes
exports.getRoutes = async (req, res) => {
  const routes = await Route.find();
  res.json(routes);
};

// Update Route
exports.updateRoute = async (req, res) => {
  const route = await Route.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(route);
};

//  Delete Route
exports.deleteRoute = async (req, res) => {
  await Route.findByIdAndDelete(req.params.id);
  res.json({ message: "Route deleted" });
};