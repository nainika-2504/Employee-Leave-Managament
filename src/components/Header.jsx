import React from 'react';

export const Header = ({ currentUser }) => {
  const isManager = currentUser?.role === 'MANAGER';

  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="breadcrumb">
          Home &nbsp;/&nbsp; Leave Request &nbsp;/&nbsp;{' '}
          <span className="breadcrumb-active">
            {isManager ? 'Manager Portal' : 'Leaves'}
          </span>
        </div>
      </div>
    </header>
  );
};
