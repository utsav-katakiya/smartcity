const mongoose = require("mongoose");

const UserSettingsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  emailNotifications: { type: Boolean, default: true },
  smsNotifications: { type: Boolean, default: false },
  inAppNotifications: { type: Boolean, default: true },
  theme: { type: String, enum: ["light", "dark", "system"], default: "system" },
  defaultCategoryFilter: { type: String, default: "All" },
  defaultStatusFilter: { type: String, default: "All" },
  refreshInterval: { type: Number, default: 15 },
  shareAnonymousUsageData: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("UserSettings", UserSettingsSchema);
