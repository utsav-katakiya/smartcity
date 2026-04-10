import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import "../styles/Admin.css";

const AdminLayout = () => {
  useEffect(() => {
    // Global Theme Sync
    const savedTheme = localStorage.getItem("admin-theme") || "light";
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
        if (isDark) {
          root.classList.add("dark");
          body.classList.add("dark");
        } else {
          root.classList.remove("dark");
          body.classList.remove("dark");
        }
      }
    };
    applyGlobalTheme(savedTheme);

    // Listen for system changes globally
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = () => {
      if (localStorage.getItem("admin-theme") === "system") applyGlobalTheme("system");
    };
    mediaQuery.addEventListener("change", handleSystemChange);
    return () => mediaQuery.removeEventListener("change", handleSystemChange);
  }, []);

  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className={`admin-layout ${isSidebarOpen ? "sidebar-open" : ""}`}>
      {/* Admin Mobile Header */}
      <div className="admin-mobile-header">
        <div className="mobile-header-left">
          {location.pathname !== "/admin/dashboard" && (
            <button className="mobile-back-btn" onClick={() => navigate(-1)}>←</button>
          )}
          <h2>Admin Portal</h2>
        </div>
        <button className="admin-hamburger" onClick={toggleSidebar}>
          ☰
        </button>
      </div>

      {/* Overlay */}
      {isSidebarOpen && <div className="admin-overlay" onClick={toggleSidebar}></div>}

      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
