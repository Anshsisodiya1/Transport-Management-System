const Student = require("../models/Student");

// ✅ Approve
exports.approveApplication = async (req, res) => {
  const student = await Student.findByIdAndUpdate(
    req.params.id,
    { status: "approved" },
    { new: true }
  );

  res.json({ message: "Approved", student });
};

// ❌ Reject
exports.rejectApplication = async (req, res) => {
  const student = await Student.findByIdAndUpdate(
    req.params.id,
    { status: "rejected" },
    { new: true }
  );

  res.json({ message: "Rejected", student });
};