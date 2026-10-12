import { LEAVE_TYPES } from './mockData';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8085/api';

const STORAGE_KEYS = {
  CURRENT_USER: 'elms_current_user'
};

export const apiService = {
  // Users
  getUsers: async () => {
    const res = await fetch(`${BASE_URL}/users`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || 'null');
  },

  setCurrentUser: (user) => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    return user;
  },

  // Leave Types (static config for icons/names)
  getLeaveTypes: () => LEAVE_TYPES,

  // Leave Balances
  getBalances: async (userId) => {
    const res = await fetch(`${BASE_URL}/users/${userId}/balances`);
    if (!res.ok) throw new Error('Failed to fetch leave balances');
    return res.json();
  },

  getAllBalances: async () => {
    const res = await fetch(`${BASE_URL}/users/all-balances`);
    if (!res.ok) throw new Error('Failed to fetch all leave balances');
    return res.json();
  },

  // Chargeable Working Days Live Calculation
  calculateChargeableDays: async (startDate, endDate, halfDay = false) => {
    const res = await fetch(`${BASE_URL}/leaves/calculate-days?startDate=${startDate}&endDate=${endDate}&halfDay=${halfDay}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to calculate working days');
    }
    return res.json();
  },

  // Leave Applications
  getApplications: async ({ userId, role } = {}) => {
    let url = `${BASE_URL}/leaves`;
    if (userId && role) {
      url += `?userId=${userId}&role=${role}`;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch leave applications');
    return res.json();
  },

  applyLeave: async (newRequest) => {
    const currentUser = apiService.getCurrentUser();
    if (!currentUser) throw new Error('No user is currently authenticated.');

    const res = await fetch(`${BASE_URL}/leaves?queryUserId=${currentUser.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': String(currentUser.id)
      },
      body: JSON.stringify({
        leaveType: newRequest.leaveType,
        startDate: newRequest.startDate,
        endDate: newRequest.endDate,
        daysCount: newRequest.daysCount,
        reason: newRequest.reason,
        halfDay: newRequest.halfDay || false,
        halfDaySession: newRequest.halfDaySession || null,
        medicalCertificate: newRequest.medicalCertificate || null,
        documentationStatus: newRequest.documentationStatus || null,
        retroactive: newRequest.retroactive || false,
        retrospectiveReason: newRequest.retrospectiveReason || null
      })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to submit leave application');
    }

    return res.json();
  },

  reviewLeaveRequest: async (requestId, status, reviewerComments = '', overrideReason = '', documentationStatus = null) => {
    const currentUser = apiService.getCurrentUser();
    if (!currentUser) throw new Error('No user is currently authenticated.');

    const res = await fetch(`${BASE_URL}/leaves/${requestId}/review?queryReviewerName=${encodeURIComponent(currentUser.name)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Name': currentUser.name
      },
      body: JSON.stringify({
        status: status,
        reviewerComments: reviewerComments,
        overrideReason: overrideReason,
        documentationStatus: documentationStatus
      })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to process leave approval review.');
    }

    return res.json();
  },

  cancelLeave: async (requestId) => {
    const currentUser = apiService.getCurrentUser();
    if (!currentUser) throw new Error('No user is currently authenticated.');

    const res = await fetch(`${BASE_URL}/leaves/${requestId}/cancel?queryUserId=${currentUser.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': String(currentUser.id)
      }
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to cancel leave request.');
    }

    return res.json();
  },

  deleteLeave: async (requestId) => {
    const res = await fetch(`${BASE_URL}/leaves/${requestId}`, {
      method: 'DELETE'
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to delete leave request.');
    }

    return res.json();
  },

  // Manager Analytics
  getDashboardAnalytics: async ({ department = 'ALL', startDate = null, endDate = null } = {}) => {
    let url = `${BASE_URL}/leaves/dashboard-analytics?department=${encodeURIComponent(department)}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch dashboard analytics');
    return res.json();
  },

  // Transactions Ledger
  getTransactions: async (userId = null) => {
    let url = `${BASE_URL}/leaves/transactions`;
    if (userId) url += `?userId=${userId}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch leave transactions');
    return res.json();
  },

  // Audit Logs
  getAuditLogs: async () => {
    const res = await fetch(`${BASE_URL}/leaves/audit-logs`);
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },

  // Admin Policies
  getPolicies: async () => {
    const res = await fetch(`${BASE_URL}/admin/policies`);
    if (!res.ok) throw new Error('Failed to fetch policies');
    return res.json();
  },

  updatePolicy: async (key, value, description) => {
    const res = await fetch(`${BASE_URL}/admin/policies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value, description })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update policy');
    }
    return res.json();
  },

  // Public Holidays
  getHolidays: async () => {
    const res = await fetch(`${BASE_URL}/admin/holidays`);
    if (!res.ok) throw new Error('Failed to fetch holidays');
    return res.json();
  },

  addHoliday: async (holidayDate, name) => {
    const res = await fetch(`${BASE_URL}/admin/holidays`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ holidayDate, name })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to add holiday');
    }
    return res.json();
  },

  deleteHoliday: async (id) => {
    const res = await fetch(`${BASE_URL}/admin/holidays/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete holiday');
    return res.json();
  },

  // Admin Monthly Accrual
  triggerAccrual: async (userId, yearMonth, amount = 1.0) => {
    const currentUser = apiService.getCurrentUser();
    const res = await fetch(`${BASE_URL}/admin/accrue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Name': currentUser?.name || 'HR Admin'
      },
      body: JSON.stringify({ userId, yearMonth, amount })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to trigger accrual');
    }
    return res.json();
  },

  // Admin Balance Adjustment
  adjustBalance: async (userId, leaveType, newRemaining, reason) => {
    const currentUser = apiService.getCurrentUser();
    const res = await fetch(`${BASE_URL}/admin/adjust-balance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Name': currentUser?.name || 'HR Admin'
      },
      body: JSON.stringify({ userId, leaveType, newRemaining, reason })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to adjust balance');
    }
    return res.json();
  },

  // Admin Balance Reconciliation
  reconcileBalance: async (userId, leaveType) => {
    const res = await fetch(`${BASE_URL}/admin/reconcile?userId=${userId}&leaveType=${leaveType}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to reconcile balance');
    }
    return res.json();
  },

  // Manager Delegations
  getDelegations: async (delegatorId = null) => {
    let url = `${BASE_URL}/admin/delegations`;
    if (delegatorId) url += `?delegatorId=${delegatorId}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch delegations');
    return res.json();
  },

  createDelegation: async (delegatorId, delegateId, startDate, endDate, reason) => {
    const res = await fetch(`${BASE_URL}/admin/delegations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delegatorId, delegateId, startDate, endDate, reason })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create delegation');
    }
    return res.json();
  },

  deleteDelegation: async (id) => {
    const res = await fetch(`${BASE_URL}/admin/delegations/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete delegation');
    return res.json();
  },

  // Notifications
  getNotifications: async (userId) => {
    const res = await fetch(`${BASE_URL}/notifications?userId=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  getUnreadNotificationCount: async (userId) => {
    const res = await fetch(`${BASE_URL}/notifications/unread-count?userId=${userId}`);
    if (!res.ok) return { unreadCount: 0 };
    return res.json();
  },

  markNotificationAsRead: async (id) => {
    const res = await fetch(`${BASE_URL}/notifications/${id}/read`, { method: 'PUT' });
    if (!res.ok) throw new Error('Failed to mark notification as read');
    return res.json();
  },

  markAllNotificationsAsRead: async (userId) => {
    const res = await fetch(`${BASE_URL}/notifications/read-all?userId=${userId}`, { method: 'PUT' });
    if (!res.ok) throw new Error('Failed to mark all as read');
    return res.json();
  }
};
