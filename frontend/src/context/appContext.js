'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as apiService from '../service/apiService';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Auth & Session States
  const [user, setUser] = useState({
    name: 'John Sales (Account Executive)',
    email: 'john.sales@marketbytes.com',
    department: 'Sales',
    role: 'Requester'
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

  // Initialize Auth & Load initial Stage 1 data
  useEffect(() => {
    const initializeApp = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        }

        // Fetch initial Contract Requests & Metrics for Requester Dashboard
        await loadRequestsData();
        await loadAssigneeOptions();

      } catch (err) {
        console.error('Error initializing AppContext:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Fetch Requests & Compute KPIs from API Service
  const loadRequestsData = useCallback(async () => {
    try {
      const res = await apiService.getContractRequests();
      if (res) {
        setContractRequests(res.data || res);

        // Compute corresponding metrics
        const metricsRes = await apiService.getRequestMetrics();
        if (metricsRes) {
          setRequestMetrics(metricsRes.data || metricsRes);
        }

        const notifsRes = await apiService.getNotifications();
        if (notifsRes) setNotifications(notifsRes.data || notifsRes);
      }
    } catch (err) {
      console.error('Failed to load contract requests:', err);
      setError('Could not fetch contract requests.');
    }
  }, []);

  // Fetch Managers and Leads for Step 4 Routing
  const loadAssigneeOptions = useCallback(async () => {
    try {
      const managersRes = await apiService.getContractManagers();
      const leadsRes = await apiService.getDepartmentLeads();
      if (managersRes?.data) setContractManagers(managersRes.data);
      if (leadsRes?.data) setDepartmentLeads(leadsRes.data);
    } catch (err) {
      console.error('Failed to load assignee dropdowns:', err);
    }
  }, []);

  // Submit new request from 4-Step Wizard & dynamically update state
  const submitNewRequest = async (wizardFormValue, isDraft = false) => {
    try {
      setLoading(true);
      const payload = { ...wizardFormValue, isDraft, requesterName: user?.name || 'Sales Rep' };
      const response = await apiService.createContractRequest(payload);

      if (response) {
        const newReq = response.data || response;
        // Prepend newly created contract to state for instant interactive demo
        const updatedList = [newReq, ...contractRequests];
        setContractRequests(updatedList);

        // Recalculate metrics in real-time
        const updatedMetrics = await apiService.getRequestMetrics(updatedList);
        if (updatedMetrics) {
          setRequestMetrics(updatedMetrics.data || updatedMetrics);
        }

        // Refresh notifications from DB
        const notifsRes = await apiService.getNotifications();
        if (notifsRes) setNotifications(notifsRes.data || notifsRes);

        return { success: true, trackingId: newReq.requestId, request: newReq };
      }
      return { success: false, message: 'Failed to generate contract request.' };
    } catch (err) {
      console.error('Error submitting request:', err);
      return { success: false, message: err?.message || 'Submission failed.' };
    } finally {
      setLoading(false);
    }
  };

  // Trigger dynamic Gemini AI Scope Extraction (Step 3)
  const triggerAIParsing = async (fileObj) => {
    setAiParsingState({ loading: true, data: null, error: null });
    try {
      const response = await apiService.analyzeDocumentAI(fileObj);
      if (response?.data) {
        setAiParsingState({ loading: false, data: response.data, error: null });
        return { success: true, data: response.data };
      }
    } catch (err) {
      setAiParsingState({ loading: false, data: null, error: 'AI Extractor encountered an issue.' });
      return { success: false, error: err?.message };
    }
  };

  const clearAIParsingState = () => {
    setAiParsingState({ loading: false, data: null, error: null });
  };

  // Auth helper methods
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
  };

  const value = {
    user,
    setUser,
    loading,
    setLoading,
    error,
    setError,
    isAuthenticated,
    // Requester domain state
    contractRequests,
    requestMetrics,
    contractManagers,
    departmentLeads,
    aiParsingState,
    notifications,
    // Requester actions
    loadRequestsData,
    submitNewRequest,
    triggerAIParsing,
    clearAIParsingState,
    // Auth actions
    login,
    logout,
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
