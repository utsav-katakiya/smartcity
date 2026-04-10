import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import "./complaintDetails.css";
import DashboardLayout from "../../components/DashboardLayout";

const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const { getToken } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`http://localhost:5000/api/complaints/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (res.ok) {
          setComplaint(data);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchComplaint();
  }, [id]);

  const hasUpvoted = complaint?.upvotedBy?.includes(user?.id);

  const upvoteComplaint = async () => {
    if (!user || hasUpvoted || isVoting || !complaint) return;
    
    setIsVoting(true);
    try {
      const dbId = complaint._id || id;
      const token = await getToken();
      const res = await fetch(`http://localhost:5000/api/complaints/upvote/${dbId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
      });
      const data = await res.json();
      if (res.ok) {
        setComplaint(data.complaint);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsVoting(false);
    }
  };

  if (!complaint) {
    return (
      <DashboardLayout>
        <div className="detailsPage">Loading complaint details...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="detailsPage">
        <div className="detailsCard">
          <div className="details-header-top">
            <button className="back-btn-details" onClick={() => navigate(-1)}>
              ← Go Back
            </button>
          </div>
          {/* IMAGE */}

          {complaint.image && (
            <img
              src={complaint.image?.startsWith("http") ? complaint.image : `http://localhost:5000/uploads/${complaint.image}`}
              alt="complaint"
              className="complaintImage"
            />
          )}

          <h2>{complaint.title}</h2>

          <div className="detailsHeaderActions">
            <span className={`status ${complaint.status?.replace(" ", "")}`}>
              {complaint.status}
            </span>
            <button 
              className={`upvoteBtn ${hasUpvoted ? 'voted' : ''}`}
              onClick={upvoteComplaint}
              disabled={hasUpvoted || isVoting}
            >
              {isVoting ? "⏳ Upvoting..." : hasUpvoted ? `👍 ${complaint.upvotes} Supported` : `👍 ${complaint.upvotes} Support`}
            </button>
          </div>

          <p className="category">{complaint.category}</p>

          <p className="description">{complaint.description}</p>

          {/* LOCATION */}

          <div className="locationBox">
            <h3>Location Details</h3>

            <div className="address-container">
              <p>
                <b>Full Address:</b> {complaint.address || "No address provided"}
              </p>
            </div>
            
            <div className="coords-container" style={{ marginTop: '10px', fontSize: '14px', color: 'var(--text-muted)' }}>
              <p>
                <b>Coordinates:</b> {complaint.latitude}, {complaint.longitude}
              </p>
            </div>
          </div>

          <p className="date">
            Submitted on: {new Date(complaint.createdAt).toLocaleString()}
          </p>

          {/* STATUS TIMELINE */}
          <div className="timeline">
            <div className={`step ${complaint.status ? "active" : ""}`}>
              Submitted
            </div>

            <div
              className={`step ${complaint.status === "In Progress" || complaint.status === "Resolved" ? "active" : ""}`}
            >
              In Progress
            </div>

            <div
              className={`step ${complaint.status === "Resolved" ? "active" : ""}`}
            >
              Resolved
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ComplaintDetails;
