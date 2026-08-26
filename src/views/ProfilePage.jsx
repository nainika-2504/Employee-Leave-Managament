import React from 'react';
import { User, Mail, Building2, Shield } from 'lucide-react';

export const ProfilePage = ({ currentUser, onLogout }) => {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <User size={24} style={{ color: 'var(--primary)' }} />
            My Profile
          </h1>
          <p className="page-description">Your account information and settings.</p>
        </div>
      </div>

      <div className="section-card">
        <div className="profile-header">
          <div className="profile-avatar-large">
            {currentUser?.avatar || 'U'}
          </div>
          <div className="profile-info">
            <h2 className="profile-name">{currentUser?.name}</h2>
            <span className="profile-role-badge">
              <Shield size={14} />
              {currentUser?.role === 'MANAGER' ? 'Manager / Admin' : 'Employee'}
            </span>
          </div>
        </div>

        <div className="profile-details">
          <div className="profile-detail-row">
            <span className="profile-detail-label"><Mail size={16} /> Email</span>
            <span className="profile-detail-value">{currentUser?.email}</span>
          </div>
          <div className="profile-detail-row">
            <span className="profile-detail-label"><Building2 size={16} /> Department</span>
            <span className="profile-detail-value">{currentUser?.department}</span>
          </div>
          {currentUser?.manager && (
            <div className="profile-detail-row">
              <span className="profile-detail-label"><User size={16} /> Reporting Manager</span>
              <span className="profile-detail-value">{currentUser.manager}</span>
            </div>
          )}
          <div className="profile-detail-row">
            <span className="profile-detail-label"><Shield size={16} /> Employee ID</span>
            <span className="profile-detail-value">EMP-{currentUser?.id}</span>
          </div>
        </div>

        {onLogout && (
          <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border-light)' }}>
            <button className="btn btn-danger" onClick={onLogout}>
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
