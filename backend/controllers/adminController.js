const bcrypt = require("bcrypt");

// Models
const User = require("../models/User");
const Student = require("../models/Student");
const Driver = require("../models/Driver");
const Bus = require("../models/Bus");
const Assignment = require("../models/Assignment");
const Trip = require("../models/Trip"); // needed for getLiveBuses

const sendEmail = require("../config/email");

// Helper
const generatePassword = () => {
  return Math.random().toString(36).slice(-8);
};

// Register student
exports.registerStudent = async (req, res) => {
  try {
    const { name, email, phone, enrollmentNumber, branch, stopName } = req.body;

    if (!name || !email || !phone || !enrollmentNumber || !branch || !stopName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Student already exists" });
    }

    const plainPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const newUser = await User.create({
      name,
      email,
      phone,
      enrollmentNumber,
      password: hashedPassword,
      role: "student",
    });

    await Student.create({
      user: newUser._id,
      branch,
      stopName,
    });

    await sendEmail({
      to: email,
      name,
      email,
      password: plainPassword,
      role: "student",
    });

    res.status(201).json({
      message: "Student registered successfully",
      credentials: { email, password: plainPassword },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Register driver
exports.registerDriver = async (req, res) => {
  try {
    const { name, email, phone, userId, licenseNumber, aadharNumber } = req.body;

    if (!name || !email || !phone || !userId || !licenseNumber || !aadharNumber) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { userId }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "Driver already exists" });
    }

    const plainPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const newUser = await User.create({
      name,
      email,
      phone,
      userId,
      password: hashedPassword,
      role: "driver",
    });

    await Driver.create({
      user: newUser._id,
      licenseNumber,
      aadharNumber,
    });

    await sendEmail({
      to: email,
      name,
      email,
      password: plainPassword,
      role: "driver",
    });

    res.status(201).json({
      message: "Driver registered successfully",
      credentials: { email, password: plainPassword },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Admin dashboard stats
exports.getAdminStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalDrivers = await Driver.countDocuments();
    const totalUsers = totalStudents + totalDrivers;
    const totalBuses = await Bus.countDocuments();
    const totalAssignments = await Assignment.countDocuments();

    res.json({
      users: totalUsers,
      students: totalStudents,
      drivers: totalDrivers,
      buses: totalBuses,
      assignments: totalAssignments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all students
exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find().populate("user");
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all drivers
exports.getDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find().populate("user");
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/live-buses
exports.getLiveBuses = async (req, res) => {
  try {
    const buses = await Bus.find().lean();

    const results = await Promise.all(
      buses.map(async (bus) => {
        const trip = await Trip.findOne({ bus: bus._id, active: true }).lean();

        const driverAssignment = await Assignment.findOne({
          bus: bus._id,
          type: "driver",
        })
          .populate("driver", "name phone contact email")
          .lean();

        return {
          busId: String(bus._id),
          busNumber: bus.busNumber,
          active: !!trip,
          location:
            trip &&
            trip.currentLocation?.lat != null &&
            trip.currentLocation?.lng != null &&
            !(trip.currentLocation.lat === 0 && trip.currentLocation.lng === 0)
              ? { lat: trip.currentLocation.lat, lng: trip.currentLocation.lng }
              : null,
          driver: driverAssignment?.driver || null,
          startTime: trip?.startTime || null,
        };
      })
    );

    res.json(results);
  } catch (err) {
    console.error("getLiveBuses error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// gat bus history - last 30 trips with driver info
exports.getBusHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const trips = await Trip.find({ bus: id })
      .populate("driver", "name phone email")
      .sort({ startTime: -1 })
      .limit(30)
      .lean();
    res.json(trips);
  } catch (err) {
    console.error("getBusHistory error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};

