import React from 'react';
import { EmployeeBalanceList } from '../components/EmployeeBalanceList';
import { Users } from 'lucide-react';

export const ManagerTeamBalances = ({ users, allBalances }) => {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Users size={24} style={{ color: 'var(--primary)' }} />
            Team Leave Balances
          </h1>
          <p className="page-description">View and monitor leave balance utilization across all team members.</p>
        </div>
      </div>

      <div className="section-card">
        <EmployeeBalanceList users={users} allBalances={allBalances} />
      </div>
    </div>
  );
};
