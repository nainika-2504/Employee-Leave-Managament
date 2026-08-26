import { LEAVE_TYPES } from './mockData';

const BASE_URL = 'http://localhost:8085/api';

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
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        leaveType: newRequest.leaveType,
        startDate: newRequest.startDate,
        endDate: newRequest.endDate,
        daysCount: newRequest.daysCount,
        reason: newRequest.reason
      })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to submit leave application');
    }

    return res.json();
  },

  reviewLeaveRequest: async (requestId, status, reviewerComments = '') => {
    const currentUser = apiService.getCurrentUser();
    if (!currentUser) throw new Error('No user is currently authenticated.');

    const res = await fetch(`${BASE_URL}/leaves/${requestId}/review?queryReviewerName=${encodeURIComponent(currentUser.name)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: status,
        reviewerComments: reviewerComments
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
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to cancel leave request.');
    }

    return res.json();
  }
};
