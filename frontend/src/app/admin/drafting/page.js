"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  PenTool, Clock, CheckCircle2, AlertTriangle, Sparkles, Layers, 
  DollarSign, Calendar, Plus, Trash2, ArrowRight, ShieldCheck, RefreshCw, 
  UserCheck, XCircle, Search, Filter, ArrowLeft, Bot, FileText, ChevronRight, Shield, Printer
} from 'lucide-react';
import PrimaryButton from '../../../common/buttons/PrimaryButton';
import { APIService } from '../../../service/apiService';
import { useAppContext } from '../../../context/appContext';

export default function DraftingWorkspacePage() {
  const router = useRouter();
  const { contracts: contextContracts, contractRequests: contextRequests } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [draftContracts, setDraftContracts] = useState([]);
  
  // View Control: 'list' (Draft Contracts Table) vs 'detail' (Contract Draft View)
  const [viewMode, setViewMode] = useState('list');
  const [selectedContract, setSelectedContract] = useState(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Detail View Configuration State
  const [finalPricing, setFinalPricing] = useState('22000');
  const [paymentSchedule, setPaymentSchedule] = useState('Milestone-Based Payments');
  const [milestones, setMilestones] = useState([
    { name: 'Initial Kickoff & UI/UX Specs', deliverable: 'High-fidelity Figma prototypes', percentage: 30, completionDate: '2026-09-01' },
    { name: 'Phase 1 Backend & API Integration', deliverable: 'Stripe & Core API Endpoints', percentage: 40, completionDate: '2026-09-20' },
    { name: 'Final Delivery & Acceptance', deliverable: 'Production Deployment & QA Signoff', percentage: 30, completionDate: '2026-10-15' }
  ]);
  const [scopeApprovalChecked, setScopeApprovalChecked] = useState(false);
  const [synthesizing, setSynthesizing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAiCopilot, setShowAiCopilot] = useState(true);

  const loadDraftingData = async () => {
    setLoading(true);
    try {
      // Query contracts and requests from live FastAPI backend
      const [contractsData, requestsData] = await Promise.all([
        APIService.getContracts().catch(() => []),
        APIService.getRequests().catch(() => [])
      ]);

      const allContractsRaw = [
        ...(contractsData || []),
        ...(contextContracts || [])
      ];

      const allRequestsRaw = [
        ...(requestsData || []),
        ...(contextRequests || [])
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

      const formattedContracts = uniqueContracts.map(c => ({
        id: c.id || `CTR-${Date.now()}`,
        is_real_contract: true,
        raw_contract: c,
        tracking_id: c.tracking_id || `CTR-2026-${c.id || Math.floor(100 + Math.random() * 900)}`,
        title: c.title,
        entity_name: c.metadata_data?.counterparty || c.metadata_data?.secondPartyName || c.entity_name || 'Acme Corp',
        entity_type: c.entity_type || 'Client / Customer',
        contract_type: c.metadata_data?.contractType || c.metadata_data?.contract_type || c.contract_type || 'Master Services Agreement (MSA)',
        category: c.metadata_data?.category || c.category || 'Revenue / Sales',
        template: c.metadata_data?.template || 'Standard Template',
        jurisdiction: c.metadata_data?.jurisdiction || 'Delaware, USA',
        signatory: c.metadata_data?.signatory || 'Authorized Representative',
        value: c.value || 75000,
        currency: 'USD',
        owner_name: c.owner_name || 'Alex Miller',
        priority: c.priority || 'High',
        status: c.status || 'Drafting In Progress',
        ai_summary: c.ai_summary || '',
        created_at: c.created_at || new Date().toISOString(),
        metadata_data: c.metadata_data || {}
      }));

      const formattedRequests = uniqueRequests.filter(r => r.status === 'Drafting In Progress' || r.status === 'Dependency Gathering' || r.status === 'Draft').map(r => ({
        id: r.id || `REQ-${Date.now()}`,
        tracking_id: r.tracking_id || `REQ-2026-${r.id}`,
        title: r.title || r.requestName || 'Contract Intake Draft',
        entity_name: r.entity_name || r.clientName || 'Acme Corp',
        entity_type: r.entity_type || 'Client / Customer',
        contract_type: r.contract_type || r.contractType || 'MSA',
        category: r.category || r.contractCategory || 'Revenue / Sales',
        value: r.final_commercial_pricing || r.deal_value || r.estimatedValue || 22000,
        currency: r.currency || 'USD',
        owner_name: r.owner_name || 'Alex Miller',
        priority: r.priority || 'High',
        status: r.status || 'Drafting In Progress',
        created_at: r.created_at || new Date().toISOString(),
        dependencies: r.dependencies || []
      }));

      let combined = [...formattedContracts, ...formattedRequests];

      if (combined.length === 0) {
        combined = [
          {
            id: 101,
            is_real_contract: true,
            tracking_id: 'CTR-2026-101',
            title: 'Master Services Agreement (MSA) - Hooli Global',
            entity_name: 'Hooli Global Technologies Ltd.',
            entity_type: 'Client / Customer',
            contract_type: 'Master Services Agreement (MSA)',
            category: 'Revenue / Sales',
            template: 'Company Standard Template (2026)',
            jurisdiction: 'Delaware, USA',
            signatory: 'David Chen (VP Engineering)',
            value: 75000,
            currency: 'USD',
            owner_name: 'Alex Miller',
            priority: 'High',
            status: 'Drafting In Progress',
            ai_summary: 'Comprehensive software development & SLA agreement.',
            created_at: new Date().toISOString()
          },
          {
            id: 102,
            is_real_contract: true,
            tracking_id: 'CTR-2026-102',
            title: 'Executive Software Engineer Offer Letter - Acme Corp',
            entity_name: 'Jane Doe (Candidate)',
            entity_type: 'Employee / Candidate',
            contract_type: 'Executive Offer Letter',
            category: 'HR & Employment',
            template: 'Standard Employment Agreement',
            jurisdiction: 'India (New Delhi / Mumbai)',
            signatory: 'Sarah Jenkins (HR Lead)',
            value: 1200000,
            currency: 'INR',
            owner_name: 'Sarah Jenkins',
            priority: 'High',
            status: 'Drafting In Progress',
            ai_summary: 'Employment agreement including ₹12L annual base salary and 5,000 ESOP shares.',
            created_at: new Date().toISOString()
          }
        ];
      }

      setDraftContracts(combined);
    } catch (err) {
      console.error("Failed to load live contracts for drafting", err);
      setDraftContracts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDraftingData();
  }, [contextContracts, contextRequests]);

  // Editing State for Draft Agreement
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editEntityName, setEditEntityName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editContractType, setEditContractType] = useState('');
  const [editValue, setEditValue] = useState('');
  const [editAiSummary, setEditAiSummary] = useState('');
  const [editEffectiveDate, setEditEffectiveDate] = useState('');
  const [editJurisdiction, setEditJurisdiction] = useState('');
  const [editFirstPartyName, setEditFirstPartyName] = useState('');
  const [editFirstPartyAddress, setEditFirstPartyAddress] = useState('');
  const [editSecondPartyAddress, setEditSecondPartyAddress] = useState('');
  const [editDeliverables, setEditDeliverables] = useState([]);
  const [editClauses, setEditClauses] = useState([]);

  const handleOpenDraftDetail = (contract) => {
    setSelectedContract(contract);
    setFinalPricing(contract.value ? contract.value.toString() : '22000');
    // Populate edit fields from saved metadata or defaults
    const meta = contract.metadata_data || {};
    const party = meta.partyInfo || {};
    
    setEditTitle(contract.title || '');
    setEditEntityName(contract.entity_name || meta.counterparty || '');
    setEditCategory(contract.category || meta.category || '');
    setEditContractType(contract.contract_type || meta.contract_type || '');
    setEditValue(contract.value ? contract.value.toString() : '');
    setEditAiSummary(contract.ai_summary || meta.scopeSummary || '');
    setEditEffectiveDate(meta.effectiveDate || new Date().toISOString().split('T')[0]);
    setEditJurisdiction(contract.jurisdiction || meta.jurisdiction || 'Delaware, USA');
    setEditFirstPartyName(party.firstPartyName || 'MarketBytes CLM Corp');
    setEditFirstPartyAddress(party.firstPartyAddress || 'Wilmington, DE');
    setEditSecondPartyAddress(party.secondPartyAddress || party.candidateAddress || 'Corporate HQ');
    
    setEditDeliverables(meta.deliverables && meta.deliverables.length > 0 ? meta.deliverables : [
      { name: 'Initial Specifications & Architecture', description: 'Technical blueprint and system specs sign-off', owner: 'Product Lead', timeline: 'Week 2' },
      { name: 'Phase 1 Delivery & API Integration', description: 'Core API endpoints and backend services', owner: 'Engineering Team', timeline: 'Week 5' },
      { name: 'Final Acceptance & Sign-off', description: 'Production deployment and QA sign-off', owner: 'Client Manager', timeline: 'Week 8' }
    ]);
    
    setEditClauses(meta.clauses && meta.clauses.length > 0 ? meta.clauses : [
      { id: 1, category: 'Confidentiality & IP Protection', text: 'All proprietary source code, software architecture, and trade secrets shared under this agreement remain exclusive property.' },
      { id: 2, category: 'Indemnification & Liability', text: 'Neither party shall be liable for indirect, incidental, or consequential damages arising from execution under this contract.' },
      { id: 3, category: 'Governing Law & Jurisdiction', text: 'This Agreement shall be governed by and construed under the laws of Delaware, USA.' }
    ]);

    setIsEditing(false);
    setViewMode('detail');
  };

  const handleSaveChanges = async () => {
    if (!selectedContract) return;
    setSaving(true);
    try {
      const updatedMeta = {
        ...(selectedContract.metadata_data || {}),
        counterparty: editEntityName,
        category: editCategory,
        contract_type: editContractType,
        jurisdiction: editJurisdiction,
        effectiveDate: editEffectiveDate,
        scopeSummary: editAiSummary,
        deliverables: editDeliverables,
        clauses: editClauses,
        partyInfo: {
          ...(selectedContract.metadata_data?.partyInfo || {}),
          firstPartyName: editFirstPartyName,
          firstPartyAddress: editFirstPartyAddress,
          secondPartyName: editEntityName,
          secondPartyAddress: editSecondPartyAddress
        }
      };

      if (selectedContract.is_real_contract) {
        const payload = {
          title: editTitle,
          value: parseFloat(editValue) || 0,
          ai_summary: editAiSummary,
          metadata_data: updatedMeta
        };
        await APIService.updateContract(selectedContract.id, payload);
        alert("Draft agreement document updated and saved successfully!");
      } else {
        alert("Draft agreement document updated!");
      }

      const updatedContract = {
        ...selectedContract,
        title: editTitle,
        entity_name: editEntityName,
        category: editCategory,
        contract_type: editContractType,
        jurisdiction: editJurisdiction,
        value: parseFloat(editValue) || 0,
        ai_summary: editAiSummary,
        metadata_data: updatedMeta
      };
      setSelectedContract(updatedContract);
      setIsEditing(false);
      await loadDraftingData();
    } catch (err) {
      console.error("Failed to save draft edits", err);
      alert("Failed to save changes: " + (err.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedContract(null);
  };

  const handleSynthesizeAi = async () => {
    if (!selectedContract) return;
    setSynthesizing(true);
    try {
      const res = await APIService.synthesizeDependencies(selectedContract.id).catch(() => null);
      if (res && res.recommended_client_pricing) {
        setFinalPricing(res.recommended_client_pricing.toString());
      } else {
        setFinalPricing('22000');
      }
    } catch (err) {
      setFinalPricing('22000');
    } finally {
      setSynthesizing(false);
    }
  };

  const addMilestoneRow = () => {
    setMilestones([
      ...milestones,
      { name: 'New Milestone', deliverable: 'Key deliverable requirement', percentage: 20, completionDate: '' }
    ]);
  };

  const removeMilestoneRow = (index) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const updateMilestone = (index, field, value) => {
    const updated = [...milestones];
    updated[index][field] = value;
    setMilestones(updated);
  };

  const handleProceedToReview = async () => {
    if (!scopeApprovalChecked) {
      alert("Please confirm the Scope Approval Checkpoint before proceeding.");
      return;
    }
    setSaving(true);
    try {
      if (selectedContract.is_real_contract) {
        const payload = {
          status: 'Review',
          value: parseFloat(finalPricing) || selectedContract.value || 0,
          metadata_data: {
            ...(selectedContract.metadata_data || {}),
            payment_schedule: paymentSchedule,
            milestones: milestones,
            scope_approval_checkpoint: scopeApprovalChecked
          }
        };
        await APIService.updateContract(selectedContract.id, payload);
      } else {
        await APIService.proceedToDrafting(selectedContract.id, {
          final_commercial_pricing: parseFloat(finalPricing) || 0,
          payment_schedule: paymentSchedule,
          status: 'Review'
        }).catch(() => {});
      }
      alert(`Contract "${selectedContract?.title}" locked and transitioned to Review! Status updated to "Review".`);
      await loadDraftingData();
      router.push('/admin/review');
    } catch (err) {
      console.error("Failed to transition contract to review", err);
      alert("Failed to transition contract: " + (err.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  const filteredContracts = draftContracts.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (c.entity_name && c.entity_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (c.tracking_id && c.tracking_id.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading Drafting Workspace...</div>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto p-4 md:p-6">
      
      {/* ========================================================================= */}
      {/* VIEW MODE 1: DRAFT CONTRACTS LIST TABLE */}
      {/* ========================================================================= */}
      {viewMode === 'list' && (
        <>
          {/* Header Bar & Metrics */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <PenTool className="w-7 h-7 text-blue-600" />
                Drafting Workspace
              </h1>
              <p className="text-xs text-slate-500 mt-1">Manage contracts currently in drafting status, author terms, and perform pre-drafting AI synthesis.</p>
            </div>
            <button
              onClick={loadDraftingData}
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh List
            </button>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Draft Contracts</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{draftContracts.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Drafting In Progress</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {draftContracts.filter(c => c.status === 'Drafting In Progress').length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <PenTool className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Pre-Drafting Review</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">
                  {draftContracts.filter(c => c.status === 'Draft' || c.status === 'Dependency Gathering').length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between gap-4 items-center">
            <div className="flex gap-1.5 bg-slate-100 p-1 rounded-lg w-full md:w-auto">
              {['All', 'Drafting In Progress', 'Dependency Gathering', 'Draft'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    statusFilter === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search draft contracts, clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              />
            </div>
          </div>

          {/* Draft Contracts Data Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5">Contract Tracking ID</th>
                    <th className="px-4 py-3.5">Contract Title & Valuation</th>
                    <th className="px-4 py-3.5">Client / Party</th>
                    <th className="px-4 py-3.5">Contract Type</th>
                    <th className="px-4 py-3.5">Manager / Owner</th>
                    <th className="px-4 py-3.5">Priority</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredContracts.length > 0 ? (
                    filteredContracts.map((contract) => (
                      <tr key={contract.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-4 font-mono font-bold text-blue-600 whitespace-nowrap">
                          {contract.tracking_id}
                        </td>
                        <td className="px-4 py-4 max-w-xs">
                          <span 
                            onClick={() => handleOpenDraftDetail(contract)}
                            className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer line-clamp-1"
                          >
                            {contract.title}
                          </span>
                          <span className="text-[10px] text-slate-500 font-semibold block">
                            Valuation: {contract.currency || 'USD'} ${contract.value ? contract.value.toLocaleString() : '0'}
                          </span>
                        </td>
                        <td className="px-4 py-4 font-medium text-slate-800 whitespace-nowrap">
                          {contract.entity_name}
                        </td>
                        <td className="px-4 py-4 text-slate-700 whitespace-nowrap">
                          {contract.contract_type}
                        </td>
                        <td className="px-4 py-4 font-medium text-slate-800 whitespace-nowrap">
                          {contract.owner_name}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            contract.priority === 'Urgent' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {contract.priority}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 flex items-center gap-1 w-fit">
                            <PenTool className="w-3.5 h-3.5" /> {contract.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleOpenDraftDetail(contract)}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg inline-flex items-center gap-1.5 shadow-sm transition-colors"
                          >
                            View Draft <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                        No draft contracts found in database. Create a contract request or convert a request to draft.
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
      {/* VIEW MODE 2: DETAILED VIEW DRAFT WORKSPACE WITH RIGHT-SIDE AI DRAWER */}
      {/* ========================================================================= */}
      {viewMode === 'detail' && selectedContract && (
        <>
          <div className="flex justify-between items-center">
            <button
              onClick={handleBackToList}
              className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Draft Contracts List
            </button>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full">
                {selectedContract.status}
              </span>
              <button
                onClick={() => setShowAiCopilot(prev => !prev)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Bot className="w-4 h-4 text-indigo-400" />
                {showAiCopilot ? 'Hide AI Copilot' : 'Show AI Copilot'}
              </button>
            </div>
          </div>

          <div className={`grid grid-cols-1 ${showAiCopilot ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-6`}>
            
            {/* MAIN AUTHORING & DRAFT AGREEMENT PAPER */}
            <div className={`${showAiCopilot ? 'lg:col-span-2' : 'lg:col-span-1'} flex flex-col gap-6`}>
              
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                      {selectedContract.tracking_id}
                    </span>
                    {isEditing ? (
                      <div className="mt-1">
                        <label className="text-[10px] font-bold text-slate-500 block uppercase">Contract Title</label>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full text-lg font-bold border border-blue-400 rounded px-2 py-1 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    ) : (
                      <h1 className="text-xl font-bold text-slate-900 mt-1">{selectedContract.title}</h1>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {isEditing ? (
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block uppercase">Valuation ($)</label>
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-32 text-sm font-bold border border-blue-400 rounded px-2 py-1 text-slate-900"
                        />
                      </div>
                    ) : (
                      <span className="text-sm font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">
                        Valuation: {selectedContract.currency} ${selectedContract.value ? selectedContract.value.toLocaleString('en-US') : '0'}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (isEditing) {
                          handleSaveChanges();
                        } else {
                          setIsEditing(true);
                        }
                      }}
                      disabled={saving}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isEditing 
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow' 
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                      }`}
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      {isEditing ? (saving ? 'Saving...' : 'Save Draft Changes') : 'Edit Draft Details'}
                    </button>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-slate-700 rounded-lg text-xs font-bold"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Client / Party</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editEntityName}
                        onChange={(e) => setEditEntityName(e.target.value)}
                        className="w-full font-bold text-slate-800 border border-slate-300 rounded px-2 py-1"
                      />
                    ) : (
                      <span className="font-bold text-slate-800">{selectedContract.entity_name}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Contract Category</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="w-full font-bold text-slate-800 border border-slate-300 rounded px-2 py-1"
                      />
                    ) : (
                      <span className="font-bold text-slate-800">{selectedContract.category}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Contract Type</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editContractType}
                        onChange={(e) => setEditContractType(e.target.value)}
                        className="w-full font-bold text-slate-800 border border-slate-300 rounded px-2 py-1"
                      />
                    ) : (
                      <span className="font-bold text-slate-800">{selectedContract.contract_type}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* LIVE FORMATTED AGREEMENT DRAFT DOCUMENT */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" /> Drafted Agreement Document
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print / Export PDF
                    </button>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold rounded">
                      v0.1 Draft Mode
                    </span>
                  </div>
                </div>

                {/* LIVE FORMATTED LEGAL DOCUMENT PAPER VIEWER */}
                <div className="bg-white border-2 border-slate-300 rounded-xl p-6 md:p-8 shadow-md flex flex-col gap-6 font-serif text-slate-900 relative overflow-hidden">
                  
                  {/* CONFIDENTIAL WATERMARK */}
                  <div className="absolute right-6 top-6 opacity-15 pointer-events-none">
                    <span className="text-3xl md:text-4xl font-extrabold tracking-widest text-slate-400 uppercase font-sans">
                      DRAFT - CONFIDENTIAL
                    </span>
                  </div>

                  {/* DOCUMENT HEADER */}
                  <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 font-sans">
                    <div>
                      <span className="text-xs font-extrabold uppercase tracking-widest text-blue-700">MARKETBYTES CLM LEGAL CONTRACT DRAFT</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">Ref: {selectedContract.tracking_id} | Category: {selectedContract.category}</p>
                    </div>
                    <div className="sm:text-right text-[11px]">
                      {isEditing ? (
                        <div className="flex flex-col gap-1 items-end">
                          <div className="flex items-center gap-1"><span className="text-slate-500">Effective:</span> <input type="date" value={editEffectiveDate} onChange={(e) => setEditEffectiveDate(e.target.value)} className="border px-1 text-xs rounded" /></div>
                          <div className="flex items-center gap-1"><span className="text-slate-500">Jurisdiction:</span> <input type="text" value={editJurisdiction} onChange={(e) => setEditJurisdiction(e.target.value)} className="border px-1 text-xs rounded w-32" /></div>
                        </div>
                      ) : (
                        <>
                          <p className="font-bold text-slate-800">Effective Date: {editEffectiveDate || new Date().toLocaleDateString('en-US')}</p>
                          <p className="text-slate-600">Governing Jurisdiction: {editJurisdiction || selectedContract.jurisdiction || 'Delaware, USA'}</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* CONTRACT TITLE */}
                  <div className="text-center my-2 font-sans">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="text-center font-bold text-lg md:text-xl uppercase border-b-2 border-blue-500 w-full text-slate-900 focus:outline-none"
                      />
                    ) : (
                      <h1 className="text-lg md:text-xl font-bold uppercase text-slate-900 tracking-wide underline">
                        {editTitle || selectedContract.title}
                      </h1>
                    )}
                    <p className="text-xs text-slate-600 italic mt-1">
                      COMMERCIAL LEGAL AGREEMENT ({selectedContract.contract_type})
                    </p>
                  </div>

                  {/* PREAMBLE */}
                  <div className="text-xs leading-relaxed text-slate-800 font-sans">
                    <p>
                      <strong>THIS AGREEMENT</strong> is made and entered into as of <strong>{editEffectiveDate || new Date().toLocaleDateString('en-US')}</strong>, by and between:
                    </p>
                    <div className="mt-2 pl-3 border-l-2 border-slate-400 flex flex-col gap-1">
                      <span className="font-bold text-slate-900">FIRST PARTY (PROVIDER / ISSUER):</span>
                      {isEditing ? (
                        <div className="flex gap-2">
                          <input type="text" value={editFirstPartyName} onChange={(e) => setEditFirstPartyName(e.target.value)} className="border px-2 py-0.5 text-xs rounded font-bold w-1/2" placeholder="First Party Name" />
                          <input type="text" value={editFirstPartyAddress} onChange={(e) => setEditFirstPartyAddress(e.target.value)} className="border px-2 py-0.5 text-xs rounded w-1/2" placeholder="First Party Address" />
                        </div>
                      ) : (
                        <p>{editFirstPartyName}, located at {editFirstPartyAddress} (Tax ID: DE-987654321), represented by Authorized Signatory.</p>
                      )}
                    </div>
                    <div className="mt-2 pl-3 border-l-2 border-blue-500 flex flex-col gap-1">
                      <span className="font-bold text-slate-900">SECOND PARTY (CLIENT / COUNTERPARTY):</span>
                      {isEditing ? (
                        <div className="flex gap-2">
                          <input type="text" value={editEntityName} onChange={(e) => setEditEntityName(e.target.value)} className="border px-2 py-0.5 text-xs rounded font-bold w-1/2" placeholder="Second Party Name" />
                          <input type="text" value={editSecondPartyAddress} onChange={(e) => setEditSecondPartyAddress(e.target.value)} className="border px-2 py-0.5 text-xs rounded w-1/2" placeholder="Second Party Address" />
                        </div>
                      ) : (
                        <p>{editEntityName}, located at {editSecondPartyAddress}.</p>
                      )}
                    </div>
                  </div>

                  {/* ARTICLE 1: SCOPE OF WORK & DELIVERABLES */}
                  <div className="flex flex-col gap-2 font-sans">
                    <h3 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-300 pb-1">
                      ARTICLE I: SCOPE OF WORK & DELIVERABLES
                    </h3>
                    {isEditing ? (
                      <textarea
                        rows={3}
                        value={editAiSummary}
                        onChange={(e) => setEditAiSummary(e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-300 rounded font-sans focus:ring-2 focus:ring-blue-500"
                        placeholder="Edit contract scope summary..."
                      />
                    ) : (
                      <p className="text-xs text-slate-700 leading-relaxed font-serif">
                        {editAiSummary || selectedContract.ai_summary || `The Scope of Work covers software delivery, technical consulting, and legal compliance services for ${editEntityName}.`}
                      </p>
                    )}
                    
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
                          {editDeliverables.map((d, i) => (
                            <tr key={i}>
                              <td className="p-2 font-semibold text-slate-900">
                                {isEditing ? (
                                  <input type="text" value={d.name} onChange={(e) => {
                                    const updated = [...editDeliverables];
                                    updated[i].name = e.target.value;
                                    setEditDeliverables(updated);
                                  }} className="w-full border px-1 py-0.5 rounded" />
                                ) : d.name}
                              </td>
                              <td className="p-2">
                                {isEditing ? (
                                  <input type="text" value={d.description} onChange={(e) => {
                                    const updated = [...editDeliverables];
                                    updated[i].description = e.target.value;
                                    setEditDeliverables(updated);
                                  }} className="w-full border px-1 py-0.5 rounded" />
                                ) : d.description}
                              </td>
                              <td className="p-2">
                                {isEditing ? (
                                  <input type="text" value={d.owner} onChange={(e) => {
                                    const updated = [...editDeliverables];
                                    updated[i].owner = e.target.value;
                                    setEditDeliverables(updated);
                                  }} className="w-full border px-1 py-0.5 rounded" />
                                ) : d.owner}
                              </td>
                              <td className="p-2 font-bold text-blue-700">
                                {isEditing ? (
                                  <input type="text" value={d.timeline} onChange={(e) => {
                                    const updated = [...editDeliverables];
                                    updated[i].timeline = e.target.value;
                                    setEditDeliverables(updated);
                                  }} className="w-full border px-1 py-0.5 rounded" />
                                ) : d.timeline}
                              </td>
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
                        {isEditing ? (
                          <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} className="w-full border px-2 py-0.5 rounded font-bold text-slate-900 mt-1" />
                        ) : (
                          <p className="font-bold text-slate-900">${parseFloat(editValue || 0).toLocaleString('en-US')} USD</p>
                        )}
                      </div>
                      <div><span className="text-slate-500 font-bold">Billing Schedule:</span> <p className="font-bold text-slate-800">{paymentSchedule}</p></div>
                      <div><span className="text-slate-500 font-bold">Jurisdiction:</span> <p className="font-bold text-slate-800">{editJurisdiction}</p></div>
                    </div>
                  </div>

                  {/* ARTICLE 3: LEGAL TERMS & CLAUSES */}
                  <div className="flex flex-col gap-2 font-sans">
                    <h3 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-300 pb-1">
                      ARTICLE III: LEGAL TERMS, CLAUSES & COVENANTS
                    </h3>
                    <div className="flex flex-col gap-2 text-xs font-serif text-slate-800">
                      {editClauses.map((c, i) => (
                        <div key={c.id || i} className="flex flex-col gap-1">
                          <strong>§ 3.{i + 1} {c.category}:</strong>
                          {isEditing ? (
                            <textarea
                              rows={2}
                              value={c.text}
                              onChange={(e) => {
                                const updated = [...editClauses];
                                updated[i].text = e.target.value;
                                setEditClauses(updated);
                              }}
                              className="w-full text-xs p-2 border border-slate-300 rounded font-serif"
                            />
                          ) : (
                            <p>{c.text}</p>
                          )}
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
                        <p className="font-bold text-slate-900">{editFirstPartyName}</p>
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
                        <p className="font-bold text-slate-900">{editEntityName}</p>
                        <p className="text-slate-600">Authorized Representative</p>
                        <p className="text-slate-500 text-[10px]">Date: ________________________</p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Module 3: Pre-Drafting Gatekeeper & Baseline Sign-Off */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-6">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Contract Gatekeeper & Final Sign-Off
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Finalize contract pricing, payment structure, and sign off the baseline checkpoint.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Final Base Fee ($ USD) *</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={finalPricing}
                        onChange={(e) => setFinalPricing(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Schedule / Billing Structure *</label>
                    <select
                      value={paymentSchedule}
                      onChange={(e) => setPaymentSchedule(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="100% Upfront">100% Upfront</option>
                      <option value="50% Upfront / 50% Completion">50% Upfront / 50% Completion</option>
                      <option value="Milestone-Based Payments">Milestone-Based Payments</option>
                      <option value="Monthly Retainer">Monthly Retainer</option>
                      <option value="Time & Materials (T&M)">Time & Materials (T&M)</option>
                      <option value="Net 30">Net 30</option>
                      <option value="Net 60">Net 60</option>
                      <option value="Custom Schedule">Custom Schedule</option>
                    </select>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="scopeCheckpointDetail"
                    checked={scopeApprovalChecked}
                    onChange={(e) => setScopeApprovalChecked(e.target.checked)}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="scopeCheckpointDetail" className="text-xs font-bold text-slate-800 cursor-pointer">
                    Scope Approval Checkpoint: I confirm all draft inputs have been evaluated and integrated into the drafting baseline.
                  </label>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleBackToList}
                    className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-bold transition-colors"
                  >
                    Cancel / Back
                  </button>

                  <PrimaryButton
                    onClick={handleProceedToReview}
                    disabled={saving}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-2"
                  >
                    <PenTool className="w-4 h-4" />
                    {saving ? 'Locking Scope Audit v0.1...' : 'Proceed to Contract Review & Negotiation'}
                    <ArrowRight className="w-4 h-4" />
                  </PrimaryButton>
                </div>

              </div>
            </div>

            {/* RIGHT 1 COLUMN: Persistent AI Assistant Copilot Drawer */}
            {showAiCopilot && (
              <div className="bg-gradient-to-b from-indigo-950 to-slate-900 text-white rounded-xl p-5 flex flex-col gap-5 shadow-lg border border-indigo-900 h-fit sticky top-4">
                <div className="flex items-center justify-between border-b border-indigo-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-bold text-sm text-white">AI Assistant Copilot</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAiCopilot(false)}
                    className="px-2 py-1 rounded text-[10px] font-bold bg-indigo-800/60 hover:bg-indigo-700 text-indigo-200 border border-indigo-500/40"
                  >
                    ✕ Hide
                  </button>
                </div>

                <div className="flex flex-col gap-3 text-xs">
                  <div className="bg-indigo-950/80 p-3.5 rounded-lg border border-indigo-800/80 flex flex-col gap-2">
                    <span className="text-indigo-300 font-bold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-400" /> AI Draft Insights
                    </span>
                    <p className="text-[11px] text-slate-300">
                      Contract draft for <strong>{selectedContract.entity_name}</strong> is structured under <strong>{selectedContract.contract_type}</strong>.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </>
      )}

    </div>
  );
}
