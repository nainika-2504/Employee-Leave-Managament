import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const CalendarView = ({ applications }) => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const goPrev = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  };

  const goNext = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  };

  // Build calendar grid
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const totalDays = lastDay.getDate();
  // getDay: 0=Sun, need Mon=0
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  const cells = [];
  // Empty cells before month start
  for (let i = 0; i < startOffset; i++) {
    cells.push({ day: null });
  }
  // Day cells
  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isToday = d === now.getDate() && month === now.getMonth() && year === now.getFullYear();

    // Find leaves that span this date
    const leavesOnDay = (applications || []).filter(app => {
      if (app.status === 'REJECTED') return false;
      return dateStr >= app.startDate && dateStr <= app.endDate;
    });

    cells.push({ day: d, dateStr, isToday, leaves: leavesOnDay });
  }

  const getTypeClass = (leaveType) => {
    const t = (leaveType || '').toUpperCase();
    if (t === 'ANNUAL') return 'annual';
    if (t === 'SICK') return 'sick';
    return 'casual';
  };

  return (
    <div className="calendar-section">
      <div className="calendar-header">
        <div className="calendar-title">
          <CalendarIcon size={18} />
          {MONTH_NAMES[month]} {year}
        </div>
        <div className="calendar-nav">
          <button className="calendar-nav-btn" onClick={goPrev} title="Previous month">
            <ChevronLeft size={16} />
          </button>
          <button className="calendar-nav-btn" onClick={goNext} title="Next month">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="calendar-grid">
        {DAY_HEADERS.map(dh => (
          <div key={dh} className="calendar-day-header">{dh}</div>
        ))}
        {cells.map((cell, idx) => (
          <div key={idx} className={`calendar-day ${cell.isToday ? 'today' : ''} ${cell.day === null ? 'empty' : ''}`}>
            {cell.day !== null && (
              <>
                <div className="calendar-day-number">{cell.day}</div>
                {(cell.leaves || []).slice(0, 2).map((lv, li) => (
                  <span key={li} className={`calendar-leave-tag ${getTypeClass(lv.leaveType)}`} title={`${lv.userName}: ${lv.leaveTypeName}`}>
                    {lv.leaveTypeName?.split(' ')[0]} {lv.userName?.split(' ')[0]}
                  </span>
                ))}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
