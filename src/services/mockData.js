export const INITIAL_USERS = [
  {
    id: 101,
    name: 'Nainika',
    email: 'nainika@company.com',
    role: 'EMPLOYEE',
    department: 'Engineering',
    manager: 'Apoorva',
    avatar: 'NA',
    joiningDate: '2024-01-15'
  },
  {
    id: 201,
    name: 'Apoorva',
    email: 'apoorva@company.com',
    role: 'MANAGER',
    department: 'Engineering Management',
    avatar: 'AP',
    joiningDate: '2023-06-01'
  },
  {
    id: 102,
    name: 'Natasha',
    email: 'natasha@company.com',
    role: 'EMPLOYEE',
    department: 'Engineering',
    manager: 'Apoorva',
    avatar: 'NT',
    joiningDate: '2024-03-10'
  },
  {
    id: 103,
    name: 'Sarvani',
    email: 'sarvani@company.com',
    role: 'EMPLOYEE',
    department: 'Design',
    manager: 'Apoorva',
    avatar: 'SV',
    joiningDate: '2024-05-20'
  },
  {
    id: 104,
    name: 'Sahaja',
    email: 'sahaja@company.com',
    role: 'EMPLOYEE',
    department: 'Engineering',
    manager: 'Apoorva',
    avatar: 'SH',
    joiningDate: '2024-08-01'
  }
];

export const LEAVE_TYPES = [
  { id: 'NORMAL', name: 'Normal Leave', defaultTotal: 10, color: '#4f46e5', maxConsecutiveDays: 3 },
  { id: 'MEDICAL', name: 'Medical Leave', defaultTotal: 10, color: '#059669' },
  { id: 'EXTENDED', name: 'Extended Leave (Unpaid)', isUnpaid: true, defaultTotal: 0, color: '#0284c7' }
];

export const INITIAL_BALANCES = {
  101: {
    NORMAL: { total: 10, used: 2, remaining: 8 },
    MEDICAL: { total: 10, used: 1, remaining: 9 },
    EXTENDED: { total: 30, used: 0, remaining: 30 }
  },
  102: {
    NORMAL: { total: 10, used: 4, remaining: 6 },
    MEDICAL: { total: 10, used: 0, remaining: 10 },
    EXTENDED: { total: 30, used: 0, remaining: 30 }
  },
  103: {
    NORMAL: { total: 10, used: 3, remaining: 7 },
    MEDICAL: { total: 10, used: 2, remaining: 8 },
    EXTENDED: { total: 30, used: 0, remaining: 30 }
  },
  104: {
    NORMAL: { total: 10, used: 1, remaining: 9 },
    MEDICAL: { total: 10, used: 3, remaining: 7 },
    EXTENDED: { total: 30, used: 0, remaining: 30 }
  }
};

export const INITIAL_APPLICATIONS = [
  {
    id: 'LV-1001',
    userId: 101,
    userName: 'Nainika',
    department: 'Engineering',
    leaveType: 'NORMAL',
    leaveTypeName: 'Normal Leave',
    startDate: '2026-09-10',
    endDate: '2026-09-12',
    daysCount: 3,
    reason: 'Family vacation trip',
    status: 'PENDING',
    appliedOn: '2026-08-24',
    reviewerComments: ''
  },
  {
    id: 'LV-1002',
    userId: 102,
    userName: 'Natasha',
    department: 'Engineering',
    leaveType: 'NORMAL',
    leaveTypeName: 'Normal Leave',
    startDate: '2026-09-01',
    endDate: '2026-09-02',
    daysCount: 2,
    reason: 'Attending cousin\'s wedding',
    status: 'PENDING',
    appliedOn: '2026-08-25',
    reviewerComments: ''
  },
  {
    id: 'LV-1000',
    userId: 101,
    userName: 'Nainika',
    department: 'Engineering',
    leaveType: 'MEDICAL',
    leaveTypeName: 'Medical Leave',
    startDate: '2026-08-15',
    endDate: '2026-08-15',
    daysCount: 1,
    reason: 'Dental surgery procedure and recovery',
    status: 'APPROVED',
    appliedOn: '2026-08-14',
    reviewedBy: 'Apoorva',
    reviewedOn: '2026-08-14',
    reviewerComments: 'Approved. Get well soon!'
  },
  {
    id: 'LV-0999',
    userId: 103,
    userName: 'Sarvani',
    department: 'Design',
    leaveType: 'EXTENDED',
    leaveTypeName: 'Extended Leave',
    startDate: '2026-08-01',
    endDate: '2026-08-05',
    daysCount: 5,
    reason: 'Personal travel abroad',
    status: 'REJECTED',
    appliedOn: '2026-07-28',
    reviewedBy: 'Apoorva',
    reviewedOn: '2026-07-29',
    reviewerComments: 'Conflict with major product release deadline.'
  }
];
