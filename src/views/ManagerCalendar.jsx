import React from 'react';
import { CalendarView } from '../components/CalendarView';
import { Calendar } from 'lucide-react';

export const ManagerCalendar = ({ allApplications }) => {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Calendar size={24} style={{ color: 'var(--primary)' }} />
            Leave Calendar
          </h1>
          <p className="page-description">Visual overview of all approved and pending leaves across the team.</p>
        </div>
      </div>

      <CalendarView applications={allApplications} />
    </div>
  );
};
