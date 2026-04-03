import React, { useEffect, useState } from "react";
import { useUser, useClerk, useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import "./DepartmentPanel.css";
import "../../styles/Admin.css"; // Reuse admin styles for cards

const DepartmentPanel = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };
  
  // Detect department from Clerk user metadata
  const departmentName = user?.publicMetadata?.department || "None";

  const fetchAssigned = async () => {
    if (!departmentName || departmentName === "None") {
        setLoading(false);
        return;
    }
    try {
      const token = await getToken();
      if (!token) return;

      const res = await fetch(`http://localhost:5000/api/complaints/department?department=${encodeURIComponent(departmentName)}`, {
        headers: { Authorization: `Bearer ${token}` }
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
      const token = await getToken();
      const res = await fetch(`http://localhost:5000/api/admin/complaints/${id}/status`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchAssigned();
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (user && departmentName) {
      fetchAssigned();
    }
  }, [user, departmentName]);

  if (loading) return <div className="admin-layout" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh'}}>Loading Department Portal...</div>;

  return (
    <div className="admin-layout">
      {/* Sidebar Area */}
      <aside className="admin-sidebar">
         <div className="admin-logo">
           <h2>{departmentName.split(' ')[0]}</h2>
           <p style={{fontSize: '10px', color: 'var(--text-muted)'}}>Smart City Issue Tracker</p>
         </div>
         <ul className="admin-menu">
            <li className="active">Assigned Tasks</li>
         </ul>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <h1>{departmentName} Portal</h1>
            <p>Managing {complaints.length} tasks specifically for the {departmentName}.</p>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout <span>🚪</span>
          </button>
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
            <div className="stat-icon" style={{color: '#f59e0b'}}>⏳</div>
            <div className="stat-info">
              <h3>Pending</h3>
              <h2>{stats.pending || 0}</h2>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="stat-icon" style={{color: '#3b82f6'}}>🛠️</div>
            <div className="stat-info">
              <h3>In Progress</h3>
              <h2>{stats.inProgress || 0}</h2>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="stat-icon" style={{color: '#10b981'}}>✅</div>
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map(cat => (
                <tr key={cat._id}>
                  <td>
                    <b>{cat.subcategory}</b>
                    <p style={{fontSize: '12px', color: 'var(--text-muted)'}}>{cat.description?.substring(0, 50)}...</p>
                  </td>
                  <td>{cat.address || cat.city}</td>
                  <td><span className={`priority-badge ${cat.priority}`}>{cat.priority}</span></td>
                  <td>
                    <span className={`status-pill ${cat.status?.replace(" ", "")}`}>
                      {cat.status}
                    </span>
                  </td>
                  <td>{cat.assignedDate ? new Date(cat.assignedDate).toLocaleDateString() : new Date(cat.updatedAt).toLocaleDateString()}</td>
                  <td>
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
                   <td colSpan="6" style={{textAlign: 'center', padding: '40px'}}>No complaints assigned to your department yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

export default DepartmentPanel;
