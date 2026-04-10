const Notification = require("../models/Notification");

// @desc    Send area alert notification
// @route   POST /api/admin/notifications
exports.sendAreaAlert = async (req, res) => {
  try {
    const { title, message, city, area } = req.body;
    
    const notification = await Notification.create({
      title,
      message,
      city,
      area,
      type: "AreaAlert",
      createdByAdmin: true
    });

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get notifications for a user based on their ID and their last known city/area
// @route   GET /api/user/notifications
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { city, area } = req.query;
    console.log("[AUTH_DEBUG] getUserNotifications - Fetching for User:", userId);

    // Get notifications directly for user OR general alerts for their area
    const notifications = await Notification.find({
      $or: [
        { userId: userId },
        { 
          type: "AreaAlert", 
          $or: [
            { city: city, area: area },
            { city: city, area: { $exists: false } },
            { city: { $exists: false }, area: { $exists: false } },
            // If no city/area is provided, show ALL AreaAlerts
            ...(!city ? [{ city: { $exists: true } }] : [])
          ]
        }
      ]
    }).sort({ createdAt: -1 });

    console.log(`[DEBUG] getUserNotifications - Found ${notifications.length} notifications`);
    res.json(notifications);
  } catch (error) {
    console.error("[ERROR] getUserNotifications:", error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/user/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Ownership check
    if (notification.userId && notification.userId !== userId) {
      return res.status(403).json({ message: "Not authorized to read this notification" });
    }

    notification.read = true;
    await notification.save();
    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("[ERROR] markAsRead:", error);
    res.status(500).json({ error: error.message });
  }
};
