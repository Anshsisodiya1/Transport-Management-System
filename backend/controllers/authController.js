const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");



//  REGISTER (Admin/Driver/Student)

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    //  Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};


//  LOGIN

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    console.log("Incoming Email:", email);
    console.log("Incoming Password:", password);
    console.log("Selected Role:", role);

    //  Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User Found:", user);

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    console.log("Password Match:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ROLE VALIDATION (VERY IMPORTANT)
    if (role && user.role !== role) {
      return res.status(403).json({ message: "Wrong role selected" });
    }

    //  Generate token
    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );
    //  Send response
    return res.status(200).json({
      message: "Login successful",
      token,
      role: user.role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.log("Server Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// =======================
//  GET CURRENT USER (Protected)
// =======================
exports.getMe = async (req, res) => {
  try {
    // req.user comes from middleware
    const user = await User.findById(req.user.id).select("-password");

    res.status(200).json({
      user,
    });
  } catch (error) {
    console.error("GET ME ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};
