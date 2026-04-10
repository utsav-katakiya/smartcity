import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DepartmentPanel.css";
import "../../styles/Admin.css"; // Reuse admin styles for cards
import { API } from "../../config/api";

const DepartmentPanel = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    sessionStorage.removeItem("dept_auth_token");
    sessionStorage.removeItem("dept_name");
    navigate("/login");
  };

  // Detect department from local storage
  const departmentName = sessionStorage.getItem("dept_name") || "General";

  const fetchAssigned = async () => {
    if (!departmentName || departmentName === "None") {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API}/api/complaints/department?department=${encodeURIComponent(departmentName)}&_t=${Date.now()}`, {
        headers: { Authorization: `Bearer dummy-override` }
      });
      const data = await res.json();
      if (res.ok) {
        setComplaints(data.complaints || []);
        setStats(data.stats || { total: 0, pending: 0, inProgress: 0, resolved: 0 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${API}/api/admin/complaints/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer dummy-override`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) await fetchAssigned();
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (departmentName) {
      fetchAssigned();
    }
  }, [departmentName]);

  if (loading) return <div className="admin-layout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Loading Department Portal...</div>;

  return (
    <div className="admin-content-inner">
      <header className="admin-header">
        <div>
          <h1>{departmentName} Portal</h1>
          <p>Managing {complaints.length} tasks specifically for the {departmentName}.</p>
        </div>
      </header>

      {/* Stats Section */}
      <section className="admin-stats-grid" style={{ marginBottom: '30px' }}>
        <div className="admin-stat-card">
          <div className="stat-icon">📄</div>
          <div className="stat-info">
            <h3>Total Tasks</h3>
            <h2>{stats.total}</h2>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon" style={{ color: '#f59e0b' }}>⏳</div>
          <div className="stat-info">
            <h3>Pending</h3>
            <h2>{stats.pending || 0}</h2>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon" style={{ color: '#3b82f6' }}>🛠️</div>
          <div className="stat-info">
            <h3>In Progress</h3>
            <h2>{stats.inProgress || 0}</h2>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon" style={{ color: '#10b981' }}>✅</div>
          <div className="stat-info">
            <h3>Resolved</h3>
            <h2>{stats.resolved || 0}</h2>
          </div>
        </div>
      </section>

      <section className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Issue</th>
              <th>Location</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Assigned Date</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map(cat => (
              <tr key={cat._id}>
                <td data-label="Issue">
                  <b>{cat.subcategory}</b>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{cat.description?.substring(0, 50)}...</p>
                </td>
                <td data-label="Location">{cat.address || cat.city}</td>
                <td data-label="Priority"><span className={`priority-badge ${cat.priority}`}>{cat.priority}</span></td>
                <td data-label="Status">
                  <span className={`status-pill ${cat.status?.replace(" ", "")}`}>
                    {cat.status}
                  </span>
                </td>
                <td data-label="Assigned Date">{cat.assignedDate ? new Date(cat.assignedDate).toLocaleDateString() : new Date(cat.updatedAt).toLocaleDateString()}</td>
                <td data-label="Actions">
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {cat.status === "Submitted" && (
                      <button className="view-btn btn-start" onClick={() => handleUpdateStatus(cat._id, "In Progress")}>Start Work</button>
                    )}
                    {cat.status === "In Progress" && (
                      <button className="view-btn btn-complete" onClick={() => handleUpdateStatus(cat._id, "Resolved")}>Mark Resolved</button>
                    )}
                    {cat.status === "Resolved" && (
                      <span style={{ color: '#10b981', fontSize: '13px', fontWeight: '600' }}>✅ Task Finished</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {complaints.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>No complaints assigned to your department yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default DepartmentPanel;
