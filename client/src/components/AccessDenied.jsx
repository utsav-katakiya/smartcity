import React from "react";
import "../styles/AccessDenied.css";

const AccessDenied = ({ message = "You do not have administrative privileges to access this panel." }) => {
  return (
    <div className="admin-layout access-denied-container">
      <div className="admin-stat-card access-denied-card">
        <h1 className="access-denied-icon">🚫</h1>
        <h2 className="access-denied-title">Access Denied</h2>
        <p className="access-denied-message">
            {message}
        </p>
        <button 
            className="view-btn access-denied-btn"
            onClick={() => window.location.href = "/dashboard"}
        >
            Return to Dashboard
        </button>
      </div>
    </div>
  );
};

export default AccessDenied;
