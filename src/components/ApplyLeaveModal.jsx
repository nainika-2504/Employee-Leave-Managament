import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, AlertCircle, Upload, Info, CheckCircle2 } from 'lucide-react';
import { apiService } from '../services/api';

export const ApplyLeaveModal = ({ isOpen, onClose, userBalances, onSuccess, initialLeaveType = 'NORMAL' }) => {
  const leaveTypes = apiService.getLeaveTypes();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    leaveType: initialLeaveType || 'NORMAL',
    startDate: '',
    endDate: '',
    reason: '',
    halfDay: false,
    halfDaySession: 'MORNING',
    medicalCertificate: '',
    documentationStatus: 'NONE',
    retroactive: false,
    retrospectiveReason: ''
  });

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        leaveType: initialLeaveType || prev.leaveType || 'NORMAL'
      }));
    }
  }, [isOpen, initialLeaveType]);

  const [daysCount, setDaysCount] = useState(0);
  const [error, setError] = useState('');
  const [certFileName, setCertFileName] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isMedicalLeave = formData.leaveType === 'MEDICAL';
  const isExtendedLeave = formData.leaveType === 'EXTENDED';
  const isNormalLeave = formData.leaveType === 'NORMAL';
  const NORMAL_MAX_DAYS = 3;
  const today = new Date().toISOString().split('T')[0];

  // For medical/retroactive: allow past dates; otherwise today onwards
  const minStartDate = (isMedicalLeave || formData.retroactive) ? '' : today;

  // Calculate chargeable working days with backend API (excludes weekends and holidays)
  useEffect(() => {
    let isCancelled = false;

    const calcDays = async () => {
      if (!formData.startDate || !formData.endDate) {
        setDaysCount(0);
        setError('');
        return;
      }

      if (formData.endDate < formData.startDate) {
        setDaysCount(0);
        setError('End date cannot be prior to start date.');
        return;
      }

      setIsCalculating(true);
      setError('');

      try {
        const res = await apiService.calculateChargeableDays(formData.startDate, formData.endDate, formData.halfDay);
        if (isCancelled) return;

        const chargeable = res.chargeableDays ?? 0;
        setDaysCount(chargeable);

        if (chargeable <= 0) {
          setError('The selected dates contain 0 working days (all weekends or public holidays).');
          return;
        }

        // Enforce max 3 consecutive days for normal leave categories (Annual, Casual)
        if (isNormalLeave && chargeable > NORMAL_MAX_DAYS) {
          setError(`Normal leave (${formData.leaveType}) cannot exceed ${NORMAL_MAX_DAYS} consecutive working days. For longer absences, please select Extended Leave.`);
          return;
        }

        // Available balance check
        const currentTypeBalance = userBalances?.[formData.leaveType]?.remaining ?? 0;
        if (chargeable > currentTypeBalance) {
          setError(`Insufficient leave balance! Requested: ${chargeable} day(s), Available: ${currentTypeBalance} day(s).`);
          return;
        }

        setError('');
      } catch (err) {
        if (!isCancelled) {
          setError(err.message || 'Error calculating working days');
        }
      } finally {
        if (!isCancelled) setIsCalculating(false);
      }
    };

    calcDays();

    return () => { isCancelled = true; };
  }, [formData.startDate, formData.endDate, formData.leaveType, formData.halfDay, userBalances, isNormalLeave]);

  // If half-day is toggled ON, sync endDate to startDate automatically
  useEffect(() => {
    if (formData.halfDay && formData.startDate) {
      setFormData(prev => ({ ...prev, endDate: prev.startDate }));
    }
  }, [formData.halfDay, formData.startDate]);

  // Detect if the applied date is in the past (retroactive)
  useEffect(() => {
    if (formData.startDate) {
      const isPast = formData.startDate < today;
      setFormData(prev => ({
        ...prev,
        retroactive: isPast,
        documentationStatus: isPast && !prev.documentationStatus ? 'PENDING' : prev.documentationStatus
      }));
    }
  }, [formData.startDate, today]);

  if (!isOpen) return null;

  const handleCertUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCertFileName(file.name);
      setFormData(prev => ({
        ...prev,
        medicalCertificate: file.name,
        documentationStatus: 'SUBMITTED'
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.startDate || !formData.endDate) {
      setError('Please select both start and end dates.');
      return;
    }

    if (daysCount <= 0) {
      setError('Invalid date range or no chargeable working days.');
      return;
    }

    const currentTypeBalance = userBalances?.[formData.leaveType]?.remaining ?? 0;
    if (daysCount > currentTypeBalance) {
      setError(`Cannot apply for ${daysCount} days. Only ${currentTypeBalance} days available.`);
      return;
    }

    if (isNormalLeave && daysCount > NORMAL_MAX_DAYS) {
      setError(`Normal leave is capped at ${NORMAL_MAX_DAYS} consecutive days. Please use Extended Leave.`);
      return;
    }

    if (formData.retroactive && !formData.retrospectiveReason?.trim()) {
      setError('Please provide a justification for late / retrospective application.');
      return;
    }

    if (!formData.reason.trim()) {
      setError('Please provide a reason for your leave application.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiService.applyLeave({
        ...formData,
        daysCount
      });
      onSuccess('Leave application submitted successfully!');
      onClose();
      // Reset form
      setFormData({
        leaveType: 'NORMAL',
        startDate: '',
        endDate: '',
        reason: '',
        halfDay: false,
        halfDaySession: 'MORNING',
        medicalCertificate: '',
        documentationStatus: 'NONE',
        retroactive: false,
        retrospectiveReason: ''
      });
      setCertFileName('');
    } catch (err) {
      setError(err.message || 'Failed to submit application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedBalance = userBalances?.[formData.leaveType]?.remaining ?? 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
        <div className="modal-header">
          <h3 className="modal-title">Apply for Leave</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{
                background: '#fee2e2',
                border: '1px solid #fca5a5',
                color: '#991b1b',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Leave Type Select */}
            <div className="form-group">
              <label className="form-label">Leave Category</label>
              <select
                className="form-control"
                value={formData.leaveType}
                onChange={(e) => setFormData({ ...formData, leaveType: e.target.value, halfDay: false })}
              >
                {leaveTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name} (Available: {userBalances?.[type.id]?.remaining ?? 0} days)
                  </option>
                ))}
              </select>
            </div>

            {/* Normal Leave Rule Banner */}
            {isNormalLeave && (
              <div style={{
                background: '#fff7ed',
                border: '1px solid #fed7aa',
                color: '#9a3412',
                padding: '8px 12px',
                borderRadius: '7px',
                fontSize: '0.81rem',
                marginBottom: 14,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8
              }}>
                <Info size={14} style={{ marginTop: 2, flexShrink: 0 }} />
                <span>
                  <strong>Normal Leave Policy:</strong> Limited to a maximum of <strong>3 consecutive working days</strong>.
                  For longer absences, select <strong>Extended Leave</strong>.
                </span>
              </div>
            )}

            {/* Extended Leave Policy Banner */}
            {isExtendedLeave && (
              <div style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                color: '#1e40af',
                padding: '8px 12px',
                borderRadius: '7px',
                fontSize: '0.81rem',
                marginBottom: 14,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8
              }}>
                <Info size={14} style={{ marginTop: 2, flexShrink: 0 }} />
                <span>
                  <strong>Extended Leave:</strong> Exempt from the 3-day consecutive limit. Requires manager and HR review, drawing from your 30-day Extended Leave quota.
                </span>
              </div>
            )}

            {/* Half Day Toggle */}
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <label className="form-label" style={{ margin: 0 }}>Half Day Leave</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <div
                  onClick={() => setFormData(prev => ({ ...prev, halfDay: !prev.halfDay }))}
                  style={{
                    width: 40,
                    height: 22,
                    background: formData.halfDay ? 'var(--primary, #291C0E)' : '#ccc',
                    borderRadius: 11,
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                >
                  <div style={{
                    width: 18,
                    height: 18,
                    background: '#fff',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: 2,
                    left: formData.halfDay ? 20 : 2,
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                  }} />
                </div>
                <span style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
                  {formData.halfDay ? 'Yes — 0.5 Day' : 'No'}
                </span>
              </label>

              {/* Session selector */}
              {formData.halfDay && (
                <select
                  className="form-control"
                  value={formData.halfDaySession}
                  onChange={(e) => setFormData(prev => ({ ...prev, halfDaySession: e.target.value }))}
                  style={{ marginLeft: 'auto', width: 'auto', fontSize: '0.84rem' }}
                >
                  <option value="MORNING">🌅 Morning Session</option>
                  <option value="AFTERNOON">🌇 Afternoon Session</option>
                </select>
              )}
            </div>

            {/* Date Pickers */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Start Date
                  {(isMedicalLeave || formData.retroactive) && (
                    <span style={{ fontSize: '0.75rem', color: '#059669', marginLeft: 6 }}>
                      (past date permitted)
                    </span>
                  )}
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.startDate}
                  min={minStartDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.endDate}
                  min={formData.startDate || minStartDate}
                  disabled={formData.halfDay}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Retroactive / Post-Incident Section */}
            {formData.retroactive && (
              <div style={{
                background: '#fef3c7',
                border: '1px solid #fbbf24',
                color: '#92400e',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                marginBottom: 14
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, marginBottom: 4 }}>
                  <Calendar size={14} /> Retrospective / Emergency Leave Workflow
                </div>
                <p style={{ margin: '0 0 8px 0', fontSize: '0.8rem' }}>
                  You are applying for past absence dates. State the emergency or medical incident reason below:
                </p>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Hospitalization, sudden illness, accident..."
                  value={formData.retrospectiveReason}
                  onChange={(e) => setFormData({ ...formData, retrospectiveReason: e.target.value })}
                  required={formData.retroactive}
                  style={{ background: '#fff', fontSize: '0.82rem' }}
                />
              </div>
            )}

            {/* Days Breakdown Preview */}
            {daysCount > 0 && !error && (
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                color: '#1e293b',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.84rem',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <span style={{ color: '#64748b' }}>Chargeable Working Days: </span>
                  <strong>{formData.halfDay ? '0.5 Day' : `${daysCount} Day${daysCount > 1 ? 's' : ''}`}</strong>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: 2 }}>
                    ✓ Excludes weekends &amp; company public holidays
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: '#64748b' }}>Balance After: </span>
                  <strong style={{ color: '#059669' }}>{(selectedBalance - daysCount).toFixed(1)} Days</strong>
                </div>
              </div>
            )}

            {/* Supporting Medical Document Upload */}
            {(isMedicalLeave || formData.retroactive || isExtendedLeave) && (
              <div className="form-group">
                <label className="form-label">
                  Supporting Document / Medical Certificate
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', marginLeft: 6 }}>
                    (PDF, JPG, PNG)
                  </span>
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed var(--border-color, #e2e8f0)',
                    borderRadius: 8,
                    padding: '12px 16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    background: certFileName ? '#f0fdf4' : 'var(--bg-app)',
                    color: certFileName ? '#059669' : 'var(--text-secondary)',
                    fontSize: '0.85rem'
                  }}
                >
                  <Upload size={16} />
                  {certFileName ? `✓ ${certFileName}` : 'Click to attach certificate or evidence'}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  style={{ display: 'none' }}
                  onChange={handleCertUpload}
                />
              </div>
            )}

            {/* Reason */}
            <div className="form-group">
              <label className="form-label">Reason for Absence</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="State your reason for leave..."
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                required
              ></textarea>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting || isCalculating || !!error}>
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
