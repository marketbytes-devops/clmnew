import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Clock, AlertTriangle, CheckCircle2, RotateCcw, UserPlus, Send, FileText, Check, X } from 'lucide-react';
import AddDependencyModal from './AddDependencyModal';
import { useAppContext } from '@/context/appContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function DependenciesTab({ requestId }) {
  const [dependencies, setDependencies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requireSupport, setRequireSupport] = useState(true);

  // Selection & Dispatch state
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [dispatchNote, setDispatchNote] = useState('');
  const [proposalFile, setProposalFile] = useState('Standard_Service_Proposal_v1.docx');
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchSuccessMsg, setDispatchSuccessMsg] = useState('');

  const { user } = useAppContext();
  const isCM = true; // CM workspace context

  const fetchDependencies = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/dependencies/me`);
      const reqDeps = res.data.filter(d => d.request_id === parseInt(requestId));
      setDependencies(reqDeps);
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
    const res = await axios.post(`${API_BASE_URL}/api/v1/dependencies/`, dependencyData);
    setDependencies(prev => [...prev, res.data]);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(dependencies.map(d => d.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDispatchSubmit = async (e) => {
    e.preventDefault();
    if (selectedIds.length === 0) return;

    setIsDispatching(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/v1/dependencies/dispatch`, {
        dependency_ids: selectedIds,
        dispatch_note: dispatchNote,
        proposal_url: proposalFile
      });

      // Update local state statuses to 'Dispatched'
      setDependencies(prev => prev.map(dep => 
        selectedIds.includes(dep.id) ? { ...dep, status: 'Dispatched' } : dep
      ));

      setDispatchSuccessMsg(res.data?.message || `Successfully sent proposal draft to ${selectedIds.length} dependency leads!`);
      setIsDispatchModalOpen(false);
      setSelectedIds([]);
      setDispatchNote('');

      setTimeout(() => {
        setDispatchSuccessMsg('');
      }, 5000);
    } catch (err) {
      console.error(err);
      alert("Failed to dispatch proposal draft to selected dependencies.");
    } finally {
      setIsDispatching(false);
    }
  };

  const handleAction = (id, action) => {
    alert(`${action} triggered for Dependency #${id}`);
  };

  // Aggregation Logic
  const totalHours = dependencies.reduce((sum, dep) => sum + (dep.total_hours || 0), 0);
  const flaggedRisks = dependencies.filter(dep => dep.feasibility === 'Feasible with Risks' || dep.feasibility === 'Not Feasible').length;
  
  const getNormalizedValue = (dep) => {
    if (dep.status === 'Pending' || dep.status === 'Dispatched' || dep.status === 'In Progress') return '—';
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

  const selectedDependencies = dependencies.filter(d => selectedIds.includes(d.id));

  return (
    <div className="p-8 flex flex-col h-full">
      {/* Dispatch Success Alert Banner */}
      {dispatchSuccessMsg && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-bold flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{dispatchSuccessMsg}</span>
          </div>
          <button onClick={() => setDispatchSuccessMsg('')} className="text-emerald-600 hover:text-emerald-900 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-900">Contract Manager Dependency Operations</h2>
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
          <p className="text-xs text-gray-500 mt-1">Select required technical & operational dependencies, send contract drafts for evaluation, and gather effort/feasibility data.</p>
        </div>
        
        {isCM && (
          <div className="flex items-center gap-3 shrink-0">
            {selectedIds.length > 0 && (
              <button 
                onClick={() => setIsDispatchModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer animate-fadeIn"
              >
                <Send className="w-4 h-4" /> Send Proposal / Draft to Selected ({selectedIds.length})
              </button>
            )}

            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-bold shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Select & Add Dependency
            </button>
          </div>
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
              <th className="p-4 w-10 text-center">
                <input 
                  type="checkbox"
                  checked={dependencies.length > 0 && selectedIds.length === dependencies.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                  title="Select All Dependencies"
                />
              </th>
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
                <td colSpan="8" className="p-8 text-center text-gray-500">
                  No dependencies requested yet. Click "Add Dependency" to assign team tasks.
                </td>
              </tr>
            ) : (
              dependencies.map(dep => {
                const isSelected = selectedIds.includes(dep.id);
                return (
                  <tr key={dep.id} className={`transition-colors group ${isSelected ? 'bg-emerald-50/50' : 'hover:bg-gray-50'}`}>
                    <td className="p-4 text-center">
                      <input 
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(dep.id)}
                        className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                      />
                    </td>
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
                        dep.status === 'Dispatched' ? 'bg-purple-50 border-purple-200 text-purple-700' :
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
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex items-center justify-between">
        {selectedIds.length > 0 ? (
          <button 
            onClick={() => setIsDispatchModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" /> Send Proposal / Draft to Selected ({selectedIds.length})
          </button>
        ) : <div />}

        <button 
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow-sm transition-colors disabled:opacity-50"
          disabled={dependencies.length === 0 || !dependencies.every(d => d.status === 'Submitted' || d.status === 'Completed')}
        >
          Mark Dependencies Resolved → Proceed to Drafting
        </button>
      </div>

      {/* Add Dependency Modal */}
      <AddDependencyModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddDependency}
        requestId={requestId}
      />

      {/* Send Proposal / Draft Dispatch Modal */}
      {isDispatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Send Proposal / Draft to Dependencies</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Dispatch proposal draft & task brief to selected leads</p>
                </div>
              </div>
              <button onClick={() => setIsDispatchModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDispatchSubmit} className="p-6 space-y-5">
              {/* Selected Target Leads List */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                  Target Recipient Leads ({selectedDependencies.length})
                </label>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {selectedDependencies.map(dep => (
                    <div key={dep.id} className="flex items-center justify-between p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-xl text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-900">{dep.department}</span>
                        <span className="text-gray-400">•</span>
                        <span className="font-medium text-gray-700">{dep.assignee_name || "Approver Lead"}</span>
                      </div>
                      <span className="font-mono text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200 font-bold">
                        SLA: {dep.sla_deadline ? new Date(dep.sla_deadline).toLocaleDateString() : 'Active'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Proposal Document Link */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Attached Proposal / Draft Document
                </label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <FileText className="w-5 h-5 text-emerald-600 shrink-0" />
                  <input 
                    type="text"
                    value={proposalFile}
                    onChange={e => setProposalFile(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-gray-800 outline-none"
                    placeholder="Enter document name or file URL..."
                  />
                </div>
              </div>

              {/* Instructions / Notes */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Instructions / Cover Note for Dependency Leads
                </label>
                <textarea 
                  value={dispatchNote}
                  onChange={e => setDispatchNote(e.target.value)}
                  placeholder="e.g. Please review the attached contract proposal draft and provide your SLA effort estimate & risk feedback before Friday..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all min-h-[90px] resize-y"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsDispatchModalOpen(false)}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>

                <button 
                  type="submit"
                  disabled={isDispatching}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-2"
                >
                  {isDispatching ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Dispatching...</>
                  ) : (
                    <><Send className="w-4 h-4" /> Send Proposal Draft Now</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
