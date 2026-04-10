import React, { useState } from "react";
import { useClerk, useAuth, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import "../../styles/Admin.css";
import "./AdminNotifications.css";

const AdminNotifications = () => {
  const [formData, setFormData] = useState({ title: "", message: "", city: "", area: "" });
  const [status, setStatus] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const { signOut } = useClerk();
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/admin");
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.message || !formData.city) {
      setStatus({ message: "Please fill all required fields", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      
      const headers = { 
        "Content-Type": "application/json"
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      if (user?.id) {
        headers["X-Clerk-User-Id"] = user.id;
      }

      const res = await fetch("http://localhost:5000/api/notifications/admin/send-alert", {
        method: "POST",
        headers,
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setStatus({ message: "Public alert sent successfully!", type: "success" });
        setFormData({ title: "", message: "", city: "", area: "" });
      } else {
        setStatus({ message: "Failed to send alert", type: "error" });
      }
    } catch (err) {
      setStatus({ message: "Server error", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-notifications-page">
      <header className="admin-header">
        <div>
          <h1>Public Notifications</h1>
          <p>Send area-wide alerts and maintenance notices.</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout <span>🚪</span>
        </button>
      </header>

        <section className="admin-table-container">
          <form className="admin-form" onSubmit={handleSubmit}>
             <div className="form-group">
                <label>Alert Title</label>
                <input 
                   type="text" 
                   name="title" 
                   className="admin-search" 
                   placeholder="e.g. Water Maintenance Notice"
                   value={formData.title}
                   onChange={handleChange}
                />
             </div>
             
             <div className="form-group">
                <label>Message</label>
                <textarea 
                   name="message" 
                   className="admin-search" 
                   placeholder="Describe the maintenance or alert..."
                   value={formData.message}
                   onChange={handleChange}
                ></textarea>
             </div>

             <div className="form-row">
                <div className="form-group">
                   <label>Target City</label>
                   <input 
                      type="text" 
                      name="city" 
                      className="admin-search" 
                      placeholder="e.g. Ahmedabad"
                      value={formData.city}
                      onChange={handleChange}
                   />
                </div>
                <div className="form-group">
                   <label>Specific Area (Optional)</label>
                   <input 
                      type="text" 
                      name="area" 
                      className="admin-search" 
                      placeholder="e.g. Satellite"
                      value={formData.area}
                      onChange={handleChange}
                   />
                </div>
             </div>

             <button 
                type="submit" 
                className="view-btn" 
                disabled={loading}
             >
                {loading ? "Sending..." : "Publish Broadcast"}
             </button>

             {status.message && (
                <div className={`status-msg ${status.type}`}>
                   {status.message}
                </div>
             )}
          </form>
        </section>
    </div>
  );
};

export default AdminNotifications;

