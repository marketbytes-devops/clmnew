"use client";
import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Building2, Users, FileText, ChevronRight, X, RefreshCw, 
  ArrowLeft, ArrowRight, CheckCircle2, UserCheck, ShieldCheck, Mail, MapPin, Code, Hash, Layers
} from 'lucide-react';
import PrimaryButton from '../../../common/buttons/PrimaryButton';
import Link from 'next/link';
import { APIService } from '../../../service/apiService';
import { useAppContext } from '../../../context/appContext';

export default function DepartmentsList() {
  const { users: contextUsers, departments: contextDepartments, addDepartment } = useAppContext();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Available user profiles to add to department
  const [availableUsers, setAvailableUsers] = useState([]);
  // Available system roles
  const [availableRoles, setAvailableRoles] = useState([]);

  // 4-Step Department Wizard Form State
  const [formData, setFormData] = useState({
    // Step 1 — Basic Details
    name: '',
    code: '',
    description: '',

    // Step 2 — Management
    head: '',
    parentDepartment: 'None (Top Level)',

    // Step 3 — Organization
    location: 'Corporate HQ - New York',
    email: '',
    costCenter: 'CC-1001',
    selectedMembers: [], // People with existing profiles added to department

    // Step 4 — Status & Review
    status: 'Active',
    assignedRole: 'Contract Manager',
    isCustomRole: false,
    customRoleText: ''
  });

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
      name: '',
      code: '',
      description: '',
      head: '',
      parentDepartment: 'None (Top Level)',
      location: 'Corporate HQ - New York',
      email: '',
      costCenter: 'CC-1001',
      selectedMembers: [],
      status: 'Active',
      assignedRole: 'Contract Manager',
      isCustomRole: false,
      customRoleText: ''
    });
  };

  const fetchDepartmentsData = async () => {
    setLoading(true);
    try {
      const data = await APIService.getDepartments().catch(() => []);
      
      const map = new Map();
      (data || []).forEach(d => {
        if (d && (d.id || d.name)) map.set(d.id || d.name, d);
      });
      (contextDepartments || []).forEach(d => {
        if (d && (d.id || d.name)) map.set(d.id || d.name, d);
      });

      const combinedList = Array.from(map.values());
      setDepartments(combinedList);
    } catch (err) {
      console.error("Failed to fetch departments from backend", err);
      setDepartments(contextDepartments || []);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuxiliaryData = async () => {
    try {
      const usersData = await APIService.getAllUsers().catch(() => []);
      const rolesData = await APIService.getAllRoles().catch(() => []);
      
      // Combine live API users with any context users created on Users page
      const combinedUsersMap = new Map();
      
      (usersData || []).forEach(u => {
        if (u && (u.id || u.email)) {
          combinedUsersMap.set(u.id || u.email, u);
        }
      });

      if (contextUsers && Array.isArray(contextUsers)) {
        contextUsers.forEach(u => {
          if (u && (u.id || u.email)) {
            combinedUsersMap.set(u.id || u.email, u);
          }
        });
      }

      const activeProfilesList = Array.from(combinedUsersMap.values());
      setAvailableUsers(activeProfilesList);
      setAvailableRoles(rolesData || []);
    } catch (err) {
      console.error("Failed auxiliary fetch", err);
    }
  };

  useEffect(() => {
    fetchDepartmentsData();
    fetchAuxiliaryData();
  }, [contextUsers, contextDepartments]);

  const handleCreateDepartment = async (e) => {
    if (e) e.preventDefault();
    setCreating(true);
    const payload = {
      name: formData.name,
      code: formData.code,
      description: formData.description,
      head: formData.head || 'Unassigned',
      parentDepartment: formData.parentDepartment,
      location: formData.location,
      email: formData.email,
      costCenter: formData.costCenter,
      status: formData.status,
      membersCount: formData.selectedMembers.length,
      assignedRole: formData.assignedRole
    };

    const newDeptObj = {
      id: Date.now(),
      ...payload,
      members: formData.selectedMembers.length,
      activeContracts: 0,
      slaCompliance: 100
    };

    try {
      const res = await APIService.createDepartment(payload).catch(() => null);
      const created = res || newDeptObj;
      addDepartment(created);
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      addDepartment(newDeptObj);
      setIsModalOpen(false);
      resetForm();
    } finally {
      setCreating(false);
    }
  };

  const toggleUserMember = (user) => {
    setFormData(prev => {
      const userId = user.id || user.email;
      const exists = prev.selectedMembers.some(m => (m.id || m.email) === userId);
      if (exists) {
        return {
          ...prev,
          selectedMembers: prev.selectedMembers.filter(m => (m.id || m.email) !== userId)
        };
      } else {
        return {
          ...prev,
          selectedMembers: [...prev.selectedMembers, user]
        };
      }
    });
  };

  const filteredDepartments = departments.filter(d => {
    const term = searchTerm.toLowerCase();
    return d.name ? d.name.toLowerCase().includes(term) : false;
  });

  return (
    <div className="flex flex-col gap-6 relative max-w-7xl mx-auto font-sans">
      
      {/* Header Area */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-500 mt-1 text-sm">Configure business units, structure, management, and team assignments.</p>
        </div>
        <div className="flex gap-3">
          <PrimaryButton onClick={() => { resetForm(); setIsModalOpen(true); }} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Department
          </PrimaryButton>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search departments..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <button 
          onClick={fetchDepartmentsData}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh List
        </button>
      </div>

      {/* Departments Grid */}
      {loading ? (
        <div className="p-8 text-center text-gray-400">Loading departments from backend...</div>
      ) : filteredDepartments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepartments.map((dept) => (
            <div key={dept.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between hover:border-blue-300 transition-all">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      dept.status === 'Inactive' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {dept.status || 'Active'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="text-lg font-bold text-gray-900">{dept.name}</h3>
                  {dept.code && (
                    <span className="text-[11px] font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {dept.code}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-4">Department Head: <span className="font-semibold text-gray-700">{dept.head || 'Unassigned'}</span></p>

                <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div>
                    <span className="text-gray-400 block uppercase text-[10px]">Team Members</span>
                    <span className="font-bold text-gray-900 flex items-center gap-1 mt-0.5">
                      <Users className="w-3.5 h-3.5 text-gray-500" /> {dept.members || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block uppercase text-[10px]">Default Role</span>
                    <span className="font-bold text-blue-700 flex items-center gap-1 mt-0.5 truncate">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" /> {dept.assignedRole || 'Contract Manager'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between items-center text-xs">
                <span className="text-gray-500 truncate max-w-[150px]">{dept.email || dept.location || 'NYC HQ'}</span>
                <Link href={`/admin/departments/${dept.id}`} className="text-blue-600 font-semibold hover:underline flex items-center gap-1">
                  Configure <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-xl border border-gray-200 text-center text-gray-400 shadow-sm">
          No departments found in database. Click <b>+ New Department</b> to create one.
        </div>
      )}

      {/* 4-Step Department Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-200 overflow-hidden my-8">
            
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-400" />
                  Create New Department
                </h3>
                <p className="text-xs text-slate-400 mt-1">Configure business structure, leaders, members, and status</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Navigation */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex justify-between items-center text-xs font-semibold">
              <div className={`flex items-center gap-2 ${currentStep === 1 ? 'text-blue-600 font-bold' : currentStep > 1 ? 'text-emerald-600' : 'text-slate-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep === 1 ? 'bg-blue-600 text-white' : currentStep > 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {currentStep > 1 ? '✓' : '1'}
                </span>
                Step 1: Basic Details
              </div>
              <div className="w-6 h-px bg-slate-300"></div>
              <div className={`flex items-center gap-2 ${currentStep === 2 ? 'text-blue-600 font-bold' : currentStep > 2 ? 'text-emerald-600' : 'text-slate-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep === 2 ? 'bg-blue-600 text-white' : currentStep > 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {currentStep > 2 ? '✓' : '2'}
                </span>
                Step 2: Management
              </div>
              <div className="w-6 h-px bg-slate-300"></div>
              <div className={`flex items-center gap-2 ${currentStep === 3 ? 'text-blue-600 font-bold' : currentStep > 3 ? 'text-emerald-600' : 'text-slate-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep === 3 ? 'bg-blue-600 text-white' : currentStep > 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {currentStep > 3 ? '✓' : '3'}
                </span>
                Step 3: Organization
              </div>
              <div className="w-6 h-px bg-slate-300"></div>
              <div className={`flex items-center gap-2 ${currentStep === 4 ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep === 4 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  4
                </span>
                Step 4: Status & Review
              </div>
            </div>

            {/* Modal Body / Wizard Forms */}
            <div className="p-6">
              
              {/* STEP 1: BASIC DETAILS */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Department Name <span className="text-rose-500">*</span>
                      </label>
                      <input 
                        type="text"
                        required 
                        placeholder="e.g. Legal Operations"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Department Code <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Code className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. LEG-OPS"
                          value={formData.code}
                          onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none uppercase font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                    <textarea 
                      rows={3}
                      placeholder="Brief overview of department scope, functions, and responsibilities..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: MANAGEMENT */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Department Head</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Elena Rostova (General Counsel)"
                        value={formData.head}
                        onChange={(e) => setFormData({ ...formData, head: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Parent Department</label>
                      <select 
                        value={formData.parentDepartment}
                        onChange={(e) => setFormData({ ...formData, parentDepartment: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      >
                        <option value="None (Top Level)">None (Top Level Division)</option>
                        <option value="Executive Management">Executive Management</option>
                        <option value="Legal & Corporate Affairs">Legal & Corporate Affairs</option>
                        <option value="Finance & Procurement">Finance & Procurement</option>
                      </select>
                    </div>
                  </div>

                  {/* Add People with existing profiles */}
                  <div className="pt-3 border-t border-slate-200">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-xs font-bold text-gray-800">
                        Add Existing Profile Users to Department ({formData.selectedMembers.length} Selected)
                      </label>
                      <span className="text-[11px] text-blue-600 font-semibold">Select profiles to assign</span>
                    </div>
                    
                    <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 bg-slate-50 p-2 space-y-1">
                      {availableUsers.length > 0 ? (
                        availableUsers.map((user) => {
                          const userName = typeof user.full_name === 'string' ? user.full_name : (typeof user.name === 'string' ? user.name : user.email);
                          const isSelected = formData.selectedMembers.some(m => (m.id || m.email) === (user.id || user.email));
                          return (
                            <div 
                              key={user.id || user.email}
                              onClick={() => toggleUserMember(user)}
                              className={`p-2.5 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                                isSelected ? 'bg-blue-50 border border-blue-200 text-blue-900' : 'bg-white hover:bg-slate-100 text-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                                  {userName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-xs font-semibold">{userName}</p>
                                  <p className="text-[11px] text-slate-500">{user.email}</p>
                                </div>
                              </div>
                              <input 
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}} // Handled by div container click
                                className="w-4 h-4 text-blue-600 rounded"
                              />
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-xs text-slate-400 p-3 text-center">No existing user profiles found in system.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: ORGANIZATION */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Location</label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input 
                          type="text" 
                          placeholder="e.g. New York Corporate HQ"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Department Email</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input 
                          type="email" 
                          placeholder="e.g. legal-ops@company.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Cost Center Code</label>
                    <div className="relative">
                      <Hash className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text" 
                        placeholder="e.g. CC-1001"
                        value={formData.costCenter}
                        onChange={(e) => setFormData({ ...formData, costCenter: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: STATUS & REVIEW */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Status <span className="text-rose-500">*</span> (Active / Inactive)
                      </label>
                      <select 
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Assigned System Role
                      </label>
                      <select 
                        value={formData.isCustomRole ? 'Other' : formData.assignedRole}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'Other') {
                            setFormData({ ...formData, isCustomRole: true, assignedRole: formData.customRoleText || 'Custom Role' });
                          } else {
                            setFormData({ ...formData, isCustomRole: false, assignedRole: val });
                          }
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                      >
                        {availableRoles.length > 0 ? (
                          availableRoles.map(r => (
                            <option key={r.id || r.name} value={r.name}>{r.name}</option>
                          ))
                        ) : (
                          <>
                            <option value="Contract Manager">Contract Manager</option>
                            <option value="General Counsel">General Counsel</option>
                            <option value="Legal Reviewer">Legal Reviewer</option>
                            <option value="Requestor">Requestor</option>
                          </>
                        )}
                        <option value="Other">+ Other (Type Custom Role...)</option>
                      </select>

                      {formData.isCustomRole && (
                        <div className="mt-2">
                          <input 
                            type="text"
                            placeholder="Type custom department system role..."
                            value={formData.customRoleText}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              customRoleText: e.target.value,
                              assignedRole: e.target.value 
                            })}
                            className="w-full border border-blue-400 bg-blue-50/50 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-800"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Summary Card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
                    <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Review Department Details</p>
                    <div className="grid grid-cols-2 gap-2 text-slate-600">
                      <div><strong className="text-slate-900">Name:</strong> {formData.name || '—'}</div>
                      <div><strong className="text-slate-900">Code:</strong> {formData.code || '—'}</div>
                      <div><strong className="text-slate-900">Head:</strong> {formData.head || 'Unassigned'}</div>
                      <div><strong className="text-slate-900">Members Assigned:</strong> {formData.selectedMembers.length} users</div>
                      <div><strong className="text-slate-900">Location:</strong> {formData.location}</div>
                      <div><strong className="text-slate-900">Email:</strong> {formData.email || 'None'}</div>
                      <div><strong className="text-slate-900">Status:</strong> {formData.status}</div>
                      <div><strong className="text-slate-900">Default Role:</strong> {formData.assignedRole}</div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer Controls */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="flex items-center gap-1.5 px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              ) : (
                <div></div>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                {currentStep < 4 ? (
                  <PrimaryButton
                    type="button"
                    onClick={() => {
                      if (currentStep === 1 && (!formData.name || !formData.code)) {
                        alert("Department Name and Department Code are required.");
                        return;
                      }
                      setCurrentStep(prev => prev + 1);
                    }}
                    className="flex items-center gap-1.5"
                  >
                    Next <ArrowRight className="w-4 h-4" />
                  </PrimaryButton>
                ) : (
                  <PrimaryButton
                    type="button"
                    onClick={handleCreateDepartment}
                    disabled={creating}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {creating ? 'Creating...' : 'Create Department'}
                  </PrimaryButton>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
