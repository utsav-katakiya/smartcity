import { Routes, Route, Navigate } from "react-router-dom";

import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import AdminLogin from "../pages/admin/AdminLogin";
import DepartmentLogin from "../pages/department/DepartmentLogin";

import Dashboard from "../pages/user/Dashboard";
import AddComplaint from "../pages/user/AddComplaint";
import MyComplaints from "../pages/user/MyComplaints";
import ComplaintDetails from "../pages/user/ComplaintDetails";
import EditComplaint from "../pages/user/EditComplaint";
import Settings from "../pages/user/Settings";
import MapView from "../pages/user/MapView";
import ResolvedHistory from "../pages/user/ResolvedHistory";

import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminComplaints from "../pages/admin/AdminComplaints";
import AdminNotifications from "../pages/admin/AdminNotifications";
import Departments from "../pages/admin/Departments";
import AdminDetailPage from "../pages/admin/AdminDetailPage";
import AdminSettings from "../pages/admin/AdminSettings";

import DepartmentPanel from "../pages/department/DepartmentPanel";

import ProtectedRoute from "../components/ProtectedRoute";
import AdminRoute from "../components/AdminRoute";
import DepartmentRoute from "../components/DepartmentRoute";
import AdminLayout from "../layouts/AdminLayout";
import DepartmentLayout from "../layouts/DepartmentLayout";
import DepartmentSettings from "../pages/department/DepartmentSettings";
import DeptResolved from "../pages/department/DeptResolved";

const APP_MODE = import.meta.env.VITE_APP_MODE || "user";

const AppRoutes = () => {
  if (APP_MODE === "admin") {
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/login/*" element={<AdminLogin />} />
        {/* ADMIN ROUTES */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="complaints" element={<AdminComplaints />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="departments" element={<Departments />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="complaint/:id" element={<AdminDetailPage />} />
        </Route>
      </Routes>
    );
  }

  if (APP_MODE === "department") {
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/department/dashboard" replace />} />
        <Route path="/login/*" element={<DepartmentLogin />} />
        
        <Route
          path="/department"
          element={
            <DepartmentRoute>
              <DepartmentLayout />
            </DepartmentRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DepartmentPanel />} />
          <Route path="resolved" element={<DeptResolved />} />
          <Route path="appearance" element={<DepartmentSettings />} />
        </Route>

        {/* Legacy redirect */}
        <Route path="/department-dashboard" element={<Navigate to="/department/dashboard" replace />} />
      </Routes>
    );
  }

  // DEFAULT (USER MODE)
  return (
    <Routes>
      <Route
        path="/map"
        element={
          <ProtectedRoute>
            <MapView />
          </ProtectedRoute>
        }
      />
      {/* PUBLIC ROUTES */}
      <Route path="/" element={<Landing />} />
      <Route path="/login/*" element={<Login />} />
      <Route path="/signup/*" element={<Signup />} />

      {/* PROTECTED ROUTES */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-complaint"
        element={
          <ProtectedRoute>
            <AddComplaint />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-complaints"
        element={
          <ProtectedRoute>
            <MyComplaints />
          </ProtectedRoute>
        }
      />
      <Route
        path="/complaint/:id"
        element={
          <ProtectedRoute>
            <ComplaintDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit-complaint/:id"
        element={
          <ProtectedRoute>
            <EditComplaint />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resolved-history"
        element={
          <ProtectedRoute>
            <ResolvedHistory />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
