import React, { useState, useEffect } from "react";
import "./AdminSettings.css";

const AdminSettings = () => {
  const [theme, setTheme] = useState(localStorage.getItem("admin-theme") || "light");

  const applyTheme = (t) => {
    const root = document.documentElement;
    const body = document.body;
    if (t === "dark") {
      root.classList.add("dark");
      body.classList.add("dark");
    } else if (t === "light") {
      root.classList.remove("dark");
      body.classList.remove("dark");
    } else if (t === "system") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (isDark) { root.classList.add("dark"); body.classList.add("dark"); }
      else { root.classList.remove("dark"); body.classList.remove("dark"); }
    }
  };

  useEffect(() => {
    applyTheme(theme);
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => { if (theme === "system") applyTheme("system"); };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("admin-theme", newTheme);
    applyTheme(newTheme);
  };

  return (
    <div className="admin-settings-container appearance-only animated-fade">
      <div className="appearance-wrapper card-premium">
        <label className="appearance-label">Theme</label>
        <select 
          className="appearance-select" 
          value={theme} 
          onChange={(e) => toggleTheme(e.target.value)}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">System Auto</option>
        </select>
      </div>
    </div>
  );
};

export default AdminSettings;
