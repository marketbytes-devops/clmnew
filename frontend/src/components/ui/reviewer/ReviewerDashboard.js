"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  CheckSquare, Clock, AlertTriangle, Sparkles, Search, FileText, ChevronRight,
  ShieldAlert, RefreshCw, CheckCircle2, XCircle, TrendingUp, Coins, Calendar,
  MessageSquare, User, Filter, ArrowUpRight
} from 'lucide-react';
import { useAppContext } from '../../../context/appContext';
import { APIService } from '../../../service/apiService';

export default function ReviewerDashboard() {
  const { user } = useAppContext();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  
  const [loading, setLoading] = useState(true);
  const [contractsList, setContractsList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'upcoming' | 'history'

  // Update activeTab when URL query parameter changes
  useEffect(() => {
    if (tabParam === 'history') {
      setActiveTab('history');
    } else if (tabParam === 'upcoming') {
      setActiveTab('upcoming');
    } else if (tabParam === 'pending') {
      setActiveTab('pending');
    }
  }, [tabParam]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const requests = await APIService.getRequests().catch(() => []);
      
      // Format requests
      const formatted = requests.map(r => {
        const seq = r.approval_sequence || [];

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
          contract_manager: r.assigned_to?.full_name || 'Alex Miller',
          approval_sequence: seq,
          margin_data: { gross_margin: r.ai_aggregated_synthesis?.target_margin_percent || 0 },
          risks: r.ai_aggregated_synthesis?.flagged_risks || []
        };
      });

      setContractsList(formatted);
    } catch (err) {
      console.error("Failed to load requests", err);
      setContractsList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [user]);

  const getReviewerRole = () => {
    const dept = user?.department?.toLowerCase() || '';
    const role = user?.role?.toLowerCase() || '';
    if (dept.includes('finance')) return 'Finance';
    if (dept.includes('legal')) return 'Legal';
    if (dept.includes('operations') || role.includes('admin') || role.includes('manager')) return 'Operations';
    return 'Finance'; // Fallback
  };
  const reviewerRole = getReviewerRole();

  // Categorize reviews based on user's role and sequential approval sequence
  const getCategorizedReviews = () => {
    const pending = [];
    const upcoming = [];
    const history = [];

    contractsList.forEach(item => {
      const status = item.status;
      const myStep = item.approval_sequence?.find(s => s.role === reviewerRole);

      if (status === 'Draft' || status === 'Submitted' || status === 'Dependency Gathering' || status === 'Drafting In Progress') {
        // Pre-drafting pipeline is upcoming for everyone
        upcoming.push(item);
      } else if (status === 'Internal Review' || status === 'Review' || status === 'Re-Drafting (Internal Rejection)') {
        if (myStep) {
          if (myStep.status === 'Pending') {
            pending.push(item);
          } else if (myStep.status === 'Queued') {
            upcoming.push(item);
          } else if (myStep.status === 'Approved' || myStep.status === 'Rejected') {
            history.push(item);
          } else {
            upcoming.push(item);
          }
        } else {
          upcoming.push(item);
        }
      } else {
        // Approved, executed, or closed contracts go to history
        history.push(item);
      }
    });

    return { pending, upcoming, history };
  };

  const { pending, upcoming, history } = getCategorizedReviews();

  // Pick the active list based on selected tab
  const getActiveList = () => {
    if (activeTab === 'pending') return pending;
    if (activeTab === 'upcoming') return upcoming;
    return history;
  };

  const activeList = getActiveList();

  // Apply filters
  const filteredList = activeList.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.entity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tracking_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriority = priorityFilter === 'All' || item.priority === priorityFilter;
    const matchesType = typeFilter === 'All' || item.contract_type.toLowerCase().includes(typeFilter.toLowerCase());

    return matchesSearch && matchesPriority && matchesType;
  });

  // Calculate Metrics
  const totalPending = pending.length;
  const totalCompleted = history.length;
  const activeQueueTCV = pending.reduce((acc, item) => acc + (item.deal_value || 0), 0);
  
  // Calculate Overdue: created more than 3 days ago or Urgent priority
  const overdueCount = pending.filter(item => {
    if (item.priority === 'Urgent') return true;
    const createdDate = new Date(item.created_at);
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    return createdDate < threeDaysAgo;
  }).length;

  // AI Compliance Risk Flags (Pending reviews containing risks)
  const aiRiskAlerts = pending.flatMap(item => 
    (item.risks || []).map(r => ({
      tracking_id: item.tracking_id,
      title: item.title,
      client: item.entity_name,
      id: item.id,
      riskText: r
    }))
  );

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto text-[#1c2918]">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest bg-[#e7f2df] text-[#2c441f] uppercase border border-[#a8c79c]">
            CLM Reviewer Hub
          </span>
          <h1 className="text-2xl font-black text-[#1c2918] mt-2 flex items-center gap-2">
            <CheckSquare className="w-7 h-7 text-[#4f6e43]" />
            Approvals & Governance Panel
          </h1>
          <p className="text-xs font-bold text-[#637756] mt-1">
            Signed in as <span className="font-extrabold text-[#1c2918]">{user?.name}</span> ({user?.title}). Manage and sign off on contract reviews assigned to you.
          </p>
        </div>
        <button
          onClick={fetchReviews}
          className="flex items-center gap-2 px-3.5 py-2.5 text-xs font-black text-[#2c441f] bg-white hover:bg-[#f0f5ee] border border-[#cbdcbe] rounded-xl shadow-sm transition-colors shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Queue
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Pending Reviews */}
        <div className="bg-white border border-[#cbdcbe] p-5 rounded-2xl shadow-sm flex items-center gap-4 relative overflow-hidden group">
          <div className="w-12 h-12 bg-[#e7f2df]/50 text-[#4f6e43] border border-[#a8c79c]/30 rounded-xl flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-[#637756] block uppercase">Pending Reviews</span>
            <span className="text-2xl font-black text-[#1c2918] leading-none">{loading ? '...' : totalPending}</span>
            <span className="text-[10px] text-[#4f6e43] block font-bold mt-1">Requires your decision</span>
          </div>
          <div className="absolute right-0 bottom-0 w-24 h-2 bg-[#4f6e43]"></div>
        </div>

        {/* KPI 2: Completed Sign-Offs */}
        <div className="bg-white border border-[#cbdcbe] p-5 rounded-2xl shadow-sm flex items-center gap-4 relative overflow-hidden group">
          <div className="w-12 h-12 bg-[#e7f2df]/50 text-[#4f6e43] border border-[#a8c79c]/30 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-[#637756] block uppercase">Completed Sign-offs</span>
            <span className="text-2xl font-black text-[#1c2918] leading-none">{loading ? '...' : totalCompleted}</span>
            <span className="text-[10px] text-[#4f6e43] block font-bold mt-1">Approved or Rolled back</span>
          </div>
          <div className="absolute right-0 bottom-0 w-24 h-2 bg-[#4f6e43]"></div>
        </div>

        {/* KPI 3: Active Queue Valuation */}
        <div className="bg-white border border-[#cbdcbe] p-5 rounded-2xl shadow-sm flex items-center gap-4 relative overflow-hidden group">
          <div className="w-12 h-12 bg-[#e7f2df]/50 text-[#4f6e43] border border-[#a8c79c]/30 rounded-xl flex items-center justify-center shrink-0">
            <Coins className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-[#637756] block uppercase">Queue Value</span>
            <span className="text-2xl font-black text-[#1c2918] leading-none">
              {loading ? '...' : `$${activeQueueTCV.toLocaleString('en-US')}`}
            </span>
            <span className="text-[10px] text-[#4f6e43] block font-bold mt-1">Pending TCV</span>
          </div>
          <div className="absolute right-0 bottom-0 w-24 h-2 bg-[#4f6e43]"></div>
        </div>

        {/* KPI 4: Overdue Reviews / Warnings */}
        <div className="bg-white border border-[#cbdcbe] p-5 rounded-2xl shadow-sm flex items-center gap-4 relative overflow-hidden group">
          <div className={`w-12 h-12 ${overdueCount > 0 ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-[#e7f2df]/50 text-[#637756] border border-[#a8c79c]/30'} rounded-xl flex items-center justify-center shrink-0`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-[#637756] block uppercase">SLA Alerts / Overdue</span>
            <span className="text-2xl font-black text-[#1c2918] leading-none">{loading ? '...' : overdueCount}</span>
            <span className="text-[10px] text-rose-600 block font-bold mt-1">SLA duration &gt; 72 hours</span>
          </div>
          <div className="absolute right-0 bottom-0 w-24 h-2 bg-rose-500"></div>
        </div>

      </div>

      {/* Main Grid: Data Table and Side Assist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Part: Data Table */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          
          {/* Tabs header */}
          <div className="bg-white rounded-xl border border-[#cbdcbe] shadow-sm p-1.5 flex gap-1">
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 py-2 px-3.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 ${
                activeTab === 'pending'
                  ? 'bg-[#4f6e43] text-white shadow-sm shadow-[#4f6e43]/15'
                  : 'text-[#5c6e53] hover:bg-[#f0f5ee] hover:text-[#1c2918]'
              }`}
            >
              <Clock className="w-4 h-4" /> Pending Action ({pending.length})
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex-1 py-2 px-3.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 ${
                activeTab === 'upcoming'
                  ? 'bg-[#4f6e43] text-white shadow-sm shadow-[#4f6e43]/15'
                  : 'text-[#5c6e53] hover:bg-[#f0f5ee] hover:text-[#1c2918]'
              }`}
            >
              <Calendar className="w-4 h-4" /> Upcoming Queue ({upcoming.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-2 px-3.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 ${
                activeTab === 'history'
                  ? 'bg-[#4f6e43] text-white shadow-sm shadow-[#4f6e43]/15'
                  : 'text-[#5c6e53] hover:bg-[#f0f5ee] hover:text-[#1c2918]'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" /> My Sign-Off History ({history.length})
            </button>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white p-4 rounded-xl border border-[#cbdcbe] shadow-sm flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by title, client, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 border border-[#cbdcbe] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#4f6e43] focus:border-[#4f6e43] bg-[#f4f9f2]/50 text-[#1c2918]"
              />
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
                <Filter className="w-3.5 h-3.5 text-[#5c6e53]" />
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="border border-[#cbdcbe] rounded-lg px-2.5 py-1.5 text-xs bg-white focus:ring-2 focus:ring-[#4f6e43] focus:border-[#4f6e43] outline-none text-[#1c2918] font-bold"
                >
                  <option value="All">All Priorities</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border border-[#cbdcbe] rounded-lg px-2.5 py-1.5 text-xs bg-white focus:ring-2 focus:ring-[#4f6e43] focus:border-[#4f6e43] outline-none text-[#1c2918] font-bold flex-1 sm:flex-initial"
              >
                <option value="All">All Contract Types</option>
                <option value="Proposal">Proposal</option>
                <option value="MSA">MSA</option>
                <option value="NDA">NDA</option>
                <option value="SOW">SOW</option>
              </select>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-xl border border-[#cbdcbe] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-[#f0f5ee] border-b border-[#cbdcbe] text-[10px] font-black text-[#5c6e53] uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5">Contract Tracking ID</th>
                    <th className="px-4 py-3.5">Title & Valuation</th>
                    <th className="px-4 py-3.5">Client</th>
                    <th className="px-4 py-3.5">Priority</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#cbdcbe]/30">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-[#5c6e53]">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#5c6e53] mb-2" />
                        Loading reviews...
                      </td>
                    </tr>
                  ) : filteredList.length > 0 ? (
                    filteredList.map((item) => {
                      const isActiveStep = activeTab === 'pending';
                      
                      return (
                        <tr key={item.id} className="hover:bg-[#f4f9f2]/50 transition-colors">
                          <td className="px-4 py-4 font-mono font-bold text-[#4f6e43] whitespace-nowrap">
                            {item.tracking_id}
                          </td>
                          <td className="px-4 py-4 max-w-xs">
                            <span className="font-extrabold text-[#1c2918] line-clamp-1">{item.title}</span>
                            <span className="text-[10px] text-[#637756] font-semibold block mt-0.5">
                              Value: {item.deal_value > 0 ? `$${item.deal_value.toLocaleString('en-US')}` : 'Non-Monetary'}
                            </span>
                          </td>
                          <td className="px-4 py-4 font-bold text-[#1c2918] whitespace-nowrap">
                            {item.entity_name}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold inline-flex items-center gap-1 ${
                              item.priority === 'Urgent' 
                                ? 'bg-red-50 text-red-700 border border-red-200' 
                                : item.priority === 'High' 
                                ? 'bg-orange-50 text-orange-700 border border-orange-200' 
                                : item.priority === 'Medium' 
                                ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                                : 'bg-[#e7f2df] text-[#2c441f] border border-[#a8c79c]'
                            }`}>
                              <span className={`w-1 h-1 rounded-full ${
                                item.priority === 'Urgent' ? 'bg-red-600' :
                                item.priority === 'High' ? 'bg-orange-600' :
                                item.priority === 'Medium' ? 'bg-blue-600' : 'bg-[#4f6e43]'
                              }`}></span>
                              {item.priority}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right whitespace-nowrap">
                            {isActiveStep ? (
                              <Link
                                href={`/reviewer/review/${item.id}`}
                                className="px-3.5 py-1.5 bg-[#4f6e43] hover:bg-[#435d39] text-white text-xs font-black rounded-xl inline-flex items-center gap-1 shadow-sm transition-all"
                              >
                                Review & Decide <ChevronRight className="w-3.5 h-3.5" />
                              </Link>
                            ) : (
                              <Link
                                href={`/reviewer/review/${item.id}`}
                                className="px-3.5 py-1.5 bg-[#e7f2df] hover:bg-[#d5e7ca] text-[#2c441f] border border-[#a8c79c] text-xs font-black rounded-xl inline-flex items-center gap-1 transition-all"
                              >
                                View Details <ChevronRight className="w-3.5 h-3.5" />
                              </Link>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-[#637756]">
                        <FileText className="w-8 h-8 text-[#cbdcbe] mx-auto mb-2" />
                        No contract reviews in this queue.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Part: Side Panel Widgets */}
        <div className="flex flex-col gap-6">
          
          {/* Widget 1: AI Compliance Guard */}
          <div className="bg-white border border-[#cbdcbe] rounded-xl p-5 shadow-sm flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute right-3 top-3 opacity-15">
              <Sparkles className="w-8 h-8 text-[#4f6e43]" />
            </div>
            
            <div className="flex items-center gap-2 pb-3 border-b border-[#f0f5ee]">
              <ShieldAlert className="w-5 h-5 text-[#4f6e43]" />
              <div>
                <h3 className="text-sm font-bold text-[#1c2918]">AI Compliance Guard</h3>
                <span className="text-[10px] font-bold text-[#4f6e43] uppercase tracking-wider block">Policy Auditing Engine</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
              {aiRiskAlerts.length > 0 ? (
                aiRiskAlerts.map((alert, idx) => (
                  <div key={idx} className="bg-[#f4f9f2]/80 border border-[#cbdcbe] rounded-lg p-3 text-xs relative hover:border-[#a8c79c] transition-colors">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <span className="font-extrabold text-[#1c2918] truncate">{alert.client}</span>
                      <span className="font-mono text-[9px] text-[#2c441f] bg-[#e7f2df] border border-[#a8c79c] px-1.5 py-0.5 rounded-md font-bold">{alert.tracking_id}</span>
                    </div>
                    <p className="text-[11px] text-[#637756] line-clamp-1 mb-2 italic">"{alert.title}"</p>
                    <div className="bg-amber-50 text-amber-950 px-2 py-1.5 rounded border border-amber-200 text-[10px] font-medium leading-relaxed">
                      ⚠️ {alert.riskText}
                    </div>
                    <Link
                      href={`/reviewer/review/${alert.id}`}
                      className="text-[10px] font-bold text-[#4f6e43] hover:text-[#435d39] inline-flex items-center gap-0.5 mt-2 transition-colors"
                    >
                      Audit Clause <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-[#637756] text-xs">
                  <CheckCircle2 className="w-8 h-8 text-[#4f6e43] mx-auto mb-2" />
                  All active contracts comply with corporate guidelines.
                </div>
              )}
            </div>
          </div>

          {/* Widget 2: Internal Discussion Alerts */}
          <div className="bg-white border border-[#cbdcbe] rounded-xl p-5 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#f0f5ee]">
              <MessageSquare className="w-5 h-5 text-[#4f6e43]" />
              <div>
                <h3 className="text-sm font-bold text-[#1c2918]">Discussion Stream</h3>
                <span className="text-[10px] font-bold text-[#4f6e43] uppercase tracking-wider block">Real-time team chat logs</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="text-center py-6 text-[#637756] text-xs">
                No recent global discussions. Active comments are located inside each review studio context.
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
