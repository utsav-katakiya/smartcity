import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const location = useLocation();

  // Hardcoded Admin Auth check
  const isAuthenticated = localStorage.getItem("admin_auth_token") === "true";

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If logged in and on base /admin, redirect down to dashboard
  if (location.pathname === "/admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;
