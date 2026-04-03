import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { UserButton, useUser, useAuth } from "@clerk/clerk-react";
import NotificationPanel from "../../components/NotificationPanel";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

import DashboardLayout from "../../components/DashboardLayout";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { getToken } = useAuth();
  const [total, setTotal] = useState(0);
  const [pending, setPending] = useState(0);
  const [progress, setProgress] = useState(0);
  const [resolved, setResolved] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mostUpvoted, setMostUpvoted] = useState([]);
  const [recentComplaints, setRecentComplaints] = useState([]);

  const fetchAnalytics = async () => {
    try {
      const token = await getToken();
      const res = await fetch("http://localhost:5000/api/dashboard/analytics", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setTotal(data.totalComplaints);
        setPending(data.pending);
        setProgress(data.inProgress);
        setResolved(data.resolved);
        setMostUpvoted(data.mostUpvoted || []);
        setRecentComplaints(data.recentComplaints || []);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(() => {
      fetchAnalytics();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="dashboardLoading">
          <div className="spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  const chartData = [
    { name: "Submitted", value: pending },
    { name: "In Progress", value: progress },
    { name: "Resolved", value: resolved },
  ];

  const statsCards = [
    { title: "Total Complaints", value: total, icon: "📋", color: "blue", label: "All reported issues" },
    { title: "Pending", value: pending, icon: "⏳", color: "amber", label: "Awaiting review" },
    { title: "In Progress", value: progress, icon: "🚀", color: "blue-intense", label: "Being resolved" },
    { title: "Resolved", value: resolved, icon: "✅", color: "green", label: "Successfully fixed" },
  ];

  const getCategoryIcon = (category) => {
    const cat = (category || "").toLowerCase();
    if (cat.includes("road")) return "🛣️";
    if (cat.includes("water")) return "💧";
    if (cat.includes("garbage")) return "🗑️";
    if (cat.includes("fire")) return "🔥";
    if (cat.includes("electricity")) return "⚡";
    if (cat.includes("traffic")) return "🚗";
    return "📍";
  };

  return (
    <DashboardLayout>
      <div className="dashboard-container">
        {/* HEADER SECTION */}
        <header className="dashboard-header">
          <div className="header-left">
            <h1>Dashboard</h1>
            <p>Welcome back, {user?.firstName}! 👋</p>
            <span className="subtitle">Track and manage your city complaints easily.</span>
          </div>
          <div className="header-right">
            <NotificationPanel userId={user?.id} />
            <div className="user-profile-trigger">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </header>

        {/* STATS SECTION */}
        <section className="stats-section">
          <div className="stats-grid">
            {statsCards.map((card, idx) => (
              <div key={idx} className={`stat-card-modern ${card.color}`}>
                <div className="card-icon">{card.icon}</div>
                <div className="card-info">
                  <span className="card-value">{card.value}</span>
                  <span className="card-title">{card.title}</span>
                  <span className="card-label-small">{card.label}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* QUICK ACTIONS & CHART ROW */}
        <div className="dashboard-mid-grid">
          {/* QUICK ACTIONS */}
          <section className="quick-actions-card">
            <h3>Quick Actions</h3>
            <div className="actions-stack">
              <button className="action-btn primary" onClick={() => navigate("/add-complaint")}>
                <span className="btn-icon">➕</span>
                <div className="btn-text">
                  <b>Add Complaint</b>
                  <span>Report a new issue</span>
                </div>
              </button>
              <button className="action-btn secondary" onClick={() => navigate("/my-complaints")}>
                <span className="btn-icon">📁</span>
                <div className="btn-text">
                  <b>My Complaints</b>
                  <span>Check status of reports</span>
                </div>
              </button>
            </div>
          </section>

          {/* CHART AREA */}
          <section className="analytics-card-modern">
            <div className="section-header">
              <h3>Complaint Activity</h3>
              <span className="tag">Live Data</span>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 11}} />
                  <YAxis axisLine={false} tickLine={false} hide />
                  <Tooltip 
                    cursor={{fill: 'var(--glass-hover)'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', background: 'var(--bg-secondary)', boxShadow: 'var(--shadow-main)' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={45}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#f59e0b' : index === 1 ? '#3b82f6' : '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        {/* LOWER GRID */}
        <div className="dashboard-lower-grid">
          {/* RECENT ACTIVITIES */}
          <section className="recent-complaints-card">
            <div className="section-header">
              <h3>🕒 Recent Complaints</h3>
              <button className="view-all-link" onClick={() => navigate("/my-complaints")}>View All</button>
            </div>
            <div className="recent-list">
              {recentComplaints.length > 0 ? (
                recentComplaints.map((c) => (
                  <div key={c._id} className="recent-complaint-item" onClick={() => navigate(`/complaint/${c._id}`)}>
                    <div className="item-icon-box">{getCategoryIcon(c.category)}</div>
                    <div className="item-content">
                      <div className="item-title-row">
                        <b>{c.title}</b>
                        <span className={`status-pill ${c.status?.replace(" ", "")}`}>{c.status}</span>
                      </div>
                      <div className="item-meta">
                        <span>{c.city || "Civic Area"}</span>
                        <span className="dot">•</span>
                        <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-recent"> No recent activities found. </div>
              )}
            </div>
          </section>

          {/* HOT ISSUES */}
          <section className="recent-complaints-card">
            <div className="section-header">
              <h3>🔥 Most Supported</h3>
            </div>
            <div className="recent-list">
              {mostUpvoted.length > 0 ? (
                mostUpvoted.map((c) => (
                  <div key={c._id} className="recent-complaint-item" onClick={() => navigate(`/complaint/${c._id}`)}>
                    <div className="item-icon-box">{getCategoryIcon(c.category)}</div>
                    <div className="item-content">
                      <div className="item-title-row">
                        <b>{c.title}</b>
                        <span className="support-count">👍 {c.upvotes}</span>
                      </div>
                      <div className="item-meta">
                        <span>{c.category}</span>
                        <span className="dot">•</span>
                        <span>{c.city || "Civics"}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-recent"> No support requests yet. </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
