"use client";

import React, { useState, useEffect, use } from "react";
import axios from "axios";
import { ArrowLeft, Clock, Save, FileText, Activity, AlertTriangle, Paperclip, Send, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useAppContext } from "@/context/appContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ApproverDependencyPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const dependencyId = params?.id || "1";

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAppContext();

  // Form State
  const [feasibility, setFeasibility] = useState("");
  const [feasibilityNotes, setFeasibilityNotes] = useState("");
  const [resourceBreakdown, setResourceBreakdown] = useState([]);
  const [assumptions, setAssumptions] = useState("");

  const fetchDependency = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/dependencies/${dependencyId}`);
      setData(res.data);
      
      const dep = res.data.dependency;
      if (dep) {
        setFeasibility(dep.feasibility || "");
        setFeasibilityNotes(dep.feasibility_notes || "");
        setResourceBreakdown(dep.resource_breakdown || []);
        setAssumptions(dep.assumptions || "");
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 404) {
        alert("Dependency not found or you do not have permission.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDependency();
  }, [dependencyId]);

  const addResourceRow = () => {
    setResourceBreakdown([...resourceBreakdown, { role: "", hours: 0, count: 1, timeline: "", rate: 0, cost: 0 }]);
  };

  const updateResourceRow = (index, field, value) => {
    const newRows = [...resourceBreakdown];
    newRows[index][field] = value;
    if (field === 'hours' || field === 'rate') {
      newRows[index].cost = (Number(newRows[index].hours) || 0) * (Number(newRows[index].rate) || 0);
    }
    setResourceBreakdown(newRows);
  };

  const handleApplyAI = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/v1/dependencies/${dependencyId}/ai-estimate`);
      if (res.data.estimates) {
        setResourceBreakdown(res.data.estimates);
      }
    } catch (err) {
      console.error("AI estimation failed", err);
    }
  };

  const handleSubmit = async (action) => {
    setIsSubmitting(true);
    
    const totalHours = resourceBreakdown.reduce((sum, r) => sum + Number(r.hours), 0);
    const totalCost = resourceBreakdown.reduce((sum, r) => sum + Number(r.cost), 0);
    
    const payload = {
      feasibility,
      feasibility_notes: feasibilityNotes,
      resource_breakdown: resourceBreakdown,
      total_hours: totalHours,
      total_cost: totalCost,
      assumptions,
      status: action === "save" ? "In Progress" : "Submitted"
    };

    try {
      await axios.patch(`${API_BASE_URL}/api/v1/dependencies/${dependencyId}/submit`, payload);
      alert(`Dependency ${action === "save" ? "saved" : "submitted"} successfully!`);
      await fetchDependency();
    } catch (err) {
      console.error(err);
      alert("Failed to submit dependency.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 font-sans text-slate-700">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold">Loading Dependency #{dependencyId}...</p>
      </div>
    );
  }

  if (!data) return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 font-sans text-slate-700">
      <p className="text-sm font-bold text-gray-500">Not Found</p>
    </div>
  );

  const { dependency: dep, brief } = data;
  const reqInputs = dep.required_inputs || { hours_estimate: true, costing: true, feasibility_note: true };

  return (
    <div className="w-full max-w-full font-sans text-slate-800 space-y-6 flex-1 flex flex-col">
      
      {/* Top Banner / Header Card */}
      <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-2xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/requests" className="p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-px h-8 bg-slate-200" />
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Dependency Response <span className="text-emerald-600">#{dep.id}</span>
            </h1>
            <p className="text-xs font-medium text-slate-500 mt-0.5">Assignee: <span className="font-bold text-slate-700">{dep.assignee_name || "Department Lead"}</span> • Status: <span className="font-bold text-emerald-700">{dep.status || "Pending"}</span></p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => handleSubmit("save")}
            disabled={isSubmitting || dep.status === "Submitted"}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2 shadow-2xs"
          >
            <Save className="w-3.5 h-3.5" /> Save Progress
          </button>
          <button 
            onClick={() => handleSubmit("submit")}
            disabled={isSubmitting || dep.status === "Submitted"}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs disabled:opacity-50 flex items-center gap-2"
          >
            <Send className="w-3.5 h-3.5" /> Submit Response
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">

        
        {/* Left Panel: Context Brief */}
        <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl overflow-y-auto flex flex-col shadow-2xs">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-sm font-extrabold text-slate-900 mb-1 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" /> Contract Brief
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">Read-only context from the main request to inform your estimation.</p>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Client / Entity</span>
              <p className="text-sm font-semibold text-slate-900">{brief.client_name || "Unknown"}</p>
            </div>
            
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Contract Request Title</span>
              <p className="text-sm font-semibold text-slate-900">{brief.title}</p>
            </div>
            
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Scope Summary</span>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-700 leading-relaxed">
                {brief.description || "No description provided."}
              </div>
            </div>

            {brief.deliverables && brief.deliverables.length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Deliverables</span>
                <ul className="list-disc pl-4 space-y-1">
                  {brief.deliverables.map((d, i) => (
                    <li key={i} className="text-sm text-slate-700">{d}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="pt-4 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3">CM Task Objective</span>
              <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                <p className="text-sm text-blue-900 font-medium">{dep.task_objective}</p>
                <div className="mt-3 flex items-center gap-2 text-xs font-bold text-blue-700">
                  <Clock className="w-4 h-4" /> SLA Deadline: {new Date(dep.sla_deadline).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Response Form */}
        <div className="lg:col-span-8 space-y-6">

          {dep.status === "Submitted" && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-sm font-bold text-emerald-900">Response Submitted</p>
                <p className="text-xs text-emerald-700">This dependency has been submitted to the Contract Manager and is now read-only.</p>
              </div>
            </div>
          )}

          <div className="max-w-3xl mx-auto space-y-8 pb-20">
            
            {/* 1. Feasibility Segmented Control */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" /> 1. Feasibility Assessment
              </h3>
              <div className="flex bg-gray-100 p-1 rounded-xl">
                {['Feasible', 'Feasible with Risks', 'Not Feasible'].map(opt => (
                  <button
                    key={opt}
                    type="button"
                    disabled={dep.status === "Submitted"}
                    onClick={() => setFeasibility(opt)}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                      feasibility === opt 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              
              {reqInputs.feasibility_note && (feasibility === 'Feasible with Risks' || feasibility === 'Not Feasible') && (
                <div className="mt-4 animate-in slide-in-from-top-2">
                  <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Risk Notes / Justification
                  </label>
                  <textarea 
                    value={feasibilityNotes}
                    onChange={e => setFeasibilityNotes(e.target.value)}
                    disabled={dep.status === "Submitted"}
                    placeholder="Explain the risks or blockers..."
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none min-h-[100px]"
                  />
                </div>
              )}
            </div>

            {/* 2. Effort & Cost Table */}
            {(reqInputs.hours_estimate || reqInputs.costing) && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-600" /> 2. Effort & Resource Estimation
                  </h3>
                  <button 
                    type="button"
                    onClick={handleApplyAI}
                    disabled={dep.status === "Submitted"}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    ✨ Apply AI Baseline
                  </button>
                </div>

                <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase">
                      <tr>
                        <th className="p-3 w-1/3">Role / Title</th>
                        {reqInputs.resource_count && <th className="p-3 w-20 text-center">Count</th>}
                        {reqInputs.hours_estimate && <th className="p-3 w-24">Hours (Ea)</th>}
                        {reqInputs.costing && <th className="p-3 w-28">Rate ($)</th>}
                        {reqInputs.costing && <th className="p-3 text-right">Total Cost</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {resourceBreakdown.map((row, idx) => (
                        <tr key={idx} className="bg-white hover:bg-gray-50/50">
                          <td className="p-3">
                            <input 
                              type="text" 
                              value={row.role} 
                              onChange={e => updateResourceRow(idx, 'role', e.target.value)}
                              disabled={dep.status === "Submitted"}
                              placeholder="e.g. Senior Eng" 
                              className="w-full bg-transparent border-0 p-0 text-sm focus:ring-0 text-gray-900 placeholder:text-gray-400"
                            />
                          </td>
                          {reqInputs.resource_count && (
                            <td className="p-3">
                              <input 
                                type="number" 
                                value={row.count} 
                                onChange={e => updateResourceRow(idx, 'count', e.target.value)}
                                disabled={dep.status === "Submitted"}
                                className="w-full text-center bg-transparent border-0 p-0 text-sm focus:ring-0 text-gray-900"
                              />
                            </td>
                          )}
                          {reqInputs.hours_estimate && (
                            <td className="p-3">
                              <input 
                                type="number" 
                                value={row.hours} 
                                onChange={e => updateResourceRow(idx, 'hours', e.target.value)}
                                disabled={dep.status === "Submitted"}
                                className="w-full bg-transparent border-0 p-0 text-sm focus:ring-0 text-gray-900"
                              />
                            </td>
                          )}
                          {reqInputs.costing && (
                            <td className="p-3">
                              <div className="flex items-center text-sm text-gray-500">
                                $<input 
                                  type="number" 
                                  value={row.rate} 
                                  onChange={e => updateResourceRow(idx, 'rate', e.target.value)}
                                  disabled={dep.status === "Submitted"}
                                  className="w-full bg-transparent border-0 p-0 pl-1 text-sm focus:ring-0 text-gray-900"
                                />
                              </div>
                            </td>
                          )}
                          {reqInputs.costing && (
                            <td className="p-3 text-right text-sm font-bold text-gray-700">
                              ${row.cost?.toLocaleString() || 0}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {dep.status !== "Submitted" && (
                    <button 
                      type="button" 
                      onClick={addResourceRow}
                      className="w-full p-3 text-xs font-bold text-gray-500 hover:text-emerald-600 hover:bg-emerald-50/50 transition-colors border-t border-gray-100 flex items-center justify-center gap-2"
                    >
                      + Add Row
                    </button>
                  )}
                </div>

                <div className="flex justify-end gap-6 text-sm">
                  {reqInputs.hours_estimate && (
                    <div><span className="text-gray-500">Total Hours:</span> <span className="font-bold text-gray-900">{resourceBreakdown.reduce((s, r) => s + Number(r.hours), 0)}</span></div>
                  )}
                  {reqInputs.costing && (
                    <div><span className="text-gray-500">Total Cost:</span> <span className="font-bold text-gray-900">${resourceBreakdown.reduce((s, r) => s + Number(r.cost), 0).toLocaleString()}</span></div>
                  )}
                </div>
              </div>
            )}

            {/* 3. Assumptions & Prerequisites */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-emerald-600" /> 3. Assumptions & Prerequisites
              </h3>
              <textarea 
                value={assumptions}
                onChange={e => setAssumptions(e.target.value)}
                disabled={dep.status === "Submitted"}
                placeholder="List any dependencies or assumptions this estimate relies on..."
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none min-h-[120px]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
