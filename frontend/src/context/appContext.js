'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import APIService, * as apiService from '../service/apiService';
import api, { setAuthToken } from '../api/api';

const AppContext = createContext();

export const MOCK_USERS = [
  {
    id: 101,
    name: 'John Sales',
    email: 'john.sales@marketbytes.com',
    department: 'Sales Department',
    role: 'Requester',
    title: 'Account Executive'
  },
  {
    id: 102,
    name: 'Alex Miller',
    email: 'alex.miller@marketbytes.com',
    department: 'UI/UX & Engineering',
    role: 'Department Lead',
    title: 'UI/UX Design Lead'
  },
  {
    id: 103,
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@marketbytes.com',
    department: 'Contract Management',
    role: 'Contract Manager',
    title: 'Contract Specialist'
  },
  {
    id: 104,
    name: 'Elena Rostova',
    email: 'elena.rostova@marketbytes.com',
    department: 'Legal Counsel',
    role: 'Reviewer',
    title: 'General Counsel'
  },
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@marketbytes.com',
    department: 'Operations',
    role: 'Admin',
    title: 'Super Admin'
  }
];

export const AppProvider = ({ children }) => {
  // Auth & Session States
  const [user, setUser] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed) {
            return {
              ...parsed,
              name: parsed.full_name || parsed.name || (parsed.email ? parsed.email.split('@')[0] : 'Logged In User'),
              full_name: parsed.full_name || parsed.name || (parsed.email ? parsed.email.split('@')[0] : 'Logged In User')
            };
          }
        } catch (e) {
          // ignore
        }
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Sidebar Open/Collapse State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  // ==========================================
  // Stage 1: Requester Portal States
  // ==========================================
  const [contractRequests, setContractRequests] = useState([]);
  const [requestMetrics, setRequestMetrics] = useState({
    totalActive: 0,
    pendingDependencies: 0,
    inReview: 0,
    approved: 0
  });
  const [contractManagers, setContractManagers] = useState([]);
  const [departmentLeads, setDepartmentLeads] = useState({});
  const [aiParsingState, setAiParsingState] = useState({ loading: false, data: null, error: null });
  const [notifications, setNotifications] = useState([]);
  const [copilotSuggestions, setCopilotSuggestions] = useState(null);
  const [copilotLoading, setCopilotLoading] = useState(false);

  const normalizeRequest = (r) => {
    if (!r) return r;
    const trackingId = r.trackingId || r.tracking_id || r.requestId || `REQ-2026-${r.id || Math.floor(1000 + Math.random() * 9000)}`;
    const title = r.title || r.requestName || 'Contract Request';
    const clientName = r.entityName || r.entity_name || r.clientName || 'Client / Beneficiary';
    const status = r.status || r.currentStatus || (r.isDraft ? 'Draft' : 'Submitted');
    const category = r.category || r.contractCategory || 'Revenue / Sales';
    const contractType = r.contractType || r.contract_type || 'Proposal';
    const createdDate = r.createdAt || r.created_at ? new Date(r.createdAt || r.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    const estimatedValue = r.dealValue || r.deal_value || r.estimatedValue || 0;

    const customClientTerms = r.custom_terms || r.customClientTerms || r.customTerms || r.specialTerms || '';
    const scopeSummary = r.scopeSummary || r.scope_summary || r.description || r.purpose || '';

    return {
      ...r,
      id: r.id || Date.now(),
      requestId: trackingId,
      trackingId,
      requestName: title,
      title,
      clientName,
      entityName: clientName,
      currentStatus: status,
      status,
      contractCategory: category,
      category,
      contractType,
      contract_type: contractType,
      createdDate,
      createdAt: r.createdAt || r.created_at || createdDate,
      estimatedValue,
      dealValue: estimatedValue,
      deal_value: estimatedValue,
      customClientTerms,
      custom_terms: customClientTerms,
      customTerms: customClientTerms,
      scopeSummary,
      description: scopeSummary,
      dependencies: r.dependencies || []
    };
  };

  const loadRequestsData = useCallback(async () => {
    try {
      const [requestsRes, metricsRes, notificationsRes] = await Promise.allSettled([
        apiService.getContractRequests(),
        apiService.getRequestMetrics(),
        apiService.getNotifications()
      ]);

      if (requestsRes.status === 'fulfilled' && Array.isArray(requestsRes.value)) {
        const normalized = requestsRes.value.map(normalizeRequest);
        setContractRequests(normalized);
      }
      if (metricsRes.status === 'fulfilled' && metricsRes.value) {
        setRequestMetrics(metricsRes.value);
      }
      if (notificationsRes.status === 'fulfilled' && notificationsRes.value?.data) {
        setNotifications(notificationsRes.value.data);
      }
    } catch (err) {
      console.error('Error loading requests data:', err);
    }
  }, []);

  const loadAssigneeOptions = useCallback(async () => {
    try {
      const users = await apiService.getAllUsers().catch(() => []);
      if (Array.isArray(users) && users.length > 0) {
        const cms = users.map(u => ({
          id: u.id,
          name: u.full_name || u.name || (u.email ? u.email.split('@')[0] : `User #${u.id}`),
          full_name: u.full_name || u.name || (u.email ? u.email.split('@')[0] : `User #${u.id}`),
          email: u.email,
          role: u.roles && u.roles.length > 0 ? (typeof u.roles[0] === 'object' ? u.roles[0].name : u.roles[0]) : (u.role || 'User')
        }));
        
        setContractManagers(cms);

        const deptMap = {};
        users.forEach(u => {
          const deptName = typeof u.department === 'object' ? u.department?.name : (u.department || 'General');
          if (!deptMap[deptName]) deptMap[deptName] = [];
          deptMap[deptName].push({
            id: u.id,
            name: u.full_name || u.name || (u.email ? u.email.split('@')[0] : u.email),
            role: u.roles && u.roles.length > 0 ? (typeof u.roles[0] === 'object' ? u.roles[0].name : u.roles[0]) : (u.role || 'User')
          });
        });
        setDepartmentLeads(deptMap);
      }
    } catch (err) {
      console.error('Error loading assignee options from DB:', err);
    }
  }, []);

  const submitNewRequest = async (requestPayload, isDraft = false) => {
    try {
      const res = await apiService.createContractRequest({ ...requestPayload, isDraft });
      const normalized = normalizeRequest(res || requestPayload);
      setContractRequests(prev => [normalized, ...prev.filter(p => p.id !== normalized.id)]);
      await loadRequestsData().catch(() => {});
      return { success: true, trackingId: normalized.trackingId };
    } catch (err) {
      console.warn('Failed to submit request to backend, saving contract request locally:', err);
      const mockId = `REQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const mockReq = normalizeRequest({
        id: Date.now(),
        requestId: mockId,
        trackingId: mockId,
        ...requestPayload,
        status: isDraft ? 'Draft' : 'Submitted',
        currentStatus: isDraft ? 'Draft' : 'Submitted',
        createdAt: new Date().toISOString()
      });
      setContractRequests(prev => [mockReq, ...prev]);
      return { success: true, trackingId: mockId };
    }
  };

  const triggerAIParsing = async (fileOrName, content = "") => {
    setAiParsingState({ loading: true, data: null, error: null });
    try {
      const res = await apiService.analyzeDocumentAI(fileOrName, content);
      setAiParsingState({ loading: false, data: res, error: null });
      return { success: true, data: res };
    } catch (err) {
      console.error('Error in AI parsing:', err);
      setAiParsingState({ loading: false, data: null, error: err.message });
      return { success: false, error: err.message };
    }
  };

  const clearAIParsingState = () => {
    setAiParsingState({ loading: false, data: null, error: null });
  };

  const fetchCopilotSuggestions = async (formPayload) => {
    setCopilotLoading(true);
    try {
      const response = await apiService.getCopilotSuggestions(formPayload);
      if (response) {
        setCopilotSuggestions(response);
        return { success: true, data: response };
      }
    } catch (err) {
      console.error('Error fetching copilot suggestions:', err);
      return { success: false, error: err?.message };
    } finally {
      setCopilotLoading(false);
    }
  };

  // Initialize Auth & Load initial Stage 1 data via HttpOnly Cookie Session
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Fetch current user from server using HttpOnly session cookie
        const res = await api.get('/auth/me');
        if (res.data) {
          setUser(res.data);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }

      Promise.allSettled([
        loadRequestsData(),
        loadAssigneeOptions()
      ]);
    };

    initializeApp();
  }, [loadRequestsData, loadAssigneeOptions]);

  const [users, setUsers] = useState([]);

  const saveUsersLocally = (updatedUsers) => {
    setUsers(updatedUsers);
  };

  const addUser = (newUser) => {
    setUsers(prev => [newUser, ...prev]);
  };

  const removeUser = (userIdOrEmail) => {
    setUsers(prev => prev.filter(u => u.id !== userIdOrEmail && u.email !== userIdOrEmail));
  };

  const [departments, setDepartments] = useState([]);

  const saveDepartmentsLocally = (updatedDepts) => {
    setDepartments(updatedDepts);
  };

  const addDepartment = (newDept) => {
    setDepartments(prev => [newDept, ...prev]);
  };

  const [roles, setRoles] = useState([]);

  // Centralized state logic for Admin
  const fetchAdminData = async () => {
    try {
      const { APIService } = await import('../service/apiService');
      const usersData = await APIService.getAllUsers();
      const rolesData = await APIService.getAllRoles();
      setUsers(usersData);
      setRoles(rolesData);
    } catch (err) {
      console.error("Failed to fetch admin data", err);
    }
  };

  const login = (userData, token) => {
    const normalizedUser = userData ? {
      ...userData,
      name: userData.full_name || userData.name || (userData.email ? userData.email.split('@')[0] : 'Logged In User'),
      full_name: userData.full_name || userData.name || (userData.email ? userData.email.split('@')[0] : 'Logged In User')
    } : null;

    if (token) {
      setAuthToken(token);
    }

    if (typeof window !== 'undefined') {
      if (token) localStorage.setItem('token', token);
      if (normalizedUser) localStorage.setItem('user', JSON.stringify(normalizedUser));
      localStorage.removeItem('clm_custom_users');
      localStorage.removeItem('clm_custom_departments');
    }
    setUser(normalizedUser);
    setIsAuthenticated(true);
    setUsers([]);
    setDepartments([]);
    setError(null);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Ignore network errors on logout
    }
    setAuthToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('clm_custom_users');
      localStorage.removeItem('clm_custom_departments');
    }
    setUser(null);
    setIsAuthenticated(false);
    setUsers([]);
    setRoles([]);
    setDepartments([]);
  };

  const [contracts, setContracts] = useState([]);

  // Fetch contracts from the backend
  const fetchContracts = async () => {
    try {
      const { APIService } = await import('../service/apiService');
      const data = await APIService.getContracts();
      setContracts(data);
    } catch (err) {
      console.error("Failed to fetch contracts", err);
    }
  };

  // Add a new contract
  const addContract = async (contractData) => {
    try {
      const { APIService } = await import('../service/apiService');
      const newContract = await APIService.createContract(contractData);
      if (newContract) {
        setContracts(prev => [newContract, ...prev]);
      }
      return newContract;
    } catch (err) {
      console.warn("Failed to create contract on backend, creating local draft", err);
      const mockContract = {
        id: Date.now(),
        title: contractData.title || 'Untitled Contract Agreement',
        status: contractData.status || 'Drafting In Progress',
        value: contractData.value || 0,
        ai_summary: contractData.ai_summary || '',
        metadata_data: contractData.metadata_data || {},
        created_at: new Date().toISOString()
      };
      setContracts(prev => [mockContract, ...prev]);
      return mockContract;
    }
  };

  const [requests, setRequests] = useState([]);

  // Fetch requests from the backend
  const fetchRequests = async (status = null) => {
    try {
      const { APIService } = await import('../service/apiService');
      const data = await APIService.getRequests(status);
      setRequests(data);
    } catch (err) {
      console.error("Failed to fetch requests", err);
    }
  };

  // Add a new request
  const addRequest = async (requestData) => {
    try {
      const { APIService } = await import('../service/apiService');
      const newRequest = await APIService.createRequest(requestData);
      setRequests(prev => [newRequest, ...prev]);
      return newRequest;
    } catch (err) {
      console.error("Failed to create request", err);
      throw err;
    }
  };

  const switchUserRole = (userId) => {
    const selected = MOCK_USERS.find(u => u.id === parseInt(userId));
    if (selected) {
      localStorage.setItem('user', JSON.stringify(selected));
      setUser(selected);
      setIsAuthenticated(true);
      return selected;
    }
    return null;
  };

  const value = {
    user,
    setUser,
    loading,
    setLoading,
    error,
    setError,
    isAuthenticated,
    isSidebarOpen,
    toggleSidebar,
    contractRequests,
    setContractRequests,
    requestMetrics,
    setRequestMetrics,
    contractManagers,
    setContractManagers,
    departmentLeads,
    setDepartmentLeads,
    aiParsingState,
    setAiParsingState,
    notifications,
    setNotifications,
    copilotSuggestions,
    setCopilotSuggestions,
    copilotLoading,
    setCopilotLoading,
    clearAIParsingState,
    fetchCopilotSuggestions,
    loadRequestsData,
    loadAssigneeOptions,
    submitNewRequest,
    triggerAIParsing,
    users,
    setUsers,
    saveUsersLocally,
    addUser,
    removeUser,
    departments,
    setDepartments,
    saveDepartmentsLocally,
    addDepartment,
    roles,
    contracts,
    requests,
    fetchAdminData,
    fetchContracts,
    addContract,
    fetchRequests,
    addRequest,
    login,
    logout,
    switchUserRole,
    MOCK_USERS
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
