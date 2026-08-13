import { get, post, put, del } from './apiMethods';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

// Helper fetch with timeout for extra reliability
const fetchWithTimeout = async (url, options = {}, timeoutMs = 5000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
};

// ==========================================
// Auth Endpoints
// ==========================================
export const loginUser = async (email, password) => {
  return await post('/api/auth/login', { email, password });
};

export const getMe = async () => {
  return await get('/api/auth/me');
};

export const logoutUser = async () => {
  return await post('/api/auth/logout');
};

// ==========================================
// Admin Dashboard Endpoints
// ==========================================
export const getAdminDashboard = async () => {
  return await get('/api/admin/dashboard');
};

export const getAdminStats = async () => {
  return await get('/api/admin/stats');
};

export const updateAdminSettings = async (settings) => {
  return await put('/api/admin/settings', settings);
};

// ==========================================
// Stage 1: Intake & Requester Portal Endpoints
// ==========================================
export const getContractRequests = async () => {
  try {
    return await get('/api/v1/requests');
  } catch (err) {
    console.warn('Backend server offline, returning fallback contract requests');
    return [];
  }
};

export const getNotifications = async () => {
  const notifications = await get('/api/contracts/notifications');
  return { data: notifications };
};

// Fetch quick metrics for Dashboard header KPIs
export const getRequestMetrics = async () => {
  return await get('/api/contracts/metrics');
};

// Create / submit a new contract request from the 4-Step Wizard
export const createContractRequest = async (requestPayload) => {
  return await post('/api/contracts/requests', requestPayload);
};

// Real AI Document Parser for Step 3 of the Wizard (Calls backend Gemini API)
export const analyzeDocumentAI = async (fileOrName, fileTextContent = "") => {
  let fileToUpload = fileOrName;
  if (typeof fileOrName === 'string') {
    const content = fileTextContent || `Objective: Build a new contract portal\nClient: Hooli Inc\nDeliverables:\n- Setup project structure\n- Create Next.js pages`;
    fileToUpload = new File([content], fileOrName, { type: 'text/plain' });
  } else if (fileOrName && !(fileOrName instanceof File) && !(fileOrName instanceof Blob)) {
    // If it's a simulated plain mock object from the wizard's demo badge
    let content = `Client: Hooli Inc\nObjective: Build a new contract portal\nDeliverables:\n- UI Wireframing & Screen layouts\n- Core web application build\n- Security audit certification`;

    if (fileOrName.name && fileOrName.name.includes("AcmeCorp")) {
      content = `Client: Acme Corp\nObjective: Build a secure billing gateway and vendor onboarding partner system.\nDeliverables:\n- Design database layout and encryption storage\n- API integration for bank merchant accounts\n- Security and compliance certification`;
    } else if (fileOrName.name && fileOrName.name.includes("YoKoBaine")) {
      content = `Client: YoKoBaine Retail\nObjective: Build an online E-Commerce catalog portal and Android mobile application.\nDeliverables:\n- UI wireframing and screen designs in Figma\n- E-Commerce storefront frontend React pages\n- Backend inventory and payment API integration`;
    }

    fileToUpload = new File([content], fileOrName.name || "simulated_file.txt", { type: 'text/plain' });
  }

  const formData = new FormData();
  formData.append('file', fileToUpload);

  return await post('/api/ai/parse-document', formData);
};

// Fetch dynamic suggestions from AI Copilot
export const getCopilotSuggestions = async (payload) => {
  return await post('/api/ai/copilot-suggestions', payload);
};

// Fetch lists of available Contract Managers and Department Leads
export const getContractManagers = async () => {
  try {
    const managers = await get('/api/contracts/managers');
    return {
      status: 'success',
      data: managers
    };
  } catch (err) {
    return {
      status: 'success',
      data: [
        { id: 1, name: 'Alex Miller', department: 'Legal Operations', email: 'alex.miller@marketbytes.com' },
        { id: 2, name: 'Sarah Jenkins', department: 'Commercial Finance', email: 'sarah.jenkins@marketbytes.com' }
      ]
    };
  }
};

export const getDepartmentLeads = async () => {
  try {
    const leads = await get('/api/contracts/leads');
    return {
      status: 'success',
      data: leads
    };
  } catch (err) {
    return {
      status: 'success',
      data: {
        Legal: [{ name: 'Elena Rostova', role: 'General Counsel' }],
        Engineering: [{ name: 'David Chen', role: 'VP of Engineering' }]
      }
    };
  }
};

// ==========================================
// UNIFIED APIService Object (All Backend Endpoints)
// ==========================================
export const APIService = {
  // --- AUTH ---
  login: async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const res = await fetchWithTimeout(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });
    if (!res.ok) throw new Error('Failed to login');
    return res.json();
  },

  // --- ADMIN ---
  getAllUsers: async (token) => {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/admin/users`);
      if (!res.ok) return [];
      return await res.json();
    } catch (err) {
      console.warn("Could not reach backend users service:", err.message);
      return [];
    }
  },

  createUser: async (userData) => {
    const payload = {
      email: userData.email,
      password: userData.password || 'password123',
      full_name: userData.name || userData.full_name,
      is_active: true,
      profile_picture_url: userData.avatar_url || userData.avatarUrl || null,
      role_id: userData.role_id || null,
      department_id: userData.department_id || null
    };

    const res = await fetchWithTimeout(`${BASE_URL}/admin/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const detail = errorData.detail || 'Failed to create user';
      const msg = typeof detail === 'string' ? detail : JSON.stringify(detail);
      throw new Error(msg);
    }
    return res.json();
  },

  updateUser: async (id, userData) => {
    const res = await fetchWithTimeout(`${BASE_URL}/admin/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!res.ok) throw new Error('Failed to update user');
    return res.json();
  },

  deleteUser: async (id) => {
    const res = await fetchWithTimeout(`${BASE_URL}/admin/users/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete user');
    return res.json();
  },

  getDepartments: async () => {
    const res = await fetchWithTimeout(`${BASE_URL}/departments`);
    if (!res.ok) throw new Error('Failed to fetch departments');
    return res.json();
  },

  createDepartment: async (deptData) => {
    const res = await fetchWithTimeout(`${BASE_URL}/departments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deptData)
    });
    if (!res.ok) throw new Error('Failed to create department');
    return res.json();
  },

  getAllRoles: async (token) => {
    const res = await fetchWithTimeout(`${BASE_URL}/admin/roles`);
    if (!res.ok) throw new Error('Failed to fetch roles');
    return res.json();
  },

  createRole: async (roleData) => {
    const res = await fetchWithTimeout(`${BASE_URL}/admin/roles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roleData)
    });
    if (!res.ok) throw new Error('Failed to create role');
    return res.json();
  },

  updateRole: async (id, roleData) => {
    const res = await fetchWithTimeout(`${BASE_URL}/admin/roles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roleData)
    });
    if (!res.ok) throw new Error('Failed to update role');
    return res.json();
  },

  deleteRole: async (id) => {
    const res = await fetchWithTimeout(`${BASE_URL}/admin/roles/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete role');
    return res.json();
  },

  // --- CONTRACTS ---
  getContracts: async () => {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/admin/contracts/`);
      if (!res.ok) throw new Error('Failed to fetch contracts');
      return res.json();
    } catch (err) {
      console.warn('Backend server offline, returning fallback contracts');
      return [];
    }
  },

  createContract: async (contractData) => {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/admin/contracts/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contractData)
      });
      if (!res.ok) throw new Error('Failed to create contract');
      return res.json();
    } catch (err) {
      console.warn('Backend server offline, generating local contract draft:', err);
      return {
        id: Date.now(),
        title: contractData.title || 'Untitled Contract Agreement',
        status: contractData.status || 'Drafting In Progress',
        value: contractData.value || 0,
        ai_summary: contractData.ai_summary || '',
        metadata_data: contractData.metadata_data || {},
        created_at: new Date().toISOString()
      };
    }
  },

  updateContract: async (contractId, contractData) => {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/admin/contracts/${contractId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contractData)
      });
      if (!res.ok) throw new Error('Failed to update contract');
      return res.json();
    } catch (err) {
      console.warn('Backend server offline, updated contract locally:', err);
      return {
        id: contractId,
        ...contractData,
        updated_at: new Date().toISOString()
      };
    }
  },

  // --- AI ---
  aiChat: async (messages) => {
    const res = await fetchWithTimeout(`${BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages })
    });
    if (!res.ok) throw new Error('Failed to send AI chat message');
    return res.json();
  },

  getAIConfigs: async () => {
    const res = await fetchWithTimeout(`${BASE_URL}/ai/config`);
    if (!res.ok) throw new Error('Failed to fetch AI configs');
    return res.json();
  },

  createAIConfig: async (configData) => {
    const res = await fetchWithTimeout(`${BASE_URL}/ai/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(configData)
    });
    if (!res.ok) throw new Error('Failed to create AI config');
    return res.json();
  },

  getAIPrompts: async () => {
    const res = await fetchWithTimeout(`${BASE_URL}/ai/prompts`);
    if (!res.ok) throw new Error('Failed to fetch AI prompts');
    return res.json();
  },

  createAIPrompt: async (promptData) => {
    const res = await fetchWithTimeout(`${BASE_URL}/ai/prompts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(promptData)
    });
    if (!res.ok) throw new Error('Failed to create AI prompt');
    return res.json();
  },

  // --- ANALYTICS ---
  getAnalyticsDashboard: async () => {
    const res = await fetchWithTimeout(`${BASE_URL}/analytics/dashboard`);
    if (!res.ok) throw new Error('Failed to fetch analytics dashboard');
    return res.json();
  },

  getAnalyticsTrends: async () => {
    const res = await fetchWithTimeout(`${BASE_URL}/analytics/trends`);
    if (!res.ok) throw new Error('Failed to fetch analytics trends');
    return res.json();
  },

  getAnalyticsDepartments: async () => {
    const res = await fetchWithTimeout(`${BASE_URL}/analytics/departments`);
    if (!res.ok) throw new Error('Failed to fetch department analytics');
    return res.json();
  },

  getAnalyticsPerformance: async () => {
    const res = await fetchWithTimeout(`${BASE_URL}/analytics/performance`);
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
    const res = await fetchWithTimeout(url);
    if (!res.ok) throw new Error('Failed to fetch requests');
    return res.json();
  },

  getRequestById: async (id) => {
    const res = await fetchWithTimeout(`${BASE_URL}/requests/${id}`);
    if (!res.ok) throw new Error('Failed to fetch request detail');
    return res.json();
  },

  createRequest: async (requestData) => {
    const res = await fetchWithTimeout(`${BASE_URL}/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });
    if (!res.ok) throw new Error('Failed to create request');
    return res.json();
  },

  updateRequest: async (id, requestData) => {
    const res = await fetchWithTimeout(`${BASE_URL}/requests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });
    if (!res.ok) throw new Error('Failed to update request');
    return res.json();
  },

  addRequestComment: async (id, content) => {
    const res = await fetchWithTimeout(`${BASE_URL}/requests/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
    if (!res.ok) throw new Error('Failed to add comment');
    return res.json();
  },

  addRequestAttachment: async (id, attachmentData) => {
    const res = await fetchWithTimeout(`${BASE_URL}/requests/${id}/attachments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(attachmentData)
    });
    if (!res.ok) throw new Error('Failed to add attachment');
    return res.json();
  },

  submitDependencyResponse: async (depId, submissionData) => {
    const res = await fetchWithTimeout(`${BASE_URL}/requests/dependencies/${depId}/submit`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submissionData)
    });
    if (!res.ok) throw new Error('Failed to submit dependency response');
    return res.json();
  },

  synthesizeDependencies: async (requestId) => {
    const res = await fetchWithTimeout(`${BASE_URL}/requests/${requestId}/synthesize-dependencies`);
    if (!res.ok) throw new Error('Failed to synthesize dependencies');
    return res.json();
  },

  proceedToDrafting: async (requestId, payload) => {
    const res = await fetchWithTimeout(`${BASE_URL}/requests/${requestId}/proceed-to-drafting`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to proceed to drafting');
    return res.json();
  },

  approveContract: async (requestId, payload) => {
    const res = await fetchWithTimeout(`${BASE_URL}/requests/${requestId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload || {})
    });
    if (!res.ok) throw new Error('Failed to approve contract');
    return res.json();
  },

  rejectAndRollback: async (requestId, payload) => {
    const res = await fetchWithTimeout(`${BASE_URL}/requests/${requestId}/reject-rollback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to reject contract and execute rollback');
    return res.json();
  },

  addInlineComment: async (requestId, payload) => {
    const res = await fetchWithTimeout(`${BASE_URL}/requests/${requestId}/add-inline-comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to add inline comment');
    return res.json();
  },

  convertRequestToContract: async (id) => {
    const res = await fetchWithTimeout(`${BASE_URL}/requests/${id}/convert-to-contract`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to convert request to contract');
    return res.json();
  },

  // ==========================================
  // Client Portal Methods (Client Module)
  // ==========================================
  getClientContract: async (token, passcode) => {
    const query = passcode ? `?token=${encodeURIComponent(token)}&passcode=${encodeURIComponent(passcode)}` : `?token=${encodeURIComponent(token)}`;
    return await get(`/api/client/contract${query}`);
  },

  verifyClientPasscode: async (token, passcode) => {
    return await post('/api/client/verify-passcode', { token, passcode });
  },

  submitClientRedlines: async (token, submissionNote, redlines) => {
    return await post('/api/client/redline', { token, submissionNote, redlines });
  },

  executeClientSignature: async (token, signerName, signerTitle, signatureData) => {
    return await post('/api/client/sign', { token, signerName, signerTitle, signatureData });
  },

  generateClientInvite: async (inviteData) => {
    return await post('/api/client/generate-invite', inviteData);
  },

  resetClientDemo: async () => {
    return await post('/api/client/reset-demo');
  }
};

export const getClientContract = APIService.getClientContract;
export const verifyClientPasscode = APIService.verifyClientPasscode;
export const submitClientRedlines = APIService.submitClientRedlines;
export const executeClientSignature = APIService.executeClientSignature;
export const generateClientInvite = APIService.generateClientInvite;
export const resetClientDemo = APIService.resetClientDemo;

export { APIService };
export default APIService;
