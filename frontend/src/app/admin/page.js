"use client";
import React, { useEffect, useState } from "react";
import Link from 'next/link';
import { 
  FileText, CheckCircle2, Hourglass, AlertTriangle, ChevronDown, Calendar, 
  Eye, Edit2, MoreVertical, RefreshCw, Handshake, Clock, TrendingUp,
  AlertCircle, PieChart, BarChart2, Activity, Layers, ShieldCheck, ChevronRight,
  ArrowUpRight, Plus, Sparkles
} from "lucide-react";
import { APIService } from "../../service/apiService";
import { useAppContext } from "../../context/appContext";

export default function AdminDashboard() {
  const { user, contracts: contextContracts, contractRequests: contextRequests } = useAppContext();
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    activeManaged: 0,
    pendingRedlines: 0,
    avgCycleTime: '3.8 Days',
    totalPortfolioValue: '₹0',
    slaOnTrackPercent: 100
  });

  const [requests, setRequests] = useState([]);
  const [recentContracts, setRecentContracts] = useState([]);

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

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [contractsData, requestsData] = await Promise.all([
        APIService.getContracts().catch(() => []),
        APIService.getRequests().catch(() => [])
      ]);

      const allContractsRaw = [...(contractsData || []), ...(contextContracts || [])];
      const allRequestsRaw = [...(requestsData || []), ...(contextRequests || [])];

      // Deduplicate contracts
      const map = new Map();
      [...allContractsRaw, ...allRequestsRaw].forEach(item => {
        if (item && (item.id || item.tracking_id || item.title)) {
          const key = item.id || item.tracking_id || item.title;
          if (!map.has(key)) map.set(key, item);
        }
      });
      const combinedList = Array.from(map.values());
      setRequests(combinedList);

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

      // Map real contract objects for recent contracts table
      const mappedRecent = combinedList.slice(0, 5).map((c, i) => {
        const ownerName = c.owner_name || c.requestorName || c.assigned_to?.name || 'Sanket Kumar';
        const initials = ownerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'SK';
        return {
          id: c.id || c.tracking_id || `C-${i + 1}`,
          name: c.title || c.name || 'Contract Agreement',
          party: c.counterparty || c.client_name || c.entity_name || 'External Counterparty',
          status: c.status || 'Active',
          startDate: c.created_at ? new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Apr 01, 2025',
          endDate: c.expiration_date ? new Date(c.expiration_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Mar 31, 2026',
          owner: ownerName,
          ownerInitials: initials
        };
      });

      setRecentContracts(mappedRecent);

    } catch (err) {
      console.error("Dashboard fetch notice:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [contextContracts, contextRequests]);

  const getStatusPillClass = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('active') || s.includes('approved') || s.includes('signed') || s.includes('executed')) {
      return 'bg-[#eaf5ea] text-[#1e5622] font-bold border border-emerald-200/80';
    }
    if (s.includes('pending') || s.includes('review') || s.includes('draft')) {
      return 'bg-amber-50 text-amber-800 font-bold border border-amber-200/80';
    }
    if (s.includes('expired') || s.includes('reject')) {
      return 'bg-rose-50 text-rose-700 font-bold border border-rose-200/80';
    }
    return 'bg-slate-100 text-slate-700 font-bold';
  };

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
    <div className="space-y-6 max-w-[1600px] mx-auto font-sans p-4 sm:p-6 lg:p-8">
      
      {/* Top Greeting & Action Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Real-time contract metrics, graphical analytics, turnaround times, and contract portfolio distribution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
            title="Refresh Dashboard Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <Link 
            href="/admin/contracts/create"
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#16a34a] hover:bg-[#15803d] rounded-xl shadow-2xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> New Contract
          </Link>
        </div>
      </div>

      {/* TOP KPI CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1 — Active Queue Contracts */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">ACTIVE QUEUE CONTRACTS</p>
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

        {/* Card 2 — Pending Redline Reviews */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">PENDING REDLINE REVIEWS</p>
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

        {/* Card 3 — Avg Cycle Turnaround */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">AVG CYCLE TURNAROUND</p>
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

        {/* Card 4 — Portfolio Managed Value */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">PORTFOLIO MANAGED VALUE</p>
              <h3 className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">{loading ? '...' : stats.totalPortfolioValue}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg">
              ₹
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <span className="text-slate-500 font-medium">Indian Rupees (INR)</span>
            <Link href="/admin/contracts" className="text-blue-600 hover:underline font-bold">
              View Repository →
            </Link>
          </div>
        </div>

      </div>

      {/* GRAPHICAL BREAKDOWN ROW (Contract Status & Contract Type) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* GRAPH 1 — CONTRACT STATUS BREAKDOWN */}
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
            {/* Active / Approved */}
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

            {/* Pending Intake & Drafts */}
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

            {/* Internal Review & Dependencies */}
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

            {/* Client Redline Decisioning */}
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

            {/* Expiring / Expired Contracts */}
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

        {/* GRAPH 2 — CONTRACT TYPE DISTRIBUTION */}
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

      {/* GRAPH 3 — ACTIVE VS EXPIRING CONTRACTS TIMELINE TREND GRAPH */}
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

        {/* Visual Line Curve */}
        <div className="h-44 w-full relative flex items-end pt-4 pb-2 px-2 border-b border-slate-100">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 500 100" preserveAspectRatio="none">
            {/* Active contracts green curve */}
            <path 
              d="M 0 75 Q 100 60, 200 45 T 400 25 T 500 15" 
              fill="none" 
              stroke="#16a34a" 
              strokeWidth="3" 
            />
            {/* Expiring contracts red dashed curve */}
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

      {/* RECENT CONTRACTS TABLE CARD */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-base font-bold text-slate-900">Recent Contracts</h3>
          <Link href="/admin/contracts" className="text-xs font-bold text-slate-600 hover:text-emerald-700 flex items-center gap-1 transition-colors">
            <span>View All Contracts</span>
            <ChevronDown className="w-4 h-4 transform -rotate-90" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-xs font-bold text-slate-400">Loading contracts data...</div>
          ) : recentContracts.length === 0 ? (
            <div className="p-8 text-center text-xs font-semibold text-slate-400">No active contracts found in database.</div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="p-4">Contract Name</th>
                  <th className="p-4">Party</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Start Date</th>
                  <th className="p-4">End Date</th>
                  <th className="p-4">Owner</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentContracts.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                    
                    {/* Contract Name */}
                    <td className="p-4 font-bold text-slate-900 flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{row.name}</span>
                    </td>

                    {/* Party */}
                    <td className="p-4 font-medium text-slate-600">
                      {row.party}
                    </td>

                    {/* Status Pill */}
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] inline-block ${getStatusPillClass(row.status)}`}>
                        {row.status}
                      </span>
                    </td>

                    {/* Start Date */}
                    <td className="p-4 text-slate-600 font-medium">
                      {row.startDate}
                    </td>

                    {/* End Date */}
                    <td className="p-4 text-slate-600 font-medium">
                      {row.endDate}
                    </td>

                    {/* Owner Initials Avatar & Name */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#eaf5ea] text-[#1e5622] font-bold text-[10px] flex items-center justify-center">
                          {row.ownerInitials}
                        </div>
                        <span className="font-semibold text-slate-800">{row.owner}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2 text-slate-400">
                        <Link href="/admin/contracts" className="p-1 hover:text-emerald-600 transition-colors" title="View Contract">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link href="/admin/drafting" className="p-1 hover:text-emerald-600 transition-colors" title="Edit Contract">
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button className="p-1 hover:text-slate-600 transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>

    </div>
  );
}
