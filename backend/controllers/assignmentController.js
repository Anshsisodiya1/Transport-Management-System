const Assignment = require("../models/Assignment");
const Bus = require("../models/Bus");
const User = require("../models/User");

// Assign Driver & Students
const assign = async (req, res) => {
  try {
    const { type, studentId, driverId, busId } = req.body;
    let { seatNumber } = req.body;

    if (!type || !busId) {
      return res.status(400).json({ message: "Type and busId required" });
    }

    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    // ================= DRIVER =================
    if (type === "driver") {
      if (!driverId) {
        return res.status(400).json({ message: "DriverId required" });
      }

      const driver = await User.findById(driverId);
      if (!driver || driver.role !== "driver") {
        return res.status(400).json({ message: "Invalid driver" });
      }

      const exists = await Assignment.findOne({
        driver: driverId,
        type: "driver",
      });

      if (exists) {
        return res.status(400).json({ message: "Driver already assigned" });
      }

      const assignment = await Assignment.create({
        driver: driverId,
        bus: busId,
        type: "driver",
      });

      return res.status(201).json({
        message: "Driver assigned",
        assignment,
      });
    }

    // ================= STUDENT =================
    if (type === "student") {
      const parsedSeat = parseInt(seatNumber, 10);

      //  STRICT VALIDATION
      if (!studentId || isNaN(parsedSeat)) {
        return res.status(400).json({ message: "Valid seat required" });
      }

      const student = await User.findById(studentId);
      if (!student || student.role !== "student") {
        return res.status(400).json({ message: "Invalid student" });
      }

      if (bus.currentCapacity >= bus.capacity) {
        return res.status(400).json({ message: "Bus is full" });
      }

      //  CHECK SEAT ALREADY TAKEN
      const seatTaken = await Assignment.findOne({
        bus: busId,
        seatNumber: parsedSeat,
        type: "student",
      });

      if (seatTaken) {
        return res.status(400).json({ message: "Seat already booked" });
      }

      //  CHECK STUDENT ALREADY ASSIGNED
      const alreadyAssigned = await Assignment.findOne({
        student: studentId,
        type: "student",
      });

      if (alreadyAssigned) {
        return res.status(400).json({ message: "Student already assigned" });
      }

      console.log("FINAL seatNumber:", parsedSeat); // DEBUG

      const assignment = await Assignment.create({
        student: studentId,
        bus: busId,
        seatNumber: parsedSeat,
        type: "student",
      });

      bus.currentCapacity += 1;
      await bus.save();

      return res.status(201).json({
        message: "Student assigned",
        assignment,
      });
    }

    return res.status(400).json({ message: "Invalid type" });

  } catch (err) {
    console.error(" Assign Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get all assignments
const getAllAssignments = async (req, res) => {
  try {
    const data = await Assignment.find()
      .populate({
        path: "student",
        select: "name email",
      })
      .populate({
        path: "driver",
        select: "name email",
      })
      .populate("bus", "busNumber capacity");

    res.json(data);
  } catch (err) {
    console.error(" Fetch Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Deleqte assignment
const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ message: "Not found" });
    }

    if (assignment.type === "student") {
      const bus = await Bus.findById(assignment.bus);
      if (bus && bus.currentCapacity > 0) {
        bus.currentCapacity -= 1;
        await bus.save();
      }
    }

    await assignment.deleteOne();

    res.json({ message: "Deleted successfully" });

  } catch (err) {
    console.error(" Delete Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update assignment
const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { busId, seatNumber } = req.body;

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const newBus = await Bus.findById(busId);
    if (!newBus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    const oldBus = await Bus.findById(assignment.bus);

    // ================= DRIVER =================
    if (assignment.type === "driver") {
      assignment.bus = busId;
      await assignment.save();

      return res.json({
        message: "Driver updated successfully",
        assignment,
      });
    }

    // ================= STUDENT =================
    if (assignment.type === "student") {
      const parsedSeat = parseInt(seatNumber, 10);

      if (isNaN(parsedSeat)) {
        return res.status(400).json({ message: "Valid seat required" });
      }

      const seatTaken = await Assignment.findOne({
        bus: busId,
        seatNumber: parsedSeat,
        type: "student",
        _id: { $ne: id },
      });

      if (seatTaken) {
        return res.status(400).json({ message: "Seat already booked" });
      }

      // bus change logic
      if (String(oldBus._id) !== String(newBus._id)) {
        oldBus.currentCapacity = Math.max(0, oldBus.currentCapacity - 1);

        if (newBus.currentCapacity >= newBus.capacity) {
          return res.status(400).json({ message: "Bus full" });
        }

        newBus.currentCapacity += 1;

        await oldBus.save();
        await newBus.save();
      }

      assignment.bus = busId;
      assignment.seatNumber = parsedSeat;

      await assignment.save();

      return res.json({
        message: "Student updated successfully",
        assignment,
      });
    }

    return res.status(400).json({ message: "Invalid type" });

  } catch (err) {
    console.error("❌ Update Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  assign,
  getAllAssignments,
  deleteAssignment,
  updateAssignment,
};