const Complaint = require("../models/Complaint");
const Notification = require("../models/Notification");
// const { getAuth } = require("@clerk/express");
// axios is not used, removing

// ================= CREATE COMPLAINT =================

exports.createComplaint = async (req, res) => {
  try {
     console.log("BODY:", req.body);   // 🔥 ADD HERE
    console.log("FILE:", req.file);
    // ===== AUTH REMOVED (Dummy User) =====
    const userId = req.auth.userId;

    console.log("[AUTH_DEBUG] User:", userId);

    // ===== SAFE BODY PARSE =====
    const {
      name,
      email,
      description,
      category,
      subcategory,
      address,
      latitude,
      longitude,
    } = req.body || {};

    // ===== VALIDATION =====
    if (!category || !subcategory || !address || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: category, subcategory, address, latitude, or longitude.",
      });
    }

    // ===== SAFE FILE HANDLING =====
    const image = req.file?.path || null;

    // ===== PRIORITY LOGIC =====
    let priority = "LOW";
    const catSafe = String(category).toLowerCase().trim();

    if (
      catSafe.includes("fire") ||
      catSafe.includes("gas") ||
      catSafe.includes("flood") ||
      catSafe.includes("electricity")
    ) {
      priority = "HIGH";
    } else if (
      catSafe.includes("road") ||
      catSafe.includes("traffic")
    ) {
      priority = "MEDIUM";
    }

    // ===== CREATE COMPLAINT =====
    const complaint = await Complaint.create({
      clerkUserId: userId,
      name: name || "Anonymous",
      email: email || "",
      description:
        description ||
        `Issue reported in category: ${category}, Subcategory: ${subcategory}`,
      category,
      subcategory,
      priority,
      address,
      latitude: Number(latitude),
      longitude: Number(longitude),
      image,
      department: "Unassigned",
      assignedDate: null,
    });

    console.log("[SUCCESS] Complaint created:", complaint._id);

    // ===== RESPONSE =====
    return res.status(201).json({
      success: true,
      message: "Complaint submitted successfully",
      complaint,
    });

  } catch (error) {
    console.error("❌ CREATE COMPLAINT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
// ================= GET ALL COMPLAINTS =================

exports.getAllComplaints = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const role = "admin"; // This should be determined by a role check in middleware

    let query = {};
    const isAdminOrDept = true; 

    if (!isAdminOrDept) {
      if (!userId) {
        console.error("[CRITICAL] Identity missing in getAllComplaints");
        return res.status(401).json({ error: "Unauthorized access" });
      }
      query.clerkUserId = userId;
    }

    console.log(`[QUERY_DEBUG] getAllComplaints by ${userId} (${role}). Filter:`, JSON.stringify(query));
    
    // Safety check: if not admin and query is empty, force empty result
    if (!isAdminOrDept && !query.clerkUserId) {
       return res.json([]);
    }

    const complaints = await Complaint.find(query).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    console.error("[ERROR] getAllComplaints:", error);
    res.status(500).json({ error: error.message });
  }
};

// ================= GET USER COMPLAINTS =================

exports.getUserComplaints = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const targetUserId = req.params.clerkUserId || userId;

    let query = { clerkUserId: targetUserId };
    console.log(`[AUTH_DEBUG] getUserComplaints by ${userId}. Filter:`, JSON.stringify(query));

    const complaints = await Complaint.find(query).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    console.error("[ERROR] getUserComplaints:", error);
    res.status(500).json({ error: error.message });
  }
};



// ================= UPDATE COMPLAINT =================

exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================= UPDATE COMPLAINT =================

