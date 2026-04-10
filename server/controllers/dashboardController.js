const Complaint = require("../models/Complaint");

exports.getDashboardAnalytics = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const role = "user"; 

    // AUTH REQUIRED - Filtering by authenticated user's ID
    let query = { clerkUserId: userId };

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
