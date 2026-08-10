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

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);

  // Example of centralizing state logic for the Admin
  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const { APIService } = await import('../service/api_service');
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
      const { APIService } = await import('../service/api_service');
      const data = await APIService.getContracts();
      setContracts(data);
    } catch (err) {
      console.error("Failed to fetch contracts", err);
    }
  };

  // Add a new contract
  const addContract = async (contractData) => {
    try {
      const { APIService } = await import('../service/api_service');
      const newContract = await APIService.createContract(contractData);
      setContracts(prev => [newContract, ...prev]);
    } catch (err) {
      console.error("Failed to create contract", err);
      throw err; // Re-throw to handle in UI
    }
  };

  const [requests, setRequests] = useState([]);

  // Fetch requests from the backend
  const fetchRequests = async (status = null) => {
    try {
      const { APIService } = await import('../service/api_service');
      const data = await APIService.getRequests(status);
      setRequests(data);
    } catch (err) {
      console.error("Failed to fetch requests", err);
    }
  };

  // Add a new request
  const addRequest = async (requestData) => {
    try {
      const { APIService } = await import('../service/api_service');
      const newRequest = await APIService.createRequest(requestData);
      setRequests(prev => [newRequest, ...prev]);
      return newRequest;
    } catch (err) {
      console.error("Failed to create request", err);
      throw err;
    }
  };

  const value = {
    user,
    setUser,
    loading,
    setLoading,
    error,
    setError,
    isAuthenticated,
    users,
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
