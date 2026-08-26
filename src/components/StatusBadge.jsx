import React from 'react';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  const normalizedStatus = (status || 'PENDING').toLowerCase();

  const config = {
    pending: {
      icon: Clock,
      label: 'Pending'
    },
    approved: {
      icon: CheckCircle2,
      label: 'Approved'
    },
    rejected: {
      icon: XCircle,
      label: 'Rejected'
    }
  };

  const current = config[normalizedStatus] || config.pending;
  const IconComponent = current.icon;

  return (
    <span className={`status-badge ${normalizedStatus}`}>
      <IconComponent size={14} />
      {current.label}
    </span>
  );
};
