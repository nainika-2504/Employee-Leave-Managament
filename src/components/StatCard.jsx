import React from 'react';

export const StatCard = ({ label, value, subtext, icon: Icon, gradient }) => {
  return (
    <div className={`stat-card ${gradient || ''}`}>
      <div className="stat-header">
        <span className="stat-label">{label}</span>
        {Icon && (
          <div className="stat-icon-wrapper">
            <Icon size={18} />
          </div>
        )}
      </div>
      <div>
        <div className="stat-value">{value}</div>
        {subtext && <div className="stat-subtext">{subtext}</div>}
      </div>
    </div>
  );
};
