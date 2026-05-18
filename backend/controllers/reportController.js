const Bus = require("../models/Bus");
const Assignment = require("../models/Assignment");
const Driver = require("../models/Driver");
const Student = require("../models/Student");

// =================  ALL BUSES =================
const allBuses = async (req, res) => {
  try {
    const buses = await Bus.find().populate("route").lean();

    const result = buses.map((bus) => ({
      busId: bus._id,
      busNumber: bus.busNumber,
      capacity: bus.capacity,
      gps: bus.gpsDeviceId || "-",
      route: bus.route
        ? `${bus.route.routeNumber} - ${bus.route.routeName}`
        : "Not Assigned",
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "All buses report failed" });
  }
};

// =================  BUS WITH DRIVER (FULL DETAIL) =================
const busWithDriver = async (req, res) => {
  try {
    const buses = await Bus.find().populate("route").lean();

    const assignments = await Assignment.find({ type: "driver" })
      .populate("driver")
      .lean();

    const drivers = await Driver.find().populate("user").lean();

    // Map userId → driver extra details
    const driverDetailsMap = {};
    drivers.forEach((d) => {
      if (d.user) {
        driverDetailsMap[d.user.toString()] = d;
      }
    });

    // Map busId → assignment
    const driverAssignMap = {};
    assignments.forEach((a) => {
      if (a.bus) {
        driverAssignMap[a.bus.toString()] = a;
      }
    });

    const result = buses.map((bus) => {
      const assign = driverAssignMap[bus._id.toString()];
      const user = assign?.driver;
      const extra = driverDetailsMap[user?._id?.toString()];

      return {
        busNumber: bus.busNumber,
        routeNumber: bus.route?.routeNumber || "-",
        routeName: bus.route?.routeName || "-",

        driverName: user?.name || "Not Assigned",
        mobile: user?.phone || "-",
        aadharNumber: extra?.aadharNumber || "-",
        licenseNumber: extra?.licenseNumber || "-",
      };
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Driver report failed" });
  }
};

// ================= BUS WITH STUDENTS (FULL DETAIL) =================
const busWithStudents = async (req, res) => {
  try {
    const buses = await Bus.find().populate("route").lean();

    const assignments = await Assignment.find({ type: "student" })
      .populate("student")
      .lean();

    const students = await Student.find().populate("user").lean();

    // Map userId → student extra details
    const studentDetailsMap = {};
    students.forEach((s) => {
      if (s.user) {
        studentDetailsMap[s.user.toString()] = s;
      }
    });

    // Group students by bus
    const studentMap = {};

    assignments.forEach((a) => {
      const busId = a.bus?.toString();
      if (!busId) return;

      if (!studentMap[busId]) studentMap[busId] = [];

      const user = a.student;
      const extra = studentDetailsMap[user?._id?.toString()];

      studentMap[busId].push({
        name: user?.name || "-",
        phone: user?.phone || "-",
        enrollmentNumber: user?.enrollmentNumber || "-",
        branch: extra?.branch || "-",
        stopName: a.stopName || extra?.stopName || "-",
      });
    });

    const result = buses.map((bus) => {
      const studentsList = studentMap[bus._id.toString()] || [];

      return {
        busNumber: bus.busNumber,
        routeNumber: bus.route?.routeNumber || "-",
        routeName: bus.route?.routeName || "-",
        totalStudents: studentsList.length,
        students: studentsList,
      };
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Student report failed" });
  }
};

// ================= 🛣 4. BUS WITH ROUTE =================
const busWithRoute = async (req, res) => {
  try {
    const buses = await Bus.find().populate("route").lean();

    const result = buses.map((bus) => ({
      busNumber: bus.busNumber,
      routeNumber: bus.route?.routeNumber || "-",
      routeName: bus.route?.routeName || "-",
      stops: bus.route?.stops || [],
      timings: bus.route?.timings || [],
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Route report failed" });
  }
};

// ================= 🪑 5. SEAT OCCUPANCY =================
const seatOccupancy = async (req, res) => {
  try {
    const buses = await Bus.find().populate("route").lean();

    const assignments = await Assignment.find({ type: "student" }).lean();

    const countMap = {};
    assignments.forEach((a) => {
      const busId = a.bus?.toString();
      if (!busId) return;

      countMap[busId] = (countMap[busId] || 0) + 1;
    });

    const result = buses.map((bus) => {
      const occupied = countMap[bus._id.toString()] || 0;

      return {
        busNumber: bus.busNumber,
        route: bus.route
          ? `${bus.route.routeNumber} - ${bus.route.routeName}`
          : "-",
        totalSeats: bus.capacity,
        occupied,
        remaining: bus.capacity - occupied,
      };
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Seat occupancy failed" });
  }
};

// ================= EXPORT =================
module.exports = {
  allBuses,
  busWithDriver,
  busWithStudents,
  busWithRoute,
  seatOccupancy,
};