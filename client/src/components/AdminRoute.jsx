import React from "react";
import { useUser, SignIn } from "@clerk/clerk-react";
import { Navigate, useLocation } from "react-router-dom";
import AccessDenied from "./AccessDenied";
import "../styles/AdminRoute.css";

const AdminRoute = ({ children }) => {
  const { isLoaded, isSignedIn, user } = useUser();
  const location = useLocation();

  // 1. Wait for Clerk to load session data
  if (!isLoaded) {
    return (
      <div className="admin-route-loading-container">
        <div className="loading-spinner">Verifying Administrative Access...</div>
      </div>
    );
  }

  // 2. CASE 1: If user is NOT logged in -> Show Clerk Login screen
  if (!isSignedIn) {
    return (
      <div className="admin-route-signin-container">
        <SignIn 
          routing="path" 
          path="/admin" 
          signUpUrl="/signup" 
          fallbackRedirectUrl="/admin/dashboard" 
        />
      </div>
    );
  }

  // 3. Role Check
  const role = user?.publicMetadata?.role;

  // CASE 2: Logged In but NOT Admin -> Show Access Denied page
  if (role !== "admin") {
    return <AccessDenied />;
  }

  // CASE 3: Logged In AND Admin Role
  // If they are on the base /admin path, redirect them to /admin/dashboard
  if (location.pathname === "/admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Otherwise, render the admin children (for routes like /admin/dashboard, /admin/complaints, etc.)
  return children;
};

export default AdminRoute;
