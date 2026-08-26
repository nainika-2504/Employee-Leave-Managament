import React, { useState } from 'react';
import { ApplyLeaveModal } from '../components/ApplyLeaveModal';
import { LeaveCardList } from '../components/LeaveCardList';
import { Plus, Calendar, Send } from 'lucide-react';

export const EmployeeApplyLeave = ({ currentUser, userBalances, onRefresh, showToast }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const leaveTypes = [
    { id: 'ANNUAL', name: 'Annual Leave', icon: '🏖️', color: '#291C0E', balance: userBalances?.ANNUAL },
    { id: 'SICK', name: 'Sick Leave', icon: '🏥', color: '#6E473B', balance: userBalances?.SICK },
    { id: 'CASUAL', name: 'Casual Leave', icon: '☕', color: '#A78D78', balance: userBalances?.CASUAL },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Send size={24} style={{ color: 'var(--primary)' }} />
            Apply for Leave
          </h1>
          <p className="page-description">Select a leave type and submit your request for manager approval.</p>
        </div>
      </div>

      {/* Leave Type Cards */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        {leaveTypes.map((lt) => (
          <div key={lt.id} className="leave-type-select-card" onClick={() => setIsModalOpen(true)}>
            <div className="leave-type-icon">{lt.icon}</div>
            <div className="leave-type-info">
              <h3>{lt.name}</h3>
              <p className="leave-type-balance">
                <strong>{lt.balance?.remaining ?? 0}</strong> days available of {lt.balance?.total ?? 0}
              </p>
              <div className="leave-type-bar">
                <div
                  className="leave-type-bar-fill"
                  style={{
                    width: `${((lt.balance?.used ?? 0) / (lt.balance?.total ?? 1)) * 100}%`,
                    background: lt.color
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', paddingTop: 12 }}>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} style={{ padding: '12px 32px', fontSize: '0.95rem' }}>
          <Plus size={18} /> Submit Leave Request
        </button>
      </div>

      <ApplyLeaveModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userBalances={userBalances}
        onSuccess={(msg) => { showToast(msg); onRefresh(); }}
      />
    </div>
  );
};
