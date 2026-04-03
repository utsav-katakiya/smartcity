import React, { useEffect, useState } from "react";
import ComplaintHeatmap from "../../components/ComplaintHeatmap";
import { useClerk, useAuth } from "@clerk/clerk-react";
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
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/admin");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const [statsRes, workloadRes, emergencyRes] = await Promise.all([
          fetch("http://localhost:5000/api/admin/stats", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch("http://localhost:5000/api/admin/complaint-stats", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch("http://localhost:5000/api/admin/emergency-complaints", {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        const statsData = await statsRes.json();
        const workloadData = await workloadRes.json();
        const emergencyData = await emergencyRes.json();
        
        if (statsRes.ok) setStats(statsData);
        if (workloadRes.ok) setWorkload(workloadData.departmentWorkload);
        if (emergencyRes.ok) setEmergencies(emergencyData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
            <div className="stat-icon" style={{color: '#f59e0b'}}>⏳</div>
            <div className="stat-info">
              <h3>Pending</h3>
              <h2>{stats.pending}</h2>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="stat-icon" style={{color: '#3b82f6'}}>🛠️</div>
            <div className="stat-info">
              <h3>In Progress</h3>
              <h2>{stats.inProgress}</h2>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="stat-icon" style={{color: '#10b981'}}>✅</div>
            <div className="stat-info">
              <h3>Resolved</h3>
              <h2>{stats.resolved}</h2>
            </div>
          </div>
        </section>


        <ComplaintHeatmap />

        <section className="admin-analytics" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          <div className="admin-table-container">
            <h3>Severity by Category</h3>
            <div className="category-stats-list" style={{marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px'}}>
              {stats.categoryStats.map(cat => (
                <div key={cat.category} className="cat-stat-item" style={{background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '12px', border: '1px solid var(--glass-border)'}}>
                   <span style={{fontSize: '13px', color: 'var(--text-muted)'}}>{cat.category}</span>
                   <h4 style={{marginTop: '5px', fontSize: '18px'}}>{cat.count} Issues</h4>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-table-container">
            <h3>Department Workload</h3>
            <div className="workload-list" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {workload.map(dept => (
                <div key={dept.department} style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>{dept.department}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{dept.total} Total</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden', display: 'flex' }}>
                    <div style={{ width: `${dept.total > 0 ? (dept.resolved / dept.total) * 100 : 0}%`, background: '#10b981' }} title="Resolved"></div>
                    <div style={{ width: `${dept.total > 0 ? (dept.pending / dept.total) * 100 : 0}%`, background: '#f59e0b' }} title="Pending"></div>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', marginTop: '10px', fontSize: '11px' }}>
                    <span style={{ color: '#10b981' }}>● Resolved: {dept.resolved}</span>
                    <span style={{ color: '#f59e0b' }}>● Pending: {dept.pending}</span>
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
