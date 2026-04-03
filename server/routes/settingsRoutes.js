const express = require("express");
const router = express.Router();
const { getSettings, createSettings, updateSettings } = require("../controllers/settingsController");

const { protect } = require("../middleware/auth");

// PROTECTED SETTINGS: Login required
router.get("/", getSettings);
router.post("/", createSettings);
router.put("/", updateSettings);

module.exports = router;
