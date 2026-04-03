const Complaint = require("../models/Complaint");


// @desc    Get all complaints with filters for admin
// @route   GET /api/admin/complaints
exports.getAllComplaintsAdmin = async (req, res) => {
  try {
    const { category, status, city, search, department, filter } = req.query;

    let query = {};
    if (category && category !== "All") query.category = category;
    if (status && status !== "All") query.status = status;
    if (department && department !== "All") query.department = department;
    if (filter === "unassigned") query.department = { $in: [null, "None"] };
    if (city && city !== "All") query.city = new RegExp(city, "i");

    if (search) {
      query.$or = [
        { subcategory: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
        { address: new RegExp(search, "i") }
      ];
    }

    const complaints = await Complaint.find(query).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get complaint stats for dashboard
// @route   GET /api/admin/stats
exports.getAdminStats = async (req, res) => {
  try {
    const total = await Complaint.countDocuments();
    const pending = await Complaint.countDocuments({ status: "Submitted" });
    const inProgress = await Complaint.countDocuments({ status: "In Progress" });
    const resolved = await Complaint.countDocuments({ status: "Resolved" });

    const categories = [
      "Drainage",
      "Water",
      "Light",
      "Health",
      "Cleaning & Solid Waste",
      "Road",
      "Wandering & Dead Animal",
      "Garden",
      "Crematorium",
      "Tree Cutting",
      "Building",
      "Gym",
      "Library",
      "Swimming Pool",
      "Traffic Circle",
      "Plastic Collection",
      "Smart Toilet",
      "Fire"
    ];

    const categoryStats = await Promise.all(categories.map(async (cat) => {
      const count = await Complaint.countDocuments({ category: cat });
      return { category: cat, count };
    }));

    res.json({
      total,
      pending,
      inProgress,
      resolved,
      categoryStats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update complaint status
// @route   PUT /api/admin/complaints/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update complaint priority
// @route   PUT /api/admin/complaints/:id/priority
exports.updatePriority = async (req, res) => {
  try {
    const { priority } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { priority },
      { new: true }
    );
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Assign department to complaint
// @route   PUT /api/admin/complaints/:id/assign-department
exports.assignDepartment = async (req, res) => {
  try {
    const { assignedDepartment } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { 
        department: assignedDepartment,
        assignedDate: assignedDepartment && assignedDepartment !== "None" ? new Date() : null
      },
      { new: true }
    );
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete complaint
// @route   DELETE /api/admin/complaints/:id
exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });
    res.json({ message: "Complaint deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// @desc    Get active high priority complaints
// @route   GET /api/admin/emergency-complaints
exports.getEmergencyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      priority: "HIGH",
      status: { $ne: "Resolved" }
    }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// @desc    Get workload stats by department
// @route   GET /api/admin/complaint-stats
exports.getComplaintStats = async (req, res) => {
  try {
    const departments = [
      "Water Department", "Electricity Department", "Sanitation Department", 
      "Road & Infrastructure", "Garden & Environment", "Animal Control", 
      "Health Department", "Public Works", "Recreation", "Fire Department"
    ];

    const departmentWorkload = await Promise.all(departments.map(async (dept) => {
      const total = await Complaint.countDocuments({ department: dept });
      const resolved = await Complaint.countDocuments({ department: dept, status: "Resolved" });
      const pending = await Complaint.countDocuments({ department: dept, status: "Submitted" });
      const inProgress = await Complaint.countDocuments({ department: dept, status: "In Progress" });
      
      return {
        department: dept,
        total,
        resolved,
        pending,
        inProgress
      };
    }));

    res.json({ departmentWorkload });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get complaint counts by city for heatmap
// @route   GET /api/admin/location-stats
exports.getLocationStats = async (req, res) => {
  try {
    const stats = await Complaint.aggregate([
      {
        $group: {
          _id: "$address",
          count: { $sum: 1 },
          lat: { $first: "$latitude" },
          lon: { $first: "$longitude" }
        }
      },
      {
        $project: {
          _id: 0,
          location: "$_id",
          count: 1,
          latitude: "$lat",
          longitude: "$lon"
        }
      }
    ]);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
