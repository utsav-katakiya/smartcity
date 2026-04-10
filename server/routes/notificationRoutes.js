const express = require("express");
const router = express.Router();
const {
  sendAreaAlert,
  getUserNotifications,
  markAsRead
} = require("../controllers/notificationController");

const { protect, checkRole } = require("../middleware/auth");

router.post("/admin/send-alert", checkRole(["admin"]), sendAreaAlert);
router.get("/user", protect, getUserNotifications);
router.put("/:id/read", protect, markAsRead);

module.exports = router;
