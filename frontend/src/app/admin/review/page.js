"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CheckSquare, Clock, AlertTriangle, Sparkles, Plus, Trash2, Upload, 
  Send, HelpCircle, FileText, Check, ShieldAlert, ArrowLeft, Bot,
  CheckCircle2, XCircle, MessageSquare, AlertCircle, Eye, GitCompare,
  UserCheck, ShieldCheck, Lock, ChevronRight, CornerUpLeft, RefreshCw, Search
} from 'lucide-react';
import PrimaryButton from '../../../common/buttons/PrimaryButton';
import { APIService } from '../../../service/apiService';
import { useAppContext } from '../../../context/appContext';

const DEMO_REVIEW_CONTRACT = {
  id: 1,
  tracking_id: 'REQ-2026-0891',
  title: 'Proposal_E-Commerce_Web_App_v1.0.docx',
  version_label: 'v1.0',
  entity_name: 'Acme Corp',
  deal_value: 22000,
  requester_name: 'Sales Rep (John Doe)',
  contract_manager: 'Alex Miller',
  status: 'Internal Review',
  priority: 'High',
  approval_sequence: [
    { step: 1, role: 'Operations', name: 'Alex Miller', status: 'Approved', timestamp: '2026-08-06 14:30' },
    { step: 2, role: 'Finance', name: 'Sarah Jenkins', status: 'Pending', timestamp: null },
    { step: 3, role: 'Legal', name: 'Elena Rostova', status: 'Queued', timestamp: null },
    { step: 4, role: 'Executive Leadership', name: 'David Chen', status: 'Queued', timestamp: null }
  ],
  clauses: [
    {
      id: 'sec-1',
      title: 'Section 1: Scope of Work & Services',
      text: 'The Provider agrees to deliver custom e-commerce web portal development including front-end UI design, back-end Stripe API integration, and automated PDF invoice generation.',
      risk: 'low'
    },
    {
      id: 'sec-2',
      title: 'Section 2: Timeline & Milestones',
      text: 'The estimated delivery schedule is set to 6.5 weeks from the Kickoff Date, subject to client providing API credentials within 5 business days.',
      risk: 'medium',
      alert: 'Operational Alert: Dependency team recommended 7 weeks.'
    },
    {
      id: 'sec-3',
      title: 'Section 3: Intellectual Property Transfer',
      text: 'All custom software code, designs, and deliverables created under this agreement shall belong exclusively to Client upon receipt of final payment.',
      risk: 'low',
      alert: 'IP Rights Check: Clause matches pre-approved Standard IP Transfer Template.'
    },
    {
      id: 'sec-4',
      title: 'Section 4: Commercial Terms & Payment Schedule',
      text: 'Client agrees to pay a total contract fee of ₹22,000 on a Net-60 payment schedule following milestone acceptance.',
      risk: 'high',
      alert: 'Financial Warning: Payment terms set to Net-60. Company baseline target is Net-30.'
    }
  ],
  baseline_diff_text: 'Client agrees to pay a total contract fee of ₹22,000 on a Net-30 payment schedule following milestone acceptance.',
  dependencies: [
    { department: 'UI/UX Design', lead: 'Alex Miller', hours: 45, status: 'Approved' },
    { department: 'Engineering', lead: 'David Chen', hours: 160, status: 'Approved' }
  ],
  margin_data: {
    contract_value: 22000,
    internal_cost: 14350,
    gross_margin: 34.77
  }
};

export default function ApproverWorkspaceStudioPage() {
  const { contracts: contextContracts, contractRequests: contextRequests } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [reviewContracts, setReviewContracts] = useState([]);
  const [selectedContract, setSelectedContract] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'detail'
  const [searchTerm, setSearchTerm] = useState('');

  // Studio State: Diff View & Inline Comments
  const [showDiffView, setShowDiffView] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState('risk');
  const [inlineComments, setInlineComments] = useState([]);
  const [selectedParagraph, setSelectedParagraph] = useState(null);
  const [newCommentType, setNewCommentType] = useState('Financial Query');
  const [newCommentText, setNewCommentText] = useState('');

  // Internal Discussion Stream State
  const [discussionNotes, setDiscussionNotes] = useState([]);
  const [newNoteText, setNewNoteText] = useState('');

  // Decision Modals State
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionCategory, setRejectionCategory] = useState('Commercial / Pricing Issue');
  const [rejectionReason, setRejectionReason] = useState('');
  const [targetClauseRef, setTargetClauseRef] = useState('Section 4: Commercial Terms & Payment Schedule');

  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [authorizationChecked, setAuthorizationChecked] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [securityPin, setSecurityPin] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState('');

  const loadContractData = async () => {
    setLoading(true);
    try {
      const [contractsData, requestsData] = await Promise.all([
        APIService.getContracts().catch(() => []),
        APIService.getRequests().catch(() => [])
      ]);

      const allContractsRaw = [
        ...(Array.isArray(contractsData) ? contractsData : []),
        ...(Array.isArray(contextContracts) ? contextContracts : [])
      ];

      const allRequestsRaw = [
        ...(Array.isArray(requestsData) ? requestsData : []),
        ...(Array.isArray(contextRequests) ? contextRequests : [])
      ];

      const contractsMap = new Map();
      allContractsRaw.forEach(c => {
        if (c && c.title) {
          const key = c.id || c.title;
          if (!contractsMap.has(key)) contractsMap.set(key, c);
        }
      });
      const uniqueContracts = Array.from(contractsMap.values());

      const requestsMap = new Map();
      allRequestsRaw.forEach(r => {
        if (r && (r.title || r.requestName)) {
          const key = r.id || r.title || r.requestName;
          if (!requestsMap.has(key)) requestsMap.set(key, r);
        }
      });
      const uniqueRequests = Array.from(requestsMap.values());

      const formattedContracts = [];

      uniqueContracts.forEach(c => {
        const meta = c.metadata_data || {};
        const isDecided = c.status === 'Approved' || c.status === 'Reviewed' || c.status === 'Rejected';
        const displayStatus = isDecided ? c.status : 'Pending';
        
        formattedContracts.push({
          id: c.id,
          tracking_id: c.tracking_id || `CTR-2026-${c.id}`,
          title: c.title,
          category: c.category || meta.category || 'General Commercial',
          version_label: isDecided ? 'v1.0-APPROVED' : 'v1.0',
          entity_name: meta.counterparty || meta.secondPartyName || meta.partyInfo?.secondPartyName || c.entity_name || 'Client / Party',
          contract_type: c.contract_type || meta.contractType || 'Standard Contract',
          deal_value: c.value || meta.commercialInfo?.totalValue || 0,
          requester_name: meta.partyInfo?.firstPartyName || 'Operations Manager',
          contract_manager: 'Alex Miller',
          status: displayStatus,
          isLocked: isDecided,
          rawMeta: meta,
          priority: c.priority || 'High',
          approval_sequence: [
            { step: 1, role: 'Operations', name: 'Alex Miller', status: 'Approved', timestamp: '2026-08-06 14:30' },
            { step: 2, role: 'Finance', name: 'Sarah Jenkins', status: displayStatus === 'Pending' ? 'Pending' : 'Approved', timestamp: 'Just now' },
            { step: 3, role: 'Legal', name: 'Elena Rostova', status: displayStatus === 'Pending' ? 'Queued' : 'Approved', timestamp: 'Just now' }
          ],
          clauses: meta.clauses && meta.clauses.length > 0 ? meta.clauses : [
            { id: 1, category: 'Confidentiality & IP Protection', text: 'All proprietary source code, software architecture, and trade secrets shared under this agreement remain exclusive property.' },
            { id: 2, category: 'Indemnification & Liability', text: 'Neither party shall be liable for indirect, incidental, or consequential damages arising from execution under this contract.' },
            { id: 3, category: 'Governing Law & Jurisdiction', text: 'This Agreement shall be governed by and construed under the laws of Delaware, USA.' }
          ]
        });
      });

      uniqueRequests.forEach(r => {
        const displayStatus = (r.status === 'Review' || r.status === 'Internal Review') ? 'Pending' : r.status || 'Pending';
        formattedContracts.push({
          id: r.id,
          tracking_id: r.tracking_id || `REQ-2026-${r.id}`,
          title: r.title || 'Contract Agreement',
          version_label: 'v1.0',
          entity_name: r.entity_name || r.client_name || 'Client / Party',
          contract_type: r.contract_type || 'Standard Agreement',
          deal_value: r.final_commercial_pricing || r.deal_value || r.value || 0,
          requester_name: 'Sales Rep',
          contract_manager: 'Alex Miller',
          status: displayStatus,
          isLocked: displayStatus !== 'Pending',
          priority: 'High',
          approval_sequence: [
            { step: 1, role: 'Operations', name: 'Alex Miller', status: 'Approved', timestamp: '2026-08-06 14:30' },
            { step: 2, role: 'Finance', name: 'Sarah Jenkins', status: displayStatus === 'Pending' ? 'Pending' : 'Approved', timestamp: null },
            { step: 3, role: 'Legal', name: 'Elena Rostova', status: displayStatus === 'Pending' ? 'Queued' : 'Approved', timestamp: null }
          ],
          clauses: [
            {
              id: 'sec-1',
              title: 'Section 1: Scope of Work & Services',
              text: r.description || 'Scope of Work & Services agreement.'
            }
          ]
        });
      });

      const finalContracts = formattedContracts.length > 0 ? formattedContracts : [DEMO_REVIEW_CONTRACT];

      setReviewContracts(finalContracts);
      setSelectedContract(finalContracts[0]);
    } catch (err) {
      console.error("Failed to load review requests from backend", err);
      setReviewContracts([DEMO_REVIEW_CONTRACT]);
      setSelectedContract(DEMO_REVIEW_CONTRACT);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContractData();
  }, [contextContracts, contextRequests]);

  const handleOpenReviewDetail = (c) => {
    setSelectedContract(c);
    setViewMode('detail');
  };

  const filteredContracts = reviewContracts.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.entity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.tracking_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConfirmRejection = async () => {
    if (rejectionReason.trim().length < 20) {
      alert("Please provide at least 20 characters in the rejection reason.");
      return;
    }
    setSubmittingAction(true);
    try {
      if (selectedContract.id) {
        await APIService.updateContract(selectedContract.id, {
          status: 'Rejected'
        }).catch(() => {});
      }
      await APIService.rejectAndRollback(selectedContract.id, {
        rejection_category: rejectionCategory,
        rejection_reason: rejectionReason,
        clause_reference: targetClauseRef
      }).catch(() => {});

      setActionSuccessMessage(`Contract ${selectedContract.tracking_id} rejected and status set to 'Rejected'.`);
      setShowRejectionModal(false);
      setViewMode('list');
      await loadContractData();
    } catch (err) {
      alert("Failed to submit rejection");
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleConfirmApproval = async () => {
    if (!authorizationChecked) {
      alert("Please check the formal authorization checkbox.");
      return;
    }
    setSubmittingAction(true);
    try {
      if (selectedContract.id) {
        await APIService.updateContract(selectedContract.id, {
          status: 'Reviewed'
        }).catch(() => {});
      }
      await APIService.approveContract(selectedContract.id, {
        authorization_checkpoint: authorizationChecked,
        approval_notes: approvalNotes,
        security_pin: securityPin
      }).catch(() => {});

      setActionSuccessMessage("Contract approved successfully! Status updated to 'Reviewed'.");
      setShowApprovalModal(false);
      setViewMode('list');
      await loadContractData();
    } catch (err) {
      alert("Failed to submit approval: " + (err.message || "Unknown error"));
    } finally {
      setSubmittingAction(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading Approver's Document Review Studio...</div>;
  }

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
                <CheckSquare className="w-7 h-7 text-indigo-600" />
                Review & Approvals Workspace
              </h1>
              <p className="text-xs text-slate-500 mt-1">Review contracts currently pending governance approval, audit terms, and execute formal sign-offs.</p>
            </div>
            <button
              onClick={loadContractData}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh List
            </button>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center gap-4">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search contracts on review by title, client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
              />
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg">
              {filteredContracts.length} Contracts Pending Review
            </span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5">Contract Tracking ID</th>
                    <th className="px-4 py-3.5">Contract Title & Valuation</th>
                    <th className="px-4 py-3.5">Client / Counterparty</th>
                    <th className="px-4 py-3.5">Contract Type</th>
                    <th className="px-4 py-3.5">Contract Manager</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredContracts.length > 0 ? (
                    filteredContracts.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-4 font-mono font-bold text-indigo-600 whitespace-nowrap">
                          {c.tracking_id}
                        </td>
                        <td className="px-4 py-4 max-w-xs">
                          <span 
                            onClick={() => handleOpenReviewDetail(c)}
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
                        <td className="px-4 py-4 text-slate-700 whitespace-nowrap">
                          {c.contract_type}
                        </td>
                        <td className="px-4 py-4 font-medium text-slate-800 whitespace-nowrap">
                          {c.contract_manager}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${
                            c.status === 'Approved' || c.status === 'Reviewed'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : c.status === 'Rejected'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {c.status === 'Approved' || c.status === 'Reviewed' ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ) : c.status === 'Rejected' ? (
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            ) : (
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                            )}
                            {c.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleOpenReviewDetail(c)}
                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg inline-flex items-center gap-1.5 shadow-sm transition-colors"
                          >
                            {c.isLocked ? 'View Contract' : 'Review Contract'} <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                        No contracts currently pending review.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 2: CONTRACT DETAIL REVIEW STUDIO */}
      {/* ========================================================================= */}
      {viewMode === 'detail' && selectedContract && (
        <>
          <div className="flex justify-between items-center mb-2">
            <button
              onClick={() => setViewMode('list')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Review List
            </button>
          </div>

          <div className="bg-slate-900 text-white p-5 rounded-xl shadow-md border border-slate-800 flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 font-mono">
                    {selectedContract.tracking_id}
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30">
                    {selectedContract.version_label}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                    selectedContract.isLocked ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                  }`}>
                    {selectedContract.isLocked ? 'Action Completed (Locked)' : 'Pending Your Decision'}
                  </span>
                </div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  {selectedContract.title}
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Client: <span className="text-white font-semibold">{selectedContract.entity_name}</span> | Valuation: <span className="text-emerald-400 font-bold">${selectedContract.deal_value?.toLocaleString('en-US')}</span> | Manager: <span className="text-slate-300">{selectedContract.contract_manager}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {selectedContract.isLocked ? (
                  <span className="px-4 py-2 bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-emerald-400" /> Decision Locked ({selectedContract.status})
                  </span>
                ) : (
                  <>
                    <button
                      onClick={() => setShowRejectionModal(true)}
                      className="px-4 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <CornerUpLeft className="w-4 h-4" />
                      Reject / Request Changes
                    </button>
                    
                    <button
                      onClick={() => setShowApprovalModal(true)}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve Contract
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* LIVE FORMATTED LEGAL DOCUMENT PAPER VIEWER */}
          <div className="bg-white border-2 border-slate-300 rounded-xl p-6 md:p-8 shadow-md flex flex-col gap-6 font-serif text-slate-900 relative overflow-hidden">
            
            {/* CONFIDENTIAL WATERMARK */}
            <div className="absolute right-6 top-6 opacity-15 pointer-events-none">
              <span className="text-3xl md:text-4xl font-extrabold tracking-widest text-slate-400 uppercase font-sans">
                {selectedContract.status === 'Approved' || selectedContract.status === 'Reviewed' ? 'APPROVED CONTRACT' : 'DRAFT - CONFIDENTIAL'}
              </span>
            </div>

            {/* DOCUMENT HEADER */}
            <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 font-sans">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-blue-700">MARKETBYTES CLM LEGAL CONTRACT</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Ref: {selectedContract.tracking_id} | Category: {selectedContract.category || 'General Commercial'}</p>
              </div>
              <div className="sm:text-right text-[11px]">
                <p className="font-bold text-slate-800">Effective Date: {selectedContract.rawMeta?.effectiveDate || new Date().toLocaleDateString('en-US')}</p>
                <p className="text-slate-600">Governing Jurisdiction: {selectedContract.rawMeta?.jurisdiction || 'Delaware, USA'}</p>
              </div>
            </div>

            {/* CONTRACT TITLE */}
            <div className="text-center my-2 font-sans">
              <h1 className="text-lg md:text-xl font-bold uppercase text-slate-900 tracking-wide underline">
                {selectedContract.title}
              </h1>
              <p className="text-xs text-slate-600 italic mt-1">
                COMMERCIAL LEGAL AGREEMENT ({selectedContract.contract_type})
              </p>
            </div>

            {/* PREAMBLE */}
            <div className="text-xs leading-relaxed text-slate-800 font-sans">
              <p>
                <strong>THIS AGREEMENT</strong> is made and entered into as of <strong>{selectedContract.rawMeta?.effectiveDate || new Date().toLocaleDateString('en-US')}</strong>, by and between:
              </p>
              <div className="mt-2 pl-3 border-l-2 border-slate-400 flex flex-col gap-1">
                <span className="font-bold text-slate-900">FIRST PARTY (PROVIDER / ISSUER):</span>
                <p>{selectedContract.rawMeta?.firstPartyName || 'MarketBytes CLM Corp'}, located at {selectedContract.rawMeta?.firstPartyAddress || 'Wilmington, DE'} (Tax ID: DE-987654321), represented by Authorized Signatory.</p>
              </div>
              <div className="mt-2 pl-3 border-l-2 border-blue-500 flex flex-col gap-1">
                <span className="font-bold text-slate-900">SECOND PARTY (CLIENT / COUNTERPARTY):</span>
                <p>{selectedContract.entity_name}, located at {selectedContract.rawMeta?.secondPartyAddress || 'Corporate HQ'}.</p>
              </div>
            </div>

            {/* ARTICLE 1: SCOPE OF WORK & DELIVERABLES */}
            <div className="flex flex-col gap-2 font-sans">
              <h3 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-300 pb-1">
                ARTICLE I: SCOPE OF WORK & DELIVERABLES
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed font-serif">
                {selectedContract.rawMeta?.scopeSummary || `The Scope of Work covers software delivery, technical consulting, and legal compliance services for ${selectedContract.entity_name}.`}
              </p>
              
              <div className="mt-2 border border-slate-200 rounded-lg overflow-hidden font-sans">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2">Deliverable Name</th>
                      <th className="p-2">Description</th>
                      <th className="p-2">Owner</th>
                      <th className="p-2">Timeline</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {(selectedContract.rawMeta?.deliverables || [
                      { name: 'Initial Specifications & Architecture', description: 'Technical blueprint and system specs sign-off', owner: 'Product Lead', timeline: 'Week 2' },
                      { name: 'Phase 1 Delivery & API Integration', description: 'Core API endpoints and backend services', owner: 'Engineering Team', timeline: 'Week 5' },
                      { name: 'Final Acceptance & Sign-off', description: 'Production deployment and QA sign-off', owner: 'Client Manager', timeline: 'Week 8' }
                    ]).map((d, i) => (
                      <tr key={i}>
                        <td className="p-2 font-semibold text-slate-900">{d.name}</td>
                        <td className="p-2">{d.description}</td>
                        <td className="p-2">{d.owner}</td>
                        <td className="p-2 font-bold text-blue-700">{d.timeline}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ARTICLE 2: COMMERCIAL COMPENSATION & FINANCIAL TERMS */}
            <div className="flex flex-col gap-2 font-sans">
              <h3 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-300 pb-1">
                ARTICLE II: COMMERCIAL COMPENSATION & FINANCIAL TERMS
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 font-bold">Total Contract Value:</span>
                  <p className="font-bold text-slate-900">${(selectedContract.deal_value || 0).toLocaleString('en-US')} USD</p>
                </div>
                <div><span className="text-slate-500 font-bold">Billing Schedule:</span> <p className="font-bold text-slate-800">{selectedContract.rawMeta?.payment_schedule || 'Milestone-Based Payments'}</p></div>
                <div><span className="text-slate-500 font-bold">Jurisdiction:</span> <p className="font-bold text-slate-800">{selectedContract.rawMeta?.jurisdiction || 'Delaware, USA'}</p></div>
              </div>
            </div>

            {/* ARTICLE 3: LEGAL TERMS & CLAUSES */}
            <div className="flex flex-col gap-2 font-sans">
              <h3 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-300 pb-1">
                ARTICLE III: LEGAL TERMS, CLAUSES & COVENANTS
              </h3>
              <div className="flex flex-col gap-2 text-xs font-serif text-slate-800">
                {selectedContract.clauses.map((c, i) => (
                  <div key={c.id || i} className="flex flex-col gap-1">
                    <strong>§ 3.{i + 1} {c.category || `Section ${i + 1}`}:</strong>
                    <p>{c.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ARTICLE 4: SIGNATURE BLOCKS */}
            <div className="pt-6 border-t-2 border-slate-900 font-sans grid grid-cols-2 gap-8 text-xs mt-4">
              <div className="flex flex-col gap-4">
                <span className="font-bold text-slate-900 uppercase">IN WITNESS WHEREOF (FIRST PARTY):</span>
                <div className="border-b border-slate-900 h-10 flex items-end pb-1 font-mono text-slate-400 italic">
                  [ Digital Signature Line ]
                </div>
                <div>
                  <p className="font-bold text-slate-900">{selectedContract.rawMeta?.firstPartyName || 'MarketBytes CLM Corp'}</p>
                  <p className="text-slate-600">Authorized Representative</p>
                  <p className="text-slate-500 text-[10px]">Date: ________________________</p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <span className="font-bold text-slate-900 uppercase">IN WITNESS WHEREOF (SECOND PARTY):</span>
                <div className="border-b border-slate-900 h-10 flex items-end pb-1 font-mono text-slate-400 italic">
                  [ Digital Signature Line ]
                </div>
                <div>
                  <p className="font-bold text-slate-900">{selectedContract.entity_name}</p>
                  <p className="text-slate-600">Authorized Representative</p>
                  <p className="text-slate-500 text-[10px]">Date: ________________________</p>
                </div>
              </div>
            </div>

          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 4.2 MODAL A: REJECTION / REQUEST CHANGES MODAL */}
      {/* ========================================================================= */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 flex flex-col gap-5">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-rose-700 flex items-center gap-2">
                  <CornerUpLeft className="w-5 h-5 text-rose-600" /> Reject / Request Changes
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Specify why you are rejecting this draft and trigger automated rollback to Contract Manager.</p>
              </div>
              <button onClick={() => setShowRejectionModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {/* Rejection Category Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Rejection Category *</label>
              <select
                value={rejectionCategory}
                onChange={(e) => setRejectionCategory(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white font-semibold text-slate-800"
              >
                <option value="Commercial / Pricing Issue">Commercial / Pricing Issue</option>
                <option value="Scope / Timeline Feasibility">Scope / Timeline Feasibility</option>
                <option value="Legal / Compliance Risk">Legal / Compliance Risk</option>
                <option value="Unclear Terms">Unclear Terms</option>
              </select>
            </div>

            {/* Target Clause Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Section / Clause Reference *</label>
              <select
                value={targetClauseRef}
                onChange={(e) => setTargetClauseRef(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white text-slate-800 font-semibold"
              >
                <option value="Article I: Scope of Work & Deliverables">Article I: Scope of Work & Deliverables</option>
                <option value="Article II: Commercial Compensation & Financial Terms">Article II: Commercial Compensation & Financial Terms</option>
                <option value="Article III: Legal Terms & Confidentiality">Article III: Legal Terms & Confidentiality</option>
                <option value="Article IV: Indemnification & Liability">Article IV: Indemnification & Liability</option>
                {(selectedContract?.clauses || []).map((c, idx) => {
                  const val = c.category ? `Article III: ${c.category}` : (c.title || `Section ${idx + 1}`);
                  return <option key={c.id || idx} value={val}>{val}</option>;
                })}
              </select>
            </div>

            {/* Mandatory Rejection Reason Text Area */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mandatory Rejection Reason & Instructions * (Min 20 Chars)</label>
              <textarea
                rows={3}
                required
                placeholder="Specify exactly what must be changed for you to approve (e.g. Change payment terms from Net-60 back to Net-30 or increase total fee by 10%)..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-rose-500 font-sans"
              />
            </div>

            {/* ⚠️ Rollback Notice Banner */}
            <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-xs text-amber-900">
              ⚠️ <span className="font-bold">Rollback Action Warning:</span> Submitting this rejection will halt the current approval chain and route the contract back to Contract Manager <span className="font-bold">{selectedContract?.contract_manager}</span> for revision (v1.1).
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowRejectionModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRejection}
                disabled={submittingAction}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
              >
                {submittingAction ? 'Executing Rollback...' : 'Confirm Rejection & Rollback'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 4.2 MODAL B: APPROVAL CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 flex flex-col gap-5">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Confirm Contract Approval
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Formal authorization for proposal {selectedContract?.title}.</p>
              </div>
              <button onClick={() => setShowApprovalModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {/* Authorization Checkbox */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3.5 flex items-center gap-3">
              <input
                type="checkbox"
                id="authCheck"
                checked={authorizationChecked}
                onChange={(e) => setAuthorizationChecked(e.target.checked)}
                className="w-5 h-5 text-emerald-600 rounded cursor-pointer"
              />
              <label htmlFor="authCheck" className="text-xs font-bold text-emerald-950 cursor-pointer">
                Approval Authorization: I have reviewed the scope, financial terms, and legal clauses in {selectedContract?.version_label} and give formal authorization.
              </label>
            </div>

            {/* Optional Approval Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Approval Notes (Optional)</label>
              <textarea
                rows={2}
                placeholder="Add any conditional guidance for the sales team..."
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 font-sans"
              />
            </div>

            {/* Security PIN / 2FA Prompt */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Security PIN Verification</label>
              <input
                type="password"
                placeholder="Enter 4-digit security PIN (e.g. 1234)"
                value={securityPin}
                onChange={(e) => setSecurityPin(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowApprovalModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmApproval}
                disabled={submittingAction}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
              >
                {submittingAction ? 'Recording Approval...' : 'Confirm Approval'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
