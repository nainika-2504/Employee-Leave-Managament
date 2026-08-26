import React, { useState } from 'react';
import { StatusBadge } from './StatusBadge';
import { Search, Filter, Calendar, FileText } from 'lucide-react';

export const LeaveHistoryTable = ({ applications, isManager = false }) => {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredApps = applications.filter((app) => {
    const matchesStatus = filterStatus === 'ALL' || app.status === filterStatus;
    const matchesSearch =
      app.leaveTypeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.userName && app.userName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div>
      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control search-input"
            style={{ paddingLeft: 36 }}
            placeholder={isManager ? "Search employee, leave type..." : "Search leave type, reason..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={16} style={{ color: 'var(--text-muted)' }} />
          <select
            className="form-control filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        {filteredApps.length === 0 ? (
          <div className="empty-state">
            <FileText className="empty-icon" />
            <p style={{ fontWeight: 500 }}>No leave applications found</p>
            <p style={{ fontSize: '0.82rem', marginTop: 4 }}>Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <table className="minimal-table">
            <thead>
              <tr>
                <th>Request ID</th>
                {isManager && <th>Employee</th>}
                <th>Leave Type</th>
                <th>Dates</th>
                <th>Duration</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Remarks / Reviewer</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map((app) => (
                <tr key={app.id}>
                  <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{app.leaveCode || `#${app.id}`}</td>
                  {isManager && (
                    <td>
                      <div style={{ fontWeight: 600 }}>{app.userName}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{app.department}</div>
                    </td>
                  )}
                  <td>
                    <span style={{ fontWeight: 500 }}>{app.leaveTypeName}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}>
                      <Calendar size={13} style={{ color: 'var(--text-muted)' }} />
                      <span>{app.startDate} to {app.endDate}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{app.daysCount} Day{app.daysCount > 1 ? 's' : ''}</td>
                  <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={app.reason}>
                    {app.reason}
                  </td>
                  <td>
                    <StatusBadge status={app.status} />
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {app.reviewerComments ? (
                      <div>
                        <em>"{app.reviewerComments}"</em>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                          - {app.reviewedBy || 'Manager'} ({app.reviewedOn})
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
