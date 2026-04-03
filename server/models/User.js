const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  clerkUserId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["user", "admin", "department"],
    default: "user"
  },
  department: {
    type: String,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
