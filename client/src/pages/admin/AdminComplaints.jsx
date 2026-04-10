import React, { useEffect, useState } from "react";
import { useClerk, useAuth, useUser } from "@clerk/clerk-react";
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
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const fetchComplaints = async () => {
    try {
      const token = await getToken();
      const { category, status, search, department, filter } = filters;
      
      const headers = {
        "Content-Type": "application/json"
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      if (user?.id) {
        headers["X-Clerk-User-Id"] = user.id;
      }

      // Add timestamp to prevent caching
      let url = `http://localhost:5000/api/admin/complaints?_t=${Date.now()}&`;
      if (category && category !== "All") url += `category=${category}&`;
      if (status && status !== "All") url += `status=${status}&`;
      if (search) url += `search=${search}&`;
      if (department && department !== "All") url += `department=${department}&`;
      if (filter) url += `filter=${filter}&`;

      const res = await fetch(url, { headers });
      const data = await res.json();
      if (res.ok) {
        setComplaints(data);
      }
    } catch (error) {
      console.error("Error fetching complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id || localStorage.getItem("admin_auth_token") === "true") {
      fetchComplaints();
    } else {
      setLoading(false);
    }

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
  }, [filters, getToken, user?.id]);

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
        await fetchComplaints(); // Wait for fetch
      }
    } catch (error) {
      console.error("Error assigned department:", error);
    }
  };

  // (HandleDelete removed as per request)

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
          <h1 style={{ fontSize: '28px', fontWeight: '800' }}>Complaint Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Review and resolve city issues</p>
        </div>
        <button className="logout-btn" onClick={() => signOut()}>
          Logout
        </button>
      </header>

      <section className="admin-panel-layout">
        <div className="header-row">
          <div className="header-row">
            {/* Action buttons removed as per request */}
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
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.length > 0 ? (
                  complaints.map(complaint => (
                    <tr key={complaint._id}>
                      <td data-label="Category">
                        <span className="cat-label">{complaint.category}</span>
                      </td>
                      <td data-label="Priority">
                        <span className={`badge-pill priority-${complaint.priority?.toLowerCase() || 'low'}`}>
                          {complaint.priority || "LOW"}
                        </span>
                      </td>
                      <td data-label="Status">
                        <span className={`status-badge s-${complaint.status?.replace(" ", "-").toLowerCase() || 'submitted'}`}>
                          {complaint.status}
                        </span>
                      </td>
                      <td data-label="Department">
                        {complaint.department && complaint.department !== "Unassigned" ? (
                          <span className="dept-highlight">{complaint.department}</span>
                        ) : (
                          <span style={{ color: '#ef4444', fontSize: '12px' }}>Unassigned</span>
                        )}
                      </td>
                      <td data-label="Assigned Date">
                        <span className="date-text">
                          {complaint.assignedDate ? new Date(complaint.assignedDate).toLocaleDateString() : "—"}
                        </span>
                      </td>
                      <td data-label="Assign Dept">
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
                      <td data-label="Address">
                        <div className="address-text" title={complaint.address}>
                          {complaint.address || "No Address"}
                        </div>
                      </td>
                      <td data-label="Created Date">
                        <span className="date-text">
                          {complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : "—"}
                        </span>
                      </td>
                      <td data-label="Actions" style={{ textAlign: 'right' }}>
                        <button className="btn-view" onClick={() => navigate(`/admin/complaint/${complaint._id}`)}>
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9">
                      <div className="empty-msg">
                        <span style={{ fontSize: '32px', display: 'block', marginBottom: '10px' }}>📦</span>
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
    </div>
  );
};

export default AdminComplaints;
