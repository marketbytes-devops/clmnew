'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as apiService from '../service/apiService';

const AppContext = createContext();

export const MOCK_USERS = [
  {
    id: 101,
    name: 'John Sales',
    email: 'john.sales@marketbytes.com',
    department: 'Sales',
    role: 'Requester',
    title: 'Account Executive'
  },
  {
    id: 102,
    name: 'Alex Miller',
    email: 'alex.miller@marketbytes.com',
    department: 'Legal Operations',
    role: 'Contract Manager',
    title: 'Contract Specialist'
  },
  {
    id: 103,
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@marketbytes.com',
    department: 'Finance',
    role: 'Reviewer',
    title: 'Finance Director'
  },
  {
    id: 104,
    name: 'Elena Rostova',
    email: 'elena.rostova@marketbytes.com',
    department: 'Legal',
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
          return JSON.parse(stored);
        } catch (e) {
          // ignore
        }
      }
    }
    return {
      id: 101,
      name: 'John Sales',
      email: 'john.sales@marketbytes.com',
      department: 'Sales',
      role: 'Requester',
      title: 'Account Executive'
    };
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

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

  const loadRequestsData = useCallback(async () => {
    try {
      const [requestsRes, metricsRes, notificationsRes] = await Promise.allSettled([
        apiService.getContractRequests(),
        apiService.getRequestMetrics(),
        apiService.getNotifications()
      ]);

      if (requestsRes.status === 'fulfilled' && requestsRes.value) {
        setContractRequests(requestsRes.value);
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
      const [managersRes, leadsRes] = await Promise.allSettled([
        apiService.getContractManagers(),
        apiService.getDepartmentLeads()
      ]);

      if (managersRes.status === 'fulfilled' && managersRes.value?.data) {
        setContractManagers(managersRes.value.data);
      }
      if (leadsRes.status === 'fulfilled' && leadsRes.value?.data) {
        setDepartmentLeads(leadsRes.value.data);
      }
    } catch (err) {
      console.error('Error loading assignee options:', err);
    }
  }, []);

  const submitNewRequest = async (requestPayload, isDraft = false) => {
    try {
      const res = await apiService.createContractRequest({ ...requestPayload, isDraft });
      if (res) {
        setContractRequests(prev => [res, ...prev]);
      }
      await loadRequestsData().catch(() => {});
      return { success: true, trackingId: res?.trackingId || res?.requestId || res?.id || `REQ-2026-${Math.floor(1000 + Math.random() * 9000)}` };
    } catch (err) {
      console.warn('Backend server offline, saving contract request locally:', err);
      const mockId = `REQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const mockReq = {
        id: Date.now(),
        requestId: mockId,
        trackingId: mockId,
        ...requestPayload,
        currentStatus: isDraft ? 'Draft' : 'Submitted / Pending Assignment',
        createdAt: new Date().toISOString()
      };
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

  // Initialize Auth & Load initial Stage 1 data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Error initializing AppContext:', err);
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

  const [users, setUsers] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('clm_custom_users');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return [];
  });

  const saveUsersLocally = (updatedUsers) => {
    setUsers(updatedUsers);
    if (typeof window !== 'undefined') {
      localStorage.setItem('clm_custom_users', JSON.stringify(updatedUsers));
    }
  };

  const addUser = (newUser) => {
    setUsers(prev => {
      const updated = [newUser, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem('clm_custom_users', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const [departments, setDepartments] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('clm_custom_departments');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return [];
  });

  const saveDepartmentsLocally = (updatedDepts) => {
    setDepartments(updatedDepts);
    if (typeof window !== 'undefined') {
      localStorage.setItem('clm_custom_departments', JSON.stringify(updatedDepts));
    }
  };

  const addDepartment = (newDept) => {
    setDepartments(prev => {
      const updated = [newDept, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem('clm_custom_departments', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const [roles, setRoles] = useState([]);

  // Example of centralizing state logic for the Admin
  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const { APIService } = await import('../service/apiService');
      const usersData = await APIService.getAllUsers(token);
      const rolesData = await APIService.getAllRoles(token);
      setUsers(usersData);
      setRoles(rolesData);
    } catch (err) {
      console.error("Failed to fetch admin data", err);
    }
  };

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    setError(null);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    setUsers([]);
    setRoles([]);
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
