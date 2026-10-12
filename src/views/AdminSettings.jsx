import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import {
  Settings, Calendar, ShieldCheck, RefreshCw, UserCheck,
  FileText, Plus, Trash2, CheckCircle2, AlertTriangle, ArrowRight
} from 'lucide-react';

export const AdminSettings = ({ users = [], currentUser, showToast }) => {
  const [activeTab, setActiveTab] = useState('policies');
  const [policies, setPolicies] = useState({});
  const [holidays, setHolidays] = useState([]);
  const [delegations, setDelegations] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // New Holiday form
  const [newHolidayDate, setNewHolidayDate] = useState('');
  const [newHolidayName, setNewHolidayName] = useState('');

  // Accrual form
  const [accrualUserId, setAccrualUserId] = useState(users[0]?.id || 1);
  const [accrualYearMonth, setAccrualYearMonth] = useState('2026-11');
  const [accrualAmount, setAccrualAmount] = useState(1.0);

  // Balance Adjustment form
  const [adjUserId, setAdjUserId] = useState(users[0]?.id || 1);
  const [adjLeaveType, setAdjLeaveType] = useState('ANNUAL');
  const [adjRemaining, setAdjRemaining] = useState(15.0);
  const [adjReason, setAdjReason] = useState('Annual entitlement recalibration');

  // Reconciliation state
  const [reconcileResult, setReconcileResult] = useState(null);

  // Delegation form
  const [delDelegatorId, setDelDelegatorId] = useState(users.find(u => u.role === 'MANAGER')?.id || 2);
  const [delDelegateId, setDelDelegateId] = useState(users[0]?.id || 1);
  const [delStartDate, setDelStartDate] = useState('');
  const [delEndDate, setDelEndDate] = useState('');
  const [delReason, setDelReason] = useState('Manager vacation coverage');

  const loadAll = async () => {
    setIsLoading(true);
    try {
      const [pol, hol, del, logs] = await Promise.all([
        apiService.getPolicies(),
        apiService.getHolidays(),
        apiService.getDelegations(),
        apiService.getAuditLogs()
      ]);
      setPolicies(pol);
      setHolidays(hol);
      setDelegations(del);
      setAuditLogs(logs);
    } catch (err) {
      console.error('Failed to load admin settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleSavePolicy = async (key, val, desc) => {
    try {
      await apiService.updatePolicy(key, String(val), desc);
      showToast?.(`Policy '${key}' updated to ${val}`);
      loadAll();
    } catch (err) {
      alert(err.message || 'Failed to update policy');
    }
  };

  const handleAddHoliday = async (e) => {
    e.preventDefault();
    if (!newHolidayDate || !newHolidayName) return;
    try {
      await apiService.addHoliday(newHolidayDate, newHolidayName);
      showToast?.(`Holiday '${newHolidayName}' added`);
      setNewHolidayDate('');
      setNewHolidayName('');
      loadAll();
    } catch (err) {
      alert(err.message || 'Failed to add holiday');
    }
  };

  const handleDeleteHoliday = async (id) => {
    if (!window.confirm('Delete this public holiday?')) return;
    try {
      await apiService.deleteHoliday(id);
      showToast?.('Holiday deleted');
      loadAll();
    } catch (err) {
      alert(err.message || 'Failed to delete holiday');
    }
  };

  const handleTriggerAccrual = async (e) => {
    e.preventDefault();
    try {
      await apiService.triggerAccrual(accrualUserId, accrualYearMonth, accrualAmount);
      showToast?.(`Successfully accrued ${accrualAmount} day(s) for ${accrualYearMonth}!`);
      loadAll();
    } catch (err) {
      alert(err.message || 'Failed to trigger accrual');
    }
  };

  const handleAdjustBalance = async (e) => {
    e.preventDefault();
    try {
      await apiService.adjustBalance(adjUserId, adjLeaveType, adjRemaining, adjReason);
      showToast?.(`Balance adjusted for User ID #${adjUserId}`);
      loadAll();
    } catch (err) {
      alert(err.message || 'Failed to adjust balance');
    }
  };

  const handleReconcile = async () => {
    try {
      const res = await apiService.reconcileBalance(adjUserId, adjLeaveType);
      setReconcileResult(res);
      showToast?.('Reconciliation check completed');
    } catch (err) {
      alert(err.message || 'Reconciliation failed');
    }
  };

  const handleCreateDelegation = async (e) => {
    e.preventDefault();
    if (!delStartDate || !delEndDate) return;
    try {
      await apiService.createDelegation(delDelegatorId, delDelegateId, delStartDate, delEndDate, delReason);
      showToast?.('Approval delegation registered successfully');
      setDelStartDate('');
      setDelEndDate('');
      loadAll();
    } catch (err) {
      alert(err.message || 'Failed to create delegation');
    }
  };

  const handleDeleteDelegation = async (id) => {
    if (!window.confirm('Revoke this delegation?')) return;
    try {
      await apiService.deleteDelegation(id);
      showToast?.('Delegation revoked');
      loadAll();
    } catch (err) {
      alert(err.message || 'Failed to revoke delegation');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Settings size={24} style={{ color: 'var(--primary)' }} />
            HR &amp; System Administration
          </h1>
          <p className="page-description">
            Configure leave policies, entitlements, accruals, public holidays, and audit trails.
          </p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div style={{ display: 'flex', gap: 10, borderBottom: '2px solid #e2e8f0', marginBottom: 20 }}>
        {[
          { id: 'policies', label: 'Leave Policies', icon: Settings },
          { id: 'holidays', label: 'Company Holidays', icon: Calendar },
          { id: 'accrual', label: 'Accrual & Ledger', icon: RefreshCw },
          { id: 'delegations', label: 'Manager Delegations', icon: UserCheck },
          { id: 'audit', label: 'Audit Trail', icon: FileText },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              border: 'none',
              background: 'none',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              color: activeTab === tab.id ? 'var(--primary)' : '#64748b',
              borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
              marginBottom: -2
            }}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: POLICIES */}
      {activeTab === 'policies' && (
        <div className="section-card">
          <div className="section-header">
            <h2 className="section-title">Organizational Entitlement &amp; Validation Policies</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
            <div className="form-group">
              <label className="form-label">Monthly Leave Accrual Rate (Days/Month)</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="number"
                  step="0.5"
                  className="form-control"
                  defaultValue={policies.monthly_accrual_rate || 1.0}
                  onBlur={(e) => handleSavePolicy('monthly_accrual_rate', e.target.value, 'Monthly leave accrual rate per employee')}
                />
              </div>
              <small style={{ color: '#64748b' }}>Default statutory policy: 1 day per month.</small>
            </div>

            <div className="form-group">
              <label className="form-label">Max Consecutive Normal-Leave Days</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="number"
                  className="form-control"
                  defaultValue={policies.max_consecutive_normal_days || 3}
                  onBlur={(e) => handleSavePolicy('max_consecutive_normal_days', e.target.value, 'Maximum consecutive normal leave days allowed')}
                />
              </div>
              <small style={{ color: '#64748b' }}>Leaves exceeding this limit require 'Extended Leave'.</small>
            </div>

            <div className="form-group">
              <label className="form-label">Minimum Department Staffing Threshold (%)</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="number"
                  className="form-control"
                  defaultValue={policies.min_department_staffing_pct || 50}
                  onBlur={(e) => handleSavePolicy('min_department_staffing_pct', e.target.value, 'Minimum department staffing percentage threshold')}
                />
              </div>
              <small style={{ color: '#64748b' }}>Triggers manager staffing shortage warnings below this threshold.</small>
            </div>

            <div className="form-group">
              <label className="form-label">Pending Request Overdue Threshold (Days)</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="number"
                  className="form-control"
                  defaultValue={policies.overdue_threshold_days || 3}
                  onBlur={(e) => handleSavePolicy('overdue_threshold_days', e.target.value, 'Threshold in days for pending requests to be flagged overdue')}
                />
              </div>
              <small style={{ color: '#64748b' }}>Highlights pending requests that exceed review SLAs.</small>
            </div>

            <div className="form-group">
              <label className="form-label">Carry-Forward Enabled</label>
              <select
                className="form-control"
                value={policies.carry_forward_enabled || 'true'}
                onChange={(e) => handleSavePolicy('carry_forward_enabled', e.target.value, 'Whether unused normal leave carries forward')}
              >
                <option value="true">Enabled (Unused balances rollover)</option>
                <option value="false">Disabled (Resets annually)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Max Carry-Forward Cap (Days)</label>
              <input
                type="number"
                className="form-control"
                defaultValue={policies.max_carry_forward_days || 30}
                onBlur={(e) => handleSavePolicy('max_carry_forward_days', e.target.value, 'Maximum carry forward leave balance cap')}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COMPANY HOLIDAYS */}
      {activeTab === 'holidays' && (
        <div className="section-card">
          <div className="section-header" style={{ justifyContent: 'space-between' }}>
            <h2 className="section-title">Company Public Holidays Calendar</h2>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: 16 }}>
            These public holidays are automatically excluded from employee chargeable working days calculations.
          </p>

          {/* Add Holiday Form */}
          <form onSubmit={handleAddHoliday} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
            <input
              type="date"
              className="form-control"
              style={{ width: 'auto' }}
              value={newHolidayDate}
              onChange={e => setNewHolidayDate(e.target.value)}
              required
            />
            <input
              type="text"
              className="form-control"
              placeholder="Holiday Name (e.g. Republic Day)"
              style={{ flex: 1, minWidth: 200 }}
              value={newHolidayName}
              onChange={e => setNewHolidayName(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary">
              <Plus size={16} /> Add Holiday
            </button>
          </form>

          {/* Holiday List */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: 8 }}>Date</th>
                <th style={{ padding: 8 }}>Holiday Name</th>
                <th style={{ padding: 8, textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {holidays.map(h => (
                <tr key={h.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: 8, fontWeight: 600 }}>{h.holidayDate}</td>
                  <td style={{ padding: 8 }}>{h.name}</td>
                  <td style={{ padding: 8, textAlign: 'right' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '4px 8px', color: '#dc2626' }}
                      onClick={() => handleDeleteHoliday(h.id)}
                      title="Remove Holiday"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: ACCRUAL & LEDGER RECONCILIATION */}
      {activeTab === 'accrual' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
          {/* Monthly Accrual Tool */}
          <div className="section-card">
            <div className="section-header">
              <h2 className="section-title">Monthly Leave Accrual Engine</h2>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
              Credits monthly statutory entitlement with strict idempotency (cannot run twice for the same period).
            </p>
            <form onSubmit={handleTriggerAccrual}>
              <div className="form-group">
                <label className="form-label">Employee</label>
                <select className="form-control" value={accrualUserId} onChange={e => setAccrualUserId(Number(e.target.value))}>
                  {users.filter(u => u.role === 'EMPLOYEE').map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.department})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Accrual Period (YYYY-MM)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="2026-11"
                  value={accrualYearMonth}
                  onChange={e => setAccrualYearMonth(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Days to Credit</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-control"
                  value={accrualAmount}
                  onChange={e => setAccrualAmount(Number(e.target.value))}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                <RefreshCw size={16} /> Credit Monthly Accrual
              </button>
            </form>
          </div>

          {/* Balance Adjustment & Ledger Reconciliation */}
          <div className="section-card">
            <div className="section-header">
              <h2 className="section-title">Ledger Balance Adjustment &amp; Reconciliation</h2>
            </div>
            <form onSubmit={handleAdjustBalance}>
              <div className="form-group">
                <label className="form-label">Employee</label>
                <select className="form-control" value={adjUserId} onChange={e => setAdjUserId(Number(e.target.value))}>
                  {users.filter(u => u.role === 'EMPLOYEE').map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Leave Category</label>
                <select className="form-control" value={adjLeaveType} onChange={e => setAdjLeaveType(e.target.value)}>
                  <option value="ANNUAL">Annual Leave</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="CASUAL">Casual Leave</option>
                  <option value="EXTENDED">Extended Leave</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">New Remaining Balance</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-control"
                  value={adjRemaining}
                  onChange={e => setAdjRemaining(Number(e.target.value))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Mandatory Administrative Reason</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Reason for balance modification"
                  value={adjReason}
                  onChange={e => setAdjReason(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Adjust Balance
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleReconcile}>
                  Reconcile Ledger
                </button>
              </div>
            </form>

            {reconcileResult && (
              <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: reconcileResult.isConsistent ? '#f0fdf4' : '#fee2e2', border: `1px solid ${reconcileResult.isConsistent ? '#86efac' : '#fca5a5'}` }}>
                <div style={{ fontWeight: 600, color: reconcileResult.isConsistent ? '#166534' : '#991b1b', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {reconcileResult.isConsistent ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                  {reconcileResult.isConsistent ? 'Ledger is Fully Consistent' : 'Discrepancy Detected'}
                </div>
                <div style={{ fontSize: '0.78rem', marginTop: 4, color: '#334155' }}>
                  Displayed Remaining: <strong>{reconcileResult.displayedRemaining}d</strong> | Ledger Sum: <strong>{reconcileResult.ledgerCalculated}d</strong> | Ledger Records: <strong>{reconcileResult.transactionsCount}</strong>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: MANAGER DELEGATIONS */}
      {activeTab === 'delegations' && (
        <div className="section-card">
          <div className="section-header">
            <h2 className="section-title">Manager Approval Authority Delegation</h2>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
            Allow managers to delegate approval responsibilities to an authorized substitute when out of office.
          </p>

          <form onSubmit={handleCreateDelegation} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
            <div>
              <label className="form-label">Delegating Manager</label>
              <select className="form-control" value={delDelegatorId} onChange={e => setDelDelegatorId(Number(e.target.value))}>
                {users.filter(u => u.role === 'MANAGER' || u.role === 'ADMIN').map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Authorized Substitute</label>
              <select className="form-control" value={delDelegateId} onChange={e => setDelDelegateId(Number(e.target.value))}>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">From Date</label>
              <input type="date" className="form-control" value={delStartDate} onChange={e => setDelStartDate(e.target.value)} required />
            </div>
            <div>
              <label className="form-label">To Date</label>
              <input type="date" className="form-control" value={delEndDate} onChange={e => setDelEndDate(e.target.value)} required />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Delegation Justification</label>
              <input type="text" className="form-control" value={delReason} onChange={e => setDelReason(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: 'fit-content' }}>
              <UserCheck size={16} /> Register Delegation
            </button>
          </form>

          {/* Active Delegations Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: 8 }}>Manager</th>
                <th style={{ padding: 8 }}>Substitute</th>
                <th style={{ padding: 8 }}>Period</th>
                <th style={{ padding: 8 }}>Reason</th>
                <th style={{ padding: 8, textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {delegations.map(d => (
                <tr key={d.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: 8, fontWeight: 600 }}>{d.delegatorName || d.delegator?.name}</td>
                  <td style={{ padding: 8 }}>{d.delegateName || d.delegate?.name}</td>
                  <td style={{ padding: 8 }}>{d.startDate} to {d.endDate}</td>
                  <td style={{ padding: 8, color: '#64748b' }}>{d.reason}</td>
                  <td style={{ padding: 8, textAlign: 'right' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '4px 8px', color: '#dc2626' }}
                      onClick={() => handleDeleteDelegation(d.id)}
                    >
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 5: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="section-card">
          <div className="section-header">
            <h2 className="section-title">System Audit Log Trail (Immutable)</h2>
          </div>
          <div style={{ maxHeight: 500, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: 8 }}>Timestamp</th>
                  <th style={{ padding: 8 }}>Action</th>
                  <th style={{ padding: 8 }}>Actor</th>
                  <th style={{ padding: 8 }}>Target Entity</th>
                  <th style={{ padding: 8 }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: 8, whiteSpace: 'nowrap', color: '#64748b' }}>
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : ''}
                    </td>
                    <td style={{ padding: 8 }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: 12,
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        background: log.action === 'APPROVE' ? '#d1fae5' : log.action === 'REJECT' ? '#fee2e2' : '#f1f5f9',
                        color: log.action === 'APPROVE' ? '#065f46' : log.action === 'REJECT' ? '#991b1b' : '#334155'
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: 8, fontWeight: 600 }}>{log.performedBy}</td>
                    <td style={{ padding: 8 }}>{log.entityType} #{log.entityId}</td>
                    <td style={{ padding: 8, color: '#334155' }}>{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
