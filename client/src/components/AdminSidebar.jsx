import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Admin.css";

const AdminSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", icon: "📊", path: "/admin/dashboard" },
    { name: "Complaints", icon: "📝", path: "/admin/complaints" },
    { name: "Departments", icon: "🏢", path: "/admin/departments" },
    { name: "Notifications", icon: "🔔", path: "/admin/notifications" },
    { name: "Appearance", icon: "🎨", path: "/admin/settings" },
  ];

  const handleNavigate = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  return (
    <div className={`admin-sidebar ${isOpen ? "open" : ""}`}>
      <div className="admin-logo">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="logo-icon">🏙️</span>
          <h2>Admin</h2>
        </div>
        <button className="admin-close-btn" onClick={onClose}>✕</button>
      </div>
      <ul className="admin-menu">
        {menuItems.map((item) => (
          <li
            key={item.name}
            className={location.pathname === item.path ? "active" : ""}
            onClick={() => handleNavigate(item.path)}
          >
            <span className="item-icon">{item.icon}</span>
            <span className="item-name">{item.name}</span>
          </li>
        ))}
        
        {/* Hardcoded Custom Logout Button */}
        <li
          className="admin-logout-btn"
          onClick={() => {
            localStorage.removeItem("admin_auth_token");
            handleNavigate("/login");
          }}
          style={{ marginTop: "auto" }}
        >
          <span className="item-icon">🚪</span>
          <span className="item-name">Log Out</span>
        </li>
      </ul>
    </div>
  );
};

export default AdminSidebar;
