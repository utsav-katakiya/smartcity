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
  getLocationStats,
  getComplaintById
} = require("../controllers/adminController");
const {
  getDepartments,
  addDepartment,
  updateDepartment,
  deleteDepartment,
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory
} = require("../controllers/adminSettingsController");
const { checkRole } = require("../middleware/auth");

router.get("/complaints", getAllComplaintsAdmin);
router.get("/complaints/:id", getComplaintById);
router.get("/stats", getAdminStats);
router.get("/complaint-stats", getComplaintStats);
router.get("/emergency-complaints", getEmergencyComplaints);
router.get("/location-stats", getLocationStats);
router.put("/complaints/:id/status", updateStatus);
router.put("/complaints/:id/priority", updatePriority);
router.put("/complaints/:id/assign-department", assignDepartment);
router.delete("/complaints/:id", deleteComplaint);

// --- SETTINGS ---
router.get("/departments", getDepartments);
router.post("/departments", addDepartment);
router.put("/departments/:id", updateDepartment);
router.delete("/departments/:id", deleteDepartment);

router.get("/categories", getCategories);
router.post("/categories", addCategory);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

module.exports = router;
