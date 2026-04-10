import React, { useEffect, useState } from "react";
import "./DepartmentPanel.css";
import "../../styles/Admin.css";
import { API } from "../../config/api";

const DeptResolved = () => {
  const [resolvedComplaints, setResolvedComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const departmentName = sessionStorage.getItem("dept_name") || "General";

  const fetchResolved = async () => {
    try {
      const res = await fetch(`${API}/api/complaints/department?department=${encodeURIComponent(departmentName)}&status=Resolved&_t=${Date.now()}`, {
        headers: { Authorization: `Bearer dummy-override` }
      });
      const data = await res.json();
      if (res.ok) {
        // Filter purely for Resolved just in case API doesn't filter perfectly
        const onlyResolved = (data.complaints || []).filter(c => c.status === "Resolved");
        setResolvedComplaints(onlyResolved);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this record from history?")) return;
    try {
      const res = await fetch(`${API}/api/admin/complaints/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer dummy-override` }
      });
      if (res.ok) {
        setResolvedComplaints(prev => prev.filter(c => c._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchResolved();
  }, []);

  if (loading) return <div className="admin-content-inner">Loading history...</div>;

  return (
    <div className="admin-content-inner animated-fade">
      <header className="admin-header">
        <div>
          <h1>Resolved History</h1>
          <p>Managed archive of all {resolvedComplaints.length} completed tasks for {departmentName}.</p>
        </div>
      </header>

      <section className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Task Details</th>
              <th>Location</th>
              <th>Finished Date</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {resolvedComplaints.map(cat => (
              <tr key={cat._id}>
                <td data-label="Task">
                  <b style={{ color: '#10b981' }}>✅ {cat.subcategory}</b>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{cat.description?.substring(0, 60)}...</p>
                </td>
                <td data-label="Location">{cat.address || cat.city}</td>
                <td data-label="Finished Date">{new Date(cat.updatedAt).toLocaleDateString()}</td>
                <td data-label="Actions">
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button
                      className="logout-btn"
                      style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.1)', marginTop: 0 }}
                      onClick={() => handleDelete(cat._id)}
                      title="Delete from history"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {resolvedComplaints.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '60px' }}>
                  <div style={{ opacity: 0.5 }}>
                    <span style={{ fontSize: '40px' }}>📂</span>
                    <p>No resolved history found for your department.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default DeptResolved;
