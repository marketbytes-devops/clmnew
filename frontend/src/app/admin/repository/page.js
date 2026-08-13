"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Archive, Download, FolderOpen, RefreshCw, Search, ArrowLeft,
  CheckCircle2, FileText, Calendar, Clock, DownloadCloud, MoreVertical,
  ShieldCheck, ArrowUpRight, Check, History, GitCommit, Bot, LayoutDashboard,
  CalendarCheck, BarChart4, TrendingUp, AlertTriangle, PlayCircle
} from 'lucide-react';
import { APIService } from '../../../service/apiService';

// Reusing the same demo contracts as before for the vault view
const DEMO_STATIC_CONTRACTS = [
  {
    id: 888,
    tracking_id: 'CTR-2026-888',
    title: 'Master Service Agreement - TechCorp',
    category: 'Master Service Agreement',
    entity_name: 'TechCorp Industries',
    contract_type: 'MSA',
    contract_manager: 'Elena Rostova',
    status: 'Active',
    execution_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    versions: [
      {
        version_label: 'v2.0-EXECUTED',
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        deal_value: 150000,
        author: 'Elena Rostova (Legal)',
        clauses: [
          { category: 'Scope of Services', text: 'Provider shall deliver enterprise software development and consulting services as requested by Client, subject to individual Statements of Work (SOWs). Provider guarantees 99.9% uptime for deployed infrastructure.' },
          { category: 'Payment Terms', text: 'Client agrees to pay all undisputed invoices on a Net-45 basis.' },
          { category: 'Limitation of Liability', text: 'In no event shall either party be liable for any indirect, incidental, or consequential damages. Total liability shall not exceed the total fees paid under this Agreement in the 12 months preceding the claim.' }
        ]
      }
    ]
  }
];

