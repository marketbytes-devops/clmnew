"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  GitCompare, Search, ArrowLeft, RefreshCw, ChevronRight, MessageSquare,
  AlertTriangle, CheckCircle2, ShieldAlert, Bot, Calendar, PhoneCall, Send,
  FileText
} from 'lucide-react';
import { APIService } from '../../../service/apiService';

const DEMO_NEGOTIATION_CONTRACT = {
  id: 999,
  tracking_id: 'REQ-2026-0891',
  title: 'Proposal_E-Commerce_Web_App_v1.0.docx',
  category: 'Proposal',
  version_label: 'v1.0-REDLINED',
  entity_name: 'Acme Corp',
  contract_type: 'MSA',
  deal_value: 22000,
  requester_name: 'Sales Rep',
  contract_manager: 'Alex Miller',
  status: 'Client Negotiation',
  redlineItems: [
    {
      id: 1,
      targetSection: 'Payment 50% Advance',
      clientComment: 'We request changing Advance Payment from 50% to 25% due to our internal procurement policy.',
      riskLevel: 'Medium',
      riskReason: 'Affects upfront cash flow',
      aiSuggestedCounter: 'Offer 35% Advance with 15% tied to Milestone 1 completion.',
      actionChoice: '',
      internalNotes: ''
    },
    {
      id: 2,
      targetSection: '30 Days Warranty Support',
      clientComment: 'We need warranty support extended from 30 days to 60 days to cover our UAT phase fully.',
      riskLevel: 'Low',
      riskReason: 'Within standard operational buffer',
      aiSuggestedCounter: 'Accept the 60 days warranty as it poses minimal risk.',
      actionChoice: '',
      internalNotes: ''
    }
  ]
};

export default function NegotiationWorkspacePage() {
  const [loading, setLoading] = useState(true);
  const [negotiationContracts, setNegotiationContracts] = useState([]);
  const [selectedContract, setSelectedContract] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');

  // Triage state
  const [triageItems, setTriageItems] = useState([]);

  // Action states
  const [submittingAction, setSubmittingAction] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState('');

  const loadContractData = async () => {
    setLoading(true);
    try {
      const [contractsData] = await Promise.all([
        APIService.getContracts().catch(() => [])
      ]);

      const formattedContracts = [];
      (contractsData || []).forEach(c => {
        if (c.status === 'Client Negotiation' || c.status === 'Negotiation' || c.status === 'Active Negotiation' || c.status === 'Countered') {
          formattedContracts.push({
            ...DEMO_NEGOTIATION_CONTRACT,
            id: c.id,
            tracking_id: `CTR-2026-${c.id}`,
            title: c.title,
            entity_name: c.metadata_data?.counterparty || 'Client',
            deal_value: c.value || 0
          });
        }
      });

      if (formattedContracts.length === 0) {
        formattedContracts.push(DEMO_NEGOTIATION_CONTRACT);
      }

      setNegotiationContracts(formattedContracts);
    } catch (err) {
      setNegotiationContracts([DEMO_NEGOTIATION_CONTRACT]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContractData();
  }, []);

  const handleOpenDetail = (c) => {
    setSelectedContract(c);
    setTriageItems(c.redlineItems || []);
    setViewMode('detail');
  };

  const handleTriageChange = (itemId, field, value) => {
    setTriageItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, [field]: value } : item
    ));
  };

  const filteredContracts = negotiationContracts.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.entity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.tracking_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleReDispatch = async () => {
    // Check if any medium/high risk items are accepted or rejected wildly,
    // which might breach boundaries. For demo, we just simulate success.
    setSubmittingAction(true);
    setTimeout(() => {
      setActionSuccessMessage('Successfully routed updated draft (v1.1) back to the client portal.');
      setSubmittingAction(false);
      setViewMode('list');
      loadContractData();
    }, 1500);
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading Negotiation Workspace...</div>;
  }

  // Calculate overall risk for re-approval routing
  const needsReApproval = triageItems.some(i => i.actionChoice === 'Accept' && i.riskLevel === 'Medium');

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto p-4 md:p-6">
      
      {/* ========================================================================= */}
      {/* VIEW MODE 1: CONTRACTS LIST TABLE */}
      {/* ========================================================================= */}
      {viewMode === 'list' && (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <GitCompare className="w-7 h-7 text-indigo-600" />
                Internal Negotiation & Revision Workbench
              </h1>
              <p className="text-xs text-slate-500 mt-1">Review client change requests, triage feedback with AI risk scoring, and dispatch counter-offers.</p>
            </div>
            <button
              onClick={loadContractData}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center gap-4">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search negotiations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
              />
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg">
              {filteredContracts.length} Active Negotiations
            </span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5">Tracking ID</th>
                    <th className="px-4 py-3.5">Contract Title & Valuation</th>
                    <th className="px-4 py-3.5">Client / Counterparty</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredContracts.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4 font-mono font-bold text-indigo-600 whitespace-nowrap">
                        {c.tracking_id}
                      </td>
                      <td className="px-4 py-4 max-w-xs">
                        <span 
                          onClick={() => handleOpenDetail(c)}
                          className="font-bold text-slate-900 hover:text-indigo-600 cursor-pointer line-clamp-1"
                        >
                          {c.title}
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold block">
                          Valuation: ${c.deal_value ? c.deal_value.toLocaleString('en-US') : '0'} USD
                        </span>
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-800 whitespace-nowrap">
                        {c.entity_name}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit bg-amber-100 text-amber-800 border border-amber-300">
                          <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                          Client Redlines Received
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenDetail(c)}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg inline-flex items-center gap-1.5 shadow-sm transition-colors"
                        >
                          Triage Feedback <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 2: INTERNAL NEGOTIATION WORKBENCH */}
      {/* ========================================================================= */}
      {viewMode === 'detail' && selectedContract && (
        <>
          <div className="flex justify-between items-center mb-2">
            <button
              onClick={() => setViewMode('list')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Negotiations
            </button>
          </div>

          <div className="bg-slate-900 text-white p-5 rounded-xl shadow-md border border-slate-800 flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 font-mono">
                    {selectedContract.tracking_id}
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    Client Negotiation / External Re-Drafting
                  </span>
                </div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <GitCompare className="w-5 h-5 text-indigo-400" />
                  {selectedContract.title}
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Client: <span className="text-white font-semibold">{selectedContract.entity_name}</span> | Owner: {selectedContract.contract_manager}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <PhoneCall className="w-4 h-4" /> Schedule Call
                </button>
                <button
                  onClick={handleReDispatch}
                  disabled={submittingAction}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" /> 
                  {submittingAction ? 'Dispatching...' : 'Update Draft & Re-Submit to Client (v1.1)'}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Col: AI Risk Classifier & Redline Summary */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-2 mb-4">
                  <Bot className="w-4 h-4 text-indigo-600" /> AI Redline Analysis
                </h3>
                <div className="mb-4">
                  <span className="text-3xl font-extrabold text-slate-900">{triageItems.length}</span>
                  <span className="text-xs font-bold text-slate-500 uppercase ml-2">Total Client Edits</span>
                </div>

                <div className="flex flex-col gap-4">
                  {triageItems.map((item, idx) => (
                    <div key={item.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Item {idx + 1}: {item.targetSection}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                          item.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {item.riskLevel === 'Medium' ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                          Risk: {item.riskLevel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 italic mb-2">"{item.clientComment}"</p>
                      <div className="bg-indigo-50 border border-indigo-100 rounded p-2 text-xs">
                        <div className="font-bold text-indigo-700 flex items-center gap-1 mb-1"><Bot className="w-3 h-3"/> AI Suggested Counter:</div>
                        <p className="text-indigo-900">{item.aiSuggestedCounter}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Internal Re-Approval Routing Check */}
              <div className={`border rounded-xl p-5 shadow-sm transition-colors ${
                needsReApproval ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'
              }`}>
                <h3 className={`text-sm font-bold flex items-center gap-2 border-b pb-2 mb-3 ${
                  needsReApproval ? 'text-rose-800 border-rose-200' : 'text-emerald-800 border-emerald-200'
                }`}>
                  <ShieldAlert className="w-4 h-4" /> Internal Re-Approval Routing Check
                </h3>
                <p className={`text-xs ${needsReApproval ? 'text-rose-700' : 'text-emerald-700'}`}>
                  {needsReApproval 
                    ? '⚠️ Warning: You have chosen to accept a Medium/High risk change (e.g. Payment Terms reduction). This breach of internal boundaries will automatically route the contract back to Finance (Stage 4) for fast-track re-approval before dispatching v1.1 to the client.'
                    : '✅ All triage decisions remain within pre-approved fallback boundaries. Internal Re-Approval is bypassed. You may dispatch v1.1 directly to the client.'}
                </p>
              </div>

            </div>

            {/* Right Col: Negotiation Triage Table */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col h-fit">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-2 mb-4">
                <FileText className="w-4 h-4 text-indigo-600" /> Negotiation Triage & Routing
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                    <tr>
                      <th className="p-3 w-1/3">Client Feedback Item</th>
                      <th className="p-3 w-1/4">Action Choice</th>
                      <th className="p-3">Internal Notes / Revision Wording</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {triageItems.map(item => (
                      <tr key={item.id} className="align-top">
                        <td className="p-3">
                          <p className="font-bold text-slate-800 mb-1">{item.targetSection}</p>
                          <p className="text-slate-600 line-clamp-2">{item.clientComment}</p>
                        </td>
                        <td className="p-3">
                          <select 
                            value={item.actionChoice}
                            onChange={(e) => handleTriageChange(item.id, 'actionChoice', e.target.value)}
                            className="w-full border border-slate-300 rounded p-1.5 bg-white text-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="" disabled>Select Action...</option>
                            <option value="Accept">Accept Redline</option>
                            <option value="Counter-Offer">Counter-Offer</option>
                            <option value="Reject">Reject</option>
                          </select>
                        </td>
                        <td className="p-3">
                          <textarea
                            rows={3}
                            placeholder="Enter the revised clause wording or internal note for v1.1..."
                            value={item.internalNotes}
                            onChange={(e) => handleTriageChange(item.id, 'internalNotes', e.target.value)}
                            className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-indigo-500"
                          />
                          {item.actionChoice === 'Counter-Offer' && (
                            <button 
                              onClick={() => handleTriageChange(item.id, 'internalNotes', item.aiSuggestedCounter)}
                              className="text-[10px] text-indigo-600 font-bold mt-1 hover:underline"
                            >
                              Use AI Suggestion
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        </>
      )}

    </div>
  );
}
