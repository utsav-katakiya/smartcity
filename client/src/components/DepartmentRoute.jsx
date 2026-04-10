import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import "../styles/DepartmentRoute.css";

const DepartmentRoute = ({ children }) => {
  const location = useLocation();

  const isAuthenticated = sessionStorage.getItem("dept_auth_token") === "true";

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (location.pathname === "/department") {
    return <Navigate to="/department-dashboard" replace />;
  }

  return children;
};

export default DepartmentRoute;
