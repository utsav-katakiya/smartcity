import React, { useEffect, useState } from "react";
import ComplaintHeatmap from "../../components/ComplaintHeatmap";
import { useClerk, useAuth, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import "../../styles/Admin.css";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    categoryStats: []
  });
  const [workload, setWorkload] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const { signOut } = useClerk();
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/admin");
  };

  useEffect(() => {
    const fetchData = async () => {
      // Admin might be using custom auth instead of Clerk, so we don't block if user is null
      const isCustomAuth = localStorage.getItem("admin_auth_token") === "true";
      
      try {
        const token = await getToken();
        // Since backend doesn't strictly require Clerk token for admin routes yet,
        // we can proceed even if token is null if we have custom auth.
        
        const headers = {
          "Content-Type": "application/json"
        };
        
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        
        if (user?.id) {
          headers["X-Clerk-User-Id"] = user.id;
        }

        const [statsRes, workloadRes, emergencyRes] = await Promise.all([
          fetch("http://localhost:5000/api/admin/stats", { headers }),
          fetch("http://localhost:5000/api/admin/complaint-stats", { headers }),
          fetch("http://localhost:5000/api/admin/emergency-complaints", { headers })
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
        
        if (workloadRes.ok) {
          const workloadData = await workloadRes.json();
          setWorkload(workloadData.departmentWorkload);
        }
        
        if (emergencyRes.ok) {
          const emergencyData = await emergencyRes.json();
          setEmergencies(emergencyData);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    // Fetch if either Clerk is ready OR custom admin auth is present
    if (user?.id || localStorage.getItem("admin_auth_token") === "true") {
      fetchData();
    } else {
      // If no auth at all, stop loading so we don't hang
      setLoading(false);
    }
  }, [getToken, user?.id]);

  if (loading) return (
    <div className="admin-loading">
      <h2>Loading Dashboard...</h2>
    </div>
  );

  return (
    <div className="admin-dashboard-page">
      <header className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Welcome to the Smart City backend management.</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout <span>🚪</span>
        </button>
      </header>

      {emergencies.length > 0 && (
        <section className="emergency-alerts" style={{ marginBottom: '40px' }}>
          <h3 style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <span className="pulse-dot"></span> Emergency Alerts ({emergencies.length})
          </h3>
          <div className="emergency-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {emergencies.map(issue => (
              <div key={issue._id} style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '12px',
                padding: '20px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', top: '0', left: '0', width: '4px', height: '100%', background: '#ef4444' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <h4 style={{ color: 'white', margin: '0' }}>🔥 {issue.title}</h4>
                  <span style={{ background: '#ef4444', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>URGENT</span>
                </div>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', margin: '10px 0' }}>{issue.description?.substring(0, 80)}...</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '15px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>📍 {issue.area || issue.city}</span>
                  <span style={{ color: 'var(--text-muted)' }}>⏱️ {new Date(issue.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="stat-icon">📄</div>
          <div className="stat-info">
            <h3>Total Complaints</h3>
            <h2>{stats.total}</h2>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon" style={{ color: '#f59e0b' }}>⏳</div>
          <div className="stat-info">
            <h3>Pending</h3>
            <h2>{stats.pending}</h2>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon" style={{ color: '#3b82f6' }}>🛠️</div>
          <div className="stat-info">
            <h3>In Progress</h3>
            <h2>{stats.inProgress}</h2>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon" style={{ color: '#10b981' }}>✅</div>
          <div className="stat-info">
            <h3>Resolved</h3>
            <h2>{stats.resolved}</h2>
          </div>
        </div>
      </section>


      <ComplaintHeatmap />

      <section className="admin-analytics" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        <div className="admin-table-container cat-analytics">
          <h3>Severity by Category</h3>
          <div className="category-stats-list">
            {stats.categoryStats.map(cat => (
              <div key={cat.category} className="cat-stat-item">
                <span className="cat-stat-label">{cat.category}</span>
                <h4 className="cat-stat-value">{cat.count} Issues</h4>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-table-container workload-analytics">
          <h3>Department Workload</h3>
          <div className="workload-list">
            {workload.map(dept => (
              <div key={dept.department} className="workload-item">
                <div className="workload-header">
                  <span className="workload-name">{dept.department}</span>
                  <span className="workload-total">{dept.total} Total</span>
                </div>
                <div className="workload-bar">
                  <div className="workload-progress resolved" style={{ width: `${dept.total > 0 ? (dept.resolved / dept.total) * 100 : 0}%` }}></div>
                  <div className="workload-progress pending" style={{ width: `${dept.total > 0 ? (dept.pending / dept.total) * 100 : 0}%` }}></div>
                </div>
                <div className="workload-details">
                  <span className="workload-detail-res">● Resolved: {dept.resolved}</span>
                  <span className="workload-detail-pen">● Pending: {dept.pending}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
