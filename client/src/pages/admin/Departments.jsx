import React, { useEffect, useState } from "react";
import { useClerk } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import "../../styles/Admin.css";
import "./Departments.css";

const Departments = () => {
  const [deptStats, setDeptStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { signOut } = useClerk();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/admin");
  };

  useEffect(() => {
    const fetchDeptStats = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/departments/stats");
        const data = await res.json();
        if (res.ok) setDeptStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeptStats();
  }, []);

  if (loading) return <div className="admin-loading"><h2>Loading department data...</h2></div>;

  return (
    <div className="admin-departments-page">
      <header className="admin-header">
        <div>
          <h1>Department Management</h1>
          <p>Global overview of department performance and workload.</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout <span>🚪</span>
        </button>
      </header>

        <section className="admin-stats-grid">
          {deptStats.map((dept) => (
            <div key={dept.department} className="admin-stat-card dept-stat-card">
              <div className="dept-stat-header">
                <div className="stat-icon dept-stat-icon">🏢</div>
                <div className="stat-info dept-stat-info">
                  <h3>{dept.department}</h3>
                  <h2>{dept.total} Tasks</h2>
                </div>
              </div>
              
              <div className="workforce-stats">
                <div className="stat-box assigned">
                  <span className="stat-label">Assigned</span>
                  <b className="stat-value">{dept.assigned}</b>
                </div>
                <div className="stat-box unassigned">
                  <span className="stat-label">Unassigned</span>
                  <b className="stat-value">{dept.unassigned}</b>
                </div>
              </div>

              <div className="dept-progress-wrapper">
                 <div className="dept-progress-fill" style={{ width: `${dept.total > 0 ? (dept.assigned / dept.total) * 100 : 0}%` }}></div>
              </div>
              <span className="dept-rate-text">
                Assignment Rate: {dept.total > 0 ? Math.round((dept.assigned / dept.total) * 100) : 0}%
              </span>
            </div>
          ))}
        </section>

        <section className="admin-table-container department-directory">
          <h3>Department Directory</h3>
          <p className="dept-directory-intro">List of authorized government departments for issue assignment.</p>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Department Name</th>
                <th>Responsibility</th>
                <th>Priority Issues</th>
                <th>Current Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Water Department</td>
                <td>Leakage, Contamination, Supply Cuts</td>
                <td><span className="priority-badge HIGH">HIGH</span></td>
                <td><span className="priority-badge OPERATIONAL">OPERATIONAL</span></td>
              </tr>
              <tr>
                <td>Electricity Department</td>
                <td>Power Cuts, Open Wires, Transformers</td>
                <td><span className="priority-badge CRITICAL">CRITICAL</span></td>
                <td><span className="priority-badge OPERATIONAL">OPERATIONAL</span></td>
              </tr>
              <tr>
                <td>Sanitation Department</td>
                <td>Garbage Collection, Sewage, Public Toilets, Plastic</td>
                <td><span className="priority-badge MEDIUM">MEDIUM</span></td>
                <td><span className="priority-badge OPERATIONAL">OPERATIONAL</span></td>
              </tr>
              <tr>
                <td>Road & Infrastructure</td>
                <td>Potholes, Roadblocks, Traffic Circles</td>
                <td><span className="priority-badge HIGH">HIGH</span></td>
                <td><span className="priority-badge OPERATIONAL">OPERATIONAL</span></td>
              </tr>
              <tr>
                <td>Garden & Environment</td>
                <td>Parks, Gardening, Tree Cutting</td>
                <td><span className="priority-badge LOW">LOW</span></td>
                <td><span className="priority-badge OPERATIONAL">OPERATIONAL</span></td>
              </tr>
              <tr>
                <td>Animal Control</td>
                <td>Stray Animals, Dead Animals</td>
                <td><span className="priority-badge MEDIUM">MEDIUM</span></td>
                <td><span className="priority-badge OPERATIONAL">OPERATIONAL</span></td>
              </tr>
              <tr>
                <td>Health Department</td>
                <td>Medical Services, Disease Control</td>
                <td><span className="priority-badge HIGH">HIGH</span></td>
                <td><span className="priority-badge OPERATIONAL">OPERATIONAL</span></td>
              </tr>
              <tr>
                <td>Public Works</td>
                <td>Drainage, Public Buildings, Flooding</td>
                <td><span className="priority-badge CRITICAL">CRITICAL</span></td>
                <td><span className="priority-badge OPERATIONAL">OPERATIONAL</span></td>
              </tr>
              <tr>
                <td>Recreation</td>
                <td>Libraries, Gyms, Swimming Pools</td>
                <td><span className="priority-badge LOW">LOW</span></td>
                <td><span className="priority-badge OPERATIONAL">OPERATIONAL</span></td>
              </tr>
              <tr>
                 <td>Fire Department</td>
                 <td>Fire Hazards, Emergency Response</td>
                 <td><span className="priority-badge CRITICAL">CRITICAL</span></td>
                 <td><span className="priority-badge OPERATIONAL">OPERATIONAL</span></td>
              </tr>
            </tbody>
          </table>
        </section>
    </div>
  );
};

export default Departments;

