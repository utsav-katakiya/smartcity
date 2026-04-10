import React, { useEffect, useState } from "react";
import "./myComplaints.css";
import { useUser, useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { API } from "../../config/api";

const MyComplaints = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  // ================= FETCH COMPLAINTS =================

  const fetchComplaints = async () => {
    try {
      const token = await getToken();
      const res = await fetch(
        `${API}/api/complaints/user/${user.id}`, // Backend now uses token to identify user
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Clerk-User-Id": user.id
          }
        }
      );
      const data = await res.json();
      if (res.ok) {
        setComplaints(data);
      }
    } catch (error) {
      console.error("Error fetching complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  // ================= LOAD DATA =================

  useEffect(() => {
    if (user) {
      fetchComplaints();
    }
  }, [user]);

  // ================= FILTER & SORT =================

  useEffect(() => {
    let result = [...complaints];

    // Search
    if (searchTerm) {
      result = result.filter(c =>
        (c.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (c.description?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (c.category?.toLowerCase() || "").includes(searchTerm.toLowerCase())
      );
    }

    // Status Filter
    if (statusFilter !== "All") {
      result = result.filter(c => c.status === statusFilter);
    }

    // Sort
    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "oldest") {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === "upvotes") {
      result.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
    }

    setFilteredComplaints(result);
  }, [complaints, searchTerm, statusFilter, sortBy]);

  // ================= STATS =================

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === "Submitted" || c.status === "Pending" || c.status === "None").length,
    inProgress: complaints.filter(c => c.status === "In Progress" || c.status === "InProgress").length,
    resolved: complaints.filter(c => c.status === "Resolved").length,
  };

  // ================= HELPERS =================
  const getCategoryIcon = (category) => {
    switch (category) {
      case "Drainage": return "🚰";
      case "Water": return "💧";
      case "Light": return "💡";
      case "Health": return "🏥";
      case "Cleaning & Solid Waste": return "🧹";
      case "Road": return "🛣️";
      case "Wandering & Dead Animal": return "🐕";
      case "Garden": return "🌳";
      case "Crematorium": return "🕯️";
      case "Tree Cutting": return "🪓";
      case "Building": return "🏢";
      case "Gym": return "🏋️";
      case "Library": return "📚";
      case "Swimming Pool": return "🏊";
      case "Traffic Circle": return "🔄";
      case "Plastic Collection": return "♻️";
      case "Smart Toilet": return "🚽";
      case "Fire": return "🔥";
      default: return "📍";
    }
  };

  // ================= LOADING =================

  if (loading) {
    return (
      <DashboardLayout>
        <div className="myComplaintsPage">
          <h2 className="loadingText">Loading your complaints...</h2>
        </div>
      </DashboardLayout>
    );
  }

  // ================= UI =================

  return (
    <DashboardLayout>
      <div className="myComplaintsPage">
        <div className="pageHeader">
          <div>
            <h1 className="pageTitle" style={{ fontSize: '32px', marginBottom: '10px', background: 'none', webkitTextFillColor: 'unset', color: 'var(--text-primary)' }}>My Complaints</h1>
            <p className="pageSubtitle">Track and manage the issues you've reported</p>
          </div>
          <button className="addBtn" onClick={() => navigate("/add-complaint")}>
            + New Complaint
          </button>
        </div>

        {/* STATS CARDS */}
        <div className="statsGridMini">
          <div className="statCardMini total">
            <span className="statLabel">Total Issues</span>
            <span className="statValue">{stats.total}</span>
          </div>
          <div className="statCardMini pending">
            <span className="statLabel">Pending</span>
            <span className="statValue">{stats.pending}</span>
          </div>
          <div className="statCardMini progress">
            <span className="statLabel">In Progress</span>
            <span className="statValue">{stats.inProgress}</span>
          </div>
          <div className="statCardMini resolved">
            <span className="statLabel">Resolved</span>
            <span className="statValue">{stats.resolved}</span>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="controlsRow">
          <div className="searchWrapper">
            <input
              type="text"
              placeholder="Search by title, category, or desc..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="searchInput"
            />
          </div>

          <div className="filtersWrapper">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filterSelect"
            >
              <option value="All">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filterSelect"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="upvotes">Most Upvoted</option>
            </select>
          </div>
        </div>

        {filteredComplaints.length === 0 ? (
          <div className="emptyState">
            <div className="emptyIcon">📭</div>
            <h3>No complaints found</h3>
            <p>{searchTerm || statusFilter !== "All" ? "Try adjusting your filters" : "You have not submitted any complaints yet."}</p>
          </div>
        ) : (
          <div className="complaintsList">
            {filteredComplaints.map((item) => (
              <div key={item._id} className="complaintCardHorizontal">
                <div className="cardMain">
                  <div className="cardTop">
                    <div className="categoryIcon">{getCategoryIcon(item.category)}</div>
                    <div className="titleArea">
                      <h3 className="cardTitle">{item.title}</h3>
                      <span className="cardCategory">{item.category}</span>
                    </div>
                  </div>

                  <p className="cardDesc">
                    {item.description?.substring(0, 160)}
                    {item.description?.length > 160 ? "..." : ""}
                  </p>

                  <div className="cardBottom">
                    <span className={`statusBadge ${item.status.replace(" ", "")}`}>
                      {item.status === "In Progress" ? "🛠️ Working" : item.status}
                    </span>
                    <span className={`priorityBadge ${item.priority || "LOW"}`}>
                      {item.priority || "LOW"}
                    </span>
                    <span className="upvoteInfo">👍 {item.upvotes || 0} supports</span>
                    <span className="cardDate">🗓️ {new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="cardActions">
                  <button onClick={() => navigate(`/complaint/${item._id}`)}>View Details</button>
                  <button onClick={() => navigate(`/edit-complaint/${item._id}`)}>Edit</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyComplaints;