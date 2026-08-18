"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/api/api";
import { Clock, AlertTriangle, CheckCircle, Save, Send, BrainCircuit, Paperclip, ChevronRight, Check, ArrowLeft, X } from "lucide-react";
import ResourceMatrix from "@/components/dependency/ResourceMatrix";

export default function DependencyPortal() {
  const { token } = useParams();
  const router = useRouter();
  const [activeTask, setActiveTask] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [feasibility, setFeasibility] = useState("");
  const [feasibilityNotes, setFeasibilityNotes] = useState("");
  const [resources, setResources] = useState([]);
  const [assumptions, setAssumptions] = useState([""]);
  
  const [toast, setToast] = useState(null);
  
  // Clarification state
  const [showClarification, setShowClarification] = useState(false);
  const [clarificationText, setClarificationText] = useState("");

  const handleSendClarification = async () => {
    if (!clarificationText.trim()) return;
    try {
      setToast("Sending clarification request...");
      // For now, this is a mock implementation as the exact endpoint for RequestComment isn't fully wired for this path
      setTimeout(() => {
        setToast("Message sent to Contract Manager");
        setClarificationText("");
        setShowClarification(false);
        setTimeout(() => setToast(null), 3000);
      }, 800);
    } catch (e) {
      console.error(e);
      alert("Failed to send message");
    }
  };

  useEffect(() => {
    const fetchDependency = async () => {
      try {
        const response = await api.get(`/api/v1/dependencies/by-token/${token}`);
        if (response.status === 200) {
          const data = response.data;
          setActiveTask(data);
          
          if (data.dependency) {
            setFeasibility(data.dependency.feasibility || "");
            setFeasibilityNotes(data.dependency.feasibilityNotes || "");
            setResources(data.dependency.resourceBreakdown || []);
            setAssumptions(data.dependency.assumptions && data.dependency.assumptions.length > 0 && data.dependency.assumptions[0] !== "" ? data.dependency.assumptions : [
              "Client must provide existing brand guidelines and high-resolution logo assets prior to project kickoff.",
              "Design revisions are capped at a maximum of two rounds per major deliverable."
            ]);
          }
        }
      } catch (err) {
        if (err.response && err.response.status === 404) {
          alert("Task not found or access denied.");
        }
        console.error("Failed to load dependency detail", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchDependency();
  }, [token]);

  const handleSubmit = async () => {
    if (!feasibility) {
      alert("Please select a feasibility status.");
      return;
    }
    
    // Conditionally require feasibility notes
    if ((feasibility === "Feasible with Risks" || feasibility === "Not Feasible") && !feasibilityNotes.trim()) {
      alert("Risk Notes / Justification is required for the selected feasibility.");
      return;
    }

    const total_hours = resources.reduce((sum, r) => sum + (r.hours * r.count), 0);
    const total_cost = resources.reduce((sum, r) => sum + r.cost, 0);

    const payload = {
      feasibility,
      feasibility_notes: feasibilityNotes,
      resource_breakdown: resources,
      total_hours,
      total_cost,
      assumptions: assumptions.filter(a => a.trim() !== ""),
      status: "Completed"
    };

    try {
      setToast("Submitting dependency response...");
      
      const response = await api.patch(`/api/v1/dependencies/${dependency.id}/submit`, payload);
      
      if (response.status === 200) {
        setToast("Dependency response submitted successfully!");
        setActiveTask(prev => ({
          ...prev,
          dependency: {
            ...prev.dependency,
            status: "Completed"
          }
        }));
      }
    } catch (err) {
      console.error(err);
      alert("Submission error or backend returned an error.");
    } finally {
      setTimeout(() => setToast(null), 4000);
    }
  };

  if (loading && !activeTask) {
    return <div className="flex h-screen items-center justify-center">Loading Tasks...</div>;
  }

  if (!activeTask) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 flex-col gap-4">
        <CheckCircle className="w-16 h-16 text-emerald-500" />
        <h2 className="text-xl font-bold text-slate-800">You're all caught up!</h2>
        <p className="text-slate-500 text-sm">No pending dependency requests assigned to you.</p>
      </div>
    );
  }

  const { dependency, brief } = activeTask;
  const isCompleted = dependency.status === "Completed";
  const total_hours = resources.reduce((sum, r) => sum + (r.hours * r.count), 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 flex flex-col w-full max-w-full">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            title="Go Back"
            className="p-2.5 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer shadow-2xs shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>

          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">Dependency Request: {dependency.task_objective}</h1>
              <span className={`px-2 py-0.5 text-xs font-bold uppercase rounded-md ${isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {dependency.status}
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold text-rose-500 bg-rose-50 border border-rose-200 rounded-md">
                URGENT
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold text-slate-500 border border-slate-200 rounded-md">
                REQ-2026-0891
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 font-medium">
              <Clock className="w-4 h-4 text-orange-500" /> 
              <span className="text-orange-600 font-semibold">{dependency.sla_deadline ? `Due in: ${dependency.sla_deadline}` : "No SLA Deadline"}</span>
            </p>
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-slate-800 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 max-w-md animate-in slide-in-from-right">
          <BrainCircuit className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-sm">{toast}</p>
        </div>
      )}

      {/* Main Split Layout */}
      <div className="flex-1 w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Panel: Read-Only Brief */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm sticky top-28">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
              Intake Context Brief
            </h2>
            
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Client / Beneficiary Details</span>
                <p className="text-sm font-semibold text-slate-800">{brief.client_name || "N/A"}</p>
              </div>
              
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Scope Summary / Business Objective</span>
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                  "{brief.description || "No description provided."}"
                </p>
              </div>

              {brief.deliverables && brief.deliverables.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Expected Key Deliverables</span>
                  <ul className="space-y-2">
                    {brief.deliverables.map((del, idx) => (
                      <li key={idx} className="text-xs flex items-start gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        <span><strong>{del.name || "Deliverable"}</strong>: {del.description || ""}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Technical / Operational Context</span>
                <p className="text-sm text-slate-600 bg-blue-50 p-3 rounded-xl border border-blue-100">
                  Client requested integration with their legacy ERP system. Tech stack includes React and Node.js. High focus on mobile responsiveness.
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Uploaded Client Documents / RFQs</span>
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <Paperclip className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-indigo-600 font-medium cursor-pointer hover:underline">acme_rfq_requirements.pdf</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Panel: Action Workbench */}
        <div className="lg:col-span-2 space-y-6">
          
          {isCompleted ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-8 relative overflow-hidden">
               {/* Watermark/Stamp */}
               <div className="absolute top-6 right-6 opacity-5 transform rotate-12 pointer-events-none">
                 <CheckCircle className="w-48 h-48 text-emerald-600" />
               </div>
               
               <div className="border-b border-slate-200 pb-4 mb-6 relative z-10">
                 <h2 className="text-2xl font-black text-slate-800 tracking-tight">Estimation Finalized</h2>
                 <p className="text-sm text-slate-500 mt-1">This dependency estimation was successfully completed and sent to the Contract Manager.</p>
               </div>

               {/* Section A Summary */}
               <div className="relative z-10">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Feasibility Assessment</h3>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${feasibility === 'Feasible' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : feasibility === 'Not Feasible' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                     <span className="font-bold">{feasibility}</span>
                  </div>
                  {feasibilityNotes && (
                    <div className="mt-4 bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
                      <p className="text-xs font-bold text-slate-500 uppercase mb-1">Risk Notes / Justification</p>
                      <p className="text-sm text-slate-700">{feasibilityNotes}</p>
                    </div>
                  )}
               </div>

               {/* Section B Summary */}
               {resources && resources.length > 0 && (
                 <div className="relative z-10">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 mt-8 border-t border-slate-100 pt-6">Resource Allocation</h3>
                    <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                          <tr>
                            <th className="px-4 py-3">Role / Level</th>
                            <th className="px-4 py-3 text-center">Count</th>
                            <th className="px-4 py-3 text-center">Est. Hours (ea)</th>
                            <th className="px-4 py-3 text-right">Total Est. Cost</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {resources.map((res, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="px-4 py-3 font-semibold text-slate-800">{res.role}</td>
                              <td className="px-4 py-3 text-center">{res.count}</td>
                              <td className="px-4 py-3 text-center">{res.hours}h</td>
                              <td className="px-4 py-3 text-right font-bold text-emerald-700">${res.cost ? res.cost.toLocaleString() : 0}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-slate-800 text-white font-bold">
                          <tr>
                            <td colSpan={3} className="px-4 py-3 text-right">Total Department Estimated Hours:</td>
                            <td className="px-4 py-3 text-right text-emerald-400">{total_hours}h</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                 </div>
               )}

               {/* Section C Summary */}
               {assumptions && assumptions.filter(a => a.trim() !== "").length > 0 && (
                 <div className="relative z-10">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 mt-8 border-t border-slate-100 pt-6">Prerequisites & Assumptions</h3>
                    <ul className="list-disc list-outside ml-5 space-y-2">
                      {assumptions.filter(a => a.trim() !== "").map((a, i) => (
                        <li key={i} className="text-sm text-slate-700">{a}</li>
                      ))}
                    </ul>
                 </div>
               )}

               {/* Read-Only Attachments */}
               <div className="relative z-10">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 mt-8 border-t border-slate-100 pt-6">Attachments Provided</h3>
                  <div className="flex items-center gap-3">
                     <span className="text-sm text-slate-500 italic bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">No attachments were uploaded with this submission.</span>
                  </div>
               </div>

            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-8">
              
              {/* Feasibility */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  Section A: Scope & Feasibility Confirmation
                  <span className="text-red-500">*</span>
                </h3>
                <div className="flex gap-3">
                  {["Feasible", "Feasible with Risks", "Not Feasible"].map(option => (
                    <label key={option} className={`flex-1 flex items-center justify-center p-3 rounded-xl border text-sm font-medium cursor-pointer transition ${feasibility === option ? (option === 'Feasible' ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : option === 'Not Feasible' ? 'bg-rose-50 border-rose-500 text-rose-800' : 'bg-amber-50 border-amber-500 text-amber-800') : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                      <input 
                        type="radio" 
                        name="feasibility" 
                        value={option} 
                        checked={feasibility === option}
                        onChange={(e) => setFeasibility(e.target.value)}
                        className="sr-only"
                        disabled={isCompleted}
                      />
                      {option}
                    </label>
                  ))}
                </div>
                
                {(feasibility === "Feasible with Risks" || feasibility === "Not Feasible") && (
                  <div className="animate-in slide-in-from-top-2 mt-3">
                    <textarea
                      placeholder="Identify key technical risks, constraints, or reasons for unfeasibility..."
                      value={feasibilityNotes}
                      onChange={(e) => setFeasibilityNotes(e.target.value)}
                      disabled={isCompleted}
                      rows={3}
                      className="w-full text-sm border border-slate-300 rounded-xl p-3 focus:outline-emerald-500"
                    />
                  </div>
                )}
              </div>

              <hr className="border-slate-100" />

              {/* Resource Matrix (Shown if Hours, Costing, or Resource Count is required) */}
              {(!dependency.required_inputs || dependency.required_inputs.includes('Hours Estimate') || dependency.required_inputs.includes('Resource Count') || dependency.required_inputs.includes('Costing')) && (
                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-4">Section B: Effort & Resource Allocation</h3>
                  <ResourceMatrix 
                    resources={resources} 
                    onChange={isCompleted ? () => {} : setResources}
                    showCost={!dependency.required_inputs || dependency.required_inputs.includes('Costing')}
                    department={dependency.department}
                    disabled={isCompleted}
                    brief={brief}
                  />
                  <div className="mt-4 flex justify-end">
                    <div className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2">
                      Total Department Estimated Hours: <span className="text-emerald-400">{total_hours}</span>
                    </div>
                  </div>
                </div>
              )}

              {(!dependency.required_inputs || dependency.required_inputs.includes('Hours Estimate') || dependency.required_inputs.includes('Resource Count') || dependency.required_inputs.includes('Costing')) && (
                <hr className="border-slate-100" />
              )}

              {/* Assumptions */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-3">Section C: Dependencies & Assumptions</h3>
                
                <div className="mb-6 space-y-2">
                  <p className="text-xs font-bold text-slate-600">Prerequisites & Client Dependencies</p>
                  {assumptions.map((assump, idx) => (
                    <input
                      key={idx}
                      type="text"
                      value={assump}
                      disabled={isCompleted}
                      onChange={(e) => {
                        const updated = [...assumptions];
                        updated[idx] = e.target.value;
                        setAssumptions(updated);
                      }}
                      placeholder="e.g., Client must provide API documentation prior to Kickoff..."
                      className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-emerald-500"
                    />
                  ))}
                  {!isCompleted && (
                    <button 
                      onClick={() => setAssumptions([...assumptions, ""])}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition px-1"
                    >
                      + Add Assumption
                    </button>
                  )}
                </div>

                <div>
                   <p className="text-xs font-bold text-slate-600 mb-2">Attachments / Solution Architecture Diagrams</p>
                   <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-slate-100 transition cursor-pointer">
                      <Paperclip className="w-6 h-6 text-slate-400 mb-2" />
                      <p className="text-sm font-medium text-slate-600">Drag & drop files here</p>
                      <p className="text-xs text-slate-400 mt-1">or click to browse</p>
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* Submission Action Bar */}
          {!isCompleted && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-4 shadow-lg sticky bottom-6">
              {showClarification && (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 animate-in slide-in-from-bottom-4">
                  <h4 className="text-sm font-bold text-amber-800 mb-2">Request Clarification</h4>
                  <p className="text-xs text-amber-700 mb-3">Ask the Contract Manager for details. This does NOT pause your SLA clock.</p>
                  <textarea
                    value={clarificationText}
                    onChange={(e) => setClarificationText(e.target.value)}
                    placeholder="Type your question here..."
                    rows={3}
                    className="w-full text-sm border border-amber-300 rounded-lg p-2 focus:outline-amber-500 mb-2"
                  />
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => setShowClarification(false)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSendClarification}
                      disabled={!clarificationText.trim()}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg disabled:opacity-50"
                    >
                      Send Message
                    </button>
                  </div>
                </div>
              )}
              
              <div className="flex flex-wrap items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition border border-slate-200">
                    Save Progress
                  </button>
                  <button 
                    onClick={() => setShowClarification(!showClarification)}
                    className="px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl transition border border-amber-200"
                  >
                    Request Clarification
                  </button>
                </div>
                <button 
                  onClick={handleSubmit}
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold rounded-xl transition shadow-sm flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Submit Dependency Response
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
