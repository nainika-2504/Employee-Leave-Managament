import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, AlertTriangle, Star } from 'lucide-react';
import { apiService } from '../services/api';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const CalendarView = ({ applications = [] }) => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [holidays, setHolidays] = useState([]);

  useEffect(() => {
    apiService.getHolidays().then(setHolidays).catch(() => {});
  }, []);

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
  for (let i = 0; i < startOffset; i++) {
    cells.push({ day: null });
  }

  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isToday = d === now.getDate() && month === now.getMonth() && year === now.getFullYear();

    const holidayMatch = holidays.find(h => h.holidayDate === dateStr);

    // Leaves on this day
    const leavesOnDay = applications.filter(app => {
      if (app.status === 'REJECTED' || app.status === 'CANCELLED') return false;
      return dateStr >= app.startDate && dateStr <= app.endDate;
    });

    const isWeekend = (startOffset + d - 1) % 7 >= 5;
    const isShortageWarning = !isWeekend && leavesOnDay.filter(l => l.status === 'APPROVED').length >= 2;

    cells.push({
      day: d,
      dateStr,
      isToday,
      isWeekend,
      holiday: holidayMatch,
      leaves: leavesOnDay,
      isShortageWarning
    });
  }

  const getTypeStyle = (lv) => {
    const isPending = lv.status === 'PENDING';
    const t = (lv.leaveType || '').toUpperCase();
    let bg = '#2563eb';
    let text = '#fff';

    if (t === 'MEDICAL' || t === 'SICK') { bg = '#059669'; }
    else if (t === 'EXTENDED') { bg = '#0284c7'; }
    else if (t === 'NORMAL' || t === 'ANNUAL') { bg = '#4f46e5'; }
    else { bg = '#f59e0b'; }

    return {
      background: isPending ? '#f1f5f9' : bg,
      color: isPending ? '#475569' : text,
      border: isPending ? `1px dashed ${bg}` : 'none',
      opacity: isPending ? 0.85 : 1
    };
  };

  return (
    <div className="calendar-section">
      <div className="calendar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="calendar-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CalendarIcon size={18} />
          <span>{MONTH_NAMES[month]} {year}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', gap: 10, fontSize: '0.72rem', color: '#64748b' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: '#2563eb' }}></span> Approved
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, border: '1px dashed #2563eb', background: '#f1f5f9' }}></span> Pending
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Star size={10} style={{ color: '#d97706' }} /> Public Holiday
            </span>
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
      </div>

      <div className="calendar-grid">
        {DAY_HEADERS.map(dh => (
          <div key={dh} className="calendar-day-header">{dh}</div>
        ))}
        {cells.map((cell, idx) => (
          <div
            key={idx}
            className={`calendar-day ${cell.isToday ? 'today' : ''} ${cell.day === null ? 'empty' : ''}`}
            style={{
              background: cell.isWeekend ? '#fafafa' : cell.holiday ? '#fffbeb' : '#fff',
              position: 'relative'
            }}
          >
            {cell.day !== null && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 2 }}>
                  <span className="calendar-day-number">{cell.day}</span>
                  {cell.holiday && (
                    <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#d97706', display: 'flex', alignItems: 'center', gap: 2 }} title={cell.holiday.name}>
                      <Star size={9} /> Holiday
                    </span>
                  )}
                  {cell.isShortageWarning && (
                    <span title="High absence on this day (potential staffing shortage)">
                      <AlertTriangle size={11} style={{ color: '#dc2626' }} />
                    </span>
                  )}
                </div>

                {cell.holiday && (
                  <div style={{ fontSize: '0.66rem', color: '#b45309', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>
                    {cell.holiday.name}
                  </div>
                )}

                {(cell.leaves || []).slice(0, 3).map((lv, li) => {
                  const style = getTypeStyle(lv);
                  const isHalf = Boolean(lv.halfDay);
                  return (
                    <span
                      key={li}
                      className="calendar-leave-tag"
                      style={{
                        ...style,
                        fontSize: '0.66rem',
                        padding: '2px 4px',
                        borderRadius: 3,
                        marginBottom: 2,
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      title={`${lv.userName} • ${lv.leaveTypeName}${isHalf ? ' (0.5 Day)' : ''} • Status: ${lv.status}`}
                    >
                      {isHalf ? '½ ' : ''}{lv.userName?.split(' ')[0]} ({lv.status === 'PENDING' ? 'P' : '✓'})
                    </span>
                  );
                })}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
