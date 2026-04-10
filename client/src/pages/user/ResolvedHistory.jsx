import React, { useEffect, useState } from "react";
import "./myComplaints.css"; // Reuse existing styles
import { useUser, useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { API } from "../../config/api";

const ResolvedHistory = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchResolvedComplaints = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = await getToken();
      const res = await fetch(
        `${API}/api/complaints/user/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Clerk-User-Id": user.id
          }
        }
      );
      const data = await res.json();
      if (res.ok) {
        // Filter ONLY resolved ones
        const resolved = data.filter(c => c.status === "Resolved");
        setComplaints(resolved);
      }
    } catch (error) {
      console.error("Error fetching resolved history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResolvedComplaints();
  }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this complaint record?")) return;

    setDeletingId(id);
    try {
      const token = await getToken();
      if (!token || !user) return;

      const res = await fetch(`${API}/api/complaints/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "X-Clerk-User-Id": user.id
        }
      });

      if (res.ok) {
        setComplaints(prev => prev.filter(c => c._id !== id));
        alert("Record deleted successfully.");
      } else {
        const err = await res.json();
        alert(err.message || "Failed to delete.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Network error.");
    } finally {
      setDeletingId(null);
    }
  };

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

  return (
    <DashboardLayout>
      <div className="myComplaintsPage">
        <div className="pageHeader">
          <div>
            <h1 className="pageTitle" style={{ fontSize: '32px', marginBottom: '10px', color: 'var(--text-primary)' }}>Resolved History</h1>
            <p className="pageSubtitle">View your successfully resolved issues and manage records.</p>
          </div>
        </div>

        {loading ? (
          <div className="loadingText">Syncing your history...</div>
        ) : complaints.length === 0 ? (
          <div className="emptyState">
            <div className="emptyIcon">✅</div>
            <h3>No resolved issues yet</h3>
            <p>Once a department fixes an issue you reported, it will appear here.</p>
          </div>
        ) : (
          <div className="complaintsList">
            {complaints.map((item) => (
              <div key={item._id} className="complaintCardHorizontal resolved-card">
                <div className="cardMain">
                  <div className="cardTop">
                    {item.image ? (
                      <img
                        src={item.image.startsWith("http") ? item.image : `${API}/uploads/${item.image}`}
                        alt="preview"
                        className="categoryIcon thumb-preview"
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="categoryIcon">{getCategoryIcon(item.category)}</div>
                    )}
                    <div className="titleArea">
                      <h3 className="cardTitle">{item.title || item.subcategory}</h3>
                      <span className="cardCategory">{item.category}</span>
                    </div>
                  </div>

                  <p className="cardDesc">
                    {item.description?.substring(0, 160)}...
                  </p>

                  <div className="cardBottom">
                    <span className="statusBadge Resolved">✅ Resolved</span>
                    <span className="cardDate">🗓️ Completed on: {new Date(item.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="cardActions">
                  <button className="view-btn" onClick={() => navigate(`/complaint/${item._id}`)}>Details</button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(item._id)}
                    style={{ backgroundColor: '#ef4444', color: 'white' }}
                    disabled={deletingId === item._id}
                  >
                    {deletingId === item._id ? "..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ResolvedHistory;
