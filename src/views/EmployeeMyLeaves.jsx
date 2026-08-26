import React, { useState } from 'react';
import { LeaveCardList } from '../components/LeaveCardList';
import { Calendar, FileText } from 'lucide-react';

export const EmployeeMyLeaves = ({ applications, onCancel }) => {
  const [filterStatus, setFilterStatus] = useState('ALL');

  const filteredApps = filterStatus === 'ALL'
    ? applications
    : applications.filter(a => a.status === filterStatus);

  const counts = {
    ALL: applications.length,
    PENDING: applications.filter(a => a.status === 'PENDING').length,
    APPROVED: applications.filter(a => a.status === 'APPROVED').length,
    REJECTED: applications.filter(a => a.status === 'REJECTED').length,
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <FileText size={24} style={{ color: 'var(--primary)' }} />
            My Leave Applications
          </h1>
          <p className="page-description">View the complete history and status of all your submitted leave requests.</p>
        </div>
      </div>

      {/* Summary Row */}
      <div className="leave-summary-row">
        {Object.entries(counts).map(([key, count]) => (
          <button
            key={key}
            className={`filter-tab ${filterStatus === key ? 'active' : ''}`}
            onClick={() => setFilterStatus(key)}
          >
            {key === 'ALL' ? 'All' : key.charAt(0) + key.slice(1).toLowerCase()}
            <span className="filter-count">{count}</span>
          </button>
        ))}
      </div>

      {/* Leave Cards */}
      <div className="section-card">
        <LeaveCardList applications={filteredApps} isManager={false} onCancel={onCancel} />
      </div>
    </div>
  );
};
