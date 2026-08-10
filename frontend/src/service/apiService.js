import { get, post, put, del } from './apiMethods';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

// Fetch all contract requests for the Requester Dashboard
export const getContractRequests = async () => {
  return await get('/api/contracts/requests');
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
    const content = `Client: Hooli Inc\nObjective: Build a new contract portal\nDeliverables:\n- UI Wireframing & Screen layouts\n- Core web application build\n- Security audit certification`;
    fileToUpload = new File([content], fileOrName.name || "simulated_file.txt", { type: 'text/plain' });
  }

  const formData = new FormData();
  formData.append('file', fileToUpload);

  return await post('/api/ai/parse-document', formData);
};

// Fetch lists of available Contract Managers and Department Leads
export const getContractManagers = async () => {
  const managers = await get('/api/contracts/managers');
  return {
    status: 'success',
    data: managers
  };
};

export const getDepartmentLeads = async () => {
  const leads = await get('/api/contracts/leads');
  return {
    status: 'success',
    data: leads
  };
};

