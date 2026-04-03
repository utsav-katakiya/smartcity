const Complaint = require("../models/Complaint");

exports.getDashboardAnalytics = async (req, res) => {
  try {
    const userId = "test_user_123";
    const role = "admin";
    const isAdminOrDept = true;

    // AUTH REMOVED
    let query = {};

    const [
      totalComplaints,
      pending,
      inProgress,
      resolved,
      mostUpvoted,
      recent
    ] = await Promise.all([
      Complaint.countDocuments(query),
      Complaint.countDocuments({ ...query, status: { $in: ["Submitted", "Pending"] } }),
      Complaint.countDocuments({ ...query, status: "In Progress" }),
      Complaint.countDocuments({ ...query, status: "Resolved" }),
      Complaint.find(query)
        .sort({ upvotes: -1 })
        .limit(5)
        .select("title category upvotes city location address status createdAt"),
      Complaint.find(query)
        .sort({ createdAt: -1 })
        .limit(5)
        .select("title category status createdAt city")
    ]);

    res.json({
      totalComplaints,
      pending,
      inProgress,
      resolved,
      mostUpvoted,
      recentComplaints: recent
    });
  } catch (error) {
    console.error("[ERROR] getDashboardAnalytics:", error);
    res.status(500).json({ error: error.message });
  }
};
