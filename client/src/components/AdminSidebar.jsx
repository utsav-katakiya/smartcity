import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Admin.css";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", icon: "📊", path: "/admin/dashboard" },
    { name: "Complaints", icon: "📝", path: "/admin/complaints" },
    { name: "Notifications", icon: "🔔", path: "/admin/notifications" },
    { name: "Departments", icon: "🏢", path: "/admin/departments" },
  ];

  return (
    <div className="admin-sidebar">
      <div className="admin-logo">
        <span className="logo-icon">🏢</span>
        <h2>Admin Panel</h2>
      </div>
      <ul className="admin-menu">
        {menuItems.map((item) => (
          <li
            key={item.name}
            className={location.pathname === item.path ? "active" : ""}
            onClick={() => navigate(item.path)}
          >
            <span className="item-icon">{item.icon}</span>
            <span className="item-name">{item.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminSidebar;
