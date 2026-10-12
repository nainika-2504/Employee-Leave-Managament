import React from 'react';
import { User, Mail, Building2, Shield, Calendar, Clock, RefreshCw, Award, CheckCircle2, Info } from 'lucide-react';

const DEFAULT_JOINING_DATES = {
  1: '2024-01-15',
  2: '2023-06-01',
  3: '2024-03-10',
  4: '2024-05-20',
  5: '2024-08-01',
  'nainika@company.com': '2024-01-15',
  'apoorva@company.com': '2023-06-01',
  'natasha@company.com': '2024-03-10',
  'sarvani@company.com': '2024-05-20',
  'sahaja@company.com': '2024-08-01'
};

const formatJoiningDate = (dateStr) => {
  if (!dateStr) return '15 Jan 2024';
  try {
    const [year, month, day] = dateStr.split('-');
    const d = new Date(year, parseInt(month, 10) - 1, day);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

const calculateTenure = (dateStr) => {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.split('-');
    const start = new Date(year, parseInt(month, 10) - 1, day);
    const now = new Date();
    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    const parts = [];
    if (years > 0) parts.push(`${years} yr${years > 1 ? 's' : ''}`);
    if (months > 0) parts.push(`${months} mo${months > 1 ? 's' : ''}`);
    return parts.length ? parts.join(', ') : 'New Joiner';
  } catch {
    return '';
  }
};

export const ProfilePage = ({ currentUser, userBalances, onLogout }) => {
  const joiningDateRaw = currentUser?.joiningDate ||
    DEFAULT_JOINING_DATES[currentUser?.id] ||
    DEFAULT_JOINING_DATES[currentUser?.email] ||
    '2024-01-15';

  const formattedJoiningDate = formatJoiningDate(joiningDateRaw);
  const tenureText = calculateTenure(joiningDateRaw);

  // Leave refresh cycle: Refreshes annually every January.
  // Accrual Rate: 1 Normal Leave credited per month.
  // For October (month 10): Exactly 10 leaves have accumulated to date!
  const currentMonthNumber = new Date().getMonth() + 1; // 10 in October
  const currentMonthName = new Date().toLocaleDateString('en-US', { month: 'short' }); // "Oct"
  const currentYear = new Date().getFullYear();
  const accumulatedToDate = currentMonthNumber; // 10 accumulated leaves in October

  const rawNormalTotal = userBalances?.NORMAL?.total ?? 10;
  const normalTotal = Math.min(rawNormalTotal, accumulatedToDate);
  const normalUsed = userBalances?.NORMAL?.used ?? 2;
  const normalRemaining = Math.max(0, normalTotal - normalUsed);

  const normalBal = {
    remaining: normalRemaining,
    used: normalUsed,
    total: normalTotal
  };

  const medicalBal = userBalances?.MEDICAL || { remaining: 9, used: 1, total: 10 };
  const extendedBal = userBalances?.EXTENDED || { remaining: 30, used: 0, total: 30 };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <User size={24} style={{ color: 'var(--primary)' }} />
            My Profile
          </h1>
          <p className="page-description">Your account information, employment details, and leave policy entitlements.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Profile Card */}
        <div className="section-card" style={{ margin: 0 }}>
          <div className="profile-header">
            <div className="profile-avatar-large">
              {currentUser?.avatar || 'U'}
            </div>
            <div className="profile-info">
              <h2 className="profile-name">{currentUser?.name}</h2>
              <span className="profile-role-badge">
                <Shield size={14} />
                {currentUser?.role === 'MANAGER' ? 'Manager' : 'Employee'}
              </span>
            </div>
          </div>

          <div className="profile-details">
            <div className="profile-detail-row">
              <span className="profile-detail-label"><Mail size={16} /> Email</span>
              <span className="profile-detail-value">{currentUser?.email}</span>
            </div>
            <div className="profile-detail-row">
              <span className="profile-detail-label"><Building2 size={16} /> Department</span>
              <span className="profile-detail-value">{currentUser?.department}</span>
            </div>
            {currentUser?.manager && (
              <div className="profile-detail-row">
                <span className="profile-detail-label"><User size={16} /> Reporting Manager</span>
                <span className="profile-detail-value">{currentUser.manager}</span>
              </div>
            )}
            <div className="profile-detail-row">
              <span className="profile-detail-label"><Shield size={16} /> Employee ID</span>
              <span className="profile-detail-value">EMP-{currentUser?.id}</span>
            </div>
            <div className="profile-detail-row">
              <span className="profile-detail-label"><Calendar size={16} style={{ color: 'var(--primary)' }} /> Date of Joining</span>
              <span className="profile-detail-value" style={{ fontWeight: 600 }}>
                {formattedJoiningDate}
                {tenureText && (
                  <span style={{
                    fontSize: '0.78rem',
                    fontWeight: 500,
                    color: 'var(--primary)',
                    background: 'var(--bg-subtle, #f1f5f9)',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    marginLeft: '8px'
                  }}>
                    {tenureText}
                  </span>
                )}
              </span>
            </div>
          </div>

          {onLogout && (
            <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border-light, #e2e8f0)' }}>
              <button className="btn btn-danger" onClick={onLogout}>
                Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Accrual & Carry Forward Policy Card */}
        <div className="section-card" style={{ margin: 0 }}>
          <div className="section-header" style={{ marginBottom: 16 }}>
            <h2 className="section-title">
              <Award size={20} style={{ color: 'var(--primary)' }} />
              Leave Accrual &amp; Carry-Forward Policy
            </h2>
          </div>

          {/* Key Rule Banners */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            {/* Rule 1: Accrual */}
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 8,
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12
            }}>
              <CheckCircle2 size={18} style={{ color: '#16a34a', marginTop: 2, flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: '0.88rem', color: '#15803d' }}>Annual Refresh &amp; Monthly Accrual (1 Leave / Month)</strong>
                <p style={{ margin: '3px 0 0', fontSize: '0.81rem', color: '#166534', lineHeight: 1.4 }}>
                  Every year on January 1st, accumulated leaves refresh. Employees accrue <strong>1 Normal Leave per calendar month worked</strong>. Since it is currently <strong>October</strong> (month 10), exactly <strong>10 leaves have accumulated</strong> to date.
                </p>
              </div>
            </div>

            {/* Rule 2: Carry Forward */}
            <div style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: 8,
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12
            }}>
              <RefreshCw size={18} style={{ color: '#2563eb', marginTop: 2, flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: '0.88rem', color: '#1d4ed8' }}>Carry-Forward Policy (Rollover Active)</strong>
                <p style={{ margin: '3px 0 0', fontSize: '0.81rem', color: '#1e40af', lineHeight: 1.4 }}>
                  Unused accumulated leaves carry forward month-to-month and into consecutive cycles without lapsing or expiring.
                </p>
              </div>
            </div>

            {/* Rule 3: 3-Day Consecutive Limit */}
            <div style={{
              background: '#fff7ed',
              border: '1px solid #fed7aa',
              borderRadius: 8,
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12
            }}>
              <Info size={18} style={{ color: '#ea580c', marginTop: 2, flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: '0.88rem', color: '#c2410c' }}>Consecutive Normal Leave Cap</strong>
                <p style={{ margin: '3px 0 0', fontSize: '0.81rem', color: '#9a3412', lineHeight: 1.4 }}>
                  Normal leave is limited to a maximum of <strong>3 consecutive working days</strong> per application. Absences exceeding 3 days require <strong>Extended Leave</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Current Entitlement Breakdown */}
          <div>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #64748b)', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Your Current Leave Quota
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              <div style={{
                background: 'var(--bg-card, #ffffff)',
                border: '1px solid var(--border-color, #e2e8f0)',
                borderRadius: 8,
                padding: '10px 12px',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary, #94a3b8)', display: 'block' }}>Normal Leave</span>
                <strong style={{ fontSize: '1.15rem', color: '#4f46e5' }}>{normalBal.remaining}d</strong>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginTop: 2 }}>of {normalBal.total}d accumulated (Oct)</span>
              </div>
              <div style={{
                background: 'var(--bg-card, #ffffff)',
                border: '1px solid var(--border-color, #e2e8f0)',
                borderRadius: 8,
                padding: '10px 12px',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary, #94a3b8)', display: 'block' }}>Medical Leave</span>
                <strong style={{ fontSize: '1.15rem', color: '#059669' }}>{medicalBal.remaining}d</strong>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginTop: 2 }}>of {medicalBal.total}d total</span>
              </div>
              <div style={{
                background: 'var(--bg-card, #ffffff)',
                border: '1px solid var(--border-color, #e2e8f0)',
                borderRadius: 8,
                padding: '10px 12px',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary, #94a3b8)', display: 'block' }}>Extended Leave</span>
                <strong style={{ fontSize: '1.15rem', color: '#0284c7' }}>{extendedBal.remaining}d</strong>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginTop: 2 }}>of {extendedBal.total}d total</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
