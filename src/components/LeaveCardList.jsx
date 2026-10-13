import React, { useState } from 'react';
import { StatusBadge } from './StatusBadge';
import { Calendar, Check, X, Trash2, FileText, Eye, AlertCircle, Download } from 'lucide-react';

const getTypeClass = (leaveType) => {
  const t = (leaveType || '').toUpperCase();
  if (t === 'NORMAL' || t === 'ANNUAL') return 'annual';
  if (t === 'MEDICAL' || t === 'SICK') return 'sick';
  if (t === 'EXTENDED') return 'extended';
  return 'casual';
};

const getInitials = (name) => {
  if (!name) return '??';
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

export const LeaveCardList = ({ applications, isManager, onApprove, onReject, onCancel, onDelete }) => {
  const [selectedDocApp, setSelectedDocApp] = useState(null);

  if (applications.length === 0) {
    return (
      <div className="empty-state">
        <Calendar className="empty-icon" />
        <p style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>No leave applications found</p>
        <p style={{ fontSize: '0.82rem', marginTop: 4 }}>Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <>
      <div className="leave-cards-grid">
        {applications.map((app) => (
          <div className="leave-card" key={app.id}>
            {/* User Info */}
            <div className="leave-card-user">
              <div className="leave-card-avatar">{getInitials(app.userName)}</div>
              <div className="leave-card-user-info">
                <h4>{app.userName}</h4>
                <span>{app.department}</span>
              </div>
            </div>

            {/* Leave Type & Status */}
            <div className="leave-card-detail">
              <div className="leave-card-detail-label">Leave Type</div>
              <div className="leave-card-detail-row">
                <span className={`leave-card-type-badge ${getTypeClass(app.leaveType)}`}>
                  {app.leaveType === 'EXTENDED' ? 'Extended Leave (Unpaid)' : app.leaveTypeName}
                </span>
                <StatusBadge status={app.status} />
              </div>
              <div className="leave-card-dates">
                <Calendar size={13} />
                {app.daysCount} Day{app.daysCount > 1 ? 's' : ''} &middot; {app.startDate} to {app.endDate}
              </div>
              {app.leaveType === 'EXTENDED' && (
                <div style={{ marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 4, background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', fontSize: '0.73rem', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                  <span>⚠️ Unpaid Leave · Salary Deducted</span>
                </div>
              )}
            </div>

            {/* Reason */}
            <div>
              <div className="leave-card-reason-label">Reason / Subject</div>
              <div className="leave-card-reason">"{app.reason}"</div>
            </div>

            {/* Supporting Document / Medical Certificate */}
            {app.medicalCertificate ? (
              <div className="leave-card-attachment">
                <div className="leave-card-attachment-header">
                  <div className="leave-card-attachment-title">
                    <FileText size={14} className="attachment-icon" />
                    <span>Medical Certificate</span>
                  </div>
                  <span className={`doc-status-badge status-${(app.documentationStatus || 'SUBMITTED').toLowerCase()}`}>
                    {app.documentationStatus === 'VERIFIED' ? '✓ Verified' :
                     app.documentationStatus === 'REJECTED' ? '✕ Invalid' :
                     app.documentationStatus || 'Submitted'}
                  </span>
                </div>
                <div className="leave-card-attachment-body">
                  <span className="leave-card-attachment-filename" title={app.medicalCertificate}>
                    {app.medicalCertificate}
                  </span>
                  <button
                    type="button"
                    className="btn-view-doc"
                    onClick={() => setSelectedDocApp(app)}
                    title="View Certificate"
                  >
                    <Eye size={12} /> View Document
                  </button>
                </div>
              </div>
            ) : ((app.leaveType === 'MEDICAL' || app.leaveType === 'SICK') ? (
              <div className="leave-card-attachment-missing">
                <AlertCircle size={13} style={{ color: '#d97706', flexShrink: 0 }} />
                <span>No Medical Certificate Attached (Pending)</span>
              </div>
            ) : null)}

            {/* Late / Retroactive Justification if present */}
            {app.retrospectiveReason && (
              <div className="leave-card-retro">
                <div className="leave-card-retro-label">Late Application Justification:</div>
                <div className="leave-card-retro-text">"{app.retrospectiveReason}"</div>
              </div>
            )}

            {/* Footer: Reviewer or Actions */}
            <div className="leave-card-footer">
              {app.reviewedBy ? (
                <div className="leave-card-reviewer">
                  <div className="leave-card-reviewer-avatar">{getInitials(app.reviewedBy)}</div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{app.reviewedBy}</div>
                    <div style={{ fontSize: '0.7rem' }}>Reviewer</div>
                  </div>
                </div>
              ) : (
                <div className="leave-card-reviewer" style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                  Awaiting review
                </div>
              )}

              <div className="leave-card-actions">
                {isManager && app.status === 'PENDING' && (
                  <>
                    <button className="action-btn approve" onClick={() => onApprove && onApprove(app)} title="Approve">
                      <Check size={16} />
                    </button>
                    <button className="action-btn reject" onClick={() => onReject && onReject(app)} title="Reject">
                      <X size={16} />
                    </button>
                  </>
                )}

                {!isManager && app.status === 'PENDING' && onCancel && (
                  <button 
                    onClick={() => onCancel(app)}
                    style={{ background: '#EAE1D9', color: '#6E473B', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Cancel Request
                  </button>
                )}

                {onDelete && (
                  <button 
                    onClick={() => onDelete(app)}
                    title="Delete Application"
                    style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', padding: '6px 8px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Medical Certificate Preview Modal */}
      {selectedDocApp && (
        <div className="modal-overlay" onClick={() => setSelectedDocApp(null)}>
          <div className="modal-content doc-preview-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={20} style={{ color: '#16a34a' }} />
                <h3 className="modal-title" style={{ margin: 0 }}>Medical Certificate Document</h3>
              </div>
              <button className="modal-close" onClick={() => setSelectedDocApp(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="doc-meta-box">
                <div className="doc-meta-row">
                  <span><strong>Employee:</strong> {selectedDocApp.userName} ({selectedDocApp.department})</span>
                  <span><strong>Leave Code:</strong> {selectedDocApp.leaveCode || `#${selectedDocApp.id}`}</span>
                </div>
                <div className="doc-meta-row">
                  <span><strong>Duration:</strong> {selectedDocApp.daysCount} Day(s) &middot; {selectedDocApp.startDate} to {selectedDocApp.endDate}</span>
                  <span><strong>Status:</strong> {selectedDocApp.status}</span>
                </div>
                <div className="doc-meta-row">
                  <span><strong>Reason:</strong> "{selectedDocApp.reason}"</span>
                </div>
                {selectedDocApp.retrospectiveReason && (
                  <div className="doc-meta-row">
                    <span><strong>Late Reason:</strong> "{selectedDocApp.retrospectiveReason}"</span>
                  </div>
                )}
                <div className="doc-meta-row" style={{ marginTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span><strong>Attached File:</strong> {selectedDocApp.medicalCertificate}</span>
                  <span className={`doc-status-badge status-${(selectedDocApp.documentationStatus || 'SUBMITTED').toLowerCase()}`}>
                    Documentation: {selectedDocApp.documentationStatus || 'SUBMITTED'}
                  </span>
                </div>
              </div>

              {/* Realistic Visual Certificate Preview Container */}
              <div className="doc-paper-preview">
                <div className="doc-paper-header">
                  <div className="doc-paper-hospital">HEALTHCARE / HOSPITAL MEDICAL CERTIFICATE</div>
                  <div className="doc-paper-sub">Official Medical Verification Document</div>
                </div>
                <div className="doc-paper-content">
                  <div className="doc-paper-line">
                    <span className="doc-paper-label">Patient Name:</span>
                    <span className="doc-paper-val">{selectedDocApp.userName}</span>
                  </div>
                  <div className="doc-paper-line">
                    <span className="doc-paper-label">Clinical Indication:</span>
                    <span className="doc-paper-val">{selectedDocApp.reason}</span>
                  </div>
                  <div className="doc-paper-line">
                    <span className="doc-paper-label">Absence Period:</span>
                    <span className="doc-paper-val">{selectedDocApp.startDate} to {selectedDocApp.endDate} ({selectedDocApp.daysCount} Days)</span>
                  </div>
                  <div className="doc-paper-badge-strip">
                    <FileText size={16} style={{ color: '#166534' }} />
                    <span>Attached Document: <strong>{selectedDocApp.medicalCertificate}</strong></span>
                  </div>
                  <div className="doc-paper-footer">
                    <span>Authorized Medical Practitioner Stamp</span>
                    <span className="doc-paper-seal">VERIFIED EVIDENCE</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <a
                href={`data:text/plain;charset=utf-8,${encodeURIComponent(`Medical Certificate: ${selectedDocApp.medicalCertificate}\nEmployee: ${selectedDocApp.userName}\nDates: ${selectedDocApp.startDate} to ${selectedDocApp.endDate}\nReason: ${selectedDocApp.reason}\nLate Justification: ${selectedDocApp.retrospectiveReason || 'N/A'}`)}`}
                download={selectedDocApp.medicalCertificate || 'medical_certificate.txt'}
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
              >
                <Download size={14} /> Download Document
              </a>
              <button className="btn btn-primary btn-sm" onClick={() => setSelectedDocApp(null)}>
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
