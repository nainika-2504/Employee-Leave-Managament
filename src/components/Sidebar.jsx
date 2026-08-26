import React from 'react';
import { Home, PlusCircle, FileText, User, Clock, ListFilter, Users, Calendar, HelpCircle, LogOut } from 'lucide-react';

export const Sidebar = ({ currentUser, currentView, onViewChange, onLogout }) => {
  const isManager = currentUser?.role === 'MANAGER';

  // Define sidebar navigation items based on active role
  const navItems = isManager
    ? [
        { id: 'dashboard', icon: Home, label: 'Dashboard' },
        { id: 'approvals', icon: Clock, label: 'Pending Approvals' },
        { id: 'history', icon: ListFilter, label: 'Leave History' },
        { id: 'balances', icon: Users, label: 'Team Balances' },
        { id: 'calendar', icon: Calendar, label: 'Leave Calendar' },
        { id: 'profile', icon: User, label: 'My Profile' },
      ]
    : [
        { id: 'dashboard', icon: Home, label: 'Dashboard' },
        { id: 'apply', icon: PlusCircle, label: 'Apply Leave' },
        { id: 'my-leaves', icon: FileText, label: 'My Leaves' },
        { id: 'profile', icon: User, label: 'My Profile' },
      ];

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo" title="LeaveFlow">
        LF
      </div>

      {/* Nav Icons */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              className={`sidebar-btn ${isActive ? 'active' : ''}`}
              title={item.label}
              onClick={() => onViewChange(item.id)}
            >
              <item.icon size={20} />
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="sidebar-bottom">
        <button className="sidebar-btn" title="Help">
          <HelpCircle size={20} />
        </button>
        {onLogout && (
          <button className="sidebar-btn" title="Sign Out" onClick={onLogout}>
            <LogOut size={20} />
          </button>
        )}
        <div 
          className="sidebar-avatar" 
          title={`${currentUser?.name} - Click to view profile`}
          onClick={() => onViewChange('profile')}
        >
          {currentUser?.avatar || 'U'}
        </div>
      </div>
    </aside>
  );
};
