import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LoginPage } from './views/LoginPage';
import { apiService } from './services/api';
import { CheckCircle2, X, AlertTriangle, FileText, Check } from 'lucide-react';

// Employee Page Imports
import { EmployeeDashboard } from './views/EmployeeDashboard';
import { EmployeeApplyLeave } from './views/EmployeeApplyLeave';
import { EmployeeMyLeaves } from './views/EmployeeMyLeaves';
import { ProfilePage } from './views/ProfilePage';

// Manager & Executive Page Imports
import { ManagerDashboard } from './views/ManagerDashboard';
import { ManagerApprovals } from './views/ManagerApprovals';
import { ManagerAllLeaves } from './views/ManagerAllLeaves';
import { ManagerTeamBalances } from './views/ManagerTeamBalances';
import { ManagerCalendar } from './views/ManagerCalendar';
import { ReportGenerator } from './views/ReportGenerator';

const AUTH_KEY = 'elms_authenticated';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem(AUTH_KEY) === 'true';
  });
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [userBalances, setUserBalances] = useState({});
  const [allBalances, setAllBalances] = useState({});
  const [applications, setApplications] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  
  // Dynamic page routing view state
  const [currentView, setCurrentView] = useState('dashboard');

  // Review confirming modal states
  const [reviewApp, setReviewApp] = useState(null);
  const [reviewAction, setReviewAction] = useState(null);
  const [reviewComments, setReviewComments] = useState('');
  const [reviewOverrideReason, setReviewOverrideReason] = useState('');
  const [reviewDocStatus, setReviewDocStatus] = useState('VERIFIED');
  const [showHelpModal, setShowHelpModal] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const allUsers = await apiService.getUsers();
      let activeUser = apiService.getCurrentUser();

      if (activeUser && Array.isArray(allUsers)) {
        const found = allUsers.find(u => u.id === activeUser.id || u.email === activeUser.email);
        if (found) {
          activeUser = { ...activeUser, ...found };
          apiService.setCurrentUser(activeUser);
        }
      }

      setUsers(allUsers);
      setCurrentUser(activeUser);

      if (activeUser) {
        const balances = await apiService.getBalances(activeUser.id);
        setUserBalances(balances);

        const apps = await apiService.getApplications({
          userId: activeUser.id,
          role: activeUser.role
        });
        setApplications(apps);
      }

      const allBals = await apiService.getAllBalances();
      setAllBalances(allBals);
    } catch (err) {
      console.error("Error loading data from API:", err);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, loadData]);

  const handleLogin = (user) => {
    localStorage.setItem(AUTH_KEY, 'true');
    setIsAuthenticated(true);
    setCurrentView('dashboard');
    apiService.setCurrentUser(user);
    showToast(`Welcome back, ${user.name}!`);
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const handleSwitchUser = async (selectedUser) => {
    try {
      apiService.setCurrentUser(selectedUser);
      setCurrentUser(selectedUser);
      setCurrentView('dashboard'); // reset view to dashboard on role switch

      const balances = await apiService.getBalances(selectedUser.id);
      setUserBalances(balances);

      const apps = await apiService.getApplications({
        userId: selectedUser.id,
        role: selectedUser.role
      });
      setApplications(apps);

      showToast(`Switched to ${selectedUser.name} (${selectedUser.role} Portal)`);
    } catch (err) {
      console.error("Error switching user profiles:", err);
    }
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Manager Approve/Reject trigger handlers
  const handleOpenReview = (app, action) => {
    setReviewApp(app);
    setReviewAction(action);
    setReviewComments(action === 'APPROVED' ? 'Approved.' : 'Unable to approve due to scheduling conflicts.');
    setReviewOverrideReason(app.shortageWarning ? 'Staffing exception approved by manager.' : '');
    setReviewDocStatus(app.documentationStatus === 'SUBMITTED' ? 'VERIFIED' : app.documentationStatus);
  };

  const handleConfirmReview = async (e) => {
    e.preventDefault();
    if (!reviewApp || !reviewAction) return;
    try {
      await apiService.reviewLeaveRequest(
        reviewApp.id,
        reviewAction,
        reviewComments,
        reviewOverrideReason,
        reviewApp.medicalCertificate ? reviewDocStatus : null
      );
      showToast(`Leave request ${reviewApp.leaveCode || reviewApp.id} has been ${reviewAction.toLowerCase()}.`);
      setReviewApp(null);
      setReviewAction(null);
      setReviewComments('');
      setReviewOverrideReason('');
      await loadData();
    } catch (err) {
      alert(err.message || "Failed to process review.");
    }
  };

  const handleCancelLeave = async (app) => {
    if (!window.confirm(`Are you sure you want to cancel request ${app.leaveCode || app.id}?`)) return;
    try {
      await apiService.cancelLeave(app.id);
      showToast(`Leave request ${app.leaveCode || app.id} cancelled successfully.`);
      await loadData();
    } catch (err) {
      alert(err.message || "Failed to cancel leave.");
    }
  };

  const handleDeleteLeave = async (app) => {
    if (!window.confirm(`Are you sure you want to permanently delete leave application ${app.leaveCode || '#' + app.id}?`)) return;
    try {
      await apiService.deleteLeave(app.id);
      showToast(`Leave application ${app.leaveCode || '#' + app.id} deleted successfully.`);
      await loadData();
    } catch (err) {
      alert(err.message || "Failed to delete leave application.");
    }
  };

  // Dynamically render the page view based on active role & currentView state
  const renderContentView = () => {
    const role = currentUser?.role;
    const isManager = role === 'MANAGER';

    if (role === 'EMPLOYEE') {
      switch (currentView) {
        case 'dashboard':
          return (
            <EmployeeDashboard
              currentUser={currentUser}
              userBalances={userBalances}
              applications={applications}
              onRefresh={loadData}
              showToast={showToast}
              onCancel={handleCancelLeave}
              onDelete={handleDeleteLeave}
            />
          );
        case 'apply':
          return (
            <EmployeeApplyLeave
              currentUser={currentUser}
              userBalances={userBalances}
              onRefresh={loadData}
              showToast={showToast}
            />
          );
        case 'my-leaves':
          return <EmployeeMyLeaves applications={applications} onCancel={handleCancelLeave} onDelete={handleDeleteLeave} />;
        case 'reports':
          return (
            <ReportGenerator
              allApplications={applications}
              users={users}
              allBalances={allBalances}
              currentUser={currentUser}
            />
          );
        case 'profile':
          return <ProfilePage currentUser={currentUser} userBalances={userBalances} onLogout={handleLogout} />;
        default:
          return <EmployeeDashboard currentUser={currentUser} userBalances={userBalances} applications={applications} onRefresh={loadData} showToast={showToast} onCancel={handleCancelLeave} onDelete={handleDeleteLeave} />;
      }
    } else if (isManager) {
      switch (currentView) {
        case 'dashboard':
          return (
            <ManagerDashboard
              users={users}
              allApplications={applications}
              allBalances={allBalances}
              onApprove={(app) => handleOpenReview(app, 'APPROVED')}
              onReject={(app) => handleOpenReview(app, 'REJECTED')}
              onDelete={handleDeleteLeave}
            />
          );
        case 'approvals':
          return (
            <ManagerApprovals
              allApplications={applications}
              onApprove={(app) => handleOpenReview(app, 'APPROVED')}
              onReject={(app) => handleOpenReview(app, 'REJECTED')}
            />
          );
        case 'history':
          return (
            <ManagerAllLeaves
              allApplications={applications}
              onApprove={(app) => handleOpenReview(app, 'APPROVED')}
              onReject={(app) => handleOpenReview(app, 'REJECTED')}
              onDelete={handleDeleteLeave}
            />
          );
        case 'balances':
          return <ManagerTeamBalances users={users} allBalances={allBalances} />;
        case 'calendar':
          return <ManagerCalendar allApplications={applications} />;
        case 'reports':
          return (
            <ReportGenerator
              allApplications={applications}
              users={users}
              allBalances={allBalances}
              currentUser={currentUser}
            />
          );
        case 'profile':
          return <ProfilePage currentUser={currentUser} userBalances={userBalances} onLogout={handleLogout} />;
        default:
          return (
            <ManagerDashboard
              users={users}
              allApplications={applications}
              allBalances={allBalances}
              onApprove={(app) => handleOpenReview(app, 'APPROVED')}
              onReject={(app) => handleOpenReview(app, 'REJECTED')}
              onDelete={handleDeleteLeave}
            />
          );
      }
    }
    return <div>Error loading view.</div>;
  };

  // Show Login Page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (!currentUser) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#2D3A47' }}>Loading ELMS...</div>;
  }

  return (
    <div className="app-container">
      {/* Left Sidebar navigation */}
      <Sidebar 
        currentUser={currentUser} 
        currentView={currentView}
        onViewChange={setCurrentView}
        onLogout={handleLogout}
        onOpenHelp={() => setShowHelpModal(true)}
      />

      {/* Main Panel */}
      <div className="main-panel">
        {/* Top Header with role switching & notifications */}
        <Header
          currentUser={currentUser}
          users={users}
          onSwitchUser={handleSwitchUser}
        />

        {/* Content routing container */}
        <main className="main-content">
          {renderContentView()}
        </main>

        {/* Application Footer */}
        <footer className="app-footer" style={{ textAlign: 'center', padding: '14px 24px', fontSize: '0.78rem', color: 'var(--text-tertiary, #94a3b8)', borderTop: '1px solid var(--border-color, #e2e8f0)', marginTop: 'auto', background: 'var(--bg-card, #ffffff)' }}>
          <span>© 2026 Employee Leave Management System (ELMS) • <strong>Group-3</strong> • Aligned with Institutional Faculty Review Guidelines • All Rights Reserved.</span>
        </footer>
      </div>

      {/* Review Confirm Modal overlay with Staff Shortage Warnings & Medical Doc Verification */}
      {reviewApp && (
        <div className="modal-overlay" onClick={() => setReviewApp(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <h3 className="modal-title">
                {reviewAction === 'APPROVED' ? 'Approve' : 'Reject'} Leave ({reviewApp.leaveCode || `#${reviewApp.id}`})
              </h3>
              <button className="modal-close" onClick={() => setReviewApp(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleConfirmReview}>
              <div className="modal-body">
                <div style={{ background: 'var(--bg-app)', padding: '12px 16px', borderRadius: '8px', marginBottom: 14, fontSize: '0.86rem' }}>
                  <div><strong>Employee:</strong> {reviewApp.userName} ({reviewApp.department})</div>
                  <div><strong>Request:</strong> {reviewApp.daysCount} Day(s) {reviewApp.leaveTypeName} ({reviewApp.startDate} to {reviewApp.endDate})</div>
                  {reviewApp.halfDay && <div style={{ color: '#2563eb', fontWeight: 600 }}>• Half-Day Session: {reviewApp.halfDaySession}</div>}
                  <div style={{ marginTop: 4, color: 'var(--text-secondary)' }}><em>"{reviewApp.reason}"</em></div>
                </div>

                {/* Staff Shortage Alert if triggered */}
                {reviewApp.shortageWarning && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '10px 14px', borderRadius: 8, marginBottom: 14, color: '#991b1b', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, marginBottom: 2 }}>
                      <AlertTriangle size={15} /> Potential Department Staffing Shortage
                    </div>
                    <span>Approving this absence lowers department availability below the configured 50% threshold. If approving an exception, state your override justification below:</span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Mandatory exception justification..."
                      value={reviewOverrideReason}
                      onChange={e => setReviewOverrideReason(e.target.value)}
                      style={{ marginTop: 6, background: '#fff', fontSize: '0.8rem' }}
                      required={reviewAction === 'APPROVED'}
                    />
                  </div>
                )}

                {/* Extended Leave (Unpaid) Warning */}
                {reviewApp.leaveType === 'EXTENDED' && (
                  <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '10px 14px', borderRadius: 8, marginBottom: 14, color: '#92400e', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, marginBottom: 2 }}>
                      <AlertTriangle size={15} style={{ color: '#d97706' }} /> Unpaid Absence (Loss of Pay)
                    </div>
                    <span>Approving this request authorizes unpaid leave with <strong>proportional salary deduction</strong> for {reviewApp.daysCount} working day(s).</span>
                  </div>
                )}

                {/* Medical Certificate Review if attached */}
                {reviewApp.medicalCertificate && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#166534' }}>
                        <FileText size={15} /> Supporting Evidence Attached
                      </div>
                      <a
                        href={`data:text/plain;charset=utf-8,${encodeURIComponent(`Medical Certificate: ${reviewApp.medicalCertificate}\nEmployee: ${reviewApp.userName}\nDates: ${reviewApp.startDate} to ${reviewApp.endDate}\nReason: ${reviewApp.reason}`)}`}
                        download={reviewApp.medicalCertificate || 'certificate.txt'}
                        style={{ fontSize: '0.74rem', color: '#15803d', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}
                      >
                        Download
                      </a>
                    </div>
                    <div>File: <strong>{reviewApp.medicalCertificate}</strong></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                      <label style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 600 }}>Verification Decision:</label>
                      <select
                        className="form-control"
                        style={{ width: 'auto', padding: '2px 8px', fontSize: '0.78rem' }}
                        value={reviewDocStatus}
                        onChange={e => setReviewDocStatus(e.target.value)}
                      >
                        <option value="VERIFIED">✓ Verified &amp; Accepted</option>
                        <option value="REJECTED">✕ Rejected / Invalid Document</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Reviewer Comments</label>
                  <textarea className="form-control" rows={3} value={reviewComments} onChange={(e) => setReviewComments(e.target.value)} required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setReviewApp(null)}>Cancel</button>
                <button type="submit" className={`btn ${reviewAction === 'APPROVED' ? 'btn-success' : 'btn-danger'}`}>
                  {reviewAction === 'APPROVED' ? 'Confirm Approval' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Online Help & Legal Documentation Modal */}
      {showHelpModal && (
        <div className="modal-overlay" onClick={() => setShowHelpModal(false)}>
          <div className="modal-content" style={{ maxWidth: 550 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">System Guidance &amp; Policies</h3>
              <button className="modal-close" onClick={() => setShowHelpModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body" style={{ fontSize: '0.88rem', lineHeight: '1.6', color: 'var(--text-primary)' }}>
              <div style={{ background: 'var(--bg-app)', padding: '12px 16px', borderRadius: '8px', marginBottom: 16 }}>
                <strong style={{ color: 'var(--brand-primary, #2563eb)' }}>Configured Leave Categories:</strong>
                <ul style={{ margin: '8px 0 0 18px', padding: 0 }}>
                  <li><strong>Normal Leave (Annual/Casual):</strong> Maximum 3 consecutive working days.</li>
                  <li><strong>Half-Day Leave:</strong> Deducts 0.5 days (Morning / Afternoon).</li>
                  <li><strong>Sick/Medical Leave:</strong> Allows retroactive dates with late reason &amp; certificate.</li>
                  <li><strong>Extended Leave (Unpaid):</strong> Exempt from 3-day consecutive limit; no fixed day cap under certain circumstances. Subject to approval &amp; proportional salary deduction.</li>
                  <li><strong>Maternity Leave:</strong> Statutory entitlement (180 days).</li>
                </ul>
              </div>

              <h4 style={{ margin: '12px 0 4px 0', fontSize: '0.92rem' }}>Role-Based Access Control:</h4>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                <strong>Employee:</strong> Apply, cancel, view balances, track ledger.<br />
                <strong>Manager:</strong> Approve/reject, availability timeline, shortage warnings, delegations.<br />
                <strong>HR/Admin:</strong> Entitlement rules, company holidays, monthly accruals, audit logs.
              </p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary" onClick={() => setShowHelpModal(false)}>Close Guide</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast popup */}
      {toastMessage && (
        <div className="toast-container">
          <div className="toast">
            <CheckCircle2 size={18} style={{ color: '#BEB5A9' }} />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