export default function RepositoryWorkspacePage() {
  const [loading, setLoading] = useState(true);
  const [repositoryContracts, setRepositoryContracts] = useState([]);
  
  // Navigation State
  const [activeTab, setActiveTab] = useState('vault'); // 'vault' | 'milestones' | 'analytics'
  const [vaultViewMode, setVaultViewMode] = useState('list'); // 'list' | 'detail'
  const [selectedContract, setSelectedContract] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  
  // Conversational AI State
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState(null);

  const loadContractData = async () => {
    setLoading(true);
    try {
      const [contractsData] = await Promise.all([
        APIService.getContracts().catch(() => [])
      ]);

      const formattedContracts = [];
      (contractsData || []).forEach(c => {
        if (c.status === 'Executed' || c.status === 'Active' || c.status === 'Completed' || c.status === 'Archived') {
          formattedContracts.push({
            id: c.id,
            tracking_id: `CTR-2026-${c.id}`,
            title: c.title,
            entity_name: c.metadata_data?.counterparty || 'Client',
            contract_type: c.contract_type || 'Standard',
            status: c.status,
            execution_date: c.updated_at || new Date().toISOString(),
            versions: [{ version_label: 'v1.0-EXECUTED', created_at: c.updated_at || new Date().toISOString(), deal_value: c.value || 0, clauses: [] }]
          });
        }
      });

      setRepositoryContracts(formattedContracts.length > 0 ? formattedContracts : DEMO_STATIC_CONTRACTS);
    } catch (err) {
      setRepositoryContracts(DEMO_STATIC_CONTRACTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContractData();
  }, []);

  const handleAiSearch = (e) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    
    // Mock AI Response based on query
    setAiResponse("Across active proposals, 12 contracts cap liability at 100% of contract value. 2 proposals (Acme Corp & TechCorp) have custom liability caps set. Click to view specifics.");
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading Central Repository...</div>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto p-4 md:p-6">
      
      {/* ========================================================================= */}
      {/* GLOBAL HEADER & TAB NAVIGATION */}
      {/* ========================================================================= */}
      {vaultViewMode === 'list' && (
        <div className="flex flex-col gap-4 mb-2">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <FolderOpen className="w-7 h-7 text-indigo-600" />
                Smart Repository & Post-Signature Lifecycle
              </h1>
              <p className="text-xs text-slate-500 mt-1">Single source of truth for executed agreements, operational milestones, and portfolio intelligence.</p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <span className="text-xs font-bold text-slate-500">Active Contracts</span>
              <span className="text-2xl font-black text-slate-900">14</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <span className="text-xs font-bold text-slate-500">Total Contract Value (TCV)</span>
              <span className="text-2xl font-black text-emerald-600">$1.42M</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <span className="text-xs font-bold text-slate-500">Upcoming Renewals (30d)</span>
              <span className="text-2xl font-black text-amber-600">3</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <span className="text-xs font-bold text-slate-500">Milestone Risks</span>
              <span className="text-2xl font-black text-rose-600">1</span>
            </div>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-lg w-fit mt-2">
            <button
              onClick={() => setActiveTab('vault')}
              className={`px-4 py-2 text-xs font-bold rounded-md flex items-center gap-2 transition-colors ${activeTab === 'vault' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <FolderOpen className="w-4 h-4" /> Smart Vault
            </button>
            <button
              onClick={() => setActiveTab('milestones')}
              className={`px-4 py-2 text-xs font-bold rounded-md flex items-center gap-2 transition-colors ${activeTab === 'milestones' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <CalendarCheck className="w-4 h-4" /> Obligation & Milestones
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 text-xs font-bold rounded-md flex items-center gap-2 transition-colors ${activeTab === 'analytics' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <BarChart4 className="w-4 h-4" /> Portfolio Intelligence
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: SMART REPOSITORY VAULT (6.1) */}
      {/* ========================================================================= */}
      {activeTab === 'vault' && vaultViewMode === 'list' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Main Contract Table */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <div className="relative w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter by title, client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                  <tr>
                    <th className="px-4 py-3">Contract ID & Name</th>
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">Execution Date</th>
                    <th className="px-4 py-3">Value</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {repositoryContracts.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => { setSelectedContract(c); setVaultViewMode('detail'); }}>
                      <td className="px-4 py-3">
                        <p className="font-mono text-indigo-600 font-bold mb-0.5">{c.tracking_id}</p>
                        <p className="font-bold text-slate-900">{c.title}</p>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">{c.entity_name}</td>
                      <td className="px-4 py-3">{new Date(c.execution_date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 font-bold">${c.versions[0]?.deal_value?.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">{c.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Conversational AI Search Drawer */}
          <div className="lg:col-span-1 bg-slate-900 text-white rounded-xl border border-slate-800 p-5 shadow-sm flex flex-col">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
              <Bot className="w-5 h-5 text-indigo-400" /> "Ask Your Contracts"
            </h3>
            <p className="text-xs text-slate-400 mb-4">Search across the unstructured text of all executed contracts using natural language.</p>
            
            <form onSubmit={handleAiSearch} className="flex flex-col gap-2 mb-4">
              <textarea 
                rows={3}
                placeholder="e.g., 'What is our standard liability cap across all active MSAs?'"
                value={aiQuery}
                onChange={e => setAiQuery(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs focus:ring-2 focus:ring-indigo-500 text-slate-200"
              />
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-xs font-bold transition-colors">
                Analyze Repository
              </button>
            </form>

            {aiResponse && (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs leading-relaxed">
                <span className="font-bold text-indigo-300 block mb-1">AI Output:</span>
                {aiResponse}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VAULT DETAIL VIEW (Document Reader) */}
      {activeTab === 'vault' && vaultViewMode === 'detail' && selectedContract && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setVaultViewMode('list')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Vault
            </button>

            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
            >
              <DownloadCloud className="w-4 h-4" /> Download PDF
            </button>
          </div>
          
          <div className="bg-white border-2 border-slate-300 rounded-xl p-8 md:p-12 shadow-md flex flex-col gap-6 font-serif text-slate-900 relative print:shadow-none print:border-none print:p-0 max-w-4xl mx-auto w-full min-h-[800px]">
            {/* WATERMARK */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none z-0">
              <span className="text-6xl md:text-8xl font-extrabold tracking-widest text-slate-500 uppercase font-sans -rotate-45">
                EXECUTED
              </span>
            </div>
            
            {/* DOCUMENT HEADER */}
            <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 font-sans relative z-10">
              <div>
                <span className="text-sm font-extrabold uppercase tracking-widest text-blue-700">MARKETBYTES CLM REPOSITORY</span>
                <p className="text-xs text-slate-500 mt-1">Ref: {selectedContract.tracking_id} | Category: {selectedContract.category || 'General Commercial'}</p>
              </div>
              <div className="sm:text-right text-xs">
                <p className="font-bold text-slate-800">Version: v1.0-EXECUTED</p>
                <p className="text-slate-600">Effective Date: {new Date(selectedContract.execution_date).toLocaleDateString()}</p>
              </div>
            </div>
            
            {/* CONTRACT TITLE */}
            <div className="text-center my-6 font-sans relative z-10">
              <h1 className="text-2xl md:text-3xl font-bold uppercase text-slate-900 tracking-wide underline">
                {selectedContract.title}
              </h1>
            </div>

            {/* PREAMBLE */}
            <div className="text-sm leading-relaxed text-slate-800 relative z-10">
              <p>
                <strong>THIS AGREEMENT</strong> is made and entered into as of <strong>{new Date(selectedContract.execution_date).toLocaleDateString()}</strong>, by and between:
              </p>
              <div className="mt-4 pl-4 border-l-2 border-slate-400 flex flex-col gap-1">
                <span className="font-bold text-slate-900 font-sans">FIRST PARTY (PROVIDER):</span>
                <p>MarketBytes CLM Corp, located at Wilmington, DE (Tax ID: DE-987654321), represented by its Authorized Signatory.</p>
              </div>
              <div className="mt-4 pl-4 border-l-2 border-blue-500 flex flex-col gap-1">
                <span className="font-bold text-slate-900 font-sans">SECOND PARTY (CLIENT):</span>
                <p>{selectedContract.entity_name}, located at Corporate HQ, represented by its Authorized Signatory.</p>
              </div>
            </div>

            {/* COMMERCIAL SUMMARY BLOCK */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm font-sans grid grid-cols-2 gap-4 relative z-10 my-4">
              <div>
                <span className="text-slate-500 font-bold block mb-1">Total Contract Value:</span>
                <p className="font-bold text-slate-900 text-lg">${(selectedContract.versions[0]?.deal_value || 0).toLocaleString('en-US')} USD</p>
              </div>
              <div>
                <span className="text-slate-500 font-bold block mb-1">Contract Type:</span>
                <p className="font-bold text-slate-800 text-lg">{selectedContract.contract_type}</p>
              </div>
            </div>

            {/* DYNAMIC CLAUSES */}
            <div className="flex flex-col gap-6 relative z-10 mt-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase border-b border-slate-300 pb-2 font-sans tracking-widest">
                LEGAL TERMS & CONDITIONS
              </h3>
              <div className="flex flex-col gap-5 text-sm text-slate-800 leading-relaxed text-justify">
                {selectedContract.versions[selectedContract.versions.length - 1].clauses.map((c, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <strong className="font-sans">§ {i + 1}. {c.category}:</strong>
                    <p>{c.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* SIGNATURE BLOCKS */}
            <div className="pt-12 mt-12 border-t-2 border-slate-900 font-sans grid grid-cols-2 gap-12 text-sm relative z-10 break-inside-avoid">
              <div className="flex flex-col gap-6">
                <span className="font-bold text-slate-900 uppercase tracking-wide">IN WITNESS WHEREOF (PROVIDER):</span>
                <div className="border-b border-slate-900 h-16 flex items-end pb-2 font-mono text-slate-400 italic">
                  [ System Authenticated Signature - {new Date(selectedContract.execution_date).toLocaleDateString()} ]
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-base">MarketBytes CLM Corp</p>
                  <p className="text-slate-600">Authorized Representative</p>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <span className="font-bold text-slate-900 uppercase tracking-wide">IN WITNESS WHEREOF (CLIENT):</span>
                <div className="border-b border-slate-900 h-16 flex items-end pb-2 font-mono text-slate-400 italic">
                  [ System Authenticated Signature - {new Date(selectedContract.execution_date).toLocaleDateString()} ]
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-base">{selectedContract.entity_name}</p>
                  <p className="text-slate-600">Authorized Representative</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: OBLIGATION & MILESTONE TRACKER (6.2) */}
      {/* ========================================================================= */}
      {activeTab === 'milestones' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-indigo-600" /> Active Milestone Management
            </h3>
            <p className="text-xs text-slate-500 mt-1">Monitors operational dependencies and billing milestones post-signature.</p>
          </div>
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Milestone Name</th>
                <th className="px-4 py-3">Associated Contract</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3">Assignee Lead</th>
                <th className="px-4 py-3">Payment Value</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-4 font-bold text-slate-800">Design Sign-off</td>
                <td className="px-4 py-4 font-mono text-indigo-600">CTR-2026-0092 (Acme)</td>
                <td className="px-4 py-4 font-medium">Aug 20, 2026</td>
                <td className="px-4 py-4">Alex Miller (UI/UX)</td>
                <td className="px-4 py-4 font-bold">$7,700 (35%)</td>
                <td className="px-4 py-4"><span className="px-2 py-1 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">In Progress</span></td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-4 font-bold text-slate-800">Backend API Launch</td>
                <td className="px-4 py-4 font-mono text-indigo-600">CTR-2026-0092 (Acme)</td>
                <td className="px-4 py-4 font-medium">Sep 15, 2026</td>
                <td className="px-4 py-4">David Chen (Dev)</td>
                <td className="px-4 py-4 font-bold">$11,000 (50%)</td>
                <td className="px-4 py-4"><span className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">Pending</span></td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-4 font-bold text-slate-800">Final QA & Handover</td>
                <td className="px-4 py-4 font-mono text-indigo-600">CTR-2026-0092 (Acme)</td>
                <td className="px-4 py-4 font-medium text-rose-600">Oct 05, 2026</td>
                <td className="px-4 py-4">Sarah Jenkins (Ops)</td>
                <td className="px-4 py-4 font-bold">$3,300 (15%)</td>
                <td className="px-4 py-4"><span className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">Queued</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PORTFOLIO ANALYTICS (6.3) */}
      {/* ========================================================================= */}
      {activeTab === 'analytics' && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-center items-center text-center">
              <TrendingUp className="w-8 h-8 text-emerald-500 mb-3" />
              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Total Contract Value</h4>
              <p className="text-4xl font-black text-slate-900 mt-1">$1.42M</p>
              <p className="text-xs text-emerald-600 font-bold mt-2 bg-emerald-50 px-2 py-1 rounded-full">+18% vs Last Quarter</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-center items-center text-center">
              <Clock className="w-8 h-8 text-indigo-500 mb-3" />
              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Avg. Negotiation Cycle</h4>
              <p className="text-4xl font-black text-slate-900 mt-1">4.2 Days</p>
              <p className="text-xs text-indigo-600 font-bold mt-2 bg-indigo-50 px-2 py-1 rounded-full">↓ 1.5 Days with AI Assists</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-center items-center text-center">
              <PlayCircle className="w-8 h-8 text-amber-500 mb-3" />
              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Contract Bottlenecks</h4>
              <p className="text-xl font-bold text-slate-900 mt-1">Finance Review Phase</p>
              <p className="text-xs text-amber-700 font-bold mt-2 bg-amber-50 px-2 py-1 rounded-full">Avg Delay: 2.1 Days</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-center items-center text-center">
              <AlertTriangle className="w-8 h-8 text-rose-500 mb-3" />
              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Margin Leakage Risk Score</h4>
              <p className="text-xl font-bold text-slate-900 mt-1">2 Contracts Below Target</p>
              <p className="text-xs text-rose-700 font-bold mt-2 bg-rose-50 px-2 py-1 rounded-full">Requires Executive Review</p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
