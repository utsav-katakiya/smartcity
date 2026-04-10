const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: String, // Clerk User Id of the recipient (optional for area alerts)
    required: false
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: false
  },
  area: {
    type: String,
    required: false
  },
  type: {
    type: String,
    enum: ["StatusUpdate", "AreaAlert", "General"],
    default: "General"
  },
  read: {
    type: Boolean,
    default: false
  },
  createdByAdmin: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Auto-delete notifications after 15 days (15 * 24 * 60 * 60 seconds)
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 1296000 });

module.exports = mongoose.model("Notification", NotificationSchema);
