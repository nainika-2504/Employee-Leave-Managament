import React, { useState, useEffect, useMemo } from 'react';
import { StatCard } from '../components/StatCard';
import { LeaveCardList } from '../components/LeaveCardList';
import { apiService } from '../services/api';
import {
  Clock, CheckCircle2, XCircle, Users, Shield, Calendar,
  AlertTriangle, FileText, Filter, RotateCcw, ChevronRight, X
} from 'lucide-react';

export const ManagerDashboard = ({ users = [], allApplications = [], onApprove, onReject, onDelete }) => {
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [drillDownTitle, setDrillDownTitle] = useState(null);
  const [drillDownRecords, setDrillDownRecords] = useState(null);

  // Load real database metrics and aggregations from backend API
  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getDashboardAnalytics({
        department: selectedDept,
        startDate: startDateFilter || null,
        endDate: endDateFilter || null
      });
      setAnalyticsData(data);
    } catch (err) {
      console.error('Failed to load manager dashboard analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedDept, startDateFilter, endDateFilter]);

  const departments = useMemo(() => {
    const set = new Set();
    users.forEach(u => { if (u.department) set.add(u.department); });
    return Array.from(set);
  }, [users]);

  const summary = analyticsData?.summary || {
    totalEmployees: users.filter(u => u.role === 'EMPLOYEE').length,
    onLeaveToday: 0,
    pendingRequests: 0,
    approvedThisMonth: 0,
    rejectedThisMonth: 0,
    upcomingApproved: 0,
    awaitingDocumentation: 0,
    overduePending: 0
  };

  const monthlyTrends = analyticsData?.monthlyTrends || [];
  const typeDistribution = analyticsData?.typeDistribution || [];
  const departmentStats = analyticsData?.departmentStats || [];
  const approvalAnalytics = analyticsData?.approvalAnalytics || {};
  const dailyAvailability = analyticsData?.dailyAvailability || [];
  const records = analyticsData?.records || allApplications;

  const pendingApps = records.filter(a => a.status === 'PENDING');

  // Drilldown handler
  const handleDrilldown = (title, filteredList) => {
    setDrillDownTitle(title);
    setDrillDownRecords(filteredList);
  };

  return (
    <div className="manager-dashboard-container">
      {/* Page Header & Global Filters */}
      <div className="page-header" style={{ alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">
            <Shield size={24} style={{ color: 'var(--primary)' }} />
            Manager &amp; Executive Dashboard
          </h1>
          <p className="page-description">
            Live database analytics, staffing availability graphs, and leave governance.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', padding: '4px 10px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <Filter size={14} style={{ color: '#64748b' }} />
            <select
              style={{ border: 'none', background: 'transparent', fontSize: '0.82rem', fontWeight: 500, outline: 'none' }}
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="ALL">All Departments</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <input
            type="date"
            className="form-control"
            style={{ width: 'auto', padding: '4px 8px', fontSize: '0.8rem' }}
            value={startDateFilter}
            onChange={(e) => setStartDateFilter(e.target.value)}
            title="Filter Start Date"
          />
          <input
            type="date"
            className="form-control"
            style={{ width: 'auto', padding: '4px 8px', fontSize: '0.8rem' }}
            value={endDateFilter}
            onChange={(e) => setEndDateFilter(e.target.value)}
            title="Filter End Date"
          />

          <button
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            onClick={() => { setSelectedDept('ALL'); setStartDateFilter(''); setEndDateFilter(''); }}
            title="Reset Filters"
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </div>

      {/* 8 Mandatory Summary Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: 24 }}>
        <StatCard
          label="Total Team Members"
          value={summary.totalEmployees}
          subtext="Under supervision scope"
          icon={Users}
          gradient="gradient-purple"
        />
        <StatCard
          label="On Leave Today"
          value={summary.onLeaveToday}
          subtext="Active absences today"
          icon={Calendar}
          gradient="gradient-yellow"
        />
        <StatCard
          label="Pending Approvals"
          value={summary.pendingRequests}
          subtext="Requires review action"
          icon={Clock}
          gradient="gradient-yellow"
        />
        <StatCard
          label="Approved This Month"
          value={summary.approvedThisMonth}
          subtext="Processed approvals"
          icon={CheckCircle2}
          gradient="gradient-green"
        />
        <StatCard
          label="Rejected This Month"
          value={summary.rejectedThisMonth}
          subtext="Declined requests"
          icon={XCircle}
          gradient="gradient-pink"
        />
        <StatCard
          label="Upcoming Approved"
          value={summary.upcomingApproved}
          subtext="Scheduled future leaves"
          icon={Calendar}
          gradient="gradient-purple"
        />
        <StatCard
          label="Awaiting Medical Docs"
          value={summary.awaitingDocumentation}
          subtext="Documentation pending"
          icon={FileText}
          gradient="gradient-yellow"
        />
        <StatCard
          label="Overdue (>3 Days)"
          value={summary.overduePending}
          subtext="Exceeds review SLA"
          icon={AlertTriangle}
          gradient="gradient-pink"
        />
      </div>

      {/* GRAPHS GRID (Real Database Aggregations) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: 20, marginBottom: 24 }}>

        {/* GRAPH 1: Monthly Leave Trends (Segmented Bar Chart) */}
        <div className="section-card">
          <div className="section-header" style={{ justifyContent: 'space-between' }}>
            <h2 className="section-title">
              <Calendar size={18} style={{ color: 'var(--primary)' }} />
              Graph 1: Monthly Leave Trends
            </h2>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Last 6 Months (Approved Days)</span>
          </div>

          <div style={{ height: 220, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingTop: 20 }}>
            {/* Chart Legend */}
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginBottom: 16, fontSize: '0.74rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: '#2563eb' }}></span> Normal
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: '#10b981' }}></span> Half-Day
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: '#f59e0b' }}></span> Medical
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: '#8b5cf6' }}></span> Extended
              </span>
            </div>

            {/* SVG Stacked / Grouped Bars */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: 150, borderBottom: '1px solid #e2e8f0', paddingBottom: 8 }}>
              {monthlyTrends.map((m, idx) => {
                const maxVal = Math.max(...monthlyTrends.map(t => t.total || 1), 10);
                const barHeight = Math.max(6, ((m.total || 0) / maxVal) * 120);

                return (
                  <div
                    key={idx}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 44, cursor: 'pointer' }}
                    onClick={() => handleDrilldown(`Leaves in ${m.month}`, records.filter(r => r.status === 'APPROVED'))}
                    title={`${m.month}: Total ${m.total} Days (Click to view)`}
                  >
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                      {m.total}d
                    </div>
                    <div style={{ width: 28, height: barHeight, display: 'flex', flexDirection: 'column-reverse', borderRadius: '4px 4px 0 0', overflow: 'hidden', background: '#f1f5f9' }}>
                      <div style={{ height: `${((m.normal || 0) / (m.total || 1)) * 100}%`, background: '#2563eb' }} />
                      <div style={{ height: `${((m.halfDay || 0) / (m.total || 1)) * 100}%`, background: '#10b981' }} />
                      <div style={{ height: `${((m.medical || 0) / (m.total || 1)) * 100}%`, background: '#f59e0b' }} />
                      <div style={{ height: `${((m.extended || 0) / (m.total || 1)) * 100}%`, background: '#8b5cf6' }} />
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 6, whiteSpace: 'nowrap' }}>
                      {m.month.split(' ')[0]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* GRAPH 2: Leave Type Distribution (Doughnut Chart) */}
        <div className="section-card">
          <div className="section-header" style={{ justifyContent: 'space-between' }}>
            <h2 className="section-title">
              <CheckCircle2 size={18} style={{ color: 'var(--primary)' }} />
              Graph 2: Leave Type Distribution
            </h2>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>By Category Usage</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', height: 220 }}>
            {/* SVG Doughnut */}
            <svg width="150" height="150" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="38" fill="transparent" stroke="#f1f5f9" strokeWidth="18" />
              {(() => {
                const colors = ['#2563eb', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'];
                const totalDays = typeDistribution.reduce((acc, t) => acc + (t.days || 0), 0) || 1;
                let offset = 0;

                return typeDistribution.map((t, idx) => {
                  const pct = (t.days || 0) / totalDays;
                  const strokeDash = pct * 238.76; // 2 * PI * 38
                  const currentOffset = offset;
                  offset += strokeDash;

                  return (
                    <circle
                      key={t.type}
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke={colors[idx % colors.length]}
                      strokeWidth="18"
                      strokeDasharray={`${strokeDash} 238.76`}
                      strokeDashoffset={-currentOffset}
                      style={{ cursor: 'pointer', transition: 'stroke-width 0.2s' }}
                      onClick={() => handleDrilldown(`${t.label} Requests`, records.filter(r => r.leaveType === t.type))}
                    />
                  );
                });
              })()}
              <text x="50" y="48" textAnchor="middle" fontSize="12" fontWeight="700" fill="#1e293b">
                {typeDistribution.reduce((acc, t) => acc + (t.days || 0), 0)}
              </text>
              <text x="50" y="62" textAnchor="middle" fontSize="7" fill="#64748b">Total Days</text>
            </svg>

            {/* Legend Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.78rem' }}>
              {typeDistribution.map((t, idx) => {
                const colors = ['#2563eb', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'];
                return (
                  <div
                    key={t.type}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                    onClick={() => handleDrilldown(`${t.label} Applications`, records.filter(r => r.leaveType === t.type))}
                  >
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: colors[idx % colors.length] }} />
                    <span style={{ color: '#334155' }}>{t.label}:</span>
                    <strong style={{ color: '#0f172a' }}>{t.days} Days</strong>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* GRAPH 3: Department-wise Leave Usage */}
        <div className="section-card">
          <div className="section-header" style={{ justifyContent: 'space-between' }}>
            <h2 className="section-title">
              <Users size={18} style={{ color: 'var(--primary)' }} />
              Graph 3: Department-wise Leave Usage
            </h2>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Comparative Utilization</span>
          </div>

          <div style={{ height: 220, overflowY: 'auto', paddingRight: 6 }}>
            {departmentStats.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#64748b', paddingTop: 60 }}>No department leave records.</p>
            ) : (
              departmentStats.map((dept) => {
                const maxDays = Math.max(...departmentStats.map(d => d.days || 1), 10);
                const pct = Math.min(100, Math.round(((dept.days || 0) / maxDays) * 100));

                return (
                  <div
                    key={dept.department}
                    style={{ marginBottom: 14, cursor: 'pointer' }}
                    onClick={() => handleDrilldown(`Leave Records for ${dept.department}`, records.filter(r => r.department === dept.department))}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, color: '#334155' }}>{dept.department}</span>
                      <span style={{ color: '#64748b' }}>{dept.days} Days ({dept.requests} requests)</span>
                    </div>
                    <div style={{ width: '100%', height: 12, background: '#f1f5f9', borderRadius: 6, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #2563eb, #60a5fa)', borderRadius: 6 }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* GRAPH 4: Leave Approval Turnaround & Decision Analytics */}
        <div className="section-card">
          <div className="section-header" style={{ justifyContent: 'space-between' }}>
            <h2 className="section-title">
              <Clock size={18} style={{ color: 'var(--primary)' }} />
              Graph 4: Leave Approval Turnaround Analytics
            </h2>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>SLA &amp; Response Metrics</span>
          </div>

          <div style={{ height: 220, display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
            {/* KPI Highlights */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, textAlign: 'center' }}>
              <div style={{ background: '#f8fafc', padding: '12px 8px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#2563eb' }}>
                  {approvalAnalytics.avgTurnaroundDays ?? 0}d
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>Avg Decision Turnaround</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '12px 8px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981' }}>
                  {approvalAnalytics.totalDecisions ?? 0}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>Completed Reviews</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '12px 8px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: summary.overduePending > 0 ? '#ef4444' : '#10b981' }}>
                  {summary.overduePending}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>Overdue SLA (&gt;3d)</div>
              </div>
            </div>

            {/* Approval vs Rejection Proportion Bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748b', marginBottom: 4 }}>
                <span style={{ color: '#059669', fontWeight: 600 }}>Approved: {summary.approvedThisMonth}</span>
                <span style={{ color: '#dc2626', fontWeight: 600 }}>Rejected: {summary.rejectedThisMonth}</span>
              </div>
              <div style={{ display: 'flex', height: 14, borderRadius: 7, overflow: 'hidden', background: '#f1f5f9' }}>
                <div style={{ width: `${(summary.approvedThisMonth / (summary.approvedThisMonth + summary.rejectedThisMonth || 1)) * 100}%`, background: '#10b981' }} />
                <div style={{ width: `${(summary.rejectedThisMonth / (summary.approvedThisMonth + summary.rejectedThisMonth || 1)) * 100}%`, background: '#ef4444' }} />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* GRAPH 5: Daily Employee Availability Timeline (Next 14 Days) */}
      <div className="section-card" style={{ marginBottom: 24 }}>
        <div className="section-header" style={{ justifyContent: 'space-between' }}>
          <h2 className="section-title">
            <Users size={18} style={{ color: 'var(--primary)' }} />
            Graph 5: Daily Employee Availability Schedule (Next 14 Days)
          </h2>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Real-time Staffing Availability &amp; Shortage Tracking</span>
        </div>

        <div style={{ overflowX: 'auto', padding: '10px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(14, minmax(65px, 1fr))', gap: 8 }}>
            {dailyAvailability.map((day) => {
              const isShortage = !day.isWeekend && !day.isHoliday && day.available < (day.totalEmployees * 0.5);

              return (
                <div
                  key={day.date}
                  style={{
                    background: day.isWeekend ? '#f1f5f9' : day.isHoliday ? '#fef3c7' : isShortage ? '#fee2e2' : '#f0fdf4',
                    border: `1px solid ${isShortage ? '#f87171' : day.isHoliday ? '#fde68a' : '#e2e8f0'}`,
                    borderRadius: 8,
                    padding: '8px 4px',
                    textAlign: 'center',
                    fontSize: '0.74rem'
                  }}
                >
                  <div style={{ fontWeight: 700, color: '#1e293b' }}>{day.dayName}</div>
                  <div style={{ color: '#64748b', fontSize: '0.68rem', marginBottom: 6 }}>{day.date.substring(5)}</div>

                  {day.isWeekend ? (
                    <span style={{ color: '#94a3b8', fontWeight: 500 }}>Weekend</span>
                  ) : day.isHoliday ? (
                    <span style={{ color: '#d97706', fontWeight: 600 }}>Holiday</span>
                  ) : (
                    <>
                      <div style={{ fontWeight: 700, color: '#059669' }}>{day.available} Present</div>
                      <div style={{ color: day.onLeave > 0 ? '#dc2626' : '#64748b', marginTop: 2 }}>{day.onLeave} on leave</div>
                      {isShortage && (
                        <div style={{ color: '#b91c1c', fontSize: '0.65rem', fontWeight: 700, marginTop: 4 }}>
                          ⚠️ Low Staff
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pending Approval Queue */}
      <div className="section-card">
        <div className="section-header" style={{ justifyContent: 'space-between' }}>
          <h2 className="section-title">
            <Clock size={18} style={{ color: 'var(--primary)' }} />
            Pending Leave Requests ({pendingApps.length})
          </h2>
        </div>
        {pendingApps.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#64748b', padding: '24px 0' }}>
            No pending leave requests awaiting approval. All requests processed!
          </p>
        ) : (
          <LeaveCardList
            applications={pendingApps}
            isManager={true}
            onApprove={onApprove}
            onReject={onReject}
            onDelete={onDelete}
          />
        )}
      </div>

      {/* Drill-Down Records Modal */}
      {drillDownRecords && (
        <div className="modal-overlay" onClick={() => setDrillDownRecords(null)}>
          <div className="modal-content" style={{ maxWidth: 700 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{drillDownTitle} ({drillDownRecords.length} Records)</h3>
              <button className="modal-close" onClick={() => setDrillDownRecords(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ maxHeight: 400, overflowY: 'auto' }}>
              {drillDownRecords.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#64748b' }}>No matching records found.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                      <th style={{ padding: 8 }}>Code</th>
                      <th style={{ padding: 8 }}>Employee</th>
                      <th style={{ padding: 8 }}>Category</th>
                      <th style={{ padding: 8 }}>Dates</th>
                      <th style={{ padding: 8 }}>Days</th>
                      <th style={{ padding: 8 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drillDownRecords.map(r => (
                      <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: 8, fontWeight: 600, color: 'var(--primary)' }}>{r.leaveCode || `#${r.id}`}</td>
                        <td style={{ padding: 8 }}>{r.userName}</td>
                        <td style={{ padding: 8 }}>{r.leaveTypeName || r.leaveType}</td>
                        <td style={{ padding: 8 }}>{r.startDate} to {r.endDate}</td>
                        <td style={{ padding: 8 }}>{r.halfDay ? '0.5' : r.daysCount}</td>
                        <td style={{ padding: 8 }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: 12,
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            background: r.status === 'APPROVED' ? '#d1fae5' : r.status === 'REJECTED' ? '#fee2e2' : '#fef3c7',
                            color: r.status === 'APPROVED' ? '#065f46' : r.status === 'REJECTED' ? '#991b1b' : '#92400e'
                          }}>
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setDrillDownRecords(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
