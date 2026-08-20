'use client';

import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../../context/appContext';
import Button from '../../../components/common/Button';
import StatusBadge from '../../../components/common/StatusBadge';
import PriorityBadge from '../../../components/common/PriorityBadge';
import { useRouter } from 'next/navigation';
import { Eye, X, FileText, Calendar, Tag, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';

export default function MyRequestsPage() {
  const { contractRequests, loading } = useAppContext();
  const router = useRouter();

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Exclude drafts, keep only submitted/active/final requests
  const activeRequests = useMemo(() => {
    return contractRequests.filter(req => req.currentStatus !== 'Draft');
  }, [contractRequests]);

  // Compute metrics for active requests
  const metrics = useMemo(() => {
    const total = activeRequests.length;
    const pendingDeps = activeRequests.filter(r => r.currentStatus === 'Dependency Gathering').length;
    const inReview = activeRequests.filter(r => r.currentStatus === 'Internal Review').length;
    const approved = activeRequests.filter(r => r.currentStatus === 'Approved').length;
    return { total, pendingDeps, inReview, approved };
  }, [activeRequests]);

  // Filter requests
  const filteredRequests = useMemo(() => {
    return activeRequests.filter(req => {
      const matchesSearch = !searchQuery || 
        req.requestId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.requestName?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || req.currentStatus?.toLowerCase() === statusFilter.toLowerCase();
      const matchesPriority = priorityFilter === 'ALL' || req.priority?.toLowerCase() === priorityFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [activeRequests, searchQuery, statusFilter, priorityFilter]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f1f6f0]">
        <div className="w-12 h-12 rounded-full border-4 border-[#cbdcbe] border-t-[#4f6e43] animate-spin mb-4"></div>
        <p className="text-base font-extrabold text-[#38522c]">Loading Requests...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 w-full space-y-7 min-h-screen bg-[#f1f6f0] text-[#1c2918]">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-7 rounded-3xl border border-[#cbdcbe] shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-[#1c2918] tracking-tight">My Requests</h1>
          <p className="text-xs font-bold text-[#637756] mt-1">Track and monitor your submitted contracts through the approval and negotiation lifecycle.</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => router.push('/requestor/create')}
          className="shadow-lg shadow-[#4f6e43]/20 px-6 py-3 font-black text-sm cursor-pointer"
        >
          + New Request
        </Button>
      </header>

      {/* Quick Metrics */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-[#cbdcbe] shadow-2xs">
          <p className="text-xs font-bold text-[#637756] uppercase tracking-wider">Total Active</p>
          <p className="text-2xl font-black text-[#1c2918] mt-1">{metrics.total}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#cbdcbe] shadow-2xs">
          <p className="text-xs font-bold text-[#7a6c2f] uppercase tracking-wider">Dependency Gathering</p>
          <p className="text-2xl font-black text-[#7a6c2f] mt-1">{metrics.pendingDeps}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#cbdcbe] shadow-2xs">
          <p className="text-xs font-bold text-[#47605e] uppercase tracking-wider">In Review</p>
          <p className="text-2xl font-black text-[#47605e] mt-1">{metrics.inReview}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#cbdcbe] shadow-2xs">
          <p className="text-xs font-bold text-[#3d592b] uppercase tracking-wider">Approved Deals</p>
          <p className="text-2xl font-black text-[#3d592b] mt-1">{metrics.approved}</p>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="bg-white rounded-3xl p-5 border border-[#cbdcbe] shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full max-w-md">
          <svg className="w-5 h-5 text-[#4f6e43] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"
            placeholder="Search by ID, Title, or Client name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-[#cbdcbe] rounded-2xl text-xs font-bold text-[#1c2918] focus:outline-none focus:ring-2 focus:ring-[#4f6e43] shadow-2xs"
          />
        </div>
        
        <div className="flex flex-wrap gap-3 items-center w-full md:w-auto justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border-2 border-[#b9d2ab] rounded-xl px-3.5 py-2.5 text-xs font-black text-[#263b1a] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#4f6e43]"
          >
            <option value="ALL">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Dependency Gathering">Dependency Gathering</option>
            <option value="Drafting In Progress">Drafting In Progress</option>
            <option value="Internal Review">Internal Review</option>
            <option value="Client Negotiation">Client Negotiation</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-white border-2 border-[#b9d2ab] rounded-xl px-3.5 py-2.5 text-xs font-black text-[#263b1a] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#4f6e43]"
          >
            <option value="ALL">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>
      </section>

      {/* Active Requests Table View */}
      <section className="bg-white rounded-3xl border border-[#cbdcbe] shadow-sm overflow-hidden">
        {filteredRequests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#f5faf0] border-b border-[#cbdcbe] text-[#38522c] font-extrabold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Request ID</th>
                  <th className="px-6 py-4">Request Title</th>
                  <th className="px-6 py-4">Client / Entity</th>
                  <th className="px-6 py-4">Contract Category</th>
                  <th className="px-6 py-4">Target Effective Date</th>
                  <th className="px-6 py-4">Estimated Value</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e4efe0]">
                {filteredRequests.map((req, idx) => (
                  <tr key={req.requestId || idx} className="hover:bg-[#f8fcf7] transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-xs text-[#2c471e] bg-[#eef6ea] px-2.5 py-1 rounded-md border border-[#c4dcba]">
                        {req.requestId || `REQ-2026-${idx}`}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-extrabold text-[#1c2918]">
                      {req.requestName || 'Contract Request'}
                    </td>
                    <td className="px-6 py-4 font-bold text-[#263b1a]">
                      {req.clientName || 'Acme Corp'}
                    </td>
                    <td className="px-6 py-4 font-bold text-[#445b37]">
                      {req.contractCategory || 'Revenue / Sales'}
                    </td>
                    <td className="px-6 py-4 font-extrabold text-[#263b1a]">
                      {req.targetEffectiveDate ? req.targetEffectiveDate.split('T')[0] : 'TBD'}
                    </td>
                    <td className="px-6 py-4 font-extrabold text-[#264b1d]">
                      {req.estimatedValue ? `$${Number(req.estimatedValue).toLocaleString()} ${req.currency || 'USD'}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <PriorityBadge priority={req.priority} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={req.currentStatus} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedRequest(req)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black text-[#2e4722] bg-[#ebf5e7] hover:bg-[#dcedd4] border border-[#b8d4ab] rounded-xl transition-all shadow-2xs cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Preview Request
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 rounded-3xl bg-[#eef5eb] border border-[#bcd1ae] flex items-center justify-center text-[#4f6e43] mx-auto shadow-2xs">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <h3 className="text-lg font-black text-[#1c2918]">No submitted requests found</h3>
            <p className="text-xs text-[#637756] font-bold">You haven't submitted any contract requests yet, or no active requests match your filter criteria.</p>
            <Button variant="primary" onClick={() => router.push('/requestor/create')} className="font-bold">
              Submit Your First Request
            </Button>
          </div>
        )}
      </section>

      {/* Request Preview Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-[#121c10]/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#cbdcbe] w-full max-w-4xl overflow-hidden my-8 transform transition-all text-[#1c2918]">
            
            {/* Modal Header */}
            <div className="bg-[#24381b] text-white p-6 flex items-start justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-xs font-black text-[#96d17b] bg-[#162510] px-3 py-1 rounded-lg border border-[#3b592b]">
                    {selectedRequest.requestId}
                  </span>
                  <PriorityBadge priority={selectedRequest.priority} />
                  <StatusBadge status={selectedRequest.currentStatus} />
                </div>
                <h2 className="text-2xl font-black mt-2.5 text-white">{selectedRequest.requestName}</h2>
                <p className="text-xs text-[#a6bf9a] font-bold mt-1">
                  Client / Counterparty: <span className="text-white font-extrabold">{selectedRequest.clientName}</span> • Category: <span className="text-white font-extrabold">{selectedRequest.contractCategory}</span>
                </p>
              </div>
              <button 
                onClick={() => setSelectedRequest(null)}
                className="p-2 text-[#a6bf9a] hover:text-white bg-[#1b2b14] hover:bg-[#2c4521] rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              
              {/* Section 1: Key Commercial Specs */}
              <div>
                <h3 className="text-xs font-black text-[#2e4722] uppercase tracking-wider mb-2.5 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#4f6e43]" />
                  Contract & Commercial Specifications
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#f6faf4] rounded-2xl border border-[#d2e2ca] text-xs">
                  <div>
                    <span className="text-[#637756] font-bold uppercase tracking-wider text-[10px]">Contract Type</span>
                    <p className="font-black text-[#1c2918] mt-1">{selectedRequest.contractType || 'Proposal'}</p>
                  </div>
                  <div>
                    <span className="text-[#637756] font-bold uppercase tracking-wider text-[10px]">Counterparty Entity</span>
                    <p className="font-black text-[#1c2918] mt-1">{selectedRequest.clientName || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[#637756] font-bold uppercase tracking-wider text-[10px]">Estimated Value</span>
                    <p className="font-black text-[#264b1d] mt-1">
                      {selectedRequest.estimatedValue ? `$${Number(selectedRequest.estimatedValue).toLocaleString()} ${selectedRequest.currency || 'USD'}` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#637756] font-bold uppercase tracking-wider text-[10px]">Pricing Model</span>
                    <p className="font-black text-[#1c2918] mt-1">{selectedRequest.pricingModel || 'TBD'}</p>
                  </div>
                </div>
              </div>

              {/* Section 2: Important Milestone Dates */}
              <div>
                <h3 className="text-xs font-black text-[#2e4722] uppercase tracking-wider mb-2.5 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#4f6e43]" />
                  Key Milestone Dates & Schedule
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 bg-[#f6faf4] border border-[#d2e2ca] rounded-2xl space-y-1">
                    <span className="text-[#637756] font-bold uppercase text-[10px]">Submitted Date</span>
                    <p className="font-black text-[#1c2918]">{selectedRequest.createdDate || 'Today'}</p>
                  </div>
                  <div className="p-4 bg-[#f6faf4] border border-[#d2e2ca] rounded-2xl space-y-1">
                    <span className="text-[#637756] font-bold uppercase text-[10px]">Target Effective Date</span>
                    <p className="font-black text-[#2f4a21]">
                      {selectedRequest.targetEffectiveDate ? selectedRequest.targetEffectiveDate.split('T')[0] : 'TBD / Upon Execution'}
                    </p>
                  </div>
                  <div className="p-4 bg-[#f6faf4] border border-[#d2e2ca] rounded-2xl space-y-1">
                    <span className="text-[#637756] font-bold uppercase text-[10px]">Target Completion / Delivery</span>
                    <p className="font-black text-[#264b1d]">
                      {selectedRequest.targetDeliveryDate ? selectedRequest.targetDeliveryDate.split('T')[0] : 'TBD / Per Milestones'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 3: Description & Scope Brief */}
              <div className="space-y-2">
                <h3 className="text-xs font-black text-[#2e4722] uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#4f6e43]" />
                  Request Description & Scope Brief
                </h3>
                <div className="p-4 bg-[#f6faf4] border border-[#d2e2ca] rounded-2xl text-xs leading-relaxed text-[#25381d] font-bold whitespace-pre-line">
                  {selectedRequest.scopeSummary || selectedRequest.description || 'No detailed scope summary provided.'}
                </div>
              </div>

              {/* Section 4: Deliverables & Milestones */}
              {selectedRequest.deliverables && (Array.isArray(selectedRequest.deliverables) ? selectedRequest.deliverables.length > 0 : Boolean(selectedRequest.deliverables)) && (
                <div className="space-y-2">
                  <h3 className="text-xs font-black text-[#2e4722] uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#4f6e43]" />
                    Key Deliverables & Milestones
                  </h3>
                  <div className="p-4 bg-[#f6faf4] border border-[#d2e2ca] rounded-2xl text-xs space-y-2">
                    {Array.isArray(selectedRequest.deliverables) ? (
                      selectedRequest.deliverables.map((item, dIdx) => (
                        <div key={dIdx} className="flex items-start gap-2.5 p-2.5 bg-white rounded-xl border border-[#d2e2ca]">
                          <span className="w-5 h-5 rounded-full bg-[#dcedd4] text-[#2f4a21] font-black flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                            {dIdx + 1}
                          </span>
                          <div>
                            <p className="font-extrabold text-[#1c2918]">{typeof item === 'string' ? item : (item.name || item.title || item.description)}</p>
                            {typeof item === 'object' && (item.timeline || item.due_date) && (
                              <span className="text-[11px] text-[#637756] font-bold">Timeline / Target: {item.timeline || item.due_date}</span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-[#25381d] font-bold">{String(selectedRequest.deliverables)}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Section 5: Custom Terms & Governance */}
              <div className="space-y-2">
                <h3 className="text-xs font-black text-[#2e4722] uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#4f6e43]" />
                  Governance & Special / Custom Client Terms
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#f6faf4] border border-[#d2e2ca] rounded-2xl text-xs font-bold text-[#1c2918]">
                  <div>
                    <span className="text-[#637756] font-bold uppercase text-[10px]">Payment Terms / Schedule</span>
                    <p className="font-extrabold text-[#264b1d] mt-1">{selectedRequest.paymentTerms || selectedRequest.paymentSchedule || 'Standard Terms'}</p>
                  </div>
                  <div>
                    <span className="text-[#637756] font-bold uppercase text-[10px]">Governing Law / Jurisdiction</span>
                    <p className="font-extrabold text-[#1c2918] mt-1">{selectedRequest.jurisdiction || 'United States - Delaware'}</p>
                  </div>
                  {(selectedRequest.customClientTerms || selectedRequest.custom_terms || selectedRequest.customTerms || selectedRequest.specialTerms) && (
                    <div className="sm:col-span-2 pt-3 border-t border-[#cbdcbe]">
                      <span className="text-[#38522c] font-black uppercase text-[11px] block mb-1">
                        Special / Custom Client Terms (Optional)
                      </span>
                      <div className="p-3 bg-white border border-[#c4dcba] rounded-xl text-xs leading-relaxed text-[#1c2918] font-bold whitespace-pre-line">
                        {selectedRequest.customClientTerms || selectedRequest.custom_terms || selectedRequest.customTerms || selectedRequest.specialTerms}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 6: Pre-Drafting Dependencies */}
              {selectedRequest.dependencies && selectedRequest.dependencies.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-black text-[#2e4722] uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#4f6e43]" />
                    Pre-Drafting Dependency Tasks ({selectedRequest.dependencies.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedRequest.dependencies.map((dep, depIdx) => (
                      <div key={depIdx} className="p-3 bg-[#f6faf4] border border-[#d2e2ca] rounded-xl text-xs flex items-center justify-between font-bold">
                        <div>
                          <p className="font-extrabold text-[#1c2918]">{dep.department || 'Department'}</p>
                          <p className="text-[11px] text-[#637756]">{dep.lead || dep.assignee_name || 'Pending Lead Assignment'}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-[#fcf5e3] text-[#7a6427] border border-[#e5d4a5]">
                          {dep.status || 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-[#f6faf4] border-t border-[#cbdcbe] flex items-center justify-between gap-4">
              <div className="text-xs font-bold text-[#637756]">
                Assigned Manager: <span className="font-black text-[#1c2918]">{selectedRequest.contractManager || 'Legal Ops Team'}</span>
              </div>
              
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-5 py-2.5 text-xs font-black text-[#2f4a21] bg-white border border-[#cbdcbe] hover:bg-[#eef6ea] rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
