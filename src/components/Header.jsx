import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, User, ChevronDown, Check, X } from 'lucide-react';
import { apiService } from '../services/api';

export const Header = ({ currentUser, users = [], onSwitchUser }) => {
  const isManager = currentUser?.role === 'MANAGER';
  const portalName = isManager ? 'Manager Portal' : 'Employee Portal';

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const loadNotifications = async () => {
    if (!currentUser?.id) return;
    try {
      const [list, countRes] = await Promise.all([
        apiService.getNotifications(currentUser.id),
        apiService.getUnreadNotificationCount(currentUser.id)
      ]);
      setNotifications(list);
      setUnreadCount(countRes.unreadCount || 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleMarkAsRead = async (id) => {
    try {
      await apiService.markNotificationAsRead(id);
      loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!currentUser?.id) return;
    try {
      await apiService.markAllNotificationsAsRead(currentUser.id);
      loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="app-header" style={{ position: 'relative' }}>
      <div className="header-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        {/* Left: Breadcrumbs & Portal Indicator */}
        <div className="breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>Home &nbsp;/&nbsp;</span>
          <span className="breadcrumb-active" style={{ fontWeight: 600 }}>
            {portalName}
          </span>
          <span style={{
            fontSize: '0.72rem',
            padding: '2px 8px',
            borderRadius: 10,
            background: isManager ? '#eff6ff' : '#f0fdf4',
            color: isManager ? '#1d4ed8' : '#15803d',
            fontWeight: 700,
            marginLeft: 8
          }}>
            {currentUser?.role}
          </span>
        </div>

        {/* Right Actions: Notifications & Switch Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Notification Bell */}
          <div style={{ position: 'relative' }}>
            <button
              className="btn btn-secondary"
              style={{
                position: 'relative',
                padding: '6px 10px',
                borderRadius: '50%',
                border: '1px solid #e2e8f0',
                background: '#fff'
              }}
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              title="Notifications"
            >
              <Bell size={18} style={{ color: '#475569' }} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  background: '#ef4444',
                  color: '#fff',
                  borderRadius: '50%',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  width: 18,
                  height: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Drawer */}
            {showNotifDropdown && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: 42,
                width: 340,
                background: '#fff',
                borderRadius: 10,
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
                border: '1px solid #e2e8f0',
                zIndex: 1000,
                overflow: 'hidden'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                  <strong style={{ fontSize: '0.86rem', color: '#1e293b' }}>In-App Notifications</strong>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      style={{ border: 'none', background: 'transparent', fontSize: '0.74rem', color: '#2563eb', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <p style={{ padding: '24px 16px', textAlign: 'center', fontSize: '0.82rem', color: '#94a3b8' }}>
                      No notifications yet.
                    </p>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => handleMarkAsRead(n.id)}
                        style={{
                          padding: '10px 14px',
                          borderBottom: '1px solid #f8fafc',
                          background: n.isRead ? '#fff' : '#f0f9ff',
                          cursor: 'pointer',
                          transition: 'background 0.15s'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <span style={{ fontWeight: n.isRead ? 500 : 700, fontSize: '0.82rem', color: '#1e293b' }}>
                            {n.title}
                          </span>
                          {!n.isRead && (
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2563eb', marginTop: 4 }} />
                          )}
                        </div>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.76rem', color: '#64748b', lineHeight: 1.4 }}>
                          {n.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Profile Switcher (Ideal for Faculty & Evaluation Review) */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: 20,
                padding: '4px 12px',
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: 'var(--primary)',
                color: '#fff',
                fontSize: '0.72rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {currentUser?.avatar || 'U'}
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                {currentUser?.name}
              </span>
              <ChevronDown size={14} style={{ color: '#64748b' }} />
            </button>

            {/* User Selection Dropdown */}
            {showUserDropdown && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: 42,
                width: 230,
                background: '#fff',
                borderRadius: 10,
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
                border: '1px solid #e2e8f0',
                zIndex: 1000,
                padding: '6px 0'
              }}>
                <div style={{ padding: '6px 14px', fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
                  Switch Active Persona
                </div>
                {users.filter(u => u.role === 'EMPLOYEE' || u.role === 'MANAGER').map(u => (
                  <div
                    key={u.id}
                    onClick={() => {
                      onSwitchUser(u);
                      setShowUserDropdown(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 14px',
                      cursor: 'pointer',
                      background: currentUser?.id === u.id ? '#f1f5f9' : 'transparent',
                      fontSize: '0.82rem'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{u.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{u.role} • {u.department}</div>
                    </div>
                    {currentUser?.id === u.id && <Check size={14} style={{ color: '#2563eb' }} />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
