const express = require("express");
const router = express.Router();

const {
  assign,
  getAllAssignments,
  deleteAssignment,
  updateAssignment,
} = require("../controllers/assignmentController");

//  Assign (driver or student)
router.post("/assign", assign);

//  Get all assignments
router.get("/", getAllAssignments);

//  Delete assignment
router.delete("/:id", deleteAssignment);

// FIXED ROUTE (IMPORTANT)
router.put("/:id", updateAssignment);

module.exports = router;