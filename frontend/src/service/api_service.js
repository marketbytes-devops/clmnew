const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const APIService = {
  // --- AUTH ---
  login: async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    });
    if (!res.ok) throw new Error('Failed to login');
    return res.json();
  },

  // --- ADMIN ---
  getAllUsers: async (token) => {
    const res = await fetch(`${BASE_URL}/admin/users`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  createUser: async (userData) => {
    const res = await fetch(`${BASE_URL}/admin/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!res.ok) throw new Error('Failed to create user');
    return res.json();
  },

  deleteUser: async (id) => {
    const res = await fetch(`${BASE_URL}/admin/users/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete user');
    return res.json();
  },

  getDepartments: async () => {
    const res = await fetch(`${BASE_URL}/departments`);
    if (!res.ok) throw new Error('Failed to fetch departments');
    return res.json();
  },

  createDepartment: async (deptData) => {
    const res = await fetch(`${BASE_URL}/departments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deptData)
    });
    if (!res.ok) throw new Error('Failed to create department');
    return res.json();
  },

  getAllRoles: async (token) => {
    // Auth disabled temporarily for integration testing
    const res = await fetch(`${BASE_URL}/admin/roles`);
    if (!res.ok) throw new Error('Failed to fetch roles');
    return res.json();
  },
  
  createRole: async (roleData) => {
    const res = await fetch(`${BASE_URL}/admin/roles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roleData)
    });
    if (!res.ok) throw new Error('Failed to create role');
    return res.json();
  },
  
  updateRole: async (id, roleData) => {
    const res = await fetch(`${BASE_URL}/admin/roles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roleData)
    });
    if (!res.ok) throw new Error('Failed to update role');
    return res.json();
  },
  
  deleteRole: async (id) => {
    const res = await fetch(`${BASE_URL}/admin/roles/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete role');
    return res.json();
  },

  // --- CONTRACTS ---
  getContracts: async () => {
    // Auth disabled temporarily for integration testing
    const res = await fetch(`${BASE_URL}/admin/contracts/`);
    if (!res.ok) throw new Error('Failed to fetch contracts');
    return res.json();
  },

  createContract: async (contractData) => {
    const res = await fetch(`${BASE_URL}/admin/contracts/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contractData)
    });
    if (!res.ok) throw new Error('Failed to create contract');
    return res.json();
  },

  updateContract: async (contractId, contractData) => {
    const res = await fetch(`${BASE_URL}/admin/contracts/${contractId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contractData)
    });
    if (!res.ok) throw new Error('Failed to update contract');
    return res.json();
  },

  // --- AI ---
  aiChat: async (messages) => {
    const res = await fetch(`${BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages })
    });
    if (!res.ok) throw new Error('Failed to send AI chat message');
    return res.json();
  },

  getAIConfigs: async () => {
    const res = await fetch(`${BASE_URL}/ai/config`);
    if (!res.ok) throw new Error('Failed to fetch AI configs');
    return res.json();
  },

  createAIConfig: async (configData) => {
    const res = await fetch(`${BASE_URL}/ai/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(configData)
    });
    if (!res.ok) throw new Error('Failed to create AI config');
    return res.json();
  },

  getAIPrompts: async () => {
    const res = await fetch(`${BASE_URL}/ai/prompts`);
    if (!res.ok) throw new Error('Failed to fetch AI prompts');
    return res.json();
  },

  createAIPrompt: async (promptData) => {
    const res = await fetch(`${BASE_URL}/ai/prompts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(promptData)
    });
    if (!res.ok) throw new Error('Failed to create AI prompt');
    return res.json();
  },

  // --- ANALYTICS ---
  getAnalyticsDashboard: async () => {
    const res = await fetch(`${BASE_URL}/analytics/dashboard`);
    if (!res.ok) throw new Error('Failed to fetch analytics dashboard');
    return res.json();
  },
  
  getAnalyticsTrends: async () => {
    const res = await fetch(`${BASE_URL}/analytics/trends`);
    if (!res.ok) throw new Error('Failed to fetch analytics trends');
    return res.json();
  },
  
  getAnalyticsDepartments: async () => {
    const res = await fetch(`${BASE_URL}/analytics/departments`);
    if (!res.ok) throw new Error('Failed to fetch department analytics');
    return res.json();
  },
  
  getAnalyticsPerformance: async () => {
    const res = await fetch(`${BASE_URL}/analytics/performance`);
    if (!res.ok) throw new Error('Failed to fetch performance analytics');
    return res.json();
  },

  // --- REQUESTS ---
  getRequests: async (filters = {}) => {
    const params = new URLSearchParams();
    if (typeof filters === 'string') {
      if (filters && filters !== 'All') params.append('status', filters);
    } else if (filters && typeof filters === 'object') {
      if (filters.status && filters.status !== 'All') params.append('status', filters.status);
      if (filters.contract_type && filters.contract_type !== 'All') params.append('contract_type', filters.contract_type);
      if (filters.search) params.append('search', filters.search);
      if (filters.assigned_to_id) params.append('assigned_to_id', filters.assigned_to_id);
    }
    const queryStr = params.toString();
    const url = queryStr ? `${BASE_URL}/requests?${queryStr}` : `${BASE_URL}/requests`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch requests');
    return res.json();
  },

  getRequestById: async (id) => {
    const res = await fetch(`${BASE_URL}/requests/${id}`);
    if (!res.ok) throw new Error('Failed to fetch request detail');
    return res.json();
  },

  createRequest: async (requestData) => {
    const res = await fetch(`${BASE_URL}/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });
    if (!res.ok) throw new Error('Failed to create request');
    return res.json();
  },

  updateRequest: async (id, requestData) => {
    const res = await fetch(`${BASE_URL}/requests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });
    if (!res.ok) throw new Error('Failed to update request');
    return res.json();
  },

  addRequestComment: async (id, content) => {
    const res = await fetch(`${BASE_URL}/requests/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
    if (!res.ok) throw new Error('Failed to add comment');
    return res.json();
  },

  addRequestAttachment: async (id, attachmentData) => {
    const res = await fetch(`${BASE_URL}/requests/${id}/attachments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(attachmentData)
    });
    if (!res.ok) throw new Error('Failed to add attachment');
    return res.json();
  },

  submitDependencyResponse: async (depId, submissionData) => {
    const res = await fetch(`${BASE_URL}/requests/dependencies/${depId}/submit`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submissionData)
    });
    if (!res.ok) throw new Error('Failed to submit dependency response');
    return res.json();
  },

  synthesizeDependencies: async (requestId) => {
    const res = await fetch(`${BASE_URL}/requests/${requestId}/synthesize-dependencies`);
    if (!res.ok) throw new Error('Failed to synthesize dependencies');
    return res.json();
  },

  proceedToDrafting: async (requestId, payload) => {
    const res = await fetch(`${BASE_URL}/requests/${requestId}/proceed-to-drafting`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to proceed to drafting');
    return res.json();
  },

  approveContract: async (requestId, payload) => {
    const res = await fetch(`${BASE_URL}/requests/${requestId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload || {})
    });
    if (!res.ok) throw new Error('Failed to approve contract');
    return res.json();
  },

  rejectAndRollback: async (requestId, payload) => {
    const res = await fetch(`${BASE_URL}/requests/${requestId}/reject-rollback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to reject contract and execute rollback');
    return res.json();
  },

  addInlineComment: async (requestId, payload) => {
    const res = await fetch(`${BASE_URL}/requests/${requestId}/add-inline-comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to add inline comment');
    return res.json();
  },

  convertRequestToContract: async (id) => {
    const res = await fetch(`${BASE_URL}/requests/${id}/convert-to-contract`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to convert request to contract');
    return res.json();
  }
};
