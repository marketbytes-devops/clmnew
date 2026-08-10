"use client";
import React, { useState, useEffect } from 'react';
import { Search, Plus, Building2, Users, FileText, ChevronRight, X, RefreshCw } from 'lucide-react';
import PrimaryButton from '../../../common/buttons/PrimaryButton';
import Link from 'next/link';
import { APIService } from '../../../service/api_service';

export default function DepartmentsList() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', head: '', budget: '' });
  const [creating, setCreating] = useState(false);

  const fetchDepartmentsData = async () => {
    setLoading(true);
    try {
      const data = await APIService.getDepartments();
      setDepartments(data || []);
    } catch (err) {
      console.error("Failed to fetch departments from backend", err);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartmentsData();
  }, []);

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const payload = {
        name: formData.name,
        head: formData.head || 'Unassigned',
        budgetAllocated: formData.budget ? parseFloat(formData.budget) : 0
      };
      await APIService.createDepartment(payload);
      setIsModalOpen(false);
      setFormData({ name: '', head: '', budget: '' });
      fetchDepartmentsData();
    } catch (err) {
      alert("Failed to create department");
    } finally {
      setCreating(false);
    }
  };

  const filteredDepartments = departments.filter(d => {
    const term = searchTerm.toLowerCase();
    return d.name ? d.name.toLowerCase().includes(term) : false;
  });

  return (
    <div className="flex flex-col gap-6 relative">
      
      {/* Header Area */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-500 mt-1 text-sm">Configure business units, workflows, budgets, and SLAs.</p>
        </div>
        <div className="flex gap-3">
          <PrimaryButton onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
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
          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
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
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    SLA: {dept.slaCompliance || 100}%
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-1">{dept.name}</h3>
                <p className="text-xs text-gray-500 mb-4">Department Head: <span className="font-semibold text-gray-700">{dept.head || 'Unassigned'}</span></p>

                <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div>
                    <span className="text-gray-400 block uppercase text-[10px]">Team Members</span>
                    <span className="font-bold text-gray-900 flex items-center gap-1 mt-0.5">
                      <Users className="w-3.5 h-3.5 text-gray-500" /> {dept.members || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block uppercase text-[10px]">Active Contracts</span>
                    <span className="font-bold text-gray-900 flex items-center gap-1 mt-0.5">
                      <FileText className="w-3.5 h-3.5 text-gray-500" /> {dept.activeContracts || 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between items-center text-xs">
                <span className="text-gray-500">Budget: <strong className="text-gray-900">${dept.budgetAllocated ? dept.budgetAllocated.toLocaleString() : '0'}</strong></span>
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

      {/* Create Department Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Create New Department</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateDepartment} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Department Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Procurement"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Department Head</label>
                <input 
                  type="text" 
                  placeholder="e.g. Jane Doe"
                  value={formData.head}
                  onChange={(e) => setFormData({ ...formData, head: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Annual Budget Allocated ($ USD)</label>
                <input 
                  type="number" 
                  placeholder="150000"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
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
                  {creating ? 'Creating...' : 'Create Department'}
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
