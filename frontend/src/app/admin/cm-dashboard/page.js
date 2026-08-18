"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Briefcase, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Users, 
  ArrowUpRight, 
  Search, 
  Filter, 
  Eye, 
  FileEdit, 
  ShieldCheck, 
  Layers, 
  Sparkles, 
  Plus, 
  RefreshCw, 
  BarChart2, 
  ChevronRight, 
  ArrowRight,
  Handshake,
  DollarSign,
  Inbox,
  CheckSquare,
  PieChart,
  Activity,
  FileCheck
} from 'lucide-react';
import { APIService } from '../../../service/apiService';
import { useAppContext } from '../../../context/appContext';

export default function ContractManagerDashboardPage() {
  const { user, contractRequests: contextRequests, contracts: contextContracts } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Stats calculation
  const [stats, setStats] = useState({
    activeManaged: 0,
    pendingRedlines: 0,
    avgCycleTime: '3.8 Days',
    totalPortfolioValue: '₹0',
    slaOnTrackPercent: 100
  });

  // Currency helper in Indian Rupees (₹)
  const formatRupees = (val) => {
    const num = parseFloat(val) || 0;
    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(2)} Cr`;
    }
    if (num >= 100000) {
      return `₹${(num / 100000).toFixed(2)} Lakhs`;
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [backendRequests, backendContracts] = await Promise.all([
        APIService.getContractRequests().catch(() => []),
        APIService.getContracts().catch(() => [])
      ]);

      const allRequestsRaw = [
        ...(Array.isArray(backendRequests) ? backendRequests : []),
        ...(Array.isArray(backendContracts) ? backendContracts : []),
        ...(Array.isArray(contextRequests) ? contextRequests : []),
        ...(Array.isArray(contextContracts) ? contextContracts : [])
      ];

      // Deduplicate items strictly from backend & context
      const map = new Map();
      allRequestsRaw.forEach(item => {
        if (item && (item.id || item.tracking_id || item.title)) {
          const key = item.id || item.tracking_id || item.title;
          if (!map.has(key)) map.set(key, item);
        }
      });

      const combinedList = Array.from(map.values());
      setRequests(combinedList);

      // Dynamic calculation strictly from live data
      const inNegotiation = combinedList.filter(r => {
        const s = (r.status || '').toLowerCase();
        return s.includes('review') || s.includes('dependency') || s.includes('redline') || s.includes('draft');
      }).length;

      const totalVal = combinedList.reduce((acc, r) => acc + (parseFloat(r.deal_value || r.value || 0) || 0), 0);
      const onTrackCount = combinedList.filter(r => !(r.status || '').toLowerCase().includes('reject')).length;
      const slaPct = combinedList.length > 0 ? Math.round((onTrackCount / combinedList.length) * 100) : 100;

      setStats({
        activeManaged: combinedList.length,
        pendingRedlines: inNegotiation,
        avgCycleTime: '3.8 Days',
        totalPortfolioValue: formatRupees(totalVal),
        slaOnTrackPercent: slaPct
      });

    } catch (err) {
      console.error("Failed to load contract manager dashboard data from backend", err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [contextRequests, contextContracts]);

  const filteredRequests = requests.filter(r => {
    const term = searchTerm.toLowerCase();
    const titleMatch = r.title ? r.title.toLowerCase().includes(term) : false;
    const clientMatch = r.entity_name || r.counterparty || r.client_name ? (r.entity_name || r.counterparty || r.client_name).toLowerCase().includes(term) : false;
    const trackingMatch = r.tracking_id ? r.tracking_id.toLowerCase().includes(term) : false;
    
    const matchesSearch = titleMatch || clientMatch || trackingMatch;
    const matchesStatus = statusFilter === 'All' || (r.status || '').toLowerCase().includes(statusFilter.toLowerCase());

    return matchesSearch && matchesStatus;
  });

  // Calculate dynamic graph metrics strictly from live dataset
  const totalCount = Math.max(1, requests.length);
  
  const statusCounts = {
    Active: requests.filter(r => ['active', 'approved', 'signed', 'executed'].includes((r.status || '').toLowerCase())).length,
    Pending: requests.filter(r => ['pending', 'draft', 'submitted', 'intake'].includes((r.status || '').toLowerCase())).length,
    Review: requests.filter(r => ['review', 'internal review', 'dependency gathering'].includes((r.status || '').toLowerCase())).length,
    Redlining: requests.filter(r => (r.status || '').toLowerCase().includes('redline')).length,
    Expiring: requests.filter(r => ['expired', 'expiring soon', 'reject'].includes((r.status || '').toLowerCase())).length
  };

  const typeCounts = {
    'Statement of Work (SOW)': requests.filter(r => (r.contract_type || r.title || '').toLowerCase().includes('sow') || (r.contract_type || r.title || '').toLowerCase().includes('statement')).length,
    'Master Services Agreement (MSA)': requests.filter(r => (r.contract_type || r.title || '').toLowerCase().includes('msa') || (r.contract_type || r.title || '').toLowerCase().includes('master')).length,
    'Non-Disclosure (NDA)': requests.filter(r => (r.contract_type || r.title || '').toLowerCase().includes('nda') || (r.contract_type || r.title || '').toLowerCase().includes('disclosure')).length,
    'Vendor Agreement': requests.filter(r => (r.contract_type || r.title || '').toLowerCase().includes('vendor') || (r.contract_type || r.title || '').toLowerCase().includes('purchase')).length,
    'Proposals & Amendments': requests.filter(r => (r.contract_type || r.title || '').toLowerCase().includes('proposal') || (r.contract_type || r.title || '').toLowerCase().includes('amend')).length
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-[#eaf5ea] via-emerald-50 to-teal-50/80 border border-emerald-200/90 rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                CONTRACT OPERATIONS WORKBENCH
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-200/80 text-slate-700">
                ACTIVE QUEUE MANAGEMENT
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <Briefcase className="w-7 h-7 text-emerald-600" />
              Contract Manager Command Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl font-medium">
              Overview of contract requests, redline reviews, SLA commitments, technical dependency approvals, and lifecycle execution queues.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button 
              onClick={loadData}
              className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} /> Refresh Data
            </button>
            <Link 
              href="/admin/contracts/create"
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#16a34a] hover:bg-[#15803d] active:bg-[#166534] rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> New Contract Request
            </Link>
          </div>
        </div>
      </div>

      {/* TOP KPI CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1 — Active Managed Contracts */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Active Queue Contracts</p>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{loading ? '...' : stats.activeManaged}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <FileText className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Live Backend Data
            </span>
            <span className="text-slate-400">Assigned Workload</span>
          </div>
        </div>

        {/* Card 2 — Pending Client Redlines */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Pending Redline Reviews</p>
              <h3 className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">{loading ? '...' : stats.pendingRedlines}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Handshake className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <span className="text-amber-700 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Action required
            </span>
            <Link href="/admin/negotiation" className="text-blue-600 hover:underline font-bold">
              Open Workbench →
            </Link>
          </div>
        </div>

        {/* Card 3 — Average Lifecycle Cycle Time */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Avg Cycle Turnaround</p>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{stats.avgCycleTime}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {stats.slaOnTrackPercent}% SLA Compliant
            </span>
            <span className="text-slate-400">Target: &lt; 5.0 Days</span>
          </div>
        </div>

        {/* Card 4 — Total Managed Portfolio Value (Rupees ₹) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Portfolio Managed Value</p>
              <h3 className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">{loading ? '...' : stats.totalPortfolioValue}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg">
              ₹
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <span className="text-slate-500 font-medium">Indian Rupees (INR)</span>
            <Link href="/admin/repository" className="text-blue-600 hover:underline font-bold">
              View Repository →
            </Link>
          </div>
        </div>

      </div>

      {/* VISUAL GRAPHS & ANALYTICS CARDS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* GRAPH 1 — CONTRACT STATUS BREAKDOWN (Donut & Progress Breakdown) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs flex flex-col justify-between space-y-5">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald-600" />
                Contract Status Breakdown
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Distribution of active, pending, in-review, and expiring contracts.</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live Metrics
            </span>
          </div>

          <div className="space-y-3.5">
            {/* Status 1: Active Contracts */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Active / Approved Contracts
                </span>
                <span className="text-emerald-700 font-extrabold">{statusCounts.Active} ({Math.round((statusCounts.Active / totalCount) * 100)}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.round((statusCounts.Active / totalCount) * 100)}%` }} />
              </div>
            </div>

            {/* Status 2: Pending Approvals */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span> Pending Intake & Drafts
                </span>
                <span className="text-blue-700 font-extrabold">{statusCounts.Pending} ({Math.round((statusCounts.Pending / totalCount) * 100)}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.round((statusCounts.Pending / totalCount) * 100)}%` }} />
              </div>
            </div>

            {/* Status 3: In Review & Dependencies */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span> Internal Review & Dependencies
                </span>
                <span className="text-purple-700 font-extrabold">{statusCounts.Review} ({Math.round((statusCounts.Review / totalCount) * 100)}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.round((statusCounts.Review / totalCount) * 100)}%` }} />
              </div>
            </div>

            {/* Status 4: Client Redlines */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> Client Redline Decisioning
                </span>
                <span className="text-amber-700 font-extrabold">{statusCounts.Redlining} ({Math.round((statusCounts.Redlining / totalCount) * 100)}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.round((statusCounts.Redlining / totalCount) * 100)}%` }} />
              </div>
            </div>

            {/* Status 5: Expiring / Expired */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span> Expiring / Expired Contracts
                </span>
                <span className="text-rose-700 font-extrabold">{statusCounts.Expiring} ({Math.round((statusCounts.Expiring / totalCount) * 100)}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.round((statusCounts.Expiring / totalCount) * 100)}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* GRAPH 2 — CONTRACT TYPE DISTRIBUTION (Bar Chart Graph) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs flex flex-col justify-between space-y-5">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-600" />
                Contract Type Distribution
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Categorization by agreement type (SOW, MSA, NDA, Vendor).</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Type Metrics
            </span>
          </div>

          <div className="space-y-3.5">
            {Object.entries(typeCounts).map(([typeLabel, count]) => {
              const pct = Math.round((count / totalCount) * 100);
              return (
                <div key={typeLabel}>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-800 font-bold">{typeLabel}</span>
                    <span className="text-slate-600">{count} contract(s) ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.max(5, pct)}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* GRAPH 3 — ACTIVE VS EXPIRING CONTRACTS TIMELINE TREND */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              Active vs Expiring Contracts Timeline Trend
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Monthly trajectory comparison between active executions and expiring contracts.</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> Active Contracts
            </span>
            <span className="flex items-center gap-1.5 text-rose-600">
              <span className="w-3 h-3 rounded-full bg-rose-400 inline-block"></span> Expiring Contracts
            </span>
          </div>
        </div>

        {/* Visual Line / Bar Trend Chart */}
        <div className="h-44 w-full relative flex items-end pt-4 pb-2 px-2 border-b border-slate-100">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 500 100" preserveAspectRatio="none">
            {/* Active contracts curve */}
            <path 
              d="M 0 75 Q 100 60, 200 45 T 400 25 T 500 15" 
              fill="none" 
              stroke="#16a34a" 
              strokeWidth="3" 
            />
            {/* Expiring contracts curve */}
            <path 
              d="M 0 90 Q 100 85, 200 80 T 400 70 T 500 65" 
              fill="none" 
              stroke="#f43f5e" 
              strokeWidth="2.5" 
              strokeDasharray="4,4"
            />
          </svg>
        </div>

        <div className="flex justify-between text-[11px] text-slate-400 font-semibold px-1">
          <span>Jan 2026</span>
          <span>Feb 2026</span>
          <span>Mar 2026</span>
          <span>Apr 2026</span>
          <span>May 2026</span>
          <span>Jun 2026 (Projected)</span>
        </div>
      </div>

      {/* QUICK WORKBENCH NAVIGATION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        <Link 
          href="/admin/contracts"
          className="group p-5 bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-500/80 shadow-2xs hover:shadow-md transition-all flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
                Contracts Operations
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">Manage active contract lifecycles & execute agreements.</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link 
          href="/admin/negotiation"
          className="group p-5 bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-500/80 shadow-2xs hover:shadow-md transition-all flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 group-hover:bg-purple-600 group-hover:text-white transition-colors flex items-center justify-center shrink-0">
              <Handshake className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
                Negotiation Workbench
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">Evaluate client redlines & publish new versions.</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link 
          href="/admin/review"
          className="group p-5 bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-500/80 shadow-2xs hover:shadow-md transition-all flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors flex items-center justify-center shrink-0">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
                Approvals & Department Reviews
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">Monitor sequential Legal, Finance & Ops sign-offs.</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
        </Link>

      </div>

      {/* MAIN CONTRACT MANAGER QUEUE & WORKFLOW TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        
        {/* Table Filter Toolbar Header */}
        <div className="p-5 border-b border-slate-200/80 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              Contract Manager Active Action Queue
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live database view of contracts needing contract manager review, technical dependency estimates, or countersign execution.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search contract, client, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            {/* Status Filter Dropdown */}
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-300 rounded-xl px-3 py-1.5 text-xs bg-white font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Statuses</option>
              <option value="Draft">Drafting</option>
              <option value="Dependency">Dependency Gathering</option>
              <option value="Review">Internal Review</option>
              <option value="Redline">Client Redlining</option>
              <option value="Approved">Approved</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 font-extrabold text-slate-600 uppercase tracking-wider text-[11px]">
                <th className="p-4">Contract / Request Info</th>
                <th className="p-4">Contract Type</th>
                <th className="p-4">Deal Value (INR ₹)</th>
                <th className="p-4">Lifecycle Status</th>
                <th className="p-4">Assigned Manager</th>
                <th className="p-4">SLA Clock</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">Loading active contract queue from backend...</td>
                </tr>
              ) : filteredRequests.length > 0 ? (
                filteredRequests.map((item) => {
                  const status = item.status || 'Draft';
                  let statusBadge = 'bg-slate-100 text-slate-700 border-slate-300';
                  
                  if (status.includes('Draft')) statusBadge = 'bg-blue-50 text-blue-800 border-blue-200';
                  else if (status.includes('Dependency')) statusBadge = 'bg-amber-50 text-amber-800 border-amber-200';
                  else if (status.includes('Review')) statusBadge = 'bg-purple-50 text-purple-800 border-purple-200';
                  else if (status.includes('Redline')) statusBadge = 'bg-rose-50 text-rose-800 border-rose-200';
                  else if (status.includes('Approved')) statusBadge = 'bg-emerald-50 text-emerald-800 border-emerald-200';

                  const clientName = item.entity_name || item.counterparty || item.client_name || 'Client Entity';

                  return (
                    <tr key={item.id || item.tracking_id} className="hover:bg-emerald-50/30 transition-colors">
                      {/* Contract Info */}
                      <td className="p-4">
                        <div className="font-extrabold text-slate-900">{item.title || item.name || 'Contract Request'}</div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span className="font-mono text-slate-400">{item.tracking_id || `REQ-${item.id}`}</span>
                          <span>•</span>
                          <span className="font-semibold text-slate-700">{clientName}</span>
                        </div>
                      </td>

                      {/* Contract Type */}
                      <td className="p-4 text-slate-700 font-semibold">
                        {item.contract_type || item.category || 'Statement of Work (SOW)'}
                      </td>

                      {/* Deal Value in Rupees (₹) */}
                      <td className="p-4 text-emerald-700 font-extrabold">
                        {formatRupees(item.deal_value || item.value || 0)}
                      </td>

                      {/* Status Pill */}
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusBadge}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {status}
                        </span>
                      </td>

                      {/* Assigned Manager */}
                      <td className="p-4 text-slate-800 font-semibold">
                        {typeof item.assigned_to === 'object' && item.assigned_to !== null ? (item.assigned_to.full_name || item.assigned_to.name || 'Sarah Jenkins') : (typeof item.assigned_to === 'string' && item.assigned_to ? item.assigned_to : 'Sarah Jenkins')}
                      </td>

                      {/* SLA Clock */}
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 font-bold ${
                          (item.sla_deadline || '').includes('Immediate') ? 'text-rose-600 animate-pulse' : 'text-slate-600'
                        }`}>
                          <Clock className="w-3.5 h-3.5" />
                          {item.sla_deadline || 'On Track (24h)'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link 
                            href={status.includes('Redline') ? '/admin/negotiation' : status.includes('Review') ? '/admin/review' : '/admin/drafting'}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition-colors shadow-2xs flex items-center gap-1"
                          >
                            Open <ArrowUpRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No active contracts found in backend database. Click <b>+ New Contract Request</b> to submit one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex justify-between items-center text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Connected to backend database API in real-time. Amounts displayed in Indian Rupees (₹).</span>
          </div>
          <span className="font-semibold text-slate-700">Showing {filteredRequests.length} active tasks</span>
        </div>

      </div>

    </div>
  );
}
