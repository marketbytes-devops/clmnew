"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Users, Mail, Phone, Building2, Briefcase, ChevronLeft, Calendar, FileText, 
  Settings, ShieldCheck, DollarSign, RefreshCw, UserPlus, Search, Check, X, Plus, Trash2, Shield
} from 'lucide-react';
import Link from 'next/link';
import PrimaryButton from '../../../../common/buttons/PrimaryButton';
import { APIService } from '../../../../service/apiService';
import { useAppContext } from '../../../../context/appContext';

export default function DepartmentDetails() {
  const params = useParams();
  const { 
    users, 
    saveUsersLocally, 
    departments: contextDepartments, 
    saveDepartmentsLocally, 
    MOCK_USERS 
  } = useAppContext();

  const [department, setDepartment] = useState(null);
  const [allRegisteredUsers, setAllRegisteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('members');

  // Modal State for adding registered users
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [assigning, setAssigning] = useState(false);

  const fetchDepartmentDetail = async () => {
    setLoading(true);
    try {
      const [deptsData, usersData] = await Promise.all([
        APIService.getDepartments().catch(() => []),
        APIService.getAllUsers().catch(() => [])
      ]);
      
      const allDeptsMap = new Map();
      (deptsData || []).forEach(d => { if (d && (d.id || d.name)) allDeptsMap.set(String(d.id || d.name), d); });
      (contextDepartments || []).forEach(d => { if (d && (d.id || d.name)) allDeptsMap.set(String(d.id || d.name), d); });
      if (typeof window !== 'undefined') {
        const storedDepts = localStorage.getItem('clm_custom_departments');
        if (storedDepts) {
          try {
            JSON.parse(storedDepts).forEach(d => {
              if (d && (d.id || d.name)) allDeptsMap.set(String(d.id || d.name), d);
            });
          } catch (e) {}
        }
      }
      const allDepts = Array.from(allDeptsMap.values());

      const allUsersMap = new Map();
      (MOCK_USERS || []).forEach(u => { if (u && (u.id || u.email)) allUsersMap.set(String(u.id || u.email), u); });
      (usersData || []).forEach(u => { if (u && (u.id || u.email)) allUsersMap.set(String(u.id || u.email), u); });
      (users || []).forEach(u => { if (u && (u.id || u.email)) allUsersMap.set(String(u.id || u.email), u); });
      if (typeof window !== 'undefined') {
        const storedUsers = localStorage.getItem('clm_custom_users');
        if (storedUsers) {
          try {
            JSON.parse(storedUsers).forEach(u => {
              if (u && (u.id || u.email)) allUsersMap.set(String(u.id || u.email), u);
            });
          } catch (e) {}
        }
      }
      const allUsersList = Array.from(allUsersMap.values());
      setAllRegisteredUsers(allUsersList);

      const rawParam = params.id ? decodeURIComponent(params.id) : '';
      const rawParamLower = rawParam.trim().toLowerCase();

      const found = allDepts.find(d => 
        String(d.id) === String(rawParam) || 
        (d.name || '').trim().toLowerCase() === rawParamLower ||
        (d.code || '').trim().toLowerCase() === rawParamLower
      );

      const targetDept = found || {
        id: rawParam,
        name: rawParam ? rawParam.charAt(0).toUpperCase() + rawParam.slice(1) : `Department #${rawParam}`,
        head: 'Unassigned',
        budgetAllocated: 0,
        slaCompliance: 100,
        description: 'Department details configured via CLM Admin.',
        members: []
      };

      const deptNameLower = String(targetDept.name || '').trim().toLowerCase();
      const deptCodeLower = String(targetDept.code || '').trim().toLowerCase();
      
      // Match all registered users belonging to this department name or code
      const matchingUsers = allUsersList.filter(u => {
        if (!u) return false;
        let uDeptStr = '';
        if (typeof u.department === 'string') {
          uDeptStr = u.department;
        } else if (typeof u.department === 'object' && u.department !== null) {
          uDeptStr = u.department.name || u.department.code || u.department.title || u.department.label || '';
        }
        uDeptStr = String(uDeptStr || '').trim().toLowerCase();
        if (!uDeptStr) return false;

        return (
          uDeptStr === deptNameLower ||
          (deptCodeLower && uDeptStr === deptCodeLower) ||
          (rawParamLower && uDeptStr === rawParamLower) ||
          (deptNameLower && deptNameLower.includes(uDeptStr)) ||
          (uDeptStr && uDeptStr.includes(deptNameLower))
        );
      }).map(u => ({
        id: u.id || u.email,
        name: u.full_name || u.name || u.email,
        email: u.email,
        role: typeof u.role === 'object' && u.role !== null ? u.role.name : (u.role || 'Member'),
        designation: u.designation || u.title || 'Team Member'
      }));

      // Combine explicitly array members with matching users
      const membersMap = new Map();
      (Array.isArray(targetDept.members) ? targetDept.members : []).forEach(m => {
        if (m && (m.id || m.email)) membersMap.set(String(m.id || m.email), m);
      });
      matchingUsers.forEach(m => {
        if (m && (m.id || m.email)) membersMap.set(String(m.id || m.email), m);
      });

      setDepartment({
        ...targetDept,
        members: Array.from(membersMap.values())
      });
    } catch (err) {
      console.error("Failed to fetch department detail", err);
      setDepartment(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartmentDetail();
  }, [params.id, users, contextDepartments]);

  const toggleUserSelection = (userId) => {
    setSelectedUserIds(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleAssignSelectedUsers = async () => {
    if (selectedUserIds.length === 0) return;
    setAssigning(true);
    try {
      const selectedUsersList = allRegisteredUsers.filter(u => 
        selectedUserIds.includes(String(u.id || u.email))
      );

      // 1. Update matching users' department attribute in localStorage
      const updatedUsersList = users.map(u => {
        if (selectedUserIds.includes(String(u.id || u.email))) {
          return {
            ...u,
            department: department.name
          };
        }
        return u;
      });

      // Add any selected users from MOCK_USERS not yet in users
      selectedUsersList.forEach(su => {
        const key = String(su.id || su.email);
        if (!updatedUsersList.some(u => String(u.id || u.email) === key)) {
          updatedUsersList.push({
            ...su,
            department: department.name
          });
        }
      });

      saveUsersLocally(updatedUsersList);

      // 2. Add users to department.members array and update department state & context
      const newMembers = selectedUsersList.map(u => ({
        id: u.id || u.email,
        name: u.full_name || u.name || u.email,
        email: u.email,
        role: typeof u.role === 'object' && u.role !== null ? u.role.name : (u.role || 'Member'),
        designation: u.designation || u.title || 'Team Member'
      }));

      const existingMembersMap = new Map();
      (department.members || []).forEach(m => {
        if (m && (m.id || m.email)) existingMembersMap.set(String(m.id || m.email), m);
      });
      newMembers.forEach(m => {
        if (m && (m.id || m.email)) existingMembersMap.set(String(m.id || m.email), m);
      });

      const updatedMembersList = Array.from(existingMembersMap.values());

      const updatedDeptObj = {
        ...department,
        members: updatedMembersList,
        membersCount: updatedMembersList.length
      };

      setDepartment(updatedDeptObj);

      const updatedDeptsList = contextDepartments.map(d => {
        if (String(d.id) === String(department.id) || (d.name || '').toLowerCase() === (department.name || '').toLowerCase()) {
          return updatedDeptObj;
        }
        return d;
      });
      if (!updatedDeptsList.some(d => String(d.id) === String(department.id))) {
        updatedDeptsList.push(updatedDeptObj);
      }
      saveDepartmentsLocally(updatedDeptsList);

      setIsAddMemberModalOpen(false);
      setSelectedUserIds([]);
    } catch (err) {
      console.error("Error assigning users to department", err);
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassignMember = (memberId) => {
    if (!confirm("Are you sure you want to remove this member from the department?")) return;
    
    const key = String(memberId);
    const updatedMembers = (department.members || []).filter(m => String(m.id || m.email) !== key);
    
    const updatedDeptObj = {
      ...department,
      members: updatedMembers,
      membersCount: updatedMembers.length
    };
    setDepartment(updatedDeptObj);

    // Update in context & localStorage
    const updatedDeptsList = contextDepartments.map(d => {
      if (String(d.id) === String(department.id) || (d.name || '').toLowerCase() === (department.name || '').toLowerCase()) {
        return updatedDeptObj;
      }
      return d;
    });
    saveDepartmentsLocally(updatedDeptsList);
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading department details from backend...</div>;
  }

  if (!department) {
    return (
      <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-gray-200">
        Department record not found in backend database.
      </div>
    );
  }

  // Filter users inside Add Member Modal
  const availableToAssignUsers = allRegisteredUsers.filter(u => {
    const key = String(u.id || u.email);
    const term = memberSearchTerm.toLowerCase();
    const userName = (u.full_name || u.name || u.email || '').toLowerCase();
    const userEmail = (u.email || '').toLowerCase();
    const matchesSearch = userName.includes(term) || userEmail.includes(term);
    return matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6 relative font-sans">
      
      {/* Navigation Breadcrumb */}
      <div>
        <Link href="/admin/departments" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Departments
        </Link>
      </div>

      {/* Header Area */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{department.name}</h1>
            <p className="text-gray-500 mt-1 text-sm">{department.description || 'Department configured in backend database.'}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
          <div className="text-right">
            <span className="text-xs text-gray-400 font-semibold block uppercase">Department Head</span>
            <p className="text-base font-bold text-gray-900">{department.head || 'Unassigned'}</p>
          </div>
          <div className="h-8 w-px bg-gray-200"></div>
          <div className="text-right">
            <span className="text-xs text-gray-400 font-semibold block uppercase">Annual Budget</span>
            <p className="text-base font-bold text-emerald-600">${department.budgetAllocated ? department.budgetAllocated.toLocaleString() : '0'}</p>
          </div>
        </div>
      </div>

      {/* Detail Content Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col gap-6">
        
        {/* Tab Toolbar Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('members')}
              className={`text-sm font-bold pb-1 border-b-2 transition-colors ${
                activeTab === 'members' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              Department Members ({department.members ? department.members.length : 0})
            </button>
          </div>

          <PrimaryButton 
            onClick={() => { setSelectedUserIds([]); setIsAddMemberModalOpen(true); }}
            className="flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" /> Add Registered Users
          </PrimaryButton>
        </div>

        {/* Tab 1 — Department Members Grid */}
        {activeTab === 'members' && (
          <div className="flex flex-col gap-4">
            {department.members && department.members.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {department.members.map((member) => (
                  <div key={member.id || member.email} className="p-5 rounded-xl border border-gray-200 bg-slate-50/70 hover:bg-white hover:border-blue-300 hover:shadow-xs transition-all flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center border border-blue-200 shrink-0">
                        {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 text-sm">{member.name}</span>
                        <span className="text-xs text-slate-500 font-medium">{member.designation || member.role || 'Member'}</span>
                        <span className="text-xs text-blue-600 font-semibold mt-0.5">{member.email}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleUnassignMember(member.id || member.email)}
                      className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Remove from Department"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-gray-400 border border-dashed border-gray-200 rounded-xl space-y-3">
                <Users className="w-10 h-10 text-slate-300 mx-auto" />
                <div>
                  <p className="text-sm font-semibold text-slate-600">No individual team members assigned to this department yet.</p>
                  <p className="text-xs text-slate-400 mt-1">Click <b>+ Add Registered Users</b> to select registered employees from the system.</p>
                </div>
                <PrimaryButton 
                  onClick={() => { setSelectedUserIds([]); setIsAddMemberModalOpen(true); }}
                  className="inline-flex items-center gap-2 text-xs"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Add Registered Users
                </PrimaryButton>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL TO ADD REGISTERED USERS TO DEPARTMENT */}
      {isAddMemberModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-200 overflow-hidden relative">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-blue-600" />
                  Add Registered Users to {department.name}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Select employees registered in the system to assign to this department.</p>
              </div>
              <button 
                onClick={() => setIsAddMemberModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search Toolbar */}
            <div className="p-4 border-b border-gray-100 bg-white">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search registered users by name or email..."
                  value={memberSearchTerm}
                  onChange={(e) => setMemberSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Registered Users Selection List */}
            <div className="p-4 max-h-80 overflow-y-auto divide-y divide-gray-100 space-y-1">
              {availableToAssignUsers.length > 0 ? (
                availableToAssignUsers.map((user) => {
                  const key = String(user.id || user.email);
                  const isAlreadyInDept = (department.members || []).some(m => String(m.id || m.email) === key);
                  const isSelected = selectedUserIds.includes(key);
                  const userName = user.full_name || user.name || user.email;
                  const currentDeptName = typeof user.department === 'object' && user.department !== null ? user.department.name : user.department;

                  return (
                    <div 
                      key={key}
                      onClick={() => !isAlreadyInDept && toggleUserSelection(key)}
                      className={`p-3 rounded-xl flex items-center justify-between transition-colors ${
                        isAlreadyInDept 
                          ? 'bg-slate-50 opacity-60 cursor-not-allowed' 
                          : isSelected 
                            ? 'bg-blue-50 border border-blue-200 text-blue-900 cursor-pointer' 
                            : 'hover:bg-slate-50 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">{userName}</p>
                          <p className="text-[11px] text-gray-500">{user.email}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                              {user.title || user.designation || 'Employee'}
                            </span>
                            {currentDeptName && (
                              <span className="text-[10px] text-blue-600 font-medium">
                                Current Dept: {currentDeptName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        {isAlreadyInDept ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                            Already Member
                          </span>
                        ) : (
                          <input 
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // Handled by div click
                            className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                          />
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-xs text-gray-400">
                  No registered users found matching "{memberSearchTerm}".
                </div>
              )}
            </div>

            {/* Modal Controls Footer */}
            <div className="p-4 bg-slate-50 border-t border-gray-100 flex justify-between items-center">
              <span className="text-xs text-gray-500 font-medium">
                {selectedUserIds.length} user(s) selected
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddMemberModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>

                <PrimaryButton 
                  onClick={handleAssignSelectedUsers}
                  disabled={selectedUserIds.length === 0 || assigning}
                  className="flex items-center gap-1.5 text-xs"
                >
                  <Check className="w-4 h-4" />
                  {assigning ? 'Assigning...' : `Assign ${selectedUserIds.length} User(s)`}
                </PrimaryButton>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
