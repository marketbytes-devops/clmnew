'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useAppContext } from '../../../context/appContext';
import Button from '../../../components/common/Button';
import StatusBadge from '../../../components/common/StatusBadge';
import PriorityBadge from '../../../components/common/PriorityBadge';

export default function SmartRepositoryPage() {
  const { contractRequests, loading } = useAppContext();

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [valueFilter, setValueFilter] = useState('ALL');

  // Conversational AI drawer state
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { 
      sender: 'ai', 
      text: "Hello! I am your CLM Portfolio Copilot. You can ask me natural language questions about all agreements in this repository. Try asking: 'What is our Total Contract Value (TCV)?' or 'Which contracts are assigned to Mark Thompson?'" 
    }
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Keep only active/submitted/completed requests in the repository
  const repositoryContracts = useMemo(() => {
    return contractRequests.filter(req => req.currentStatus !== 'Draft');
  }, [contractRequests]);

  // Compute metrics
  const metrics = useMemo(() => {
    const activeCount = repositoryContracts.length;
    const tcv = repositoryContracts.reduce((sum, r) => sum + (r.estimatedValue || 0), 0);
    const pendingMilestones = repositoryContracts.filter(r => r.currentStatus === 'Dependency Gathering').length;
    const riskCount = repositoryContracts.filter(r => r.priority === 'High' || r.priority === 'Urgent').length;
    return { activeCount, tcv, pendingMilestones, riskCount };
  }, [repositoryContracts]);

  // Filtered contracts
  const filteredContracts = useMemo(() => {
    return repositoryContracts.filter(req => {
      const matchesSearch = !searchQuery || 
        req.requestId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.requestName?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || req.currentStatus?.toLowerCase() === statusFilter.toLowerCase();
      const matchesType = typeFilter === 'ALL' || req.contractType?.toLowerCase() === typeFilter.toLowerCase();
      
      let matchesValue = true;
      if (valueFilter === 'under_50k') matchesValue = (req.estimatedValue || 0) < 50000;
      else if (valueFilter === 'over_50k') matchesValue = (req.estimatedValue || 0) >= 50000;

      return matchesSearch && matchesStatus && matchesType && matchesValue;
    });
  }, [repositoryContracts, searchQuery, statusFilter, typeFilter, valueFilter]);

  // Dynamic Conversational Search AI Processor
  const processAIQuery = (query) => {
    const q = query.toLowerCase();
    
    // 1. TCV Query
    if (q.includes('total value') || q.includes('tcv') || q.includes('how much money') || q.includes('worth')) {
      const count = repositoryContracts.length;
      return `There are currently ${count} active agreements in the repository with a combined **Total Contract Value (TCV) of $${metrics.tcv.toLocaleString()} USD**.`;
    }

    // 2. Manager Query
    if (q.includes('manager') || q.includes('assigned to') || q.includes('workload')) {
      const jenkinsCount = repositoryContracts.filter(r => r.contractManager?.includes('Jenkins')).length;
      const thompsonCount = repositoryContracts.filter(r => r.contractManager?.includes('Thompson')).length;
      const rostovaCount = repositoryContracts.filter(r => r.contractManager?.includes('Rostova')).length;
      
      return `Here is the contract manager assignment breakdown:\n- **Sarah Jenkins:** ${jenkinsCount} active contract(s)\n- **Mark Thompson:** ${thompsonCount} active contract(s)\n- **Elena Rostova:** ${rostovaCount} active contract(s)\n\nLet me know if you would like me to list details of a specific manager's queue.`;
    }

    // 3. Specific Client Query (Test Client A, Test Client B, Verification Client, etc.)
    const clientFound = repositoryContracts.find(r => q.includes(r.clientName?.toLowerCase()));
    if (clientFound) {
      return `Here are the details for **${clientFound.clientName}**:\n- **ID:** ${clientFound.requestId}\n- **Request Name:** ${clientFound.requestName}\n- **Contract Type:** ${clientFound.contractType}\n- **Estimated Value:** $${(clientFound.estimatedValue || 0).toLocaleString()} ${clientFound.currency || 'USD'}\n- **Current Status:** ${clientFound.currentStatus}\n- **Assigned Manager:** ${clientFound.contractManager || 'Unassigned'}\n- **Effective Date:** ${clientFound.targetEffectiveDate || 'TBD'}`;
    }

    // 4. Status Check Query
    if (q.includes('status') || q.includes('stage') || q.includes('progress')) {
      const statusCounts = repositoryContracts.reduce((acc, r) => {
        acc[r.currentStatus] = (acc[r.currentStatus] || 0) + 1;
        return acc;
      }, {});
      
      let breakdown = "Contract status distribution:\n";
      Object.keys(statusCounts).forEach(status => {
        breakdown += `- **${status}:** ${statusCounts[status]} contract(s)\n`;
      });
      return breakdown;
    }

    // 5. Risks or Priority Query
    if (q.includes('risk') || q.includes('high priority') || q.includes('urgent')) {
      const highReqs = repositoryContracts.filter(r => r.priority === 'High' || r.priority === 'Urgent');
      if (highReqs.length > 0) {
        let resp = `I found **${highReqs.length} high-risk/urgent agreements**:\n`;
        highReqs.forEach(r => {
          resp += `- **${r.requestId}** (${r.clientName}): $${r.estimatedValue?.toLocaleString()} USD [Status: ${r.currentStatus}]\n`;
        });
        return resp;
      }
      return "No high-risk or urgent priority agreements found in the active database.";
    }

    // Default Fallback
    return "I scanned your active contracts but couldn't find a direct answer. Try asking: \n- *'What is our total contract value?'*\n- *'Show status breakdown'* \n- *'Who is the contract manager for Verification Client?'*";
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { sender: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);

    const queryText = chatInput;
    setChatInput('');

    // Simulate AI thinking and outputting response
    setTimeout(() => {
      const aiResponse = processAIQuery(queryText);
      setChatMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);
    }, 450);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f1f6f0]">
        <div className="w-12 h-12 rounded-full border-4 border-[#cbdcbe] border-t-[#4f6e43] animate-spin mb-4"></div>
        <p className="text-base font-extrabold text-[#38522c]">Opening Smart Vault...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-7 min-h-screen bg-[#f1f6f0] text-[#1c2918] flex flex-col">
      {/* Header with Search */}
      <header className="bg-white p-7 rounded-3xl border border-[#cbdcbe] shadow-sm flex flex-col md:flex-row gap-5 items-center justify-between">
        <div className="space-y-1 w-full md:w-auto">
          <h1 className="text-3xl font-black text-[#1c2918] tracking-tight flex items-center gap-2">
            <span>🗄️ Smart Repository</span>
          </h1>
          <p className="text-xs font-bold text-[#637756]">
            Secure archive for all executed contract records. Query documents using the conversational assistant on the right.
          </p>
        </div>

        {/* Global AI Query Search Input */}
        <div className="relative w-full max-w-lg">
          <svg className="w-5 h-5 text-[#4f6e43] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"
            placeholder="Ask any question or search contracts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-[#cbdcbe] rounded-2xl text-xs font-bold text-[#1c2918] focus:outline-none focus:ring-2 focus:ring-[#4f6e43] shadow-2xs placeholder-[#7a8a70]"
          />
        </div>
      </header>

      {/* Quick Metrics */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-[#cbdcbe] shadow-2xs">
          <p className="text-xs font-bold text-[#637756] uppercase tracking-wider">Active Contracts</p>
          <p className="text-2xl font-black text-[#1c2918] mt-1">{metrics.activeCount}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#cbdcbe] shadow-2xs">
          <p className="text-xs font-bold text-[#4c693a] uppercase tracking-wider">TCV (Total Contract Value)</p>
          <p className="text-2xl font-black text-[#4c693a] mt-1">${metrics.tcv.toLocaleString()} USD</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#cbdcbe] shadow-2xs">
          <p className="text-xs font-bold text-[#7a6c2f] uppercase tracking-wider">Pending Milestones</p>
          <p className="text-2xl font-black text-[#7a6c2f] mt-1">{metrics.pendingMilestones}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#cbdcbe] shadow-2xs">
          <p className="text-xs font-bold text-[#a14b4b] uppercase tracking-wider">Alerts & Risks</p>
          <p className="text-2xl font-black text-[#a14b4b] mt-1">{metrics.riskCount}</p>
        </div>
      </section>

      {/* Main Split-Screen Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1">
        {/* Left Side: Filterable Contracts Table */}
        <section className={`bg-white rounded-3xl border border-[#cbdcbe] shadow-sm overflow-hidden flex flex-col transition-all duration-300 ${
          isChatOpen ? 'lg:col-span-8' : 'lg:col-span-12'
        }`}>
          {/* Header Actions */}
          <div className="p-5 border-b border-[#e2ede0] flex flex-wrap items-center justify-between gap-4 bg-[#fafdfa]">
            <h2 className="text-sm font-black text-[#1c2918] uppercase tracking-wider">Contract Master Ledger</h2>
            
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border-2 border-[#b9d2ab] rounded-xl px-3.5 py-2.5 text-[10px] font-black text-[#263b1a] cursor-pointer focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="Approved">Approved</option>
                <option value="Dependency Gathering">Dependencies</option>
                <option value="Internal Review">Internal Review</option>
                <option value="Client Negotiation">Negotiation</option>
                <option value="Rejected">Rejected</option>
              </select>

              <select
                value={valueFilter}
                onChange={(e) => setValueFilter(e.target.value)}
                className="bg-white border-2 border-[#b9d2ab] rounded-xl px-3.5 py-2.5 text-[10px] font-black text-[#263b1a] cursor-pointer focus:outline-none"
              >
                <option value="ALL">All Values</option>
                <option value="under_50k">Under $50,000</option>
                <option value="over_50k">Over $50,000</option>
              </select>

              <button 
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="px-4 py-2.5 bg-[#eaf3e5] border-2 border-[#cbdcbe] hover:bg-[#d5e8d5] text-[#2c441f] text-[10px] font-black rounded-xl transition-all"
              >
                {isChatOpen ? 'Close Copilot ➔' : '🤖 Ask Contracts Copilot'}
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#e9f2e4] border-b border-[#c4d7b7] text-[10px] font-black text-[#2f4820] uppercase tracking-wider">
                  <th className="py-4 px-5">Contract ID & Name</th>
                  <th className="py-4 px-4">Client / Beneficiary</th>
                  <th className="py-4 px-4">Contract Type</th>
                  <th className="py-4 px-4">Deal Value</th>
                  <th className="py-4 px-4">Effective Date</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2ede0] text-xs font-semibold bg-white text-[#1c2918]">
                {filteredContracts.length > 0 ? (
                  filteredContracts.map((req, idx) => (
                    <tr key={req.requestId || idx} className="hover:bg-[#f8fcf7] transition-all">
                      <td className="py-4 px-5 font-bold">
                        <span className="font-mono text-[10px] text-[#4f6e43] block">{req.requestId}</span>
                        <span className="text-sm font-extrabold text-[#1c2918] mt-0.5 block">{req.requestName}</span>
                      </td>
                      <td className="py-4 px-4 font-extrabold">
                        {req.clientName}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-[#e9f2e4] text-[#2c441f] border border-[#bfd3b1] font-black text-[10px]">
                          {req.contractType}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-black text-[#3d592b]">
                        {req.estimatedValue ? `$${Number(req.estimatedValue).toLocaleString()} ${req.currency || 'USD'}` : 'TBD'}
                      </td>
                      <td className="py-4 px-4 text-[#637756]">
                        {req.targetEffectiveDate || 'TBD'}
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={req.currentStatus} />
                      </td>
                      <td className="py-4 px-5 text-right font-black">
                        <button className="text-[#4f6e43] hover:underline text-[11px] font-black">
                          Download &darr;
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-20 text-center text-[#637756] font-bold">
                      No agreements found in repository matching criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Right Side: Conversational Copilot Chat Panel */}
        {isChatOpen && (
          <section className="bg-white rounded-3xl border-2 border-[#557847] shadow-xl overflow-hidden flex flex-col h-[580px] lg:col-span-4 animate-fadeIn">
            {/* Header info */}
            <div className="p-4 bg-[#f2f8ef] border-b border-[#cbdcbe] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-[#e3eedc] border border-[#a8c79c] text-lg leading-none">🤖</span>
                <div>
                  <h3 className="text-xs font-black text-[#1c2918] uppercase tracking-wider">Ask Your Contracts</h3>
                  <p className="text-[10px] font-black text-[#4f6e43]">DeepMind CLM Copilot</p>
                </div>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="text-[#728564] hover:text-[#1c2918] font-black text-xs p-1"
              >
                ✕
              </button>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#fafdf9]">
              {chatMessages.map((msg, mIdx) => (
                <div 
                  key={mIdx} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs shadow-3xs leading-relaxed whitespace-pre-line font-bold ${
                      msg.sender === 'user' 
                        ? 'bg-[#4f6e43] text-white' 
                        : 'bg-white border border-[#cbdcbe] text-[#2c421f] text-left'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendChat} className="p-3 border-t border-[#cbdcbe] bg-white flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask e.g. 'What is our total contract value?'..."
                className="flex-1 px-4 py-3 bg-[#f4f9f2] border border-[#cbdcbe] rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#4f6e43] text-[#1c2918]"
              />
              <button 
                type="submit" 
                className="px-5 bg-[#4f6e43] hover:bg-[#3b5431] text-white text-xs font-black rounded-2xl transition-all shadow-md shadow-[#4f6e43]/20"
              >
                Ask
              </button>
            </form>
          </section>
        )}
      </div>
    </div>
  );
}
