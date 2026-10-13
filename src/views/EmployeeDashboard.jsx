import React, { useState } from 'react';
import { StatCard } from '../components/StatCard';
import { LeaveCardList } from '../components/LeaveCardList';
import { CalendarView } from '../components/CalendarView';
import { ApplyLeaveModal } from '../components/ApplyLeaveModal';
import { Plus, Calendar, Clock, HeartPulse, ShieldCheck } from 'lucide-react';

export const EmployeeDashboard = ({ currentUser, userBalances, applications, onRefresh, showToast, onCancel, onDelete }) => {
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const currentMonthNumber = new Date().getMonth() + 1; // 10 in October
  const rawNormalTotal = userBalances?.NORMAL?.total ?? 10;
  const normalTotal = Math.min(rawNormalTotal, currentMonthNumber);
  const normalUsed = userBalances?.NORMAL?.used ?? 2;
  const normalRemaining = Math.max(0, normalTotal - normalUsed);

  const normalBal = {
    remaining: normalRemaining,
    used: normalUsed,
    total: normalTotal
  };
  const medicalBal = userBalances?.MEDICAL || { remaining: 9, used: 1, total: 10 };
  const extendedBal = userBalances?.EXTENDED || { remaining: 0, used: 0, total: 0 };

  const totalRemaining = normalBal.remaining + medicalBal.remaining;
  const pendingCount = applications.filter(a => a.status === 'PENDING').length;
  const recentApps = applications.slice(0, 3);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {currentUser.name ? currentUser.name.split(' ')[0] : 'Employee'}!</h1>
          <p className="page-description">Here's a quick overview of your leave status, quota balances, and activity.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsApplyModalOpen(true)}>
          <Plus size={18} /> Apply for Leave
        </button>
      </div>

      {/* Colorful Stat Cards */}
      <div className="stats-grid">
        <StatCard
          label="Normal Leave"
          value={`${normalBal.used}/${normalBal.total}`}
          subtext={`${normalBal.remaining} days remaining (10 accrued to date)`}
          icon={Calendar}
          gradient="gradient-purple"
        />
        <StatCard
          label="Medical Leave"
          value={`${medicalBal.used}/${medicalBal.total}`}
          subtext={`${medicalBal.remaining} days remaining`}
          icon={HeartPulse}
          gradient="gradient-green"
        />
        <StatCard
          label="Extended Leave (Unpaid)"
          value={`${extendedBal.used || 0}d Taken`}
          subtext="No limit · Salary Deducted (LOP)"
          icon={Clock}
          gradient="gradient-yellow"
        />
        <StatCard
          label="Paid Leave Balance"
          value={`${totalRemaining} Days`}
          subtext={`${pendingCount} request${pendingCount === 1 ? '' : 's'} pending`}
          icon={ShieldCheck}
          gradient="gradient-purple"
        />
      </div>

      {/* Recent Applications */}
      <div className="section-card">
        <div className="section-header">
          <h2 className="section-title">
            <Clock size={18} style={{ color: 'var(--primary)' }} />
            Recent Applications
          </h2>
        </div>
        <LeaveCardList applications={recentApps} isManager={false} onCancel={onCancel} onDelete={onDelete} />
      </div>

      {/* Calendar */}
      <CalendarView applications={applications} />

      {/* Modal */}
      <ApplyLeaveModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        userBalances={userBalances}
        onSuccess={(msg) => { showToast(msg); onRefresh(); }}
      />
    </div>
  );
};
