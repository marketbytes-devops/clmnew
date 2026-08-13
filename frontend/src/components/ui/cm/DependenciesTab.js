import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Clock, AlertTriangle, CheckCircle2, RotateCcw, UserPlus } from 'lucide-react';
import AddDependencyModal from './AddDependencyModal';
import { useAppContext } from '@/context/appContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function DependenciesTab({ requestId }) {
  const [dependencies, setDependencies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requireSupport, setRequireSupport] = useState(true);
  
  // Assuming a generic user logic for now
  const { user } = useAppContext();
  const isCM = true; // Hardcoded true for the CM view context

  const fetchDependencies = async () => {
    setIsLoading(true);
    try {
      // In a real app, we'd fetch dependencies specific to the request.
      // We'll mock hitting the /me endpoint or similar based on backend changes
      // Actually we can hit a new endpoint if we had one, but let's just fetch all and filter for now
      // since the backend we wrote didn't explicitly add GET /request/{id}/dependencies
      // For demonstration, let's assume we can fetch them.
      const res = await axios.get(`${API_BASE_URL}/api/v1/dependencies/me`);
      // Just showing all for the UI demo, or filtering locally
      setDependencies(res.data.filter(d => d.request_id === parseInt(requestId)));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, [requestId]);

  const handleAddDependency = async (dependencyData) => {
    // Actually hit the backend to create the dependency
    const res = await axios.post(`${API_BASE_URL}/api/v1/dependencies/`, dependencyData);
    setDependencies([...dependencies, res.data]);
  };

  const handleAction = (id, action) => {
    // Mocking action for reopen/reassign
    alert(`${action} triggered for Dependency #${id}`);
  };

  // Aggregation Logic
  const totalHours = dependencies.reduce((sum, dep) => sum + (dep.total_hours || 0), 0);
  const flaggedRisks = dependencies.filter(dep => dep.feasibility === 'Feasible with Risks' || dep.feasibility === 'Not Feasible').length;
  
  const getNormalizedValue = (dep) => {
    if (dep.status === 'Pending' || dep.status === 'In Progress') return '—';
    if (dep.total_hours && dep.total_cost) return `${dep.total_hours} hrs • $${dep.total_cost.toLocaleString()}`;
    if (dep.total_hours) return `${dep.total_hours} hrs`;
    if (dep.feasibility) return dep.feasibility;
    return 'Submitted';
  };

  if (!requireSupport) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-900">Pre-Drafting Dependencies</h2>
            <div className="h-6 w-px bg-gray-300" />
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={requireSupport} onChange={() => setRequireSupport(!requireSupport)} />
                <div className="block bg-gray-200 w-10 h-6 rounded-full"></div>
                <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
              </div>
              <span className="ml-3 text-sm font-medium text-gray-700">Require Support?</span>
            </label>
          </div>
        </div>
        <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
          <p>Dependency support is toggled off. Proceed to drafting.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 flex flex-col h-full">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-gray-900">Pre-Drafting Dependencies</h2>
          <div className="h-6 w-px bg-gray-300" />
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input type="checkbox" className="sr-only" checked={requireSupport} onChange={() => setRequireSupport(!requireSupport)} />
              <div className="block bg-emerald-500 w-10 h-6 rounded-full"></div>
              <div className="dot absolute right-1 top-1 bg-white w-4 h-4 rounded-full transition transform"></div>
            </div>
            <span className="ml-3 text-sm font-medium text-gray-700">Require Support?</span>
          </label>
        </div>
        
        {isCM && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-bold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Dependency
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Aggregated Effort</p>
            <p className="text-xl font-black text-gray-900">{totalHours > 0 ? `${totalHours} Hours` : '--'}</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Flagged Risks</p>
            <p className="text-xl font-black text-gray-900">{flaggedRisks} Issues</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Dependency Status</p>
            <p className="text-xl font-black text-gray-900">
              {dependencies.length > 0 && dependencies.every(d => d.status === 'Submitted' || d.status === 'Completed') ? "Ready" : "Blocking"}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
              <th className="p-4 font-bold">Department</th>
              <th className="p-4 font-bold">Assigned Approver</th>
              <th className="p-4 font-bold">Task Objective</th>
              <th className="p-4 font-bold">SLA Deadline</th>
              <th className="p-4 font-bold">Status</th>
              <th className="p-4 font-bold">Submitted Value</th>
              <th className="p-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-100 bg-white">
            {dependencies.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-gray-500">
                  No dependencies requested yet.
                </td>
              </tr>
            ) : (
              dependencies.map(dep => (
                <tr key={dep.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="p-4 font-semibold text-gray-900">{dep.department}</td>
                  <td className="p-4 text-gray-600 flex items-center gap-2">
                    <div className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold">
                      {dep.assignee_name?.charAt(0) || "A"}
                    </div>
                    {dep.assignee_name || "Unassigned"}
                  </td>
                  <td className="p-4 text-gray-600 max-w-[200px] truncate" title={dep.task_objective}>
                    {dep.task_objective}
                  </td>
                  <td className="p-4 text-gray-600">
                    {dep.sla_deadline ? new Date(dep.sla_deadline).toLocaleString() : 'N/A'}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
                      dep.status === 'Submitted' || dep.status === 'Completed' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                      dep.status === 'Pending' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                      dep.status === 'Reopened' ? 'bg-red-50 border-red-200 text-red-700' :
                      'bg-blue-50 border-blue-200 text-blue-700'
                    }`}>
                      {dep.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-700 font-medium">
                    {getNormalizedValue(dep)}
                  </td>
                  <td className="p-4 text-right">
                    {(dep.status === 'Submitted' || dep.status === 'Completed') && (
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleAction(dep.id, 'Reopen')}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors" 
                          title="Reopen"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleAction(dep.id, 'Reassign')}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" 
                          title="Reassign"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-end">
        <button 
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow-sm transition-colors disabled:opacity-50"
          disabled={dependencies.length === 0 || !dependencies.every(d => d.status === 'Submitted' || d.status === 'Completed')}
        >
          Mark Dependencies Resolved → Proceed to Drafting
        </button>
      </div>

      <AddDependencyModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddDependency}
        requestId={requestId}
      />
    </div>
  );
}
