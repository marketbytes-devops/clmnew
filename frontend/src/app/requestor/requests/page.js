'use client';

import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../../context/appContext';
import Button from '../../../components/common/Button';
import StatusBadge from '../../../components/common/StatusBadge';
import PriorityBadge from '../../../components/common/PriorityBadge';
import { useRouter } from 'next/navigation';

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

  // Map status to visual lifecycle stages
  const getLifecycleStage = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'submitted') return 1;
    if (statusLower === 'dependency gathering') return 2;
    if (statusLower === 'drafting in progress') return 3;
    if (statusLower === 'internal review') return 4;
    if (statusLower === 'client negotiation') return 5;
    if (statusLower === 'approved') return 6;
    return 2; // default
  };

  const lifecycleStages = [
    { label: 'Intake', step: 1 },
    { label: 'Dependencies', step: 2 },
    { label: 'Authoring', step: 3 },
    { label: 'Approval', step: 4 },
    { label: 'Negotiation', step: 5 },
    { label: 'Approved', step: 6 }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f1f6f0]">
        <div className="w-12 h-12 rounded-full border-4 border-[#cbdcbe] border-t-[#4f6e43] animate-spin mb-4"></div>
        <p className="text-base font-extrabold text-[#38522c]">Loading Requests...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-7 min-h-screen bg-[#f1f6f0] text-[#1c2918]">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-7 rounded-3xl border border-[#cbdcbe] shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-[#1c2918] tracking-tight">My Requests</h1>
          <p className="text-xs font-bold text-[#637756] mt-1">Track and monitor your submitted contracts through the approval and negotiation lifecycle.</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => router.push('/requestor/create')}
          className="shadow-lg shadow-[#4f6e43]/20 px-6 py-3 font-black text-sm"
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
            placeholder="Search by ID or Client name..."
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

      {/* Active Requests List */}
      <section className="bg-white rounded-3xl border border-[#cbdcbe] shadow-sm overflow-hidden">
        {filteredRequests.length > 0 ? (
          <div className="divide-y divide-[#e2ede0]">
            {filteredRequests.map((req, idx) => {
              const currentStage = getLifecycleStage(req.currentStatus);
              const isSelected = selectedRequest?.requestId === req.requestId;
              
              return (
                <div 
                  key={req.requestId || idx}
                  className="p-6 hover:bg-[#f8fcf7] transition-all cursor-pointer"
                  onClick={() => setSelectedRequest(isSelected ? null : req)}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-[#4f6e43]">{req.requestId}</span>
                        <PriorityBadge priority={req.priority} />
                      </div>
                      <h3 className="text-base font-extrabold text-[#1c2918]">{req.requestName}</h3>
                      <p className="text-xs text-[#637756] font-bold">
                        Client: <span className="font-black text-[#2f4621]">{req.clientName}</span> | Category: <span className="font-black">{req.contractCategory}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-4 justify-between md:justify-end">
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] uppercase font-bold text-[#637756]">Effective Date</p>
                        <p className="text-xs font-extrabold text-[#1c2918]">{req.targetEffectiveDate || 'TBD'}</p>
                      </div>
                      <StatusBadge status={req.currentStatus} />
                      <div className="text-[#4f6e43] font-black text-lg transition-transform duration-200">
                        {isSelected ? '▲' : '▼'}
                      </div>
                    </div>
                  </div>

                  {/* Lifecycle Tracker Visual Block */}
                  <div className="mt-5 pt-5 border-t border-[#f0f5ee]">
                    <div className="relative">
                      {/* Line background */}
                      <div className="absolute top-3.5 left-6 right-6 h-1 bg-[#e0ebd8] -z-10 rounded-full"></div>
                      
                      {/* Active line background */}
                      <div 
                        className="absolute top-3.5 left-6 h-1 bg-[#4f6e43] -z-10 rounded-full transition-all duration-500"
                        style={{ width: `${((currentStage - 1) / 5) * 100}%` }}
                      ></div>

                      {/* Stage steps */}
                      <div className="flex justify-between items-center text-center">
                        {lifecycleStages.map((stage) => {
                          const isActive = stage.step === currentStage;
                          const isCompleted = stage.step < currentStage;
                          
                          return (
                            <div key={stage.step} className="flex flex-col items-center flex-1 relative">
                              <div 
                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-black text-xs transition-all duration-300 ${
                                  isActive 
                                    ? 'bg-[#4f6e43] border-[#4f6e43] text-white ring-4 ring-[#e7f2df] scale-110' 
                                    : isCompleted 
                                      ? 'bg-[#dcedd4] border-[#8ba87c] text-[#3c582c]' 
                                      : 'bg-white border-[#cbdcbe] text-[#76876c]'
                                }`}
                              >
                                {isCompleted ? '✓' : stage.step}
                              </div>
                              <span className={`text-[10px] mt-2 font-black ${
                                isActive ? 'text-[#4f6e43]' : 'text-[#637756]'
                              }`}>
                                {stage.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Detail Panel */}
                  {isSelected && (
                    <div className="mt-6 p-5 bg-[#f5faef] rounded-2xl border border-[#d2e2ca] space-y-4 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-bold text-[#1c2918]">
                        <div>
                          <p className="text-[10px] uppercase text-[#637756]">Contract Manager</p>
                          <p className="text-sm font-black text-[#2f4621] mt-0.5">{req.contractManager || 'Assigning soon...'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase text-[#637756]">Pricing Model & Value</p>
                          <p className="text-sm font-black text-[#2f4621] mt-0.5">
                            {req.pricingModel} • {req.estimatedValue ? `$${Number(req.estimatedValue).toLocaleString()} ${req.currency}` : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase text-[#637756]">Submission / Target Dates</p>
                          <p className="text-sm font-black text-[#2f4621] mt-0.5">
                            Created: {req.createdDate} | Target Complete: {req.targetDeliveryDate || 'TBD'}
                          </p>
                        </div>
                      </div>

                      {req.scopeSummary && (
                        <div>
                          <p className="text-[10px] uppercase text-[#637756] mb-1">Scope Brief Summary</p>
                          <div className="p-3 bg-white border border-[#d2e2ca] rounded-xl text-xs leading-relaxed text-[#3a4f32]">
                            {req.scopeSummary}
                          </div>
                        </div>
                      )}

                      {req.dependencies && req.dependencies.length > 0 && (
                        <div>
                          <p className="text-[10px] uppercase text-[#637756] mb-1">Pre-Drafting Dependency Tasks ({req.dependencies.length})</p>
                          <div className="flex flex-wrap gap-2">
                            {req.dependencies.map((dep, dIdx) => (
                              <span key={dIdx} className="px-3 py-1 bg-white border border-[#d2e2ca] rounded-lg text-xs font-bold text-[#2f4621] flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#f1be3e] inline-block"></span>
                                {dep.department}: {dep.lead}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
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
    </div>
  );
}
