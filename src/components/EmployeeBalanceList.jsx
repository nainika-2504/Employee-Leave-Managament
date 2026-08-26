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
            <th>Annual Leave (18d)</th>
            <th>Sick Leave (10d)</th>
            <th>Casual Leave (7d)</th>
            <th>Total Days Remaining</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => {
            const userBal = allBalances[emp.id] || {
              ANNUAL: { remaining: 18, used: 0 },
              SICK: { remaining: 10, used: 0 },
              CASUAL: { remaining: 7, used: 0 }
            };

            const totalRemaining =
              (userBal.ANNUAL?.remaining || 0) +
              (userBal.SICK?.remaining || 0) +
              (userBal.CASUAL?.remaining || 0);

            return (
              <tr key={emp.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{emp.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{emp.email}</div>
                </td>
                <td>{emp.department}</td>
                <td>
                  <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{userBal.ANNUAL?.remaining ?? 18} Left</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: 6 }}>({userBal.ANNUAL?.used ?? 0} used)</span>
                </td>
                <td>
                  <span style={{ fontWeight: 600, color: '#6E473B' }}>{userBal.SICK?.remaining ?? 10} Left</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: 6 }}>({userBal.SICK?.used ?? 0} used)</span>
                </td>
                <td>
                  <span style={{ fontWeight: 600, color: '#A78D78' }}>{userBal.CASUAL?.remaining ?? 7} Left</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: 6 }}>({userBal.CASUAL?.used ?? 0} used)</span>
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
