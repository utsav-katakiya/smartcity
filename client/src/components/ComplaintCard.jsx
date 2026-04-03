import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import "../styles/ComplaintCard.css"
const getStatusStep = (status) => {
  if (status === "Pending") return 1;
  if (status === "In Progress") return 2;
  if (status === "Resolved") return 3;
  return 1;
};

const ComplaintCard = ({ complaint: initialComplaint }) => {
  const { user } = useUser();
  const [complaint, setComplaint] = useState(initialComplaint);
  const [isVoting, setIsVoting] = useState(false);

  const hasUpvoted = complaint.upvotedBy?.includes(user?.id);

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "orange";
      case "In Progress":
        return "blue";
      case "Resolved":
        return "green";
      default:
        return "gray";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "#ef4444";
      case "Medium":
        return "#f59e0b";
      case "Low":
        return "#22c55e";
      default:
        return "gray";
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
  
  const upvoteComplaint = async (id) => {
    if (!user || hasUpvoted || isVoting) return;

    setIsVoting(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/complaints/upvote/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: user.id }),
        },
      );
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
  return (
    <div className="complaint-card">
      <h2 className="complaint-title">{complaint.title}</h2>

      <div className="complaint-info">
        <p>
          <strong>Category:</strong> {getCategoryIcon(complaint.category)}{" "}
          {complaint.category}
        </p>

        <p>
          <strong>Priority:</strong>{" "}
          <span
            style={{
              backgroundColor: getPriorityColor(complaint.priority),
              color: "white",
              padding: "4px 8px",
              borderRadius: "6px",
              fontSize: "12px",
            }}
          >
            {complaint.priority}
          </span>
        </p>

        <p>
          <strong>Status:</strong>{" "}
          <span
            style={{
              backgroundColor: getStatusColor(complaint.status),
              color: "white",
              padding: "4px 8px",
              borderRadius: "6px",
              fontSize: "12px",
            }}
          >
            {complaint.status}
          </span>
        </p>

        {/* Timeline */}
        <div className="timeline">
          <span
            className={getStatusStep(complaint.status) >= 1 ? "active" : ""}
          >
            Submitted
          </span>

          <span
            className={getStatusStep(complaint.status) >= 2 ? "active" : ""}
          >
            In Progress
          </span>

          <span
            className={getStatusStep(complaint.status) >= 3 ? "active" : ""}
          >
            Resolved
          </span>
        </div>

        <p>
          <strong>Location:</strong> {complaint.location || complaint.address}
        </p>

        <p>
          <strong>Upvotes:</strong> {complaint.upvotes}
        </p>
      </div>

      <div className="card-actions">
        <Link to={`/complaint/${complaint._id || complaint.id}`}>
          <button className="details-btn">View Details</button>
        </Link>

        <Link to={`/edit-complaint/${complaint._id || complaint.id}`}>
          <button className="edit-btn">Edit</button>
        </Link>

        <button
          className={`upvoteBtn ${hasUpvoted ? "voted" : ""}`}
          onClick={() => upvoteComplaint(complaint._id || complaint.id)}
          disabled={hasUpvoted || isVoting}
        >
          {isVoting ? "⏳ Upvoting..." : hasUpvoted ? `👍 ${complaint.upvotes} Supported` : `👍 ${complaint.upvotes} Support`}
        </button>
      </div>
      
    </div>
  );
};

export default ComplaintCard;
