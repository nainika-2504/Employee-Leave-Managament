import React from 'react';
import { StatusBadge } from './StatusBadge';
import { Calendar, Check, X } from 'lucide-react';

const getTypeClass = (leaveType) => {
  const t = (leaveType || '').toUpperCase();
  if (t === 'ANNUAL') return 'annual';
  if (t === 'SICK') return 'sick';
  return 'casual';
};

const getInitials = (name) => {
  if (!name) return '??';
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

export const LeaveCardList = ({ applications, isManager, onApprove, onReject, onCancel }) => {
  if (applications.length === 0) {
    return (
      <div className="empty-state">
        <Calendar className="empty-icon" />
        <p style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>No leave applications found</p>
        <p style={{ fontSize: '0.82rem', marginTop: 4 }}>Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="leave-cards-grid">
      {applications.map((app) => (
        <div className="leave-card" key={app.id}>
          {/* User Info */}
          <div className="leave-card-user">
            <div className="leave-card-avatar">{getInitials(app.userName)}</div>
            <div className="leave-card-user-info">
              <h4>{app.userName}</h4>
              <span>{app.department}</span>
            </div>
          </div>

          {/* Leave Type & Status */}
          <div className="leave-card-detail">
            <div className="leave-card-detail-label">Leave Type</div>
            <div className="leave-card-detail-row">
              <span className={`leave-card-type-badge ${getTypeClass(app.leaveType)}`}>
                {app.leaveTypeName}
              </span>
              <StatusBadge status={app.status} />
            </div>
            <div className="leave-card-dates">
              <Calendar size={13} />
              {app.daysCount} Day{app.daysCount > 1 ? 's' : ''} &middot; {app.startDate} to {app.endDate}
            </div>
          </div>

          {/* Reason */}
          <div>
            <div className="leave-card-reason-label">Reason / Subject</div>
            <div className="leave-card-reason">"{app.reason}"</div>
          </div>

          {/* Footer: Reviewer or Actions */}
          <div className="leave-card-footer">
            {app.reviewedBy ? (
              <div className="leave-card-reviewer">
                <div className="leave-card-reviewer-avatar">{getInitials(app.reviewedBy)}</div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{app.reviewedBy}</div>
                  <div style={{ fontSize: '0.7rem' }}>Reviewer</div>
                </div>
              </div>
            ) : (
              <div className="leave-card-reviewer" style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                Awaiting review
              </div>
            )}

            {isManager && app.status === 'PENDING' && (
              <div className="leave-card-actions">
                <button className="action-btn approve" onClick={() => onApprove && onApprove(app)} title="Approve">
                  <Check size={16} />
                </button>
                <button className="action-btn reject" onClick={() => onReject && onReject(app)} title="Reject">
                  <X size={16} />
                </button>
              </div>
            )}
            
            {!isManager && app.status === 'PENDING' && (
              <div className="leave-card-actions">
                <button 
                  onClick={() => onCancel && onCancel(app)}
                  style={{ background: '#EAE1D9', color: '#6E473B', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel Request
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
