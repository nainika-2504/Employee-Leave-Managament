import React from 'react';
import { UserCheck, Shield } from 'lucide-react';

export const Header = ({ currentUser, users, onSwitchUser }) => {
  const isManager = currentUser?.role === 'MANAGER';

  return (
    <header className="app-header">
      <div className="header-inner">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          Home &nbsp;/&nbsp; Leave Request &nbsp;/&nbsp;{' '}
          <span className="breadcrumb-active">
            {isManager ? 'Manager Portal' : 'Leaves'}
          </span>
        </div>

        {/* Role Switcher Toolbar */}
        <div className="role-switcher">
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, paddingLeft: 8 }}>
            View as:
          </span>
          {users.map((user) => {
            const isActive = currentUser?.id === user.id;
            const isManagerRole = user.role === 'MANAGER';
            return (
              <button
                key={user.id}
                className={`role-btn ${isActive ? 'active' : ''}`}
                onClick={() => onSwitchUser(user)}
                title={`Switch to ${user.name} (${user.role})`}
              >
                {isManagerRole ? <Shield size={14} /> : <UserCheck size={14} />}
                <span>{user.name.split(' ')[0]} ({isManagerRole ? 'Manager' : 'Employee'})</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
