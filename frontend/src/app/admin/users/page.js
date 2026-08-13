"use client";
import React, { useState, useEffect } from 'react';
import { 
  Search, UserPlus, Shield, X, RefreshCw, Trash2, Check, ArrowLeft, ArrowRight, 
  Building, Briefcase, Camera, Lock, User, Award, CheckCircle2, FileText, Phone, Mail, MapPin, Calendar, CreditCard, Upload
} from 'lucide-react';
import PrimaryButton from '../../../common/buttons/PrimaryButton';
import { APIService } from '../../../service/apiService';
import { useAppContext } from '../../../context/appContext';

const MODULES = ['Contracts', 'Users', 'Departments', 'Analytics', 'AI', 'Roles'];
const ACTIONS = ['View', 'Create', 'Edit', 'Delete', 'Approve', 'Reject', 'Archive', 'Restore', 'Export', 'Import', 'Assign'];

const getDefaultPermissionsMatrix = () => {
  const matrix = {};
  MODULES.forEach(mod => {
    matrix[mod] = {};
    ACTIONS.forEach(act => {
      matrix[mod][act] = false;
    });
  });
  return matrix;
};

export default function UsersList() {
  const { users: contextUsers, addUser, saveUsersLocally } = useAppContext();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // 3-Step Wizard Form State
  const [formData, setFormData] = useState({
    // Step 1 — Basic Details
    name: '',
    email: '',
    phone: '',
    employeeId: '',
    avatarUrl: '',
    password: 'password123',

    // Step 2 — Employment Details
    designation: 'Senior Legal Counsel',
    department: 'Legal Operations',
    employeeType: 'Full-Time',
    joiningDate: '2026-08-01',
    reportingManager: 'Elena Rostova (General Counsel)',
    workLocation: 'New York Corporate HQ',

    // Step 3 — Role & Permissions
    role: 'Contract Manager',
    modules: ['Contracts', 'Users', 'Departments', 'Analytics', 'AI', 'Roles'],
    permissionLevel: 'Standard Edit',
    specificPermissions: ['Create Contracts', 'Approve Requests', 'Edit Clauses', 'Export Reports'],
    approvalAuthority: '$100,000',
    permissionsMatrix: getDefaultPermissionsMatrix()
  });

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
      name: '',
      email: '',
      phone: '',
      employeeId: '',
      avatarUrl: '',
      password: 'password123',
      designation: 'Senior Legal Counsel',
      department: 'Legal Operations',
      employeeType: 'Full-Time',
      joiningDate: '2026-08-01',
      reportingManager: 'Elena Rostova (General Counsel)',
      workLocation: 'New York Corporate HQ',
      role: 'Contract Manager',
      modules: ['Contracts', 'Users', 'Departments', 'Analytics', 'AI', 'Roles'],
      permissionLevel: 'Standard Edit',
      specificPermissions: ['Create Contracts', 'Approve Requests', 'Edit Clauses', 'Export Reports'],
      approvalAuthority: '$100,000',
      permissionsMatrix: getDefaultPermissionsMatrix()
    });
  };

  const fetchUsersData = async () => {
    setLoading(true);
    try {
      const data = await APIService.getAllUsers().catch(() => []);
      
      const map = new Map();
      (data || []).forEach(u => {
        if (u && (u.id || u.email)) map.set(u.id || u.email, u);
      });
      (contextUsers || []).forEach(u => {
        if (u && (u.id || u.email)) map.set(u.id || u.email, u);
      });

      const combinedList = Array.from(map.values());
      setUsers(combinedList);
    } catch (err) {
      console.error("Failed to fetch users from backend", err);
      setUsers(contextUsers || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersData();
  }, [contextUsers]);

  const handleCreateUserSubmit = async (e) => {
    if (e) e.preventDefault();
    setCreating(true);
    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      department: formData.department,
      designation: formData.designation,
      employee_id: formData.employeeId,
      phone: formData.phone,
      avatar_url: formData.avatarUrl,
      employee_type: formData.employeeType,
      joining_date: formData.joiningDate,
      reporting_manager: formData.reportingManager,
      work_location: formData.workLocation,
      permission_level: formData.permissionLevel,
      approval_authority: formData.approvalAuthority,
      modules: formData.modules,
      specific_permissions: formData.specificPermissions
    };

    const newUserObj = {
      id: Date.now(),
      email: formData.email,
      full_name: formData.name,
      role: { name: formData.role },
      department: { name: formData.department },
      is_active: true,
      created_at: new Date().toISOString()
    };

    try {
      const res = await APIService.createUser(payload).catch(() => null);
      const created = res || newUserObj;
      addUser(created);
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      addUser(newUserObj);
      setIsModalOpen(false);
      resetForm();
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await APIService.deleteUser(id).catch(() => null);
      const updated = users.filter(u => u.id !== id);
      setUsers(updated);
      saveUsersLocally(updated);
    } catch (err) {
      const updated = users.filter(u => u.id !== id);
      setUsers(updated);
      saveUsersLocally(updated);
    }
  };

  const toggleModule = (moduleName) => {
    setFormData(prev => {
      const exists = prev.modules.includes(moduleName);
      return {
        ...prev,
        modules: exists ? prev.modules.filter(m => m !== moduleName) : [...prev.modules, moduleName]
      };
    });
  };

  const toggleSpecificPermission = (perm) => {
    setFormData(prev => {
      const exists = prev.specificPermissions.includes(perm);
      return {
        ...prev,
        specificPermissions: exists ? prev.specificPermissions.filter(p => p !== perm) : [...prev.specificPermissions, perm]
      };
    });
  };

  const togglePermissionMatrix = (moduleName, actionName) => {
    setFormData(prev => ({
      ...prev,
      permissionsMatrix: {
        ...prev.permissionsMatrix,
        [moduleName]: {
          ...prev.permissionsMatrix?.[moduleName],
          [actionName]: !prev.permissionsMatrix?.[moduleName]?.[actionName]
        }
      }
    }));
  };

  const filteredUsers = users.filter(u => {
    const term = searchTerm.toLowerCase();
    const nameMatch = u.name ? u.name.toLowerCase().includes(term) : false;
    const emailMatch = u.email ? u.email.toLowerCase().includes(term) : false;
    return nameMatch || emailMatch;
  });

  return (
    <div className="flex flex-col gap-6 relative max-w-7xl mx-auto font-sans">
      
      {/* Header Area */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage users, roles, departments, and system access control.</p>
        </div>
        <div className="flex gap-3">
          <PrimaryButton onClick={() => { resetForm(); setIsModalOpen(true); }} className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" /> New User
          </PrimaryButton>
        </div>
      </div>

      {/* Toolbar (Search & Filters) */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search users by name, email, or role..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <button 
          onClick={fetchUsersData}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh List
        </button>
      </div>

      {/* Users Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="p-4">User Details</th>
                <th className="p-4">Role & Access</th>
                <th className="p-4">Department</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">Loading users from backend...</td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="User avatar" className="w-9 h-9 rounded-full object-cover border border-slate-200" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                            {typeof user.full_name === 'string' && user.full_name ? user.full_name.charAt(0).toUpperCase() : (typeof user.name === 'string' && user.name ? user.name.charAt(0).toUpperCase() : 'U')}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-gray-900">
                            {typeof user.full_name === 'string' ? user.full_name : (typeof user.name === 'string' ? user.name : 'User')}
                          </div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        <Shield className="w-3 h-3" />
                        {typeof user.role === 'object' && user.role !== null ? (user.role.name || 'Viewer') : (typeof user.role === 'string' ? user.role : 'Viewer')}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 font-medium">
                      {typeof user.department === 'object' && user.department !== null ? (user.department.name || 'General') : (typeof user.department === 'string' ? user.department : 'General')}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        user.is_active !== false ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.is_active !== false ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                        {user.is_active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    No users found in database. Click <b>+ New User</b> to add a user.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3-STEP CREATE NEW USER MODAL WIZARD */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className={`bg-white rounded-2xl shadow-2xl ${currentStep === 3 ? 'max-w-5xl' : 'max-w-2xl'} w-full p-6 md:p-8 border border-gray-200 overflow-hidden relative transition-all duration-300`}>
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <UserPlus className="w-6 h-6 text-blue-600" />
                  Create New User
                </h3>
                <p className="text-xs text-gray-500 mt-1">Configure profile details, employment info, and role permissions.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Progress Indicator */}
            <div className="flex items-center justify-between mb-8 px-2">
              {/* Step 1 Indicator */}
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  currentStep === 1 ? 'bg-blue-600 text-white ring-4 ring-blue-100' :
                  currentStep > 1 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > 1 ? <Check className="w-4 h-4" /> : '1'}
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-bold text-gray-900">Step 1</p>
                  <p className="text-[11px] text-gray-500 font-medium">Basic Details</p>
                </div>
              </div>

              <div className={`flex-1 h-0.5 mx-3 ${currentStep > 1 ? 'bg-emerald-500' : 'bg-gray-200'}`} />

              {/* Step 2 Indicator */}
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  currentStep === 2 ? 'bg-blue-600 text-white ring-4 ring-blue-100' :
                  currentStep > 2 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > 2 ? <Check className="w-4 h-4" /> : '2'}
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-bold text-gray-900">Step 2</p>
                  <p className="text-[11px] text-gray-500 font-medium">Employment Details</p>
                </div>
              </div>

              <div className={`flex-1 h-0.5 mx-3 ${currentStep > 2 ? 'bg-emerald-500' : 'bg-gray-200'}`} />

              {/* Step 3 Indicator */}
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  currentStep === 3 ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-gray-200 text-gray-600'
                }`}>
                  3
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-bold text-gray-900">Step 3</p>
                  <p className="text-[11px] text-gray-500 font-medium">Role & Permissions</p>
                </div>
              </div>
            </div>

            {/* STEP 1 FORM — BASIC DETAILS */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Jane Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="email" 
                        required
                        placeholder="jane@acme.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="tel" 
                        placeholder="+1 (555) 019-2834"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Employee ID</label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text" 
                        placeholder="EMP-2026-089"
                        value={formData.employeeId}
                        onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Profile Photo Upload</label>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center overflow-hidden shrink-0">
                      {formData.avatarUrl ? (
                        <img src={formData.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <label className="flex-1 flex items-center justify-center gap-2 border border-dashed border-gray-300 rounded-lg px-4 py-2 text-sm text-slate-600 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
                      <Upload className="w-4 h-4 text-slate-500" />
                      <span>{formData.avatarUrl ? "Change Photo File" : "Upload Document / Image"}</span>
                      <input 
                        type="file"
                        accept="image/*,.pdf,.doc,.docx"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files && e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setFormData({ ...formData, avatarUrl: reader.result });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 FORM — EMPLOYMENT DETAILS */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Designation / Job Title <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Senior Legal Counsel"
                        value={formData.designation}
                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Department <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <select 
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="Legal Operations">Legal Operations</option>
                        <option value="Sales & Commercial">Sales & Commercial</option>
                        <option value="Finance & Procurement">Finance & Procurement</option>
                        <option value="Software Engineering">Software Engineering</option>
                        <option value="Human Resources (HR)">Human Resources (HR)</option>
                        <option value="Executive Management">Executive Management</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Employee Type</label>
                    <select 
                      value={formData.employeeType}
                      onChange={(e) => setFormData({ ...formData, employeeType: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="Full-Time">Full-Time Employee</option>
                      <option value="Part-Time">Part-Time Employee</option>
                      <option value="Contractor">Contractor / Consultant</option>
                      <option value="Intern">Intern / Trainee</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Joining Date</label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="date" 
                        value={formData.joiningDate}
                        onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Reporting Manager</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Elena Rostova (General Counsel)"
                      value={formData.reportingManager}
                      onChange={(e) => setFormData({ ...formData, reportingManager: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Work Location</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text" 
                        placeholder="e.g. New York HQ / Remote"
                        value={formData.workLocation}
                        onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3 FORM — ROLE & PERMISSIONS MATRIX */}
            {currentStep === 3 && (
              <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Role <span className="text-rose-500">*</span>
                    </label>
                    <select 
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Contract Manager">Contract Manager</option>
                      <option value="Legal Counsel">Legal Counsel</option>
                      <option value="Approver">Approver</option>
                      <option value="Requester">Requester</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Permission Level</label>
                    <select 
                      value={formData.permissionLevel}
                      onChange={(e) => setFormData({ ...formData, permissionLevel: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="Full Admin">Full Admin</option>
                      <option value="Standard Edit">Standard Edit</option>
                      <option value="Read-Only">Read-Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Approval Authority Limit</label>
                    <input 
                      type="text" 
                      placeholder="e.g. $100,000 / Unlimited"
                      value={formData.approvalAuthority}
                      onChange={(e) => setFormData({ ...formData, approvalAuthority: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                {/* PERMISSION MATRIX BOX MATCHING SCREENSHOT */}
                <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
                    <h4 className="text-sm font-bold text-slate-800">Permission Matrix</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Configure which actions this role can perform across different modules.</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-slate-50/70 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-4 font-bold text-slate-700 min-w-[120px] border-r border-slate-100">
                            Module
                          </th>
                          {ACTIONS.map((act) => (
                            <th key={act} className="px-2 py-4 font-medium text-center h-20 align-bottom whitespace-nowrap min-w-[50px]">
                              <span className="inline-block transform -rotate-45 origin-bottom-left text-[11px] font-semibold text-slate-600">
                                {act}
                              </span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {MODULES.map((mod, idx) => (
                          <tr key={mod} className={`hover:bg-blue-50/20 transition-colors ${idx % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'}`}>
                            <td className="px-4 py-3.5 font-bold text-slate-800 border-r border-slate-100">
                              {mod}
                            </td>
                            {ACTIONS.map((act) => {
                              const isChecked = formData.permissionsMatrix?.[mod]?.[act] || false;
                              return (
                                <td key={act} className="px-2 py-3.5 text-center">
                                  <input 
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => togglePermissionMatrix(mod, act)}
                                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                                  />
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Controls Footer */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-100 mt-6">
              {currentStep > 1 ? (
                <button 
                  type="button" 
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              ) : (
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              )}

              {currentStep < 3 ? (
                <PrimaryButton 
                  onClick={() => {
                    if (currentStep === 1 && (!formData.name || !formData.email)) {
                      alert("Please enter Full Name and Email Address.");
                      return;
                    }
                    if (currentStep === 2 && !formData.designation) {
                      alert("Please enter Designation / Job Title.");
                      return;
                    }
                    setCurrentStep(prev => prev + 1);
                  }}
                  className="flex items-center gap-1.5"
                >
                  Next Step <ArrowRight className="w-4 h-4" />
                </PrimaryButton>
              ) : (
                <PrimaryButton onClick={handleCreateUserSubmit} disabled={creating} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  {creating ? 'Creating User...' : 'Complete User Creation'}
                </PrimaryButton>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
