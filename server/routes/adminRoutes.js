const express = require("express");
const router = express.Router();
const {
  getAllComplaintsAdmin,
  getAdminStats,
  updateStatus,
  updatePriority,
  assignDepartment,
  deleteComplaint,
  getComplaintStats,
  getEmergencyComplaints,
  getLocationStats
} = require("../controllers/adminController");
const { checkRole } = require("../middleware/auth");

router.get("/complaints", getAllComplaintsAdmin);
router.get("/stats", getAdminStats);
router.get("/complaint-stats", getComplaintStats);
router.get("/emergency-complaints", getEmergencyComplaints);
router.get("/location-stats", getLocationStats);
router.put("/complaints/:id/status", updateStatus);
router.put("/complaints/:id/priority", updatePriority);
router.put("/complaints/:id/assign-department", assignDepartment);
router.delete("/complaints/:id", deleteComplaint);

module.exports = router;
