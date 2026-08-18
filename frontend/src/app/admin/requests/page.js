"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Inbox, Search, Filter, RefreshCw, FileText, ArrowRight, CheckCircle2, Clock, 
  AlertCircle, ChevronRight, User, Calendar, Tag, ShieldCheck, ArrowUpRight, Plus
} from 'lucide-react';
import { APIService } from '../../../service/apiService';
import { useAppContext } from '../../../context/appContext';

export default function ContractRequestsPage() {
  const { contractRequests: contextRequests } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await APIService.getRequests().catch(() => []);
      const combined = [...(data || []), ...(contextRequests || [])];
      
      const reqMap = new Map();
      combined.forEach(r => {
        if (r && (r.id || r.title || r.requestName)) {
          const key = r.id || r.title || r.requestName;
          if (!reqMap.has(key)) reqMap.set(key, r);
        }
      });

      const list = Array.from(reqMap.values()).map(r => ({
        id: r.id || `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
        title: r.title || r.requestName || 'Contract Request',
        requestorName: r.requestorName || r.requestor || 'Internal Requestor',
        department: r.department || 'Legal Operations',
        contractType: r.contractType || r.contract_type || 'Master Services Agreement (MSA)',
        counterparty: r.counterparty || r.secondPartyName || 'External Counterparty',
        priority: r.priority || 'Medium',
        status: r.status || 'Pending Intake',
        createdAt: r.createdAt || r.created_at || new Date().toISOString(),
        estimatedValue: r.estimatedValue || r.value || 50000,
        dependenciesCount: r.dependencies ? r.dependencies.length : 0,
        description: r.description || r.purpose || 'Contract request submitted for review and pre-drafting processing.'
      }));

      setRequests(list);
    } catch (err) {
      console.error("Failed to load requests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [contextRequests]);

  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.requestorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.counterparty.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || req.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Approved':
      case 'Completed':
        return 'bg-[#eaf5ea] text-[#1e5622] font-bold border border-emerald-200';
      case 'Drafting In Progress':
      case 'In Review':
        return 'bg-blue-50 text-blue-800 font-bold border border-blue-200';
      case 'Pending Intake':
      case 'Submitted':
        return 'bg-amber-50 text-amber-800 font-bold border border-amber-200';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 font-bold border border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 font-bold';
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'High':
      case 'Critical':
        return 'bg-rose-50 text-rose-700 font-bold border border-rose-200';
      case 'Medium':
        return 'bg-amber-50 text-amber-800 font-bold border border-amber-200';
      default:
        return 'bg-slate-50 text-slate-600 font-bold border border-slate-200';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#eaf5ea] flex items-center justify-center text-[#16a34a]">
              <Inbox className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Contract Requests Intake</h1>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Review, manage, and process incoming pre-drafting contract requests across all departments.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={fetchRequests}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <Link href="/requestor/create">
            <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#16a34a] hover:bg-[#15803d] rounded-xl shadow-xs transition-colors cursor-pointer">
              <Plus className="w-4 h-4" />
              New Contract Request
            </button>
          </Link>
        </div>
      </div>

      {/* Metric Cards (Matching Theme Cards Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-bold text-slate-500">Total Requests</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">{requests.length}</p>
          <span className="text-[11px] text-slate-400 font-medium mt-1 inline-block">Active Intake Queue</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-bold text-amber-700">Pending Review</p>
          <p className="text-3xl font-extrabold text-amber-900 mt-1">
            {requests.filter(r => r.status === 'Pending Intake' || r.status === 'Submitted').length}
          </p>
          <span className="text-[11px] text-amber-700 font-medium mt-1 inline-block">Awaiting Gatekeeper Action</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-bold text-blue-700">In Drafting</p>
          <p className="text-3xl font-extrabold text-blue-900 mt-1">
            {requests.filter(r => r.status === 'Drafting In Progress').length}
          </p>
          <span className="text-[11px] text-blue-700 font-medium mt-1 inline-block">Assigned to Legal Operations</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-bold text-[#16a34a]">High Priority</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">
            {requests.filter(r => r.priority === 'High' || r.priority === 'Critical').length}
          </p>
          <span className="text-[11px] text-[#16a34a] font-medium mt-1 inline-block">Expedited Queue</span>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, requestor, or counterparty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200/90 rounded-xl focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none bg-slate-50 focus:bg-white text-slate-800"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs text-slate-600 font-bold">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-emerald-100 bg-white font-medium text-slate-700"
            >
              <option value="All">All Statuses</option>
              <option value="Pending Intake">Pending Intake</option>
              <option value="Drafting In Progress">Drafting In Progress</option>
              <option value="Approved">Approved</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 font-bold">
            <span>Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-emerald-100 bg-white font-medium text-slate-700"
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Request Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs font-bold">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#16a34a]" />
            Loading request queue...
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-bold text-slate-700 text-sm">No requests found</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting search filters or submitting a new request.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Request ID & Title</th>
                  <th className="px-6 py-4">Requestor</th>
                  <th className="px-6 py-4">Contract Type</th>
                  <th className="px-6 py-4">Counterparty</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{req.title}</div>
                      <div className="text-[11px] text-slate-400 font-medium">{req.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{req.requestorName}</div>
                      <div className="text-[11px] text-slate-400 font-medium">{req.department}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-[11px] font-bold border border-slate-200/80">
                        {req.contractType}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {req.counterparty}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] inline-block ${getPriorityBadgeClass(req.priority)}`}>
                        {req.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] inline-block ${getStatusBadgeClass(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href="/admin/drafting"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#16a34a] bg-[#eaf5ea] border border-emerald-200 rounded-xl hover:bg-[#dcfce7] transition-colors"
                      >
                        Process Request
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
