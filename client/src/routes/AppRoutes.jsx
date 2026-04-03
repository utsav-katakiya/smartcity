import { Routes, Route } from "react-router-dom";

import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Signup from "../pages/Signup";

import Dashboard from "../pages/user/Dashboard";
import AddComplaint from "../pages/user/AddComplaint";
import MyComplaints from "../pages/user/MyComplaints";
import ComplaintDetails from "../pages/user/ComplaintDetails";
import EditComplaint from "../pages/user/EditComplaint";
import Settings from "../pages/user/Settings";
import MapView from "../pages/user/MapView";

import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminComplaints from "../pages/admin/AdminComplaints";
import AdminNotifications from "../pages/admin/AdminNotifications";
import Departments from "../pages/admin/Departments";

import DepartmentPanel from "../pages/department/DepartmentPanel";

import ProtectedRoute from "../components/ProtectedRoute";
import AdminRoute from "../components/AdminRoute";
import DepartmentRoute from "../components/DepartmentRoute";
import AdminLayout from "../layouts/AdminLayout";

const AppRoutes = () => {
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
      </Route>

      {/* DEPARTMENT ROUTES */}
      <Route
        path="/department/*"
        element={
          <DepartmentRoute>
            <DepartmentPanel />
          </DepartmentRoute>
        }
      />
      <Route
        path="/department-dashboard"
        element={
          <DepartmentRoute>
            <DepartmentPanel />
          </DepartmentRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
