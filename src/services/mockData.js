export const INITIAL_USERS = [
  {
    id: 101,
    name: 'Nainika',
    email: 'nainika@company.com',
    role: 'EMPLOYEE',
    department: 'Engineering',
    manager: 'Apoorva',
    avatar: 'NA'
  },
  {
    id: 201,
    name: 'Apoorva',
    email: 'apoorva@company.com',
    role: 'MANAGER',
    department: 'Engineering Management',
    avatar: 'AP'
  },
  {
    id: 102,
    name: 'Natasha',
    email: 'natasha@company.com',
    role: 'EMPLOYEE',
    department: 'Engineering',
    manager: 'Apoorva',
    avatar: 'NT'
  },
  {
    id: 103,
    name: 'Sarvani',
    email: 'sarvani@company.com',
    role: 'EMPLOYEE',
    department: 'Design',
    manager: 'Apoorva',
    avatar: 'SV'
  },
  {
    id: 104,
    name: 'Sahaja',
    email: 'sahaja@company.com',
    role: 'EMPLOYEE',
    department: 'Engineering',
    manager: 'Apoorva',
    avatar: 'SH'
  }
];

export const LEAVE_TYPES = [
  { id: 'ANNUAL', name: 'Annual Leave', defaultTotal: 18, color: '#4f46e5' },
  { id: 'SICK', name: 'Sick Leave', defaultTotal: 10, color: '#059669' },
  { id: 'CASUAL', name: 'Casual Leave', defaultTotal: 7, color: '#d97706' }
];

export const INITIAL_BALANCES = {
  101: {
    ANNUAL: { total: 18, used: 4, remaining: 14 },
    SICK: { total: 10, used: 1, remaining: 9 },
    CASUAL: { total: 7, used: 2, remaining: 5 }
  },
  102: {
    ANNUAL: { total: 18, used: 6, remaining: 12 },
    SICK: { total: 10, used: 0, remaining: 10 },
    CASUAL: { total: 7, used: 3, remaining: 4 }
  },
  103: {
    ANNUAL: { total: 18, used: 10, remaining: 8 },
    SICK: { total: 10, used: 2, remaining: 8 },
    CASUAL: { total: 7, used: 1, remaining: 6 }
  },
  104: {
    ANNUAL: { total: 18, used: 2, remaining: 16 },
    SICK: { total: 10, used: 3, remaining: 7 },
    CASUAL: { total: 7, used: 0, remaining: 7 }
  }
};

export const INITIAL_APPLICATIONS = [
  {
    id: 'LV-1001',
    userId: 101,
    userName: 'Nainika',
    department: 'Engineering',
    leaveType: 'ANNUAL',
    leaveTypeName: 'Annual Leave',
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
    leaveType: 'CASUAL',
    leaveTypeName: 'Casual Leave',
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
    leaveType: 'SICK',
    leaveTypeName: 'Sick Leave',
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
    leaveType: 'ANNUAL',
    leaveTypeName: 'Annual Leave',
    startDate: '2026-08-01',
    endDate: '2026-08-05',
    daysCount: 5,
    reason: 'Personal travel',
    status: 'REJECTED',
    appliedOn: '2026-07-28',
    reviewedBy: 'Apoorva',
    reviewedOn: '2026-07-29',
    reviewerComments: 'Conflict with major product release deadline.'
  }
];
