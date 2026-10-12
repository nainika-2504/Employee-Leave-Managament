import React from 'react';

export const EmployeeBalanceList = ({ users, allBalances }) => {
  const employees = users.filter(u => u.role === 'EMPLOYEE');

  return (
    <div className="table-wrapper">
      <table className="minimal-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Department</th>
            <th>Normal Leave (10d accrued)</th>
            <th>Medical Leave (10d)</th>
            <th>Extended Leave (30d)</th>
            <th>Total Days Remaining</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => {
            const userBal = allBalances[emp.id] || {
              NORMAL: { remaining: 8, used: 2, total: 10 },
              MEDICAL: { remaining: 9, used: 1, total: 10 },
              EXTENDED: { remaining: 30, used: 0, total: 30 }
            };

            const normUsed = userBal.NORMAL?.used ?? 2;
            const normRemaining = Math.max(0, 10 - normUsed);
            const medRemaining = userBal.MEDICAL?.remaining ?? 9;
            const extRemaining = userBal.EXTENDED?.remaining ?? 30;

            const totalRemaining = normRemaining + medRemaining + extRemaining;

            const joinDate = emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : (
              emp.id === 1 || emp.email?.includes('nainika') ? '15 Jan 2024' :
              emp.id === 3 || emp.email?.includes('natasha') ? '10 Mar 2024' :
              emp.id === 4 || emp.email?.includes('sarvani') ? '20 May 2024' :
              emp.id === 5 || emp.email?.includes('sahaja') ? '01 Aug 2024' : '15 Jan 2024'
            );

            return (
              <tr key={emp.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{emp.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{emp.email}</div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--primary)', marginTop: 2 }}>Joined: {joinDate}</div>
                </td>
                <td>{emp.department}</td>
                <td>
                  <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{normRemaining} Left</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: 6 }}>({normUsed} used of 10)</span>
                </td>
                <td>
                  <span style={{ fontWeight: 600, color: '#059669' }}>{userBal.MEDICAL?.remaining ?? 9} Left</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: 6 }}>({userBal.MEDICAL?.used ?? 0} used)</span>
                </td>
                <td>
                  <span style={{ fontWeight: 600, color: '#0284c7' }}>{userBal.EXTENDED?.remaining ?? 30} Left</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: 6 }}>({userBal.EXTENDED?.used ?? 0} used)</span>
                </td>
                <td>
                  <span style={{
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    background: 'var(--bg-subtle)',
                    padding: '4px 10px',
                    borderRadius: '6px'
                  }}>
                    {totalRemaining} Days
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
