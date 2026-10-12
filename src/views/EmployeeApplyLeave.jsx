import React, { useState } from 'react';
import { ApplyLeaveModal } from '../components/ApplyLeaveModal';
import { Plus, Send, Calendar, HeartPulse, Clock, ArrowRight } from 'lucide-react';

export const EmployeeApplyLeave = ({ currentUser, userBalances, onRefresh, showToast }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('NORMAL');

  const currentMonthNumber = new Date().getMonth() + 1; // 10 in October
  const rawNormalTotal = userBalances?.NORMAL?.total ?? 10;
  const normalTotal = Math.min(rawNormalTotal, currentMonthNumber);
  const normalUsed = userBalances?.NORMAL?.used ?? 2;
  const normalRemaining = Math.max(0, normalTotal - normalUsed);

  const leaveTypes = [
    {
      id: 'NORMAL',
      name: 'Normal Leave',
      icon: <Calendar size={26} />,
      color: '#4f46e5',
      balance: { remaining: normalRemaining, used: normalUsed, total: normalTotal },
      description: 'Standard vacation and planned personal leaves. 10 leaves accumulated to date (Oct). Max 3 consecutive days.'
    },
    {
      id: 'MEDICAL',
      name: 'Medical Leave',
      icon: <HeartPulse size={26} />,
      color: '#059669',
      balance: userBalances?.MEDICAL || { remaining: 9, used: 1, total: 10 },
      description: 'Health recovery, doctor appointments, or sudden illness. Supports retrospective filing.'
    },
    {
      id: 'EXTENDED',
      name: 'Extended Leave',
      icon: <Clock size={26} />,
      color: '#0284c7',
      balance: userBalances?.EXTENDED || { remaining: 30, used: 0, total: 30 },
      description: 'Longer absence leaves beyond 3 days. Exempt from consecutive day limit.'
    },
  ];

  const handleCardClick = (typeId) => {
    setSelectedType(typeId);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Send size={24} style={{ color: 'var(--primary)' }} />
            Apply for Leave
          </h1>
          <p className="page-description">
            Select a leave category below or click submit to launch your request.
          </p>
        </div>
      </div>

      {/* Leave Type Cards */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        {leaveTypes.map((lt) => (
          <div
            key={lt.id}
            className="leave-type-select-card"
            onClick={() => handleCardClick(lt.id)}
            style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
          >
            <div className="leave-type-icon" style={{ color: lt.color }}>{lt.icon}</div>
            <div className="leave-type-info">
              <h3>{lt.name}</h3>
              <p className="leave-type-balance">
                <strong>{lt.balance?.remaining ?? 0}</strong> days available of {lt.balance?.total ?? 0}
              </p>
              <div className="leave-type-bar" style={{ marginTop: 8, marginBottom: 8 }}>
                <div
                  className="leave-type-bar-fill"
                  style={{
                    width: `${Math.min(100, ((lt.balance?.used ?? 0) / (lt.balance?.total ?? 1)) * 100)}%`,
                    background: lt.color
                  }}
                />
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                {lt.description}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 10, fontSize: '0.8rem', fontWeight: 600, color: lt.color }}>
                <span>Apply now</span>
                <ArrowRight size={14} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', paddingTop: 12 }}>
        <button
          className="btn btn-primary"
          onClick={() => { setSelectedType('NORMAL'); setIsModalOpen(true); }}
          style={{ padding: '12px 32px', fontSize: '0.95rem' }}
        >
          <Plus size={18} /> Submit Leave Request
        </button>
      </div>

      <ApplyLeaveModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userBalances={userBalances}
        initialLeaveType={selectedType}
        onSuccess={(msg) => { showToast(msg); onRefresh(); }}
      />
    </div>
  );
};
