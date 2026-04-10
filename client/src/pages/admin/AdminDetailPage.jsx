import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import "./AdminComplaints.css"; // Reuse existing admin styles
import "../user/complaintDetails.css"; // Reuse card-based details style

const AdminDetailPage = () => {
  const { id } = useParams();
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaint = async () => {
      if (!user || user.id === undefined) return;
      try {
        const token = await getToken();
        const res = await fetch(`http://localhost:5000/api/admin/complaints/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Clerk-User-Id": user.id
          }
        });
        const data = await res.json();
        if (res.ok) {
          setComplaint(data);
        }
      } catch (error) {
        console.error("Error fetching admin complaint details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaint();
  }, [id, getToken, user?.id]);


  if (loading) return <div className="detailsPage">Loading admin overview...</div>;
  if (!complaint) return <div className="detailsPage">Complaint not found.</div>;

  return (
    <div className="detailsPage admin-view-mode">
      <div className="detailsCard">
        <div className="admin-detail-header">
          <button className="back-btn-mini" onClick={() => navigate(-1)}>← Go Back</button>
          <span className="admin-tag">ADMIN OVERVIEW</span>
        </div>

        {complaint.image && (
          <img
            src={complaint.image?.startsWith("http") ? complaint.image : `http://localhost:5000/uploads/${complaint.image}`}
            alt="complaint"
            className="complaintImage"
          />
        )}

        <h2>{complaint.subcategory || complaint.title}</h2>

        <div className="detailsHeaderActions">
          <span className={`status-badge s-${complaint.status?.replace(" ", "-").toLowerCase()}`}>
            {complaint.status}
          </span>
          <span className={`badge-pill priority-${complaint.priority?.toLowerCase() || 'low'}`}>
            {complaint.priority || "LOW"}
          </span>
        </div>

        <p className="category">{complaint.category}</p>
        <p className="description">{complaint.description}</p>

        <div className="locationBox">
          <h3>Location Details</h3>
          <div className="address-container">
            <p><b>Full Address:</b> {complaint.address || "No address provided"}</p>
          </div>
          <div className="coords-container" style={{ marginTop: '10px', fontSize: '14px', color: 'var(--text-muted)' }}>
            <p><b>Coordinates:</b> {complaint.latitude}, {complaint.longitude}</p>
          </div>
        </div>

        <div className="timeline">
          <div className={`step ${complaint.status ? "active" : ""}`}>Submitted</div>
          <div className={`step ${complaint.status === "In Progress" || complaint.status === "Resolved" ? "active" : ""}`}>In Progress</div>
          <div className={`step ${complaint.status === "Resolved" ? "active" : ""}`}>Resolved</div>
        </div>

        <div className="admin-actions-footer">
          <p className="date">Reported on: {new Date(complaint.createdAt).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDetailPage;
