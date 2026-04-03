import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

const ProtectedRoute = ({ children }) => {
  const { isSignedIn, isLoaded, user } = useUser();

  if (!isLoaded) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg-main)', color: 'white' }}>
        Loading...
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/login" />;
  }

  const role = user?.publicMetadata?.role;
  const department = user?.publicMetadata?.department;

  // Strict role redirection for non-citizen roles
  if (role === "admin") {
    return <Navigate to="/admin" />;
  }

  // Redirect department personnel to their portal if they try to access site dashboard
  if (department) {
    return <Navigate to="/department/dashboard" />;
  }

  return children;
};

export default ProtectedRoute;