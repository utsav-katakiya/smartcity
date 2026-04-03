import React from "react";
import Sidebar from "./Sidebar";
import "../styles/DashboardLayout.css";

const DashboardLayout = ({ children }) => {
  return (
    <div className="dashboardLayout">
      <Sidebar />
      <div className="dashboardContent">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
