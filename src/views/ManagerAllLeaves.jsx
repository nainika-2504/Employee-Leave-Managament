import React, { useState } from 'react';
import { LeaveCardList } from '../components/LeaveCardList';
import { ListFilter } from 'lucide-react';

export const ManagerAllLeaves = ({ allApplications, onApprove, onReject }) => {
  const [filterStatus, setFilterStatus] = useState('ALL');

  const filteredApps = filterStatus === 'ALL'
    ? allApplications
    : allApplications.filter(a => a.status === filterStatus);

  const counts = {
    ALL: allApplications.length,
    PENDING: allApplications.filter(a => a.status === 'PENDING').length,
    APPROVED: allApplications.filter(a => a.status === 'APPROVED').length,
    REJECTED: allApplications.filter(a => a.status === 'REJECTED').length,
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <ListFilter size={24} style={{ color: 'var(--primary)' }} />
            All Leave History
          </h1>
          <p className="page-description">Complete audit trail of all employee leave applications across the organization.</p>
        </div>
      </div>

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

      <div className="section-card">
        <LeaveCardList
          applications={filteredApps}
          isManager={true}
          onApprove={onApprove}
          onReject={onReject}
        />
      </div>
    </div>
  );
};
