import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import "./complaintDetails.css";
import DashboardLayout from "../../components/DashboardLayout";

const ComplaintDetails = () => {
  const { id } = useParams();
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
          {/* IMAGE */}

          {complaint.image && (
            <img
              src={`http://localhost:5000/uploads/${complaint.image}`}
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

            <p>
              <b>State:</b> {complaint.state || "Not provided"}
            </p>
            <p>
              <b>City:</b> {complaint.city || "Not provided"}
            </p>
            <p>
              <b>Pincode:</b> {complaint.pincode || "Not provided"}
            </p>
            <p>
              <b>Street:</b> {complaint.street || "Not provided"}
            </p>
            <p>
              <b>Area:</b> {complaint.area || "Not provided"}
            </p>
            <p>
              <b>Landmark:</b> {complaint.landmark || "Not provided"}
            </p>
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
