const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // req.user comes from authMiddleware (JWT decoded)
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          message: "Access Denied: You are not allowed to access this resource",
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        message: "Server Error",
      });
    }
  };
};

module.exports = checkRole;