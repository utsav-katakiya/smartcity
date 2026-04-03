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
  getDepartmentComplaints,
  assignComplaintManual
} = require("../controllers/complaintController");
const { protect, checkRole } = require("../middleware/auth");

// --- PUBLIC ROUTES (Read-Only) ---
router.get("/:id", getComplaintById);
router.get("/", getAllComplaints);

// --- PROTECTED ROUTES (Now Public) ---
router.post("/", upload.single("image"), createComplaint);
router.get("/user/:clerkUserId", getUserComplaints);
router.patch("/upvote/:id", upvoteComplaint);
router.put("/:id", upload.single("image"), updateComplaint);

// --- AUTHORIZED ROUTES (Now Public) ---
router.get("/department", getDepartmentComplaints);
router.put("/assign/:id", assignComplaintManual);

module.exports = router;