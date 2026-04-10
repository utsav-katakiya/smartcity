import React, { useEffect, useState, useCallback } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import "./Settings.css";
import DashboardLayout from "../../components/DashboardLayout";

const Settings = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    inAppNotifications: true,
    theme: localStorage.getItem("theme") || "system",
    defaultCategoryFilter: "All",
    defaultStatusFilter: "All",
    refreshInterval: 15,
    city: "",
    area: "",
    shareAnonymousUsageData: false
  });
  
  const [toast, setToast] = useState({ message: "", type: "" });
  const [isEditingLoc, setIsEditingLoc] = useState(false);
  const [tempLoc, setTempLoc] = useState({ city: settings.city, area: settings.area });

  const fetchSettings = useCallback(async () => {
    if (!user || user.id === undefined) return;
    
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;

      const res = await fetch("http://localhost:5000/api/settings", {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "X-Clerk-User-Id": user.id 
        }
      });
      const data = await res.json();
      if (res.ok && data.userId) {
        setSettings({
          emailNotifications: data.emailNotifications ?? true,
          smsNotifications: data.smsNotifications ?? false,
          inAppNotifications: data.inAppNotifications ?? true,
          theme: data.theme ?? "system",
          defaultCategoryFilter: data.defaultCategoryFilter ?? "All",
          defaultStatusFilter: data.defaultStatusFilter ?? "All",
          refreshInterval: data.refreshInterval ?? 15,
          city: data.city ?? "",
          area: data.area ?? "",
          shareAnonymousUsageData: data.shareAnonymousUsageData ?? false
        });
        setTempLoc({
          city: data.city ?? "",
          area: data.area ?? ""
        });
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to load settings from server.", "error");
    } finally {
      setLoading(false);
    }
  }, [getToken, user?.id]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Apply UI theme changes dynamically whenever settings.theme changes
  useEffect(() => {
    const theme = settings.theme;
    localStorage.setItem("theme", theme);
    
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
    } else if (theme === "system") {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  }, [settings.theme]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  const handleSave = async (updatedSubset) => {
    setSaving(true);
    
    // Optimistic UI update
    setSettings(prev => ({ ...prev, ...updatedSubset }));

    try {
      const token = await getToken();
      const res = await fetch("http://localhost:5000/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "X-Clerk-User-Id": user.id
        },
        body: JSON.stringify(updatedSubset)
      });
      const data = await res.json();
      
      if (res.ok) {
        setSettings(data);
        showToast("Settings saved successfully!");
      } else {
        showToast(data.message || data.error || "Failed to save.", "error");
        // Re-fetch to undo optimistic update if failed
        fetchSettings();
      }
    } catch (err) {
      console.error(err);
      showToast("Network error. Could not save settings.", "error");
      fetchSettings();
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field, value) => {
    handleSave({ [field]: value });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="settings-page">
          <div className="skeleton-container">
            <div className="skeleton title"></div>
            <div className="skeleton row"></div>
            <div className="skeleton row"></div>
            <div className="skeleton p"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="settings-page">
        {/* TOAST */}
        {toast.message && (
          <div className={`toast ${toast.type}`}>
            {toast.message}
          </div>
        )}

        <div className="settings-container">
          
          {/* SIDEBAR */}
          <div className="settings-sidebar">
            <ul className="settings-menu">
              <li className={activeTab === "profile" ? "active" : ""} onClick={() => setActiveTab("profile")}>User Profile</li>
              <li className={activeTab === "notifications" ? "active" : ""} onClick={() => setActiveTab("notifications")}>Notifications</li>
              <li className={activeTab === "appearance" ? "active" : ""} onClick={() => setActiveTab("appearance")}>Appearance</li>
              <li className={activeTab === "dashboard" ? "active" : ""} onClick={() => setActiveTab("dashboard")}>Dashboard Prefs</li>
              <li className={activeTab === "privacy" ? "active" : ""} onClick={() => setActiveTab("privacy")}>Privacy</li>
              <li className={activeTab === "connections" ? "active" : ""} onClick={() => setActiveTab("connections")}>Connected Accounts</li>
            </ul>
          </div>

          {/* MAIN PANEL */}
          <div className="settings-content">
            <div className="settings-header">
              <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace("Prefs", " Preferences")}</h2>
              {saving && <span className="saving-badge">Saving...</span>}
            </div>

            <div className="settings-body">

              {activeTab === "profile" && (
                <div className="settings-section">
                  <p className="settings-desc">Manage your basic profile details here. Your identity is synced with Clerk.</p>
                  <div className="form-group">
                    <label htmlFor="name-input">Full Name</label>
                    <input id="name-input" type="text" value={user?.fullName || ""} disabled className="input-disabled" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email-input">Email Address</label>
                    <input id="email-input" type="email" value={user?.primaryEmailAddress?.emailAddress || ""} disabled className="input-disabled" />
                  </div>
                  {user?.primaryPhoneNumber?.phoneNumber && (
                    <div className="form-group">
                      <label htmlFor="phone-input">Phone Number</label>
                      <input id="phone-input" type="text" value={user.primaryPhoneNumber.phoneNumber} disabled className="input-disabled" />
                    </div>
                  )}
                  <div className="info-box">
                    <p>You can edit your personal information directly through your connected Clerk profile widget or dashboard.</p>
                  </div>

                  <hr style={{ margin: '30px 0', borderColor: 'var(--glass-border)' }} />

                  <div className="settings-section">
                    <div className="section-title-row">
                      <h4>Current Location</h4>
                      {!isEditingLoc ? (
                        <button className="edit-loc-btn" onClick={() => setIsEditingLoc(true)}>Change Address</button>
                      ) : (
                        <div className="edit-actions">
                          <button className="cancel-loc-btn" onClick={() => {
                            setIsEditingLoc(false);
                            setTempLoc({ city: settings.city, area: settings.area });
                          }}>Cancel</button>
                          <button 
                            className="save-loc-btn" 
                            onClick={() => {
                              handleSave({ city: tempLoc.city, area: tempLoc.area });
                              setIsEditingLoc(false);
                            }}
                            disabled={saving}
                          >
                            Save Location
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="settings-desc">Set your city and area to receive relevant local alerts and maintenance notices.</p>
                    
                    {!isEditingLoc ? (
                       <div className="location-display">
                          {settings.city || settings.area ? (
                            <div className="loc-pills">
                              {settings.city && <span className="loc-pill"><b>City:</b> {settings.city}</span>}
                              {settings.area && <span className="loc-pill"><b>Area:</b> {settings.area}</span>}
                            </div>
                          ) : (
                            <p className="no-loc">No location set. Update now to stay informed.</p>
                          )}
                       </div>
                    ) : (
                      <>
                        <div className="form-group">
                          <label htmlFor="city-input">City</label>
                          <input 
                            id="city-input" 
                            type="text" 
                            placeholder="e.g. Ahmedabad" 
                            value={tempLoc.city} 
                            onChange={(e) => setTempLoc(prev => ({ ...prev, city: e.target.value }))} 
                          />
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="area-input">Specific Area / Ward</label>
                          <input 
                            id="area-input" 
                            type="text" 
                            placeholder="e.g. Satellite" 
                            value={tempLoc.area} 
                            onChange={(e) => setTempLoc(prev => ({ ...prev, area: e.target.value }))} 
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="settings-section">
                  <p className="settings-desc">Control where and how you receive notifications.</p>
                  
                  <div className="toggle-group">
                    <label htmlFor="email-toggle">Email Notifications</label>
                    <label className="switch">
                      <input id="email-toggle" type="checkbox" checked={settings.emailNotifications} onChange={(e) => updateField("emailNotifications", e.target.checked)} />
                      <span className="slider round"></span>
                    </label>
                  </div>
                  
                  <div className="toggle-group">
                    <label htmlFor="sms-toggle">SMS Notifications (Experimental)</label>
                    <label className="switch">
                      <input id="sms-toggle" type="checkbox" checked={settings.smsNotifications} onChange={(e) => updateField("smsNotifications", e.target.checked)} />
                      <span className="slider round"></span>
                    </label>
                  </div>

                  <div className="toggle-group">
                    <label htmlFor="inapp-toggle">In-App Notifications</label>
                    <label className="switch">
                      <input id="inapp-toggle" type="checkbox" checked={settings.inAppNotifications} onChange={(e) => updateField("inAppNotifications", e.target.checked)} />
                      <span className="slider round"></span>
                    </label>
                  </div>

                </div>
              )}

              {activeTab === "appearance" && (
                <div className="settings-section">
                  <p className="settings-desc">Adjust the visual presentation of the platform.</p>
                  
                  <div className="form-group">
                    <label htmlFor="theme-select">Theme</label>
                    <select id="theme-select" value={settings.theme} onChange={(e) => updateField("theme", e.target.value)}>
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System Auto</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === "dashboard" && (
                <div className="settings-section">
                  <p className="settings-desc">Customize your dashboard rendering preferences.</p>
                  
                  <div className="form-group">
                    <label htmlFor="category-select">Default Category Filter</label>
                    <select id="category-select" value={settings.defaultCategoryFilter} onChange={(e) => updateField("defaultCategoryFilter", e.target.value)}>
                      <option value="All">All Categories</option>
                      <option>Drainage</option>
                      <option>Water</option>
                      <option>Light</option>
                      <option>Health</option>
                      <option>Cleaning & Solid Waste</option>
                      <option>Road</option>
                      <option>Wandering & Dead Animal</option>
                      <option>Garden</option>
                      <option>Crematorium</option>
                      <option>Tree Cutting</option>
                      <option>Building</option>
                      <option>Gym</option>
                      <option>Library</option>
                      <option>Swimming Pool</option>
                      <option>Traffic Circle</option>
                      <option>Plastic Collection</option>
                      <option>Smart Toilet</option>
                      <option>Fire</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="status-select">Default Status Filter</label>
                    <select id="status-select" value={settings.defaultStatusFilter} onChange={(e) => updateField("defaultStatusFilter", e.target.value)}>
                      <option value="All">All Statuses</option>
                      <option value="Submitted">Submitted</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="refresh-select">Auto-Refresh Interval</label>
                    <select id="refresh-select" value={settings.refreshInterval} onChange={(e) => updateField("refreshInterval", parseInt(e.target.value))}>
                      <option value={0}>Off / Manual Refresh</option>
                      <option value={5}>Every 5 Seconds</option>
                      <option value={10}>Every 10 Seconds</option>
                      <option value={15}>Every 15 Seconds</option>
                      <option value={60}>Every Minute</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === "privacy" && (
                <div className="settings-section">
                  <p className="settings-desc">Manage data collection.</p>
                  
                  <div className="toggle-group">
                    <label htmlFor="privacy-toggle">Share Anonymized Data <span className="desc">(Helps city planners with analytical heatmapping)</span></label>
                    <label className="switch">
                      <input id="privacy-toggle" type="checkbox" checked={settings.shareAnonymousUsageData} onChange={(e) => updateField("shareAnonymousUsageData", e.target.checked)} />
                      <span className="slider round"></span>
                    </label>
                  </div>
                </div>
              )}

              {activeTab === "connections" && (
                <div className="settings-section">
                  <p className="settings-desc">Manage third-party authentication linked to this account.</p>
                  <div className="info-box">
                    <p><strong>System Auth ID (Clerk):</strong> {user?.id} </p>
                    <p><strong>Login Provider:</strong> {user?.externalAccounts.length > 0 ? user.externalAccounts[0].provider : "Email/Password"} </p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
