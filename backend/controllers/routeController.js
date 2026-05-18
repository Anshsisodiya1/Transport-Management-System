const Route = require("../models/Route");

// CREATE ROUTE
exports.createRoute = async (req, res) => {
  try {
    const {
      routeNumber,
      routeName,
      stops,
      startPoint,
      endPoint,
      timings,
    } = req.body;

    const route = await Route.create({
      routeNumber,
      routeName,
      stops,
      startPoint,
      endPoint,
      timings,
    });

    res.status(201).json(route);

  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Failed to create route",
    });
  }
};

// GET ROUTES
exports.getRoutes = async (req, res) => {
  try {
    const routes = await Route.find();
    res.json(routes);

  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch routes",
    });
  }
};

// UPDATE ROUTE
exports.updateRoute = async (req, res) => {
  try {
    const {
      routeNumber,
      routeName,
      stops,
      startPoint,
      endPoint,
      timings,
    } = req.body;

    const route = await Route.findByIdAndUpdate(
      req.params.id,
      {
        routeNumber,
        routeName,
        stops,
        startPoint,
        endPoint,
        timings,
      },
      { new: true }
    );

    res.json(route);

  } catch (err) {
    res.status(500).json({
      message: "Failed to update route",
    });
  }
};

// DELETE ROUTE
exports.deleteRoute = async (req, res) => {
  try {
    await Route.findByIdAndDelete(req.params.id);

    res.json({
      message: "Route deleted",
    });

  } catch (err) {
    res.status(500).json({
      message: "Failed to delete route",
    });
  }
};