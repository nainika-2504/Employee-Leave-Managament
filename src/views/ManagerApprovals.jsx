import React from 'react';
import { LeaveCardList } from '../components/LeaveCardList';
import { Clock, CheckCircle2 } from 'lucide-react';

export const ManagerApprovals = ({ allApplications, onApprove, onReject }) => {
  const pendingApps = allApplications.filter(a => a.status === 'PENDING');

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Clock size={24} style={{ color: 'var(--primary)' }} />
            Pending Approvals
          </h1>
          <p className="page-description">
            Review and action team leave requests. {pendingApps.length} request{pendingApps.length !== 1 ? 's' : ''} awaiting your review.
          </p>
        </div>
      </div>

      <div className="section-card">
        {pendingApps.length === 0 ? (
          <div className="empty-state">
            <CheckCircle2 size={40} className="empty-icon" style={{ color: 'var(--primary)' }} />
            <p style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>All caught up!</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
              There are no pending leave requests.
            </p>
          </div>
        ) : (
          <LeaveCardList
            applications={pendingApps}
            isManager={true}
            onApprove={onApprove}
            onReject={onReject}
          />
        )}
      </div>
    </div>
  );
};
