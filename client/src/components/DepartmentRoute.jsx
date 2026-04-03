import React from "react";
import { useUser, SignIn } from "@clerk/clerk-react";
import { Navigate, useLocation } from "react-router-dom";
import AccessDenied from "./AccessDenied";
import "../styles/DepartmentRoute.css";

const DepartmentRoute = ({ children }) => {
  const { isLoaded, isSignedIn, user } = useUser();
  const location = useLocation();

  if (!isLoaded) {
    return (
      <div className="department-route-loading-container">
        <div className="loading-spinner">Verifying Department Access...</div>
      </div>
    );
  }

  // CASE 1: User NOT Logged In
  if (!isSignedIn) {
    // If on any /department route (including sub-paths like /factor-one), show SignIn
    return (
      <div className="department-route-signin-container">
        <SignIn 
          routing="path" 
          path="/department" 
          signUpUrl="/signup" 
          fallbackRedirectUrl="/department/dashboard" 
        />
      </div>
    );
  }

  const role = user?.publicMetadata?.role;
  const department = user?.publicMetadata?.department;

  // CASE 2: User Logged In but NO department metadata
  if (!department) {
    // Still allow admins to go to their own section if they accidentally land here
    if (role === "admin") {
      return <Navigate to="/admin" />;
    }
    return <AccessDenied message="Access Denied. You are not assigned to any department." />;
  }

  // CASE 3: User Logged In AND has department metadata
  // If they are on the base /department path, redirect them to /department/dashboard
  if (location.pathname === "/department") {
    return <Navigate to="/department/dashboard" replace />;
  }

  return children;
};

export default DepartmentRoute;
