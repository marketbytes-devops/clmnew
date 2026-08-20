"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Inbox, Search, Filter, RefreshCw, FileText, ArrowRight, CheckCircle2, Clock, 
  AlertCircle, ChevronRight, User, Calendar, Tag, ShieldCheck, ArrowUpRight, Plus, Eye, X, Users, Send, Check
} from 'lucide-react';
import { APIService } from '../../../service/apiService';
import { useAppContext } from '../../../context/appContext';

export default function ContractRequestsPage() {
  const pathname = usePathname();
  const basePath = pathname?.startsWith('/cm') ? '/cm' : '/admin';
  const { contractRequests: contextRequests } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDependencyDispatchModal, setShowDependencyDispatchModal] = useState(false);
  const [selectedReviewers, setSelectedReviewers] = useState([]);
  const [dispatchSuccessMsg, setDispatchSuccessMsg] = useState(null);
  const [dbUsers, setDbUsers] = useState([]);

  useEffect(() => {
    APIService.getAllUsers().then(users => {
      if (Array.isArray(users) && users.length > 0) {
        setDbUsers(users);
      }
    }).catch(err => console.warn('Could not load DB users:', err));
  }, []);

  const reviewerOptions = useMemo(() => {
    if (dbUsers && dbUsers.length > 0) {
      return dbUsers.map(u => {
        const uRole = u.roles && u.roles.length > 0 
          ? (typeof u.roles[0] === 'object' ? u.roles[0].name : u.roles[0])
          : (u.role || 'Reviewer');
        const dept = typeof u.department === 'object' ? u.department?.name : (u.department || uRole || 'Internal');
        return {
          id: u.id,
          name: u.full_name || u.name || (u.email ? u.email.split('@')[0] : `User #${u.id}`),
          dept: dept,
          role: uRole
        };
      });
    }

    return [
      { id: 1, name: 'Legal & Compliance Lead', dept: 'Legal & Compliance', role: 'Reviewer' },
      { id: 2, name: 'Finance & Tax Lead', dept: 'Finance & Accounting', role: 'Reviewer' },
      { id: 3, name: 'IT Department Lead', dept: 'IT Department', role: 'Reviewer' },
      { id: 4, name: 'DevOps Lead', dept: 'DevOps & Infrastructure', role: 'Dependency' },
      { id: 5, name: 'Operations Lead', dept: 'Operations Department', role: 'Reviewer' }
    ];
  }, [dbUsers]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await APIService.getRequests().catch(() => []);
      const combined = [...(data || []), ...(contextRequests || [])];
      
      const reqMap = new Map();
      combined.forEach(r => {
        if (r && (r.id || r.title || r.requestName)) {
          const key = r.tracking_id || (r.id ? `db-${r.id}` : r.title);
          if (!reqMap.has(key)) reqMap.set(key, r);
        }
      });

      const list = Array.from(reqMap.values()).map(r => ({
        id: r.tracking_id || (typeof r.id === 'string' || typeof r.id === 'number' ? `REQ-${r.id}` : `REQ-${Math.floor(1000 + Math.random() * 9000)}`),
        title: r.title || r.requestName || (r.entity_name ? `${r.entity_name} - ${r.contract_type || 'Contract Request'}` : 'Contract Request'),
        requestorName: r.requestorName || r.primary_contact_name || (r.requester && r.requester.full_name) || r.requestor || 'Internal Requestor',
        requestorEmail: r.primary_contact_email || (r.requester && r.requester.email) || '',
        department: r.department || r.requester_department || 'Legal Operations',
        businessUnit: r.business_unit || r.businessUnit || 'Corporate',
        contractType: r.contractType || r.contract_type || 'Proposal',
        category: r.category || r.contractCategory || 'Commercial',
        counterparty: r.counterparty || r.entity_name || r.secondPartyName || 'External Counterparty',
        priority: r.priority || 'Medium',
        status: r.status || r.current_status || 'Pending Intake',
        createdAt: r.createdAt || r.created_at || new Date().toISOString(),
        targetEffectiveDate: r.target_effective_date || r.targetEffectiveDate || null,
        targetDeliveryDate: r.target_delivery_date || r.targetDeliveryDate || null,
        estimatedValue: r.estimatedValue !== undefined ? r.estimatedValue : (r.deal_value !== undefined ? r.deal_value : (r.value !== undefined ? r.value : 0)),
        currency: r.currency || 'USD',
        pricingModel: r.pricing_model || r.pricingModel || 'TBD',
        paymentSchedule: r.payment_schedule || r.paymentSchedule || r.paymentTerms || 'TBD',
        jurisdiction: r.jurisdiction || r.governingLaw || 'Standard Jurisdiction',
        deliverables: r.deliverables || (r.keyDeliverables ? r.keyDeliverables : []),
        customTerms: r.custom_terms || r.customTerms || r.specialTerms || '',
        dependencies: r.dependencies || [],
        attachments: r.attachments || [],
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
    <div className="space-y-6 w-full px-4 sm:px-6 lg:px-8 font-sans">
      
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
                  <th className="px-6 py-4">Request ID</th>
                  <th className="px-6 py-4">Request Title</th>
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
                      <span className="font-mono font-bold text-xs text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                        {req.id}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {req.title}
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
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedRequest(req)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
                          title="View Request Details"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          View Request
                        </button>
                        <Link 
                          href={`${basePath}/drafting`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#16a34a] rounded-xl hover:bg-[#15803d] transition-colors shadow-xs"
                        >
                          Process
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-8 transform transition-all">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-6 flex items-start justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-lg border border-emerald-800">
                    {selectedRequest.id}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${getPriorityBadgeClass(selectedRequest.priority)}`}>
                    {selectedRequest.priority} Priority
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${getStatusBadgeClass(selectedRequest.status)}`}>
                    {selectedRequest.status}
                  </span>
                </div>
                <h2 className="text-xl font-bold mt-2.5 text-slate-50">{selectedRequest.title}</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Submitted by <span className="text-slate-200 font-bold">{selectedRequest.requestorName}</span>
                  {selectedRequest.requestorEmail && ` (${selectedRequest.requestorEmail})`} • {selectedRequest.department}
                </p>
              </div>
              <button 
                onClick={() => setSelectedRequest(null)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              
              {/* Section 1: Commercial Specs */}
              <div>
                <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-600" />
                  Contract & Commercial Specifications
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Contract Type</span>
                    <p className="font-bold text-slate-900 mt-1">{selectedRequest.contractType}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Counterparty Entity</span>
                    <p className="font-bold text-slate-900 mt-1">{selectedRequest.counterparty}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Estimated Value</span>
                    <p className="font-extrabold text-emerald-700 mt-1">
                      {selectedRequest.estimatedValue ? `$${Number(selectedRequest.estimatedValue).toLocaleString()} ${selectedRequest.currency}` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Pricing Model</span>
                    <p className="font-bold text-slate-900 mt-1">{selectedRequest.pricingModel}</p>
                  </div>
                </div>
              </div>

              {/* Section 2: Important Milestone Dates */}
              <div>
                <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  Key Milestone Dates & Schedule
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Submission Date</span>
                    <p className="font-bold text-slate-800">
                      {new Date(selectedRequest.createdAt).toLocaleDateString(undefined, { dateStyle: 'full' })}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Target Effective Date</span>
                    <p className="font-bold text-emerald-800">
                      {selectedRequest.targetEffectiveDate ? new Date(selectedRequest.targetEffectiveDate).toLocaleDateString(undefined, { dateStyle: 'full' }) : 'TBD / Upon Execution'}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Target Completion / Delivery</span>
                    <p className="font-bold text-blue-800">
                      {selectedRequest.targetDeliveryDate ? new Date(selectedRequest.targetDeliveryDate).toLocaleDateString(undefined, { dateStyle: 'full' }) : 'TBD / Per Milestones'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 3: Description & Scope Brief */}
              <div className="space-y-2">
                <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Request Description & Scope Brief
                </h3>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs leading-relaxed text-slate-700 font-medium whitespace-pre-line">
                  {selectedRequest.description}
                </div>
              </div>

              {/* Section 4: Deliverables & Milestones */}
              {selectedRequest.deliverables && (Array.isArray(selectedRequest.deliverables) ? selectedRequest.deliverables.length > 0 : Boolean(selectedRequest.deliverables)) && (
                <div className="space-y-2">
                  <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Key Deliverables & Milestones
                  </h3>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2">
                    {Array.isArray(selectedRequest.deliverables) ? (
                      selectedRequest.deliverables.map((item, dIdx) => (
                        <div key={dIdx} className="flex items-start gap-2.5 p-2.5 bg-white rounded-xl border border-slate-200/70">
                          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                            {dIdx + 1}
                          </span>
                          <div>
                            <p className="font-bold text-slate-900">{typeof item === 'string' ? item : (item.name || item.title || item.description)}</p>
                            {typeof item === 'object' && item.due_date && (
                              <span className="text-[11px] text-slate-500 font-medium">Due Date: {item.due_date}</span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-700 font-medium">{String(selectedRequest.deliverables)}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Section 5: Custom Terms & Governance */}
              <div className="space-y-2">
                <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Governance & Special / Custom Client Terms
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs">
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Payment Terms / Schedule</span>
                    <p className="font-bold text-slate-800 mt-1">{selectedRequest.paymentSchedule || 'Standard Terms'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Governing Law / Jurisdiction</span>
                    <p className="font-bold text-slate-800 mt-1">{selectedRequest.jurisdiction || 'Standard Jurisdiction'}</p>
                  </div>
                  {(selectedRequest.customTerms || selectedRequest.customClientTerms || selectedRequest.custom_terms || selectedRequest.specialTerms) && (
                    <div className="sm:col-span-2 pt-3 border-t border-slate-200">
                      <span className="text-emerald-800 font-extrabold uppercase tracking-wider text-[11px] block mb-1">
                        Special / Custom Client Terms (Optional)
                      </span>
                      <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs leading-relaxed text-slate-900 font-bold whitespace-pre-line">
                        {selectedRequest.customTerms || selectedRequest.customClientTerms || selectedRequest.custom_terms || selectedRequest.specialTerms}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 6: Pre-Drafting Dependencies */}
              {selectedRequest.dependencies && selectedRequest.dependencies.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    Pre-Drafting Dependency Tasks ({selectedRequest.dependencies.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedRequest.dependencies.map((dep, depIdx) => (
                      <div key={depIdx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900">{dep.department || 'Department'}</p>
                          <p className="text-[11px] text-slate-500 font-medium">{dep.assignee_name || dep.task_objective || 'Pending Assignment'}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          {dep.status || 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Close Preview
              </button>

              {dispatchSuccessMsg && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                  {dispatchSuccessMsg}
                </span>
              )}
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setSelectedReviewers(['IT Reviewer', 'Legal Reviewer', 'Finance Reviewer']);
                    setShowDependencyDispatchModal(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-[#16a34a] bg-[#eaf5ea] border border-emerald-200 hover:bg-[#dcfce7] rounded-xl transition-colors cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  Collect Pre-Draft Dependencies
                </button>

                <Link 
                  href={`${basePath}/drafting`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#16a34a] hover:bg-[#15803d] rounded-xl shadow-xs transition-colors"
                >
                  Process & Author Contract
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Request Pre-Draft Dependencies Modal (Matching Image 2 & 3) */}
      {showDependencyDispatchModal && selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8 transform transition-all text-slate-900">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Request Pre-Draft Dependencies</h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Select specialist leads to dispatch pre-drafting clearance tasks before drafting</p>
                </div>
              </div>
              <button 
                onClick={() => setShowDependencyDispatchModal(false)}
                className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
            </div>

            {/* Reviewer Selection Grid (Image 2) */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <p className="text-xs font-bold text-slate-600">Select reviewers / department leads to gather SLA estimates and scope approval:</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {reviewerOptions.map((rev) => {
                  const isChecked = selectedReviewers.includes(rev.name);
                  return (
                    <label 
                      key={rev.id || rev.name}
                      onClick={() => {
                        setSelectedReviewers(prev => 
                          isChecked ? prev.filter(n => n !== rev.name) : [...prev, rev.name]
                        );
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                        isChecked 
                          ? 'bg-emerald-50/80 border-emerald-500 shadow-2xs' 
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        onChange={() => {}}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <div>
                        <p className="font-extrabold text-xs text-slate-900">{rev.name}</p>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md mt-1 inline-block border border-slate-200/80">
                          {rev.dept} ({rev.role})
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setShowDependencyDispatchModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  try {
                    const newDeps = selectedReviewers.map(revName => ({
                      department: revName.includes('Legal') ? 'Legal & Compliance' : (revName.includes('Finance') ? 'Finance & Tax' : (revName.includes('IT') ? 'IT & Infrastructure' : 'Operations')),
                      assignee_name: revName,
                      task_objective: `Scope clearance & review task for ${selectedRequest.title}`,
                      sla_deadline: '24 Hours',
                      status: 'Pending'
                    }));

                    const updatedReq = {
                      ...selectedRequest,
                      status: 'Dependency Gathering',
                      dependencies: [...(selectedRequest.dependencies || []), ...newDeps]
                    };

                    setSelectedRequest(updatedReq);
                    setRequests(prev => prev.map(r => r.id === selectedRequest.id ? updatedReq : r));
                    setShowDependencyDispatchModal(false);
                    setDispatchSuccessMsg(`Dependencies dispatched to ${selectedReviewers.length} reviewer(s)! Status set to Dependency Gathering.`);
                    setTimeout(() => setDispatchSuccessMsg(null), 5000);
                  } catch (err) {
                    console.error(err);
                  }
                }}
                disabled={selectedReviewers.length === 0}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#16a34a] hover:bg-[#15803d] rounded-xl shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Send Requests ({selectedReviewers.length})
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
