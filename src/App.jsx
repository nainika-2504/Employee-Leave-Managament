import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LoginPage } from './views/LoginPage';
import { apiService } from './services/api';
import { CheckCircle2, X } from 'lucide-react';

// Employee Page Imports
import { EmployeeDashboard } from './views/EmployeeDashboard';
import { EmployeeApplyLeave } from './views/EmployeeApplyLeave';
import { EmployeeMyLeaves } from './views/EmployeeMyLeaves';
import { ProfilePage } from './views/ProfilePage';

// Manager Page Imports
import { ManagerDashboard } from './views/ManagerDashboard';
import { ManagerApprovals } from './views/ManagerApprovals';
import { ManagerAllLeaves } from './views/ManagerAllLeaves';
import { ManagerTeamBalances } from './views/ManagerTeamBalances';
import { ManagerCalendar } from './views/ManagerCalendar';

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

  // Review confirming modal states (shared globally for any manager page)
  const [reviewApp, setReviewApp] = useState(null);
  const [reviewAction, setReviewAction] = useState(null);
  const [reviewComments, setReviewComments] = useState('');

  const loadData = useCallback(async () => {
    try {
      const allUsers = await apiService.getUsers();
      const activeUser = apiService.getCurrentUser();

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

      showToast(`Switched to ${selectedUser.name} (${selectedUser.role === 'MANAGER' ? 'Manager Portal' : 'Employee Portal'})`);
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
  };

  const handleConfirmReview = async (e) => {
    e.preventDefault();
    if (!reviewApp || !reviewAction) return;
    try {
      await apiService.reviewLeaveRequest(reviewApp.id, reviewAction, reviewComments);
      showToast(`Leave request ${reviewApp.leaveCode || reviewApp.id} has been ${reviewAction.toLowerCase()}.`);
      setReviewApp(null);
      setReviewAction(null);
      setReviewComments('');
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

  // Dynamically render the page view based on active role & currentView state
  const renderContentView = () => {
    const role = currentUser?.role;

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
          return <EmployeeMyLeaves applications={applications} onCancel={handleCancelLeave} />;
        case 'profile':
          return <ProfilePage currentUser={currentUser} onLogout={handleLogout} />;
        default:
          return <EmployeeDashboard currentUser={currentUser} userBalances={userBalances} applications={applications} onRefresh={loadData} showToast={showToast} onCancel={handleCancelLeave} />;
      }
    } else if (role === 'MANAGER') {
      switch (currentView) {
        case 'dashboard':
          return (
            <ManagerDashboard
              users={users}
              allApplications={applications}
              allBalances={allBalances}
              onApprove={(app) => handleOpenReview(app, 'APPROVED')}
              onReject={(app) => handleOpenReview(app, 'REJECTED')}
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
            />
          );
        case 'balances':
          return <ManagerTeamBalances users={users} allBalances={allBalances} />;
        case 'calendar':
          return <ManagerCalendar allApplications={applications} />;
        case 'profile':
          return <ProfilePage currentUser={currentUser} onLogout={handleLogout} />;
        default:
          return (
            <ManagerDashboard
              users={users}
              allApplications={applications}
              allBalances={allBalances}
              onApprove={(app) => handleOpenReview(app, 'APPROVED')}
              onReject={(app) => handleOpenReview(app, 'REJECTED')}
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
      />

      {/* Main Panel */}
      <div className="main-panel">
        {/* Top Header with simulated role switching */}
        <Header
          currentUser={currentUser}
          users={users}
          onSwitchUser={handleSwitchUser}
        />

        {/* Content routing container */}
        <main className="main-content">
          {renderContentView()}
        </main>
      </div>

      {/* Review Confirm Modal overlay */}
      {reviewApp && (
        <div className="modal-overlay" onClick={() => setReviewApp(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {reviewAction === 'APPROVED' ? 'Approve' : 'Reject'} Leave ({reviewApp.leaveCode || `#${reviewApp.id}`})
              </h3>
              <button className="modal-close" onClick={() => setReviewApp(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleConfirmReview}>
              <div className="modal-body">
                <div style={{ background: 'var(--bg-app)', padding: '12px 16px', borderRadius: '8px', marginBottom: 16, fontSize: '0.88rem' }}>
                  <div><strong>Employee:</strong> {reviewApp.userName}</div>
                  <div><strong>Request:</strong> {reviewApp.daysCount} Day(s) {reviewApp.leaveTypeName} ({reviewApp.startDate} to {reviewApp.endDate})</div>
                  <div style={{ marginTop: 4, color: 'var(--text-secondary)' }}><em>"{reviewApp.reason}"</em></div>
                </div>
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
