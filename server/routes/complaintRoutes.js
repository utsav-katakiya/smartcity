const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const {
  createComplaint,
  getAllComplaints,
  getUserComplaints,
  updateComplaint,
  getComplaintById,
  upvoteComplaint,
  deleteComplaint,
  getDepartmentComplaints,
  assignComplaintManual
} = require("../controllers/complaintController");
const { protect, checkRole } = require("../middleware/auth");

// --- PUBLIC ROUTES (Read-Only) ---
router.get("/", getAllComplaints);

// --- AUTHORIZED ROUTES (Now Public-ish) ---
// Moved /department UP to prevent /:id from consuming it
router.get("/department", getDepartmentComplaints);
router.put("/assign/:id", assignComplaintManual);

router.get("/:id", getComplaintById);

// --- PROTECTED ROUTES ---
router.post("/", protect, upload.single("image"), createComplaint);
router.get("/user/:clerkUserId", protect, getUserComplaints);
router.patch("/upvote/:id", protect, upvoteComplaint);
router.put("/:id", protect, upload.single("image"), updateComplaint);
router.delete("/:id", protect, deleteComplaint);

module.exports = router;