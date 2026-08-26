import React, { useState, useEffect } from 'react';
import { X, Calendar, AlertCircle } from 'lucide-react';
import { apiService } from '../services/api';

export const ApplyLeaveModal = ({ isOpen, onClose, userBalances, onSuccess }) => {
  const leaveTypes = apiService.getLeaveTypes();
  
  const [formData, setFormData] = useState({
    leaveType: 'ANNUAL',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const [daysCount, setDaysCount] = useState(0);
  const [error, setError] = useState('');

  // Calculate days difference whenever dates change
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);

      if (end < start) {
        setDaysCount(0);
        setError('End date cannot be prior to start date.');
        return;
      }

      // Calculate calendar days
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      setDaysCount(diffDays);
      
      // Check available balance
      const currentTypeBalance = userBalances?.[formData.leaveType]?.remaining || 0;
      if (diffDays > currentTypeBalance) {
        setError(`Insufficient leave balance! You have ${currentTypeBalance} days left for ${formData.leaveType} leave.`);
      } else {
        setError('');
      }
    } else {
      setDaysCount(0);
      setError('');
    }
  }, [formData.startDate, formData.endDate, formData.leaveType, userBalances]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.startDate || !formData.endDate) {
      setError('Please select both start and end dates.');
      return;
    }

    if (daysCount <= 0) {
      setError('Invalid date range.');
      return;
    }

    const currentTypeBalance = userBalances?.[formData.leaveType]?.remaining || 0;
    if (daysCount > currentTypeBalance) {
      setError(`Cannot apply for ${daysCount} days. Only ${currentTypeBalance} days available.`);
      return;
    }

    if (!formData.reason.trim()) {
      setError('Please provide a reason for your leave application.');
      return;
    }

    try {
      apiService.applyLeave({
        ...formData,
        daysCount
      });
      onSuccess('Leave application submitted successfully!');
      onClose();
      // Reset form
      setFormData({
        leaveType: 'ANNUAL',
        startDate: '',
        endDate: '',
        reason: ''
      });
    } catch (err) {
      setError(err.message || 'Failed to submit application.');
    }
  };

  const selectedBalance = userBalances?.[formData.leaveType]?.remaining ?? 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
                background: '#efe0d6',
                border: '1px solid #d3b8a8',
                color: '#5a3830',
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
              <label className="form-label">Leave Type</label>
              <select
                className="form-control"
                value={formData.leaveType}
                onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
              >
                {leaveTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name} (Available: {userBalances?.[type.id]?.remaining ?? 0} days)
                  </option>
                ))}
              </select>
            </div>

            {/* Date Picker Row */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.startDate}
                  min={new Date().toISOString().split('T')[0]}
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
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Days Duration Indicator */}
            {daysCount > 0 && !error && (
              <div style={{
                background: '#E1D4C2',
                color: '#291C0E',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 500,
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span>Total Duration: <strong>{daysCount} Day{daysCount > 1 ? 's' : ''}</strong></span>
                <span>Remaining After: <strong>{selectedBalance - daysCount} Days</strong></span>
              </div>
            )}

            {/* Reason */}
            <div className="form-group">
              <label className="form-label">Reason for Leave</label>
              <textarea
                className="form-control"
                placeholder="Briefly state your reason for taking leave..."
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                required
              ></textarea>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit Leave Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
