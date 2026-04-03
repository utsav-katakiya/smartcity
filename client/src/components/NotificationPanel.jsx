import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import "../styles/Admin.css"; // Reuse some styles for clean look
import "../styles/NotificationPanel.css";

const NotificationPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { getToken } = useAuth();

  const fetchNotifications = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:5000/api/notifications/user`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id) => {
    try {
      const token = await getToken();
      await fetch(`http://localhost:5000/api/notifications/${id}/read`, { 
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) { console.error(err); }
  };

  return (
    <div className="notification-bell-container notification-panel">
      <button 
        className="bell-btn notification-bell-btn" 
        onClick={() => setIsOpen(!isOpen)}
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
           <div className="notification-header">
              <h4 className="notification-header-title">Notifications</h4>
              <button 
                className="notification-close-btn" 
                onClick={() => setIsOpen(false)}
              >
                ×
              </button>
           </div>
           <div className="notif-list notification-list">
              {notifications.map(n => (
                <div 
                  key={n._id} 
                  className={`notif-item notification-item ${n.read ? 'read' : 'unread'}`}
                  onClick={() => markAsRead(n._id)}
                >
                   <b className="notification-title">{n.title}</b>
                   <p className="notification-message">{n.message}</p>
                   <span className="notification-time">{new Date(n.createdAt).toLocaleString()}</span>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="notification-empty">No notifications yet</div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