exports.updateComplaint = async (req, res) => {

  try {

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found"
      });
    }

    complaint.description = req.body.description || complaint.description;
    if (req.body.category) {
      complaint.category = req.body.category;
    }
    complaint.subcategory = req.body.subcategory || complaint.subcategory;

    complaint.address = req.body.address || complaint.address;
    complaint.latitude = req.body.latitude || complaint.latitude;
    complaint.longitude = req.body.longitude || complaint.longitude;

    if (req.file) {
      complaint.image = req.file.path; // Cloudinary URL
    }

    const updatedComplaint = await complaint.save();

    res.json({
      message: "Complaint updated successfully",
      complaint: updatedComplaint
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};
exports.upvoteComplaint = async (req, res) => {
  try {
    const userId = req.auth.userId;
    
    console.log("[AUTH_DEBUG] upvoteComplaint - User attempting vote:", userId);

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
       console.warn(`[WARN] upvoteComplaint - Complaint ${req.params.id} not found`);
       return res.status(404).json({ message: "Complaint not found" });
    }

    if (complaint.upvotedBy.includes(userId)) {
      return res.status(400).json({ message: "You have already supported this issue" });
    }

    complaint.upvotedBy.push(userId);
    complaint.upvotes = (complaint.upvotes || 0) + 1;
    
    await complaint.save();
    console.log(`[SUCCESS] Upvote successful for complaint: ${complaint._id}`);
    res.json({ message: "Support added successfully", upvotes: complaint.upvotes, complaint });
  } catch (error) {
    console.error("[ERROR] upvoteComplaint:", error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get complaints for the logged-in user's department
// @route   GET /api/complaints/department
exports.getDepartmentComplaints = async (req, res) => {
  try {
    const departmentName = req.query.department;
    console.log("FETCH_DEBUG: Received department name:", departmentName);

    if (!departmentName) {
      return res.status(400).json({ message: "No department name provided" });
    }

    const complaints = await Complaint.find({
      $or: [
        { department: departmentName },
        { assignedDepartment: departmentName }
      ]
    }).sort({ createdAt: -1 });

    console.log(`FETCH_DEBUG: Found ${complaints.length} for ${departmentName}`);

    const stats = {
      total: complaints.length,
      pending: complaints.filter(c => c.status === "Submitted").length,
      inProgress: complaints.filter(c => (c.status === "In Progress" || c.status === "progress")).length,
      resolved: complaints.filter(c => (c.status === "Resolved" || c.status === "resolved")).length
    };

    res.json({ complaints, stats, department: departmentName });

  } catch (error) {
    console.error("FETCH_ERROR_DETAILED:", error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Manual assignment of complaint to department
// @route   PUT /api/complaints/:id/assign
exports.assignComplaintManual = async (req, res) => {
  try {
    const { department } = req.body;
    console.log(`ASSIGN_DEBUG: Assigning ${req.params.id} to ${department}`);

    if (!department || department === "None" || department === "Unassigned") {
      return res.status(400).json({ message: "A valid Department name is required for assignment" });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { 
        department: department,
        assignedDate: new Date()
      },
      { new: true }
    );
    
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    // CREATE NOTIFICATION FOR USER
    if (complaint.clerkUserId) {
       await Notification.create({
         userId: complaint.clerkUserId,
         title: "Complaint Assigned",
         message: `Your complaint #${complaint._id.toString().slice(-6)} has been assigned to the ${department}.`,
         type: "StatusUpdate"
       });
    }
    
    console.log("ASSIGN_DEBUG: Assignment saved successfully in 'department' field for:", department);
    res.json({ message: "Assigned successfully", complaint });
  } catch (error) {
    console.error("ASSIGN_ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete a complaint
// @route   DELETE /api/complaints/:id
exports.deleteComplaint = async (req, res) => {
  try {
    const userId = req.auth.userId;
    console.log(`[DELETE_DEBUG] User ${userId} attempting to delete ${req.params.id}`);
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Authorization check: Only creator can delete
    console.log(`[DELETE_DEBUG] Owner: ${complaint.clerkUserId}, Requester: ${userId}`);
    if (complaint.clerkUserId !== userId) {
      console.warn(`[DELETE_DEBUG] Forbidden: ${complaint.clerkUserId} !== ${userId}`);
      return res.status(403).json({ message: "Not authorized to delete this complaint" });
    }

    await Complaint.findByIdAndDelete(req.params.id);
    res.json({ message: "Complaint deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};