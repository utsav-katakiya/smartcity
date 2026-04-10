import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useClerk } from "@clerk/clerk-react";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useClerk();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: "📊" },
    { name: "Add Complaint", path: "/add-complaint", icon: "➕" },
    { name: "My Complaints", path: "/my-complaints", icon: "📁" },
    { name: "Resolved History", path: "/resolved-history", icon: "✅" },
    { name: "City Map", path: "/map", icon: "🗺️" },
    { name: "Settings", path: "/settings", icon: "⚙️" },
  ];

  return (
    <>
      {/* MOBILE HEADER */}
      <div className="mobileHeader">
        <div className="headerLeftGroup">
          {location.pathname !== "/dashboard" && location.pathname !== "/" && (
            <button className="backBtn" onClick={() => navigate(-1)}>
              ←
            </button>
          )}
          <h2 className="logoSmall">Smart City Issue Tracker</h2>
        </div>
        <button className="hamburger" onClick={toggleSidebar}>
          ☰
        </button>
      </div>

      {/* SIDEBAR */}
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebarTop">
          <div className="sidebarHeader">
            <h2 className="logo">Smart City Issue Tracker</h2>
            <button className="closeBtn" onClick={toggleSidebar}>✕</button>
          </div>

          <ul className="menu">
            {menuItems.map((item) => (
              <li
                key={item.path}
                className={location.pathname === item.path ? "active" : ""}
                onClick={() => {
                  navigate(item.path);
                  setIsOpen(false);
                }}
              >
                <span>{item.icon}</span> {item.name}
              </li>
            ))}
          </ul>
        </div>

        <button
          className="logoutBtn"
          onClick={() => signOut(() => navigate("/"))}
        >
          🚪 Logout
        </button>
      </div>

      {/* OVERLAY FOR MOBILE */}
      {isOpen && <div className="overlay" onClick={toggleSidebar}></div>}
    </>
  );
};

export default Sidebar;
