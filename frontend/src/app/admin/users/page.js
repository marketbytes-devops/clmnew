"use client";
import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Upload, MoreVertical, Plus, UserPlus, Shield, X, RefreshCw, Trash2, Power } from 'lucide-react';
import PrimaryButton from '../../../common/buttons/PrimaryButton';
import { APIService } from '../../../service/api_service';

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'Viewer', department: 'Sales', password: 'password123' });
  const [creating, setCreating] = useState(false);

  const fetchUsersData = async () => {
    setLoading(true);
    try {
      const data = await APIService.getAllUsers();
      setUsers(data || []);
    } catch (err) {
      console.error("Failed to fetch users from backend", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersData();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        department: formData.department
      };
      await APIService.createUser(payload);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', role: 'Viewer', department: 'Sales', password: 'password123' });
      fetchUsersData();
    } catch (err) {
      alert("Failed to create user: " + err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await APIService.deleteUser(id);
      fetchUsersData();
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  const filteredUsers = users.filter(u => {
    const term = searchTerm.toLowerCase();
    const nameMatch = u.name ? u.name.toLowerCase().includes(term) : false;
    const emailMatch = u.email ? u.email.toLowerCase().includes(term) : false;
    return nameMatch || emailMatch;
  });

  return (
    <div className="flex flex-col gap-6 relative">
      
      {/* Header Area */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage users, roles, departments, and system access.</p>
        </div>
        <div className="flex gap-3">
          <PrimaryButton onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" /> New User
          </PrimaryButton>
        </div>
      </div>

      {/* Toolbar (Search & Filters) */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search users by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <button 
          onClick={fetchUsersData}
          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh List
        </button>
      </div>

      {/* Users Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
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
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{user.name || 'User'}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        <Shield className="w-3 h-3" />
                        {user.role || 'Viewer'}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">{user.department || 'General'}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.is_active !== false ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.is_active !== false ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                        {user.is_active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
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

      {/* Create User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Create New User</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Jane Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="jane@acme.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Role</label>
                <select 
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Admin">Admin</option>
                  <option value="Contract Manager">Contract Manager</option>
                  <option value="Approver">Approver</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Department</label>
                <select 
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Legal">Legal</option>
                  <option value="Sales">Sales</option>
                  <option value="Finance">Finance</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <PrimaryButton type="submit" disabled={creating}>
                  {creating ? 'Creating...' : 'Create User'}
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
