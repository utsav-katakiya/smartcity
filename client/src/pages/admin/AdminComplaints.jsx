import React, { useEffect, useState } from "react";
import { useClerk, useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import "../../styles/Admin.css";
import "./AdminComplaints.css";

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: "All", status: "All", search: "", department: "All", priority: "All" });
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showCatDropdown, setShowCatDropdown] = useState(false);
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [tempAssignments, setTempAssignments] = useState({});
  const { signOut } = useClerk();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const fetchComplaints = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const { category, status, search, department, filter } = filters;
      let url = `http://localhost:5000/api/admin/complaints?`;
      if (category && category !== "All") url += `category=${category}&`;
      if (status && status !== "All") url += `status=${status}&`;
      if (search) url += `search=${search}&`;
      if (department && department !== "All") url += `department=${department}&`;
      if (filter) url += `filter=${filter}&`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setComplaints(data);
    } catch (error) {
      console.error("Error fetching complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
    
    const handleClickOutside = (e) => {
      if (
        !e.target.closest(".custom-select-admin") && 
        !e.target.closest(".custom-dept-admin") &&
        !e.target.closest(".custom-status-admin") &&
        !e.target.closest(".custom-priority-admin")
      ) {
        setShowCatDropdown(false);
        setShowDeptDropdown(false);
        setShowStatusDropdown(false);
        setShowPriorityDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [filters]);

  const handleAssignDept = async (id, department) => {
    if (!department || department === "Unassigned") {
      alert("Please select a valid department first.");
      return;
    }
    
    console.log("Assign clicked:", id, department);
    const url = `http://localhost:5000/api/complaints/assign/${id}`;
    console.log("FETCH_DEBUG: Calling URL:", url);

    try {
      const token = await getToken();
      const res = await fetch(url, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ department })
      });
      if (res.ok) {
        console.log("Assignment successful for:", id);
        setTempAssignments(prev => {
          const newState = { ...prev };
          delete newState[id];
          return newState;
        });
        fetchComplaints();
      }
    } catch (error) {
      console.error("Error assigned department:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this complaint?")) return;
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:5000/api/admin/complaints/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSelectedComplaint(null);
        fetchComplaints();
      }
    } catch (error) {
      console.error("Error deleting complaint:", error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "HIGH": return "#ef4444";
      case "MEDIUM": return "#f59e0b";
      case "LOW": return "#3b82f6";
      default: return "#9ca3af";
    }
  };

  return (
    <div className="admin-complaints-page">
      <header className="admin-header">
        <div>
          <h1 style={{fontSize: '28px', fontWeight: '800'}}>Complaint Management</h1>
          <p style={{color: 'var(--text-muted)'}}>Review and resolve city issues</p>
        </div>
        <button className="logout-btn" onClick={() => signOut()}>
          Logout
        </button>
      </header>

      <section className="admin-panel-layout">
          <div className="header-row">
            <div className="btn-actions">
              <button className="btn-icon" onClick={() => fetchComplaints()}>
                <span>🔄</span> Refresh
              </button>
              <button className="btn-icon">
                <span>📤</span> Export CSV
              </button>
            </div>
          </div>

          <div className="action-row">
            <div className="search-field">
              <i>🔍</i>
              <input
                type="text"
                placeholder="Search complaints by ID, or address..."
                value={filters.search}
                onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
              />
            </div>

            <div className="filters-field">
              {/* CUSTOM CATEGORY DROPDOWN */}
              <div className="custom-select-admin">
                <div 
                  className={`select-header-admin ${showCatDropdown ? "active" : ""}`}
                  onClick={() => setShowCatDropdown(!showCatDropdown)}
                >
                  <span>{filters.category === "All" ? "All Categories" : filters.category}</span>
                  <div className={`chevron-admin ${showCatDropdown ? "up" : ""}`}></div>
                </div>

                {showCatDropdown && (
                  <div className="select-items-admin">
                    <div 
                      className={`select-item-admin ${filters.category === "All" ? "selected" : ""}`}
                      onClick={() => {
                        setFilters(f => ({ ...f, category: "All" }));
                        setShowCatDropdown(false);
                      }}
                    >
                      All Categories
                    </div>
                    {[
                      "Drainage", "Water", "Light", "Health", "Cleaning & Solid Waste", "Road",
                      "Wandering & Dead Animal", "Garden", "Crematorium", "Tree Cutting", "Building", "Gym",
                      "Library", "Swimming Pool", "Traffic Circle", "Plastic Collection", "Smart Toilet", "Fire"
                    ].map(cat => (
                      <div 
                        key={cat} 
                        className={`select-item-admin ${filters.category === cat ? "selected" : ""}`}
                        onClick={() => {
                          setFilters(f => ({ ...f, category: cat }));
                          setShowCatDropdown(false);
                        }}
                      >
                        {cat}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CUSTOM STATUS DROPDOWN */}
              <div className="custom-status-admin">
                <div 
                  className={`select-header-admin ${showStatusDropdown ? "active" : ""}`}
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                >
                  <span>{filters.status === "All" ? "All Status" : filters.status}</span>
                  <div className={`chevron-admin ${showStatusDropdown ? "up" : ""}`}></div>
                </div>

                {showStatusDropdown && (
                  <div className="select-items-admin">
                    {["All", "Submitted", "In Progress", "Resolved"].map(s => (
                      <div 
                        key={s} 
                        className={`select-item-admin ${filters.status === s ? "selected" : ""}`}
                        onClick={() => {
                          setFilters(f => ({ ...f, status: s }));
                          setShowStatusDropdown(false);
                        }}
                      >
                        {s}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CUSTOM DEPT DROPDOWN */}
              <div className="custom-dept-admin">
                <div 
                  className={`select-header-admin ${showDeptDropdown ? "active" : ""}`}
                  onClick={() => setShowDeptDropdown(!showDeptDropdown)}
                >
                  <span>{filters.department === "All" ? "All Departments" : filters.department}</span>
                  <div className={`chevron-admin ${showDeptDropdown ? "up" : ""}`}></div>
                </div>

                {showDeptDropdown && (
                  <div className="select-items-admin">
                    <div 
                      className={`select-item-admin ${filters.department === "All" ? "selected" : ""}`}
                      onClick={() => {
                        setFilters(f => ({ ...f, department: "All" }));
                        setShowDeptDropdown(false);
                      }}
                    >
                      All Departments
                    </div>
                    {[
                      "Water Department", "Electricity Department", "Sanitation Department", 
                      "Road & Infrastructure", "Garden & Environment", "Animal Control", 
                      "Health Department", "Public Works", "Recreation", "Fire Department"
                    ].map(dept => (
                      <div 
                        key={dept} 
                        className={`select-item-admin ${filters.department === dept ? "selected" : ""}`}
                        onClick={() => {
                          setFilters(f => ({ ...f, department: dept }));
                          setShowDeptDropdown(false);
                        }}
                      >
                        {dept}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CUSTOM PRIORITY DROPDOWN */}
              <div className="custom-priority-admin">
                <div 
                  className={`select-header-admin ${showPriorityDropdown ? "active" : ""}`}
                  onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                >
                  <span>{filters.priority === "All" ? "All Priority" : filters.priority}</span>
                  <div className={`chevron-admin ${showPriorityDropdown ? "up" : ""}`}></div>
                </div>

                {showPriorityDropdown && (
                  <div className="select-items-admin">
                    {["All", "Low", "Medium", "High"].map(p => (
                      <div 
                        key={p} 
                        className={`select-item-admin ${filters.priority === p ? "selected" : ""}`}
                        onClick={() => {
                          setFilters(f => ({ ...f, priority: p }));
                          setShowPriorityDropdown(false);
                        }}
                      >
                        {p}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <span className="clear-btn" onClick={() => setFilters({ category: "All", status: "All", search: "", filter: "All", department: "All", priority: "All" })}>
                Clear Filters
              </span>
            </div>
          </div>

          <div className="table-wrapper">
            <div className="table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Department</th>
                    <th>Assigned Date</th>
                    <th>Assign Department</th>
                    <th>Address</th>
                    <th>Date</th>
                    <th style={{textAlign: 'right'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.length > 0 ? (
                    complaints.map(complaint => (
                      <tr key={complaint._id}>
                        <td>
                          <span className="cat-label">{complaint.category}</span>
                        </td>
                        <td>
                          <span className={`badge-pill priority-${complaint.priority?.toLowerCase() || 'low'}`}>
                            {complaint.priority || "LOW"}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge s-${complaint.status?.replace(" ", "-").toLowerCase() || 'submitted'}`}>
                            {complaint.status}
                          </span>
                        </td>
                        <td>
                          {complaint.department && complaint.department !== "Unassigned" ? (
                            <span className="dept-highlight">{complaint.department}</span>
                          ) : (
                            <span style={{color: '#ef4444', fontSize: '12px'}}>Unassigned</span>
                          )}
                        </td>
                        <td>
                          <span className="date-text">
                            {complaint.assignedDate ? new Date(complaint.assignedDate).toLocaleDateString() : "—"}
                          </span>
                        </td>
                        <td>
                          <div className="assign-cell">
                            <select 
                              className="assign-select"
                              value={tempAssignments[complaint._id] !== undefined ? tempAssignments[complaint._id] : (complaint.department || "Unassigned")}
                              onChange={(e) => setTempAssignments(prev => ({ ...prev, [complaint._id]: e.target.value }))}
                            >
                              <option value="Unassigned">Assign Dept</option>
                              <option>Water Department</option>
                              <option>Electricity Department</option>
                              <option>Sanitation Department</option>
                              <option>Road & Infrastructure</option>
                              <option>Garden & Environment</option>
                              <option>Animal Control</option>
                              <option>Health Department</option>
                              <option>Public Works</option>
                              <option>Recreation</option>
                              <option>Fire Department</option>
                            </select>
                            <button 
                              className="btn-assign-small"
                              onClick={() => handleAssignDept(complaint._id, tempAssignments[complaint._id] || complaint.department)}
                              disabled={
                                (tempAssignments[complaint._id] === undefined) || 
                                (tempAssignments[complaint._id] === (complaint.department || "Unassigned")) ||
                                (tempAssignments[complaint._id] === "Unassigned")
                              }
                            >
                              Assign
                            </button>
                          </div>
                        </td>
                        <td>
                          <div className="address-text" title={complaint.address}>
                            {complaint.address || "No Address"}
                          </div>
                        </td>
                        <td>
                          <span className="date-text">
                            {complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : "—"}
                          </span>
                        </td>
                        <td style={{textAlign: 'right'}}>
                          <button className="btn-view" onClick={() => setSelectedComplaint(complaint)}>
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9">
                        <div className="empty-msg">
                          <span style={{fontSize: '32px', display: 'block', marginBottom: '10px'}}>📦</span>
                          No complaints found matching selected filters.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* DETAILS MODAL */}
        {selectedComplaint && (
          <div className="admin-modal-overlay" onClick={() => setSelectedComplaint(null)}>
            <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Complaint Details</h2>
                <button className="close-btn" onClick={() => setSelectedComplaint(null)}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="modal-info-grid">
                  <div className="info-main">
                    {selectedComplaint.image && (
                      <img src={selectedComplaint.image} alt="Issue" className="modal-image" />
                    )}
                    <h3>{selectedComplaint.subcategory}</h3>
                    <p className="desc">{selectedComplaint.description}</p>
                    
                    <div className="address-box">
                      <h4>Location Details</h4>
                      <p><strong>Address:</strong> {selectedComplaint.address}</p>
                      <p><strong>Coordinates:</strong> {selectedComplaint.latitude}, {selectedComplaint.longitude}</p>
                    </div>
                  </div>

                  <div className="info-side">
                    <div className="info-actions">
                      <div className="action-group">
                        <label>Current Status</label>
                        <div className="status-text-only">{selectedComplaint.status}</div>
                      </div>

                      <div className="action-group">
                        <label>Category</label>
                        <p style={{background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px'}}>{selectedComplaint.category}</p>
                      </div>

                      <button className="delete-btn" onClick={() => handleDelete(selectedComplaint._id)}>
                        Delete Complaint
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default AdminComplaints;
