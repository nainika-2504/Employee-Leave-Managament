import React, { useState } from 'react';
import { StatCard } from '../components/StatCard';
import { LeaveCardList } from '../components/LeaveCardList';
import { CalendarView } from '../components/CalendarView';
import { ApplyLeaveModal } from '../components/ApplyLeaveModal';
import { Plus, Calendar, Clock, CheckCircle2, Sparkles } from 'lucide-react';

export const EmployeeDashboard = ({ currentUser, userBalances, applications, onRefresh, showToast, onCancel }) => {
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const annualBal = userBalances?.ANNUAL || { remaining: 14, used: 4, total: 18 };
  const sickBal = userBalances?.SICK || { remaining: 9, used: 1, total: 10 };
  const casualBal = userBalances?.CASUAL || { remaining: 5, used: 2, total: 7 };

  const totalRemaining = annualBal.remaining + sickBal.remaining + casualBal.remaining;
  const pendingCount = applications.filter(a => a.status === 'PENDING').length;
  const recentApps = applications.slice(0, 3);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {currentUser.name.split(' ')[0]}!</h1>
          <p className="page-description">Here's a quick overview of your leave status and recent activity.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsApplyModalOpen(true)}>
          <Plus size={18} /> Apply for Leave
        </button>
      </div>

      {/* Colorful Stat Cards */}
      <div className="stats-grid">
        <StatCard
          label="Annual Leaves"
          value={`${annualBal.used}/${annualBal.total}`}
          subtext={`${annualBal.remaining} days remaining`}
          icon={Calendar}
          gradient="gradient-purple"
        />
        <StatCard
          label="Sick Leaves"
          value={`${sickBal.used}/${sickBal.total}`}
          subtext={`${sickBal.remaining} days remaining`}
          icon={CheckCircle2}
          gradient="gradient-yellow"
        />
        <StatCard
          label="Casual Leaves"
          value={`${casualBal.used}/${casualBal.total}`}
          subtext={`${casualBal.remaining} days remaining`}
          icon={Sparkles}
          gradient="gradient-green"
        />
        <StatCard
          label="Total Balance"
          value={`${totalRemaining} Days`}
          subtext={`${pendingCount} request${pendingCount === 1 ? '' : 's'} pending`}
          icon={Clock}
          gradient="gradient-pink"
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
        <LeaveCardList applications={recentApps} isManager={false} onCancel={onCancel} />
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
