const express = require("express");
const router = express.Router();

const {
  registerStudent,
  registerDriver,
  getAdminStats,
  getStudents,
  getDrivers,
  getLiveBuses,
  getBusHistory,
} = require("../controllers/adminController");

const verifyToken = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");

const User = require("../models/User");
const Student = require("../models/Student");
const Driver = require("../models/Driver");
const Assignment = require("../models/Assignment");
const Route = require("../models/Route");
const Bus = require("../models/Bus");

// ════════════════════════════════════════════════
// EXISTING ROUTES
// ════════════════════════════════════════════════

router.post(
  "/register-student",
  verifyToken,
  checkRole("admin"),
  registerStudent,
);

router.post(
  "/register-driver",
  verifyToken,
  checkRole("admin"),
  registerDriver,
);

router.get("/stats", verifyToken, checkRole("admin"), getAdminStats);

router.get("/students", getStudents);

router.get("/drivers", verifyToken, checkRole("admin"), getDrivers);

router.get("/live-buses", verifyToken, checkRole("admin"), getLiveBuses);

router.get("/bus/:id/history", verifyToken, checkRole("admin"), getBusHistory);

// ════════════════════════════════════════════════
// MANAGE USERS — FILTER OPTIONS
// ════════════════════════════════════════════════

router.get(
  "/users/filter-options",
  verifyToken,
  checkRole("admin"),
  async (req, res) => {
    try {
      const branches = await Student.distinct("branch");

      // FIX: stopName lives on Student, not Assignment
      const stops = await Student.distinct("stopName");

      const routeDocs = await Route.find({}, "routeNumber routeName").lean();

      const routes = routeDocs.map((r) => r.routeNumber || r.routeName);

      res.json({
        success: true,
        data: {
          branches,
          stops,
          routes,
        },
      });
    } catch (err) {
      console.log(err);

      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },
);

// ════════════════════════════════════════════════
// MANAGE USERS — GET STUDENTS
// ════════════════════════════════════════════════

router.get(
  "/users/students",
  verifyToken,
  checkRole("admin"),
  async (req, res) => {
    try {
      const { branch, stop, route, search } = req.query;

      const studentFilter = {};

      if (branch) {
        studentFilter.branch = {
          $regex: branch,
          $options: "i",
        };
      }

      const students = await Student.find(studentFilter)
        .populate("user", "name email phone enrollmentNumber")
        .lean();

      let enriched = await Promise.all(
        students.map(async (s) => {
          let routeNo = "—";

          // Route lookup still comes from Assignment (bus/route assignment)
          const asgn = await Assignment.findOne({ student: s.user._id })
            .populate({
              path: "bus",
              populate: {
                path: "route",
                select: "routeNumber routeName",
              },
            })
            .lean();

          if (asgn?.bus?.route) {
            routeNo =
              asgn.bus.route.routeNumber || asgn.bus.route.routeName || "—";
          }

          return {
            _id: s._id,
            userId: s.user?._id,

            name: s.user?.name || "—",
            email: s.user?.email || "—",
            phone: s.user?.phone || "—",

            enrollmentNumber: s.user?.enrollmentNumber || "—",

            branch: s.branch || "—",

            // FIX: stopName comes straight from the Student document
            stopName: s.stopName || "—",
            routeNo,
          };
        }),
      );

      // FILTER BY STOP
      if (stop) {
        enriched = enriched.filter((s) =>
          s.stopName?.toLowerCase().includes(stop.toLowerCase()),
        );
      }

      // FILTER BY ROUTE
      if (route) {
        enriched = enriched.filter((s) =>
          s.routeNo?.toLowerCase().includes(route.toLowerCase()),
        );
      }

      // SEARCH
      if (search) {
        const q = search.toLowerCase();

        enriched = enriched.filter(
          (s) =>
            s.name?.toLowerCase().includes(q) ||
            s.email?.toLowerCase().includes(q) ||
            s.enrollmentNumber?.toLowerCase().includes(q),
        );
      }

      res.json({
        success: true,
        data: enriched,
      });
    } catch (err) {
      console.log(err);

      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },
);

// ════════════════════════════════════════════════
// MANAGE USERS — GET DRIVERS
// ════════════════════════════════════════════════

router.get(
  "/users/drivers",
  verifyToken,
  checkRole("admin"),
  async (req, res) => {
    try {
      const { search } = req.query;

      const filter = {
        role: "driver",
      };

      if (search) {
        filter.$or = [
          {
            name: {
              $regex: search,
              $options: "i",
            },
          },
          {
            email: {
              $regex: search,
              $options: "i",
            },
          },
        ];
      }

      const users = await User.find(filter).select("name email phone").lean();

      const enriched = await Promise.all(
        users.map(async (u) => {
          // DRIVER DETAILS
          const driverInfo = await Driver.findOne({
            user: u._id,
          })
            .populate("assignedBus")
            .lean();

          let routeNo = "—";
          let busNumber = "—";

          // ASSIGNMENT
          const assignment = await Assignment.findOne({
            driver: u._id,
          })
            .populate({
              path: "bus",
              populate: {
                path: "route",
                model: "Route",
              },
            })
            .lean();

          // ROUTE
          if (assignment?.bus?.route) {
            routeNo =
              assignment.bus.route.routeNumber ||
              assignment.bus.route.routeName ||
              "—";
          }

          // BUS NUMBER
          if (assignment?.bus) {
            busNumber = assignment.bus.busNumber || "—";
          }

          return {
            _id: u._id,

            name: u.name || "—",
            email: u.email || "—",
            phone: u.phone || "—",

            licenseNumber: driverInfo?.licenseNumber || "—",

            aadharNumber: driverInfo?.aadharNumber || "—",

            routeNo,
            busNumber,
          };
        }),
      );

      res.json({
        success: true,
        data: enriched,
      });
    } catch (err) {
      console.log("DRIVER FETCH ERROR:", err);

      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },
);

// ════════════════════════════════════════════════
// MANAGE USERS — EDIT STUDENT
// ════════════════════════════════════════════════

router.put(
  "/users/students/:id",
  verifyToken,
  checkRole("admin"),
  async (req, res) => {
    try {
      const { name, email, phone, branch, stopName, enrollmentNumber } =
        req.body;

      const student = await Student.findById(req.params.id);

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      await User.findByIdAndUpdate(student.user, {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(enrollmentNumber && {
          enrollmentNumber,
        }),
      });

      if (branch) student.branch = branch;

      // FIX: stopName saved on the Student document itself
      if (stopName) student.stopName = stopName;

      await student.save();

      res.json({
        success: true,
        message: "Student updated successfully",
      });
    } catch (err) {
      console.log(err);

      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },
);

// ════════════════════════════════════════════════
// MANAGE USERS — EDIT DRIVER
// ════════════════════════════════════════════════

router.put(
  "/users/drivers/:id",
  verifyToken,
  checkRole("admin"),
  async (req, res) => {
    try {
      const { name, email, phone, licenseNumber, aadharNumber } = req.body;

      // UPDATE USER
      await User.findByIdAndUpdate(req.params.id, {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
      });

      // UPDATE DRIVER MODEL
      await Driver.findOneAndUpdate(
        { user: req.params.id },
        {
          ...(licenseNumber && {
            licenseNumber,
          }),
          ...(aadharNumber && {
            aadharNumber,
          }),
        },
      );

      res.json({
        success: true,
        message: "Driver updated successfully",
      });
    } catch (err) {
      console.log(err);

      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },
);

// ════════════════════════════════════════════════
// MANAGE USERS — DELETE STUDENT
// ════════════════════════════════════════════════

router.delete(
  "/users/students/:id",
  verifyToken,
  checkRole("admin"),
  async (req, res) => {
    try {
      const student = await Student.findById(req.params.id);

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      await Assignment.deleteMany({
        student: student.user,
      });

      await User.findByIdAndDelete(student.user);

      await Student.findByIdAndDelete(req.params.id);

      res.json({
        success: true,
        message: "Student deleted successfully",
      });
    } catch (err) {
      console.log(err);

      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },
);

// ════════════════════════════════════════════════
// MANAGE USERS — DELETE DRIVER
// ════════════════════════════════════════════════

router.delete(
  "/users/drivers/:id",
  verifyToken,
  checkRole("admin"),
  async (req, res) => {
    try {
      await Assignment.deleteMany({
        driver: req.params.id,
      });

      await Driver.findOneAndDelete({
        user: req.params.id,
      });

      await User.findByIdAndDelete(req.params.id);

      res.json({
        success: true,
        message: "Driver deleted successfully",
      });
    } catch (err) {
      console.log(err);

      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },
);

module.exports = router;