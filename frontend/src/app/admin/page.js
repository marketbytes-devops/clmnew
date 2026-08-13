"use client";
import React, { useEffect, useState } from "react";
import Link from 'next/link';
import { 
  FileText, CheckCircle2, Hourglass, AlertTriangle, ChevronDown, Calendar, 
  Eye, Edit2, MoreVertical, RefreshCw
} from "lucide-react";
import { APIService } from "../../service/apiService";
import { useAppContext } from "../../context/appContext";

export default function AdminDashboard() {
  const { contracts: contextContracts, contractRequests: contextRequests } = useAppContext();
  const [loading, setLoading] = useState(true);

  // Fully Dynamic Metrics state (calculated strictly from contract statuses)
  const [metrics, setMetrics] = useState({
    totalContracts: 0,
    activeContracts: 0,
    pendingApprovals: 0,
    expiredContracts: 0
  });

  // Dynamic Recent Contracts Table list from real database & context
  const [recentContracts, setRecentContracts] = useState([]);

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
      const contractsMap = new Map();
      allContractsRaw.forEach(c => {
        if (c && (c.id || c.title)) {
          const key = c.id || c.title;
          if (!contractsMap.has(key)) contractsMap.set(key, c);
        }
      });
      const contractsList = Array.from(contractsMap.values());

      // Deduplicate requests
      const requestsMap = new Map();
      allRequestsRaw.forEach(r => {
        if (r && (r.id || r.title || r.requestName)) {
          const key = r.id || r.title || r.requestName;
          if (!requestsMap.has(key)) requestsMap.set(key, r);
        }
      });
      const requestsList = Array.from(requestsMap.values());

      // Calculate exact counts strictly based on contract & request statuses
      const activeCount = contractsList.filter(c => ['Active', 'Executed', 'Signed'].includes(c.status)).length;
      const pendingCount = contractsList.filter(c => ['Pending', 'Pending Approval', 'In Review', 'Drafting In Progress', 'Draft'].includes(c.status)).length +
                           requestsList.filter(r => ['Submitted', 'Pending Intake', 'Internal Review', 'Dependency Gathering'].includes(r.status)).length;
      const expiredCount = contractsList.filter(c => ['Expired', 'Expiring Soon', 'Rejected'].includes(c.status)).length;
      const totalCount = contractsList.length + requestsList.length;

      setMetrics({
        totalContracts: totalCount,
        activeContracts: activeCount,
        pendingApprovals: pendingCount,
        expiredContracts: expiredCount
      });

      // Map real contract objects for recent contracts table
      const mappedRecent = contractsList.slice(0, 5).map((c, i) => {
        const ownerName = c.owner_name || c.requestorName || 'Sanket Kumar';
        const initials = ownerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'SK';
        return {
          id: c.id || `C-${i + 1}`,
          name: c.title || c.name || 'Contract Agreement',
          party: c.counterparty || c.client_name || c.party || 'External Counterparty',
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
    switch (status) {
      case 'Active':
      case 'Executed':
      case 'Signed':
        return 'bg-[#eaf5ea] text-[#1e5622] font-bold border border-emerald-200/80';
      case 'Pending Approval':
      case 'In Review':
      case 'Drafting In Progress':
        return 'bg-amber-50 text-amber-800 font-bold border border-amber-200/80';
      case 'Expiring Soon':
        return 'bg-yellow-50 text-yellow-800 font-bold border border-yellow-200/80';
      case 'Expired':
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 font-bold border border-rose-200/80';
      default:
        return 'bg-slate-100 text-slate-700 font-bold';
    }
  };

  // Dynamic percentages for donut chart
  const total = Math.max(1, metrics.totalContracts);
  const activePct = Math.round((metrics.activeContracts / total) * 100);
  const pendingPct = Math.round((metrics.pendingApprovals / total) * 100);
  const expiredPct = Math.round((metrics.expiredContracts / total) * 100);

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Top Greeting Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Welcome back, Sanket! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time contract metrics calculated dynamically based on contract statuses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 text-xs font-bold text-slate-700 px-3.5 py-2 rounded-xl shadow-2xs cursor-pointer hover:bg-slate-50">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>May 12 – May 18, 2025</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <button
            onClick={fetchDashboardData}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
            title="Refresh Dashboard Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4 Dynamic Stat KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1 — Total Contracts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500">Total Contracts</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">
              {loading ? '...' : metrics.totalContracts}
            </p>
            <p className="text-[11px] font-semibold text-slate-400 mt-1">
              Total Contract Lifecycle Count
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#eaf5ea] flex items-center justify-center text-emerald-600">
            <FileText className="w-6 h-6 text-emerald-600" />
          </div>
        </div>

        {/* Card 2 — Active Contracts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500">Active Contracts</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">
              {loading ? '...' : metrics.activeContracts}
            </p>
            <p className="text-[11px] font-semibold text-emerald-600 mt-1">
              {activePct}% of Total Contracts
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#eaf5ea] flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
        </div>

        {/* Card 3 — Pending Approvals */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500">Pending Approvals</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">
              {loading ? '...' : metrics.pendingApprovals}
            </p>
            <p className="text-[11px] font-semibold text-amber-600 mt-1">
              {pendingPct}% Awaiting Workflow Action
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
            <Hourglass className="w-6 h-6 text-amber-600" />
          </div>
        </div>

        {/* Card 4 — Expired Contracts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500">Expired Contracts</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">
              {loading ? '...' : metrics.expiredContracts}
            </p>
            <p className="text-[11px] font-semibold text-rose-600 mt-1">
              {expiredPct}% Expired / Expiring Soon
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
          </div>
        </div>

      </div>

      {/* Analytics & Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Donut Chart — Contracts by Status */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-900">Contracts by Status</h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
            {/* Dynamic SVG Donut Visual */}
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-slate-100" strokeWidth="3.8" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                
                {/* Active segment */}
                <path className="text-[#16a34a]" strokeDasharray={`${activePct}, 100`} strokeWidth="4" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                
                {/* Pending segment */}
                <path className="text-amber-400" strokeDasharray={`${pendingPct}, 100`} strokeDashoffset={`-${activePct}`} strokeWidth="4" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                
                {/* Expired segment */}
                <path className="text-rose-500" strokeDasharray={`${expiredPct}, 100`} strokeDashoffset={`-${activePct + pendingPct}`} strokeWidth="4" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute text-center">
                <span className="text-2xl font-extrabold text-slate-900 block leading-tight">{metrics.totalContracts}</span>
                <span className="text-[11px] font-medium text-slate-400">Total</span>
              </div>
            </div>

            {/* Dynamic Donut Legend List */}
            <div className="space-y-2.5 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#16a34a]"></span>
                <span className="text-slate-600">Active</span>
                <span className="text-slate-400 ml-auto font-medium">{activePct}% ({metrics.activeContracts})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span className="text-slate-600">Pending</span>
                <span className="text-slate-400 ml-auto font-medium">{pendingPct}% ({metrics.pendingApprovals})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="text-slate-600">Expired</span>
                <span className="text-slate-400 ml-auto font-medium">{expiredPct}% ({metrics.expiredContracts})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Line Chart — Contracts Over Time */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-900">Contracts Over Time</h3>
            <div className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 px-3 py-1 rounded-lg flex items-center gap-1.5 cursor-pointer">
              <span>Last 6 Weeks</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
          </div>

          <div className="h-48 w-full relative flex items-end pt-6 pb-2 px-2 border-b border-slate-100">
            {/* SVG Line Curve */}
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
              <path 
                d="M 0 90 Q 100 70, 200 60 T 400 30 T 500 15" 
                fill="none" 
                stroke="#16a34a" 
                strokeWidth="3" 
              />
              <circle cx="0" cy="90" r="4" fill="#16a34a" />
              <circle cx="100" cy="75" r="4" fill="#16a34a" />
              <circle cx="200" cy="60" r="4" fill="#16a34a" />
              <circle cx="300" cy="45" r="4" fill="#16a34a" />
              <circle cx="400" cy="30" r="4" fill="#16a34a" />
              <circle cx="500" cy="15" r="4" fill="#16a34a" />
            </svg>
          </div>

          {/* X Axis Labels */}
          <div className="flex justify-between text-[11px] text-slate-400 font-medium pt-3 px-1">
            <span>Apr 12</span>
            <span>Apr 19</span>
            <span>Apr 26</span>
            <span>May 03</span>
            <span>May 10</span>
            <span>May 17</span>
          </div>
        </div>

      </div>

      {/* Dynamic Recent Contracts Table Card */}
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
