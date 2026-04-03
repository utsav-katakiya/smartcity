const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({

  clerkUserId: {
    type: String,
    required: true
  },

  name: String,
  email: String,

  title: {
    type: String,
    required: true
  },

  description: String,

  category: {
    type: String,
    required: true
  },

  location: {
    state: String,
    city: String,
    pincode: String,
    address: String,
    latitude: Number,
    longitude: Number
  },

  image: String,

  priority: {
    type: String,
    enum: ["Low","Medium","High","Emergency"],
    default: "Low"
  },

  status: {
    type: String,
    enum: ["Submitted","In Progress","Resolved"],
    default: "Submitted"
  },

  upvotes: {
    type: Number,
    default: 0
  }

},
{ timestamps: true });

module.exports = mongoose.model("Complaint", complaintSchema);