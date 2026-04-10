const express = require("express");
const router = express.Router();
const { getSettings, createSettings, updateSettings } = require("../controllers/settingsController");

const { protect } = require("../middleware/auth");

// PROTECTED SETTINGS: Login required
router.get("/", protect, getSettings);
router.post("/", protect, createSettings);
router.put("/", protect, updateSettings);

module.exports = router;
