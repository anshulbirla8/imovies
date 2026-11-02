const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Only logged-in users can pass
exports.protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    next();
  } catch (err) {
    res.status(401).json({ message: "Not authorized, token invalid or expired" });
  }
};

// Only admins can pass (use after protect)
exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  res.status(403).json({ message: "Admin access only" });
};