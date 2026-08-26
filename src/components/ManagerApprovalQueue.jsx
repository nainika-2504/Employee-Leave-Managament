import React, { useState } from 'react';
import { StatusBadge } from './StatusBadge';
import { Check, X, Calendar, MessageSquare, AlertCircle } from 'lucide-react';
import { apiService } from '../services/api';

export const ManagerApprovalQueue = ({ pendingApplications, onActionComplete }) => {
  const [selectedApp, setSelectedApp] = useState(null);
  const [actionType, setActionType] = useState(null); // 'APPROVED' or 'REJECTED'
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openReviewModal = (app, status) => {
    setSelectedApp(app);
    setActionType(status);
    setComments(status === 'APPROVED' ? 'Approved.' : 'Unable to approve due to scheduling.');
  };

  const handleConfirmAction = (e) => {
    e.preventDefault();
    if (!selectedApp || !actionType) return;

    setIsSubmitting(true);
    try {
      apiService.reviewLeaveRequest(selectedApp.id, actionType, comments);
      onActionComplete(`Leave request ${selectedApp.id} has been ${actionType.toLowerCase()}.`);
      setSelectedApp(null);
      setActionType(null);
      setComments('');
    } catch (err) {
      alert(err.message || 'Error processing request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (pendingApplications.length === 0) {
    return (
      <div className="empty-state">
        <Check size={40} className="empty-icon" style={{ color: '#16a34a' }} />
        <p style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>All caught up!</p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
          There are no pending leave requests requiring review.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="table-wrapper">
        <table className="minimal-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Leave Type</th>
              <th>Dates & Duration</th>
              <th>Reason</th>
              <th>Applied On</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingApplications.map((app) => (
              <tr key={app.id}>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{app.userName}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{app.department}</div>
                </td>
                <td>
                  <span style={{ fontWeight: 500 }}>{app.leaveTypeName}</span>
                </td>
                <td>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{app.daysCount} Day{app.daysCount > 1 ? 's' : ''}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {app.startDate} to {app.endDate}
                  </div>
                </td>
                <td style={{ maxWidth: 260, fontSize: '0.85rem' }}>
                  "{app.reason}"
                </td>
                <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {app.appliedOn}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => openReviewModal(app, 'APPROVED')}
                      title="Approve leave request"
                    >
                      <Check size={14} /> Approve
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => openReviewModal(app, 'REJECTED')}
                      title="Reject leave request"
                    >
                      <X size={14} /> Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Review Modal */}
      {selectedApp && (
        <div className="modal-overlay" onClick={() => setSelectedApp(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {actionType === 'APPROVED' ? 'Approve Leave Request' : 'Reject Leave Request'} ({selectedApp.id})
              </h3>
              <button className="modal-close" onClick={() => setSelectedApp(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmAction}>
              <div className="modal-body">
                <div style={{
                  background: 'var(--bg-subtle)',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  fontSize: '0.88rem'
                }}>
                  <div><strong>Employee:</strong> {selectedApp.userName}</div>
                  <div><strong>Request:</strong> {selectedApp.daysCount} Day(s) {selectedApp.leaveTypeName} ({selectedApp.startDate} to {selectedApp.endDate})</div>
                  <div style={{ marginTop: 4, color: 'var(--text-secondary)' }}><em>"{selectedApp.reason}"</em></div>
                </div>

                <div className="form-group">
                  <label className="form-label">Reviewer Comments / Note for Employee</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Enter review notes..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedApp(null)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`btn ${actionType === 'APPROVED' ? 'btn-success' : 'btn-danger'}`}
                  disabled={isSubmitting}
                >
                  {actionType === 'APPROVED' ? 'Confirm Approval' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
