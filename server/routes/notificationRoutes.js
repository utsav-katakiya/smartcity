const express = require("express");
const router = express.Router();
const {
  sendAreaAlert,
  getUserNotifications,
  markAsRead
} = require("../controllers/notificationController");

const { protect, checkRole } = require("../middleware/auth");

router.post("/admin/send-alert", sendAreaAlert);
router.get("/user", getUserNotifications);
router.put("/:id/read", markAsRead);

module.exports = router;
