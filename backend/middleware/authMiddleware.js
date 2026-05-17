const jwt = require("jsonwebtoken");
const User = require("../models/User");

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(403).json({ message: "No token provided" });
  }

  try {
    //  Extract token safely
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    // Use ENV instead of hardcoded secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch full user
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //  Attach both user + id (VERY USEFUL)
    req.user = user;
    req.userId = user._id;

    next();
  } catch (error) {
    console.log(" Auth Error:", error.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = verifyToken;