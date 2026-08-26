import React from 'react';
import { StatCard } from '../components/StatCard';
import { LeaveCardList } from '../components/LeaveCardList';
import { Clock, CheckCircle2, XCircle, Users, Shield } from 'lucide-react';

export const ManagerDashboard = ({ users, allApplications, allBalances, onApprove, onReject }) => {
  const pendingApps = allApplications.filter(a => a.status === 'PENDING');
  const approvedApps = allApplications.filter(a => a.status === 'APPROVED');
  const rejectedApps = allApplications.filter(a => a.status === 'REJECTED');
  const employeeCount = users.filter(u => u.role === 'EMPLOYEE').length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Shield size={24} style={{ color: 'var(--primary)' }} />
            Manager Dashboard
          </h1>
          <p className="page-description">Overview of team leave activity and pending approvals.</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <StatCard label="Pending Approvals" value={pendingApps.length} subtext="Requires review" icon={Clock} gradient="gradient-yellow" />
        <StatCard label="Approved" value={approvedApps.length} subtext="Processed" icon={CheckCircle2} gradient="gradient-green" />
        <StatCard label="Rejected" value={rejectedApps.length} subtext="Declined" icon={XCircle} gradient="gradient-pink" />
        <StatCard label="Team Members" value={employeeCount} subtext="Active employees" icon={Users} gradient="gradient-purple" />
      </div>

      {/* Recent Pending */}
      {pendingApps.length > 0 && (
        <div className="section-card">
          <div className="section-header">
            <h2 className="section-title">
              <Clock size={18} style={{ color: 'var(--primary)' }} />
              Pending Requests
            </h2>
          </div>
          <LeaveCardList
            applications={pendingApps.slice(0, 4)}
            isManager={true}
            onApprove={onApprove}
            onReject={onReject}
          />
        </div>
      )}
    </div>
  );
};
