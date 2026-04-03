// const User = require("../models/User");
// const { getAuth } = require("@clerk/express");

/**
 * 🔓 AUTH REMOVED - EVERYONE IS PROTECT
 * This is a dummy middleware that bypasses Clerk
 */
const protect = (req, res, next) => {
  // Set a dummy user identity so controllers don't crash
  req.auth = { userId: "test_user_123" };
  req.user = { role: "admin", clerkUserId: "test_user_123" }; // Give full access
  next();
};

/**
 * 🔓 ROLE CHECK REMOVED
 * Everyone has every role now
 */
const checkRole = (roles) => {
  return (req, res, next) => {
    req.auth = { userId: "test_user_123" };
    req.user = { role: "admin", clerkUserId: "test_user_123" }; 
    next();
  };
};

module.exports = { protect, checkRole };
