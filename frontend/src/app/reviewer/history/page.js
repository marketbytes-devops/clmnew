'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CheckSquare, Search, FileText, ChevronRight, RefreshCw, 
  CheckCircle2, XCircle, Coins, Calendar, Filter, ArrowUpRight
} from 'lucide-react';
import { useAppContext } from '../../../context/appContext';
import { APIService } from '../../../service/apiService';

export default function ReviewHistoryPage() {
  const { user } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [historyList, setHistoryList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [decisionFilter, setDecisionFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  const getReviewerRole = () => {
    const dept = user?.department?.toLowerCase() || '';
    const role = user?.role?.toLowerCase() || '';
    if (dept.includes('finance')) return 'Finance';
    if (dept.includes('legal')) return 'Legal';
    if (dept.includes('operations') || role.includes('admin') || role.includes('manager')) return 'Operations';
    return 'Finance'; // Fallback
  };
  const reviewerRole = getReviewerRole();

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const requests = await APIService.getRequests().catch(() => []);
      
      // Format requests
      const formatted = requests.map(r => {
        const seq = r.approval_sequence || [];
        const myStep = seq.find(s => s.role === reviewerRole);
        const myDecision = myStep?.status === 'Approved' ? 'Approved' : myStep?.status === 'Rejected' ? 'Rejected' : 'N/A';
        const decisionDate = myStep?.timestamp || r.updated_at || r.created_at || new Date().toISOString();

        return {
          id: r.id,
          tracking_id: r.tracking_id || `REQ-2026-${r.id}`,
          title: r.title || 'Contract Agreement',
          version_label: r.version_label || 'v1.0',
          entity_name: r.entity_name || 'Client Corp',
          contract_type: r.contract_type || 'Standard Agreement',
          deal_value: r.final_commercial_pricing || r.deal_value || 0,
          priority: r.priority || 'Medium',
          created_at: r.created_at || new Date().toISOString(),
          status: r.status,
          myDecision,
          decisionDate,
          myStep
        };
      });

      // Filter to only display items where this reviewer has signed off/decided
      const auditedItems = formatted.filter(item => 
        item.myDecision === 'Approved' || item.myDecision === 'Rejected' || item.status === 'Approved - Ready for Hand-off'
      );

      setHistoryList(auditedItems);
    } catch (err) {
      console.error("Failed to load history requests", err);
      setHistoryList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  // Apply filters
  const filteredList = historyList.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.entity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tracking_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDecision = decisionFilter === 'All' || item.myDecision === decisionFilter;
    const matchesType = typeFilter === 'All' || item.contract_type.toLowerCase().includes(typeFilter.toLowerCase());

    return matchesSearch && matchesDecision && matchesType;
  });

  // Calculate Metrics
  const totalSignedOff = historyList.length;
  const totalApproved = historyList.filter(i => i.myDecision === 'Approved').length;
  const totalRejected = historyList.filter(i => i.myDecision === 'Rejected').length;
  const totalValue = historyList.reduce((acc, curr) => acc + (curr.deal_value || 0), 0);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 bg-[#f1f6f0] text-[#1c2918] min-h-screen">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-[#cbdcbe] p-7 rounded-3xl shadow-sm">
        <div>
          <span className="px-2.5 py-1 rounded bg-[#e7f2df] text-[#2c441f] text-[10px] font-black uppercase tracking-widest border border-[#a8c79c]">
            Audit Vault
          </span>
          <h1 className="text-3xl font-black text-[#1c2918] tracking-tight mt-2 flex items-center gap-2">
            <CheckSquare className="w-8 h-8 text-[#4f6e43]" />
            Review History
          </h1>
          <p className="text-xs text-[#637756] mt-1">
            Signed in as <span className="font-extrabold text-[#1c2918]">{user?.name}</span> ({user?.title}). Audit log of your digital signatures and sign-offs.
          </p>
        </div>
        <button
          onClick={fetchHistory}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-black text-[#2c441f] bg-white hover:bg-[#f0f5ee] border border-[#cbdcbe] rounded-xl transition-all shadow-sm shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh History
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Signed Off */}
        <div className="bg-white border border-[#cbdcbe] p-5 rounded-2xl shadow-sm flex items-center gap-4 relative overflow-hidden group">
          <div className="w-12 h-12 bg-[#e7f2df]/50 text-[#4f6e43] border border-[#a8c79c]/30 rounded-xl flex items-center justify-center shrink-0">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-[#637756] block uppercase">Total Sign-offs</span>
            <span className="text-2xl font-black text-[#1c2918] leading-none">{loading ? '...' : totalSignedOff}</span>
            <span className="text-[10px] text-[#4f6e43] block font-bold mt-1">Decided by you</span>
          </div>
        </div>

        {/* Approved Decisions */}
        <div className="bg-white border border-[#cbdcbe] p-5 rounded-2xl shadow-sm flex items-center gap-4 relative overflow-hidden group">
          <div className="w-12 h-12 bg-[#e7f2df]/50 text-[#4f6e43] border border-[#a8c79c]/30 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-[#637756] block uppercase">Approved</span>
            <span className="text-2xl font-black text-[#1c2918] leading-none">{loading ? '...' : totalApproved}</span>
            <span className="text-[10px] text-[#4f6e43] block font-bold mt-1">Authorized drafts</span>
          </div>
        </div>

        {/* Rejected Decisions */}
        <div className="bg-white border border-[#cbdcbe] p-5 rounded-2xl shadow-sm flex items-center gap-4 relative overflow-hidden group">
          <div className="w-12 h-12 bg-[#e7f2df]/50 text-[#4f6e43] border border-[#a8c79c]/30 rounded-xl flex items-center justify-center shrink-0">
            <XCircle className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-[#637756] block uppercase">Returned / Rejected</span>
            <span className="text-2xl font-black text-[#1c2918] leading-none">{loading ? '...' : totalRejected}</span>
            <span className="text-[10px] text-[#4f6e43] block font-bold mt-1">Sent back to authoring</span>
          </div>
        </div>

        {/* Total Value signed off */}
        <div className="bg-white border border-[#cbdcbe] p-5 rounded-2xl shadow-sm flex items-center gap-4 relative overflow-hidden group">
          <div className="w-12 h-12 bg-[#e7f2df]/50 text-[#4f6e43] border border-[#a8c79c]/30 rounded-xl flex items-center justify-center shrink-0">
            <Coins className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-[#637756] block uppercase">Audited TCV</span>
            <span className="text-2xl font-black text-[#1c2918] leading-none">
              {loading ? '...' : `$${totalValue.toLocaleString('en-US')}`}
            </span>
            <span className="text-[10px] text-[#4f6e43] block font-bold mt-1">Total contract value</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white border border-[#cbdcbe] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Filters Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#5c6e53] absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by ID, client, or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#f4f9f2]/50 border border-[#cbdcbe] text-xs font-semibold text-[#1c2918] focus:outline-none focus:border-[#4f6e43] transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-1.5 text-xs text-[#5c6e53]">
              <Filter className="w-4 h-4 text-[#4f6e43]" /> Filters:
            </div>
            
            <select
              value={decisionFilter}
              onChange={(e) => setDecisionFilter(e.target.value)}
              className="border border-[#cbdcbe] rounded-2xl px-4 py-3 text-xs bg-white text-[#1c2918] font-bold focus:outline-none focus:border-[#4f6e43] transition-colors"
            >
              <option value="All">All Decisions</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-[#cbdcbe] rounded-2xl px-4 py-3 text-xs bg-white text-[#1c2918] font-bold focus:outline-none focus:border-[#4f6e43] transition-colors"
            >
              <option value="All">All Contract Types</option>
              <option value="Proposal">Proposal</option>
              <option value="MSA">MSA</option>
              <option value="NDA">NDA</option>
              <option value="SOW">SOW</option>
            </select>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white border border-[#cbdcbe] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-[#f0f5ee] border-b border-[#cbdcbe] text-[10px] font-black text-[#5c6e53] uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-4">Contract Tracking ID</th>
                  <th className="px-5 py-4">Title & Valuation</th>
                  <th className="px-5 py-4">Client</th>
                  <th className="px-5 py-4">Your Decision</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Decision Date</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#cbdcbe]/30">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-[#5c6e53]">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#5c6e53] mb-2" />
                      Loading audit logs...
                    </td>
                  </tr>
                ) : filteredList.length > 0 ? (
                  filteredList.map((item) => {
                    return (
                      <tr key={item.id} className="hover:bg-[#f4f9f2]/50 transition-colors">
                        <td className="px-5 py-4 font-mono font-bold text-[#4f6e43] whitespace-nowrap">
                          {item.tracking_id}
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-extrabold text-[#1c2918] block truncate max-w-[200px]">{item.title}</span>
                          <span className="text-[10px] text-[#637756] font-semibold block mt-0.5">
                            Value: {item.deal_value > 0 ? `$${item.deal_value.toLocaleString('en-US')}` : 'Non-Monetary'}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-bold text-[#1c2918] whitespace-nowrap">
                          {item.entity_name}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                            item.myDecision === 'Approved' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : item.myDecision === 'Rejected' 
                              ? 'bg-red-50 text-red-700 border border-red-200' 
                              : 'bg-slate-50 text-slate-600 border border-slate-250'
                          }`}>
                            {item.myDecision}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 bg-[#e7f2df] text-[#2c441f] border border-[#cbdcbe]/50 rounded text-[9px] font-extrabold uppercase">
                            {item.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap font-mono text-[11px] text-[#637756]">
                          {new Date(item.decisionDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          <Link
                            href={`/reviewer/review/${item.id}`}
                            className="px-3 py-1.5 bg-[#e7f2df] hover:bg-[#d5e7ca] text-[#2c441f] border border-[#a8c79c] text-xs font-black rounded-xl inline-flex items-center gap-1 transition-all"
                          >
                            View Details <ArrowUpRight className="w-3.5 h-3.5 text-[#4f6e43]" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-[#637756]">
                      <FileText className="w-8 h-8 text-[#cbdcbe] mx-auto mb-2" />
                      No sign-off history recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
