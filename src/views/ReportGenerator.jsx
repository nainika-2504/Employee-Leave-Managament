import React, { useState } from 'react';
import { FileDown, Printer, Filter, BarChart2, X } from 'lucide-react';

/**
 * ReportGenerator — inline report builder for leave data.
 * Supports filtering by user, leave type, status, and date range.
 * Renders a printable table and supports CSV download.
 */
export const ReportGenerator = ({ allApplications = [], users = [], allBalances = {}, currentUser }) => {
  const isManager = currentUser?.role === 'MANAGER';

  const [filters, setFilters] = useState({
    userId: 'ALL',
    leaveType: 'ALL',
    status: 'ALL',
    fromDate: '',
    toDate: ''
  });
  const [showReport, setShowReport] = useState(false);

  const employees = users.filter(u => u.role === 'EMPLOYEE');

  // Derive filtered applications
  const filtered = allApplications.filter(app => {
    if (!isManager && app.userId !== currentUser?.id && app.user?.id !== currentUser?.id) return false;
    if (filters.userId !== 'ALL') {
      const appUserId = app.userId ?? app.user?.id;
      if (String(appUserId) !== String(filters.userId)) return false;
    }
    if (filters.leaveType !== 'ALL' && app.leaveType !== filters.leaveType) return false;
    if (filters.status !== 'ALL' && app.status !== filters.status) return false;
    if (filters.fromDate && app.startDate < filters.fromDate) return false;
    if (filters.toDate && app.endDate > filters.toDate) return false;
    return true;
  });

  // Summary stats
  const totalDays = filtered.reduce((sum, a) => sum + (a.daysCount || 0), 0);
  const approved = filtered.filter(a => a.status === 'APPROVED').length;
  const pending = filtered.filter(a => a.status === 'PENDING').length;
  const rejected = filtered.filter(a => a.status === 'REJECTED').length;

  // CSV Download
  const downloadCSV = () => {
    const headers = ['Leave Code', 'Employee', 'Department', 'Leave Type', 'Start Date', 'End Date', 'Days', 'Half Day', 'Status', 'Applied On', 'Reviewed By', 'Reviewer Comments'];
    const rows = filtered.map(a => [
      a.leaveCode || a.id,
      a.userName || a.user?.name || '',
      a.department || '',
      a.leaveTypeName || a.leaveType,
      a.startDate,
      a.endDate,
      a.halfDay ? '0.5' : a.daysCount,
      a.halfDay ? (a.halfDaySession || 'YES') : 'No',
      a.status,
      a.appliedOn,
      a.reviewedBy || '',
      (a.reviewerComments || '').replace(/,/g, ';')
    ]);
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ELMS_Leave_Report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const statusColor = (status) => {
    switch (status) {
      case 'APPROVED': return { background: '#d1fae5', color: '#065f46' };
      case 'REJECTED': return { background: '#fee2e2', color: '#991b1b' };
      case 'CANCELLED': return { background: '#f3f4f6', color: '#6b7280' };
      default: return { background: '#fef3c7', color: '#92400e' };
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <BarChart2 size={24} style={{ color: 'var(--primary)' }} />
            Leave Report Generator
          </h1>
          <p className="page-description">Filter, preview, and export leave data as a report or CSV.</p>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="section-card" style={{ marginBottom: 24 }}>
        <div className="section-header">
          <h2 className="section-title">
            <Filter size={16} style={{ color: 'var(--primary)' }} />
            Report Filters
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, padding: '0 0 4px 0' }}>
          {isManager && (
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Employee</label>
              <select className="form-control" value={filters.userId} onChange={e => setFilters(f => ({ ...f, userId: e.target.value }))}>
                <option value="ALL">All Employees</option>
                {employees.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Leave Type</label>
            <select className="form-control" value={filters.leaveType} onChange={e => setFilters(f => ({ ...f, leaveType: e.target.value }))}>
              <option value="ALL">All Types</option>
              <option value="NORMAL">Normal Leave</option>
              <option value="MEDICAL">Medical Leave</option>
              <option value="EXTENDED">Extended Leave</option>
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Status</label>
            <select className="form-control" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">From Date</label>
            <input type="date" className="form-control" value={filters.fromDate} onChange={e => setFilters(f => ({ ...f, fromDate: e.target.value }))} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">To Date</label>
            <input type="date" className="form-control" value={filters.toDate} onChange={e => setFilters(f => ({ ...f, toDate: e.target.value }))} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => setShowReport(true)}>
            <BarChart2 size={16} /> Generate Report
          </button>
          <button className="btn btn-secondary" onClick={downloadCSV} disabled={filtered.length === 0}>
            <FileDown size={16} /> Download CSV
          </button>
          <button className="btn btn-secondary" onClick={handlePrint} disabled={!showReport}>
            <Printer size={16} /> Print
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => { setFilters({ userId: 'ALL', leaveType: 'ALL', status: 'ALL', fromDate: '', toDate: '' }); setShowReport(false); }}
          >
            <X size={16} /> Reset
          </button>
        </div>
      </div>

      {/* Report Output */}
      {showReport && (
        <div className="section-card" id="printable-report">
          {/* Report Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Employee Leave Management System</h2>
              <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Leave Report — Generated on {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                {filters.fromDate && filters.toDate && ` • Period: ${filters.fromDate} to ${filters.toDate}`}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {/* Summary Chips */}
              {[
                { label: 'Total Records', val: filtered.length, bg: '#f1f5f9', color: '#334155' },
                { label: 'Total Days', val: totalDays, bg: '#ede9fe', color: '#4c1d95' },
                { label: 'Approved', val: approved, bg: '#d1fae5', color: '#065f46' },
                { label: 'Pending', val: pending, bg: '#fef3c7', color: '#92400e' },
                { label: 'Rejected', val: rejected, bg: '#fee2e2', color: '#991b1b' },
              ].map(chip => (
                <div key={chip.label} style={{ background: chip.bg, color: chip.color, padding: '4px 12px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600 }}>
                  {chip.label}: {chip.val}
                </div>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '32px 0' }}>No records match the selected filters.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-app)', borderBottom: '2px solid var(--border-color)' }}>
                    {['Code', 'Employee', 'Dept.', 'Leave Type', 'Start', 'End', 'Days', 'Half Day', 'Status', 'Applied On', 'Reviewed By'].map(h => (
                      <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((app, i) => (
                    <tr key={app.id || i} style={{ borderBottom: '1px solid var(--border-color)', background: i % 2 === 0 ? 'transparent' : 'var(--bg-app)' }}>
                      <td style={{ padding: '7px 10px', fontWeight: 600, color: 'var(--primary)' }}>{app.leaveCode || `#${app.id}`}</td>
                      <td style={{ padding: '7px 10px' }}>{app.userName}</td>
                      <td style={{ padding: '7px 10px', color: 'var(--text-secondary)' }}>{app.department}</td>
                      <td style={{ padding: '7px 10px' }}>{app.leaveTypeName || app.leaveType}</td>
                      <td style={{ padding: '7px 10px', whiteSpace: 'nowrap' }}>{app.startDate}</td>
                      <td style={{ padding: '7px 10px', whiteSpace: 'nowrap' }}>{app.endDate}</td>
                      <td style={{ padding: '7px 10px', textAlign: 'center', fontWeight: 600 }}>
                        {app.halfDay ? '½' : app.daysCount}
                      </td>
                      <td style={{ padding: '7px 10px', textAlign: 'center', fontSize: '0.75rem', color: app.halfDay ? '#059669' : 'var(--text-tertiary)' }}>
                        {app.halfDay ? (app.halfDaySession === 'MORNING' ? '🌅 AM' : '🌇 PM') : '—'}
                      </td>
                      <td style={{ padding: '7px 10px' }}>
                        <span style={{ ...statusColor(app.status), padding: '2px 8px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600 }}>
                          {app.status}
                        </span>
                      </td>
                      <td style={{ padding: '7px 10px', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>{app.appliedOn}</td>
                      <td style={{ padding: '7px 10px', color: 'var(--text-secondary)' }}>{app.reviewedBy || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Print-only footer */}
          <div style={{ marginTop: 24, paddingTop: 12, borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>
            © 2026 Employee Leave Management System (ELMS) — Group-3 • SRS v1.0 • Confidential
          </div>
        </div>
      )}
    </div>
  );
};
