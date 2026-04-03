const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({

  clerkUserId: {
    type: String,
    required: true
  },

  name: {
    type: String
  },

  email: {
    type: String
  },


  description: {
    type: String,
    required: false
  },

  category: {
    type: String,
    required: true
  },

  subcategory: {
    type: String,
    required: true
  },

  address: String,

  latitude: {
    type: Number,
    required: true
  },

  longitude: {
    type: Number,
    required: true
  },

  image: String,

  status: {
    type: String,
    enum: ["Submitted", "In Progress", "Resolved"],
    default: "Submitted"
  },

  priority: {
    type: String,
    enum: ["LOW", "MEDIUM", "HIGH"],
    default: "LOW"
  },

  upvotes: {
    type: Number,
    default: 0
  },

  upvotedBy: [
    {
      type: String // clerkUserId
    }
  ],

  department: {
    type: String,
    default: null
  },

  assignedDepartment: {
    type: String,
    default: null
  },

  assignedDate: {
    type: Date,
    default: null
  }

}, { timestamps: true });

module.exports = mongoose.model("Complaint", complaintSchema);