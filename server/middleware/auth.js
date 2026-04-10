// const User = require("../models/User");
// const { getAuth } = require("@clerk/express");


const protect = (req, res, next) => {
  const userId = req.headers["x-clerk-user-id"] || req.query.clerkUserId || req.body.clerkUserId;
  
  if (!userId) {
    return res.status(401).json({ message: "Authentication required. Please provide a clerkUserId." });
  }

  req.auth = { userId };
  req.user = { clerkUserId: userId, role: "user" }; // Default role, specific controllers check roles
  next();
};

const checkRole = (roles) => {
  return (req, res, next) => {
    const userId = req.headers["x-clerk-user-id"] || req.query.clerkUserId || req.body.clerkUserId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. Missing User Identity." });
    }
    req.auth = { userId };
    req.user = { clerkUserId: userId, role: "admin" }; // Temporary until full role sync
    next();
  };
};

module.exports = { protect, checkRole };
