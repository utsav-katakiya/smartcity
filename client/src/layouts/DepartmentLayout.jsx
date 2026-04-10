import React, { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import "../styles/Admin.css";

const DepartmentLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const departmentName = sessionStorage.getItem("dept_name") || "Dept";

  useEffect(() => {
    // Global Theme Sync
    const savedTheme = localStorage.getItem("dept-theme") || "light";
    const applyGlobalTheme = (t) => {
      const root = document.documentElement;
      const body = document.body;
      if (t === "dark") {
        root.classList.add("dark");
        body.classList.add("dark");
      } else if (t === "light") {
        root.classList.remove("dark");
        body.classList.remove("dark");
      } else if (t === "system") {
        const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (isDark) { root.classList.add("dark"); body.classList.add("dark"); }
        else { root.classList.remove("dark"); body.classList.remove("dark"); }
      }
    };
    applyGlobalTheme(savedTheme);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("dept_auth_token");
    sessionStorage.removeItem("dept_name");
    navigate("/login");
  };

  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className={`admin-layout ${isSidebarOpen ? "sidebar-open" : ""}`}>
      {/* Mobile Header */}
      <div className="admin-mobile-header">
        <div className="mobile-header-left">
          {location.pathname !== "/department/dashboard" && (
            <button className="mobile-back-btn" onClick={() => navigate(-1)}>←</button>
          )}
          <h2>{departmentName.split(' ')[0]} Portal</h2>
        </div>
        <button className="admin-hamburger" onClick={toggleSidebar}>
          ☰
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? "open" : ""}`}>
         <div className="admin-logo">
           <div className="sidebar-logo-content">
             <h2>{departmentName.split(' ')[0]}</h2>
             <p style={{fontSize: '10px', color: 'var(--text-muted)'}}>Smart City Issue Tracker</p>
           </div>
           <button className="admin-close-btn" onClick={toggleSidebar}>✕</button>
         </div>
         <ul className="admin-menu">
            <li 
              className={location.pathname === "/department/dashboard" ? "active" : ""} 
              onClick={() => { navigate("/department/dashboard"); setIsSidebarOpen(false); }}
            >
              <span className="item-icon">📋</span>
              Assigned Tasks
            </li>
            <li 
              className={location.pathname === "/department/resolved" ? "active" : ""} 
              onClick={() => { navigate("/department/resolved"); setIsSidebarOpen(false); }}
            >
              <span className="item-icon">📜</span>
              Resolved History
            </li>
            <li 
              className={location.pathname === "/department/appearance" ? "active" : ""} 
              onClick={() => { navigate("/department/appearance"); setIsSidebarOpen(false); }}
            >
              <span className="item-icon">🎨</span>
              Appearance
            </li>
            
            <li className="admin-logout-btn" onClick={handleLogout} style={{marginTop: 'auto'}}>
              <span className="item-icon">🚪</span>
              Logout
            </li>
         </ul>
      </aside>

      {/* Overlay */}
      {isSidebarOpen && <div className="admin-overlay" onClick={toggleSidebar}></div>}

      {/* Main Content */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default DepartmentLayout;
