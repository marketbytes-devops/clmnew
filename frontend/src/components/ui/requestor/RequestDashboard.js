'use client';

import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../../context/appContext';
import Button from '../../common/Button';
import StatusBadge from '../../common/StatusBadge';
import PriorityBadge from '../../common/PriorityBadge';
import MetricCard from '../../common/MetricCard';
import { useRouter } from 'next/navigation';

export default function RequestDashboard() {
  const { 
    user, 
    contractRequests, 
    requestMetrics, 
    notifications,
    contractManagers,
    loading,
    logout
  } = useAppContext();
  
  const router = useRouter();

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Filtered list computed dynamically
  const filteredRequests = useMemo(() => {
    return contractRequests.filter(req => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = !query || 
        req.requestId?.toLowerCase().includes(query) ||
        req.clientName?.toLowerCase().includes(query) ||
        req.requestName?.toLowerCase().includes(query) ||
        req.contractManager?.toLowerCase().includes(query);

      const matchesStatus = statusFilter === 'ALL' || req.currentStatus?.toLowerCase() === statusFilter.toLowerCase();
      const matchesCategory = categoryFilter === 'ALL' || req.contractCategory?.toLowerCase() === categoryFilter.toLowerCase();
      const matchesType = typeFilter === 'ALL' || req.contractType?.toLowerCase() === typeFilter.toLowerCase();
      const matchesDepartment = departmentFilter === 'ALL' || (() => {
        const mgr = contractManagers.find(m => m.name === req.contractManager);
        if (!mgr) return false;
        if (departmentFilter === 'Legal') return mgr.department?.toLowerCase().includes('legal');
        if (departmentFilter === 'Finance') return mgr.department?.toLowerCase().includes('finance');
        if (departmentFilter === 'Sales') return mgr.department?.toLowerCase().includes('sales');
        return false;
      })();
      const matchesDate = !dateFilter || req.createdDate === dateFilter;

      return matchesSearch && matchesStatus && matchesCategory && matchesType && matchesDepartment && matchesDate;
    });
  }, [contractRequests, searchQuery, statusFilter, categoryFilter, typeFilter, departmentFilter, dateFilter]);

  const availableContractTypes = {
    'Revenue / Sales': ['Proposal', 'Master Services Agreement (MSA)', 'Statement of Work (SOW)', 'Change Order'],
    'Procurement / Expenses': ['Vendor Agreement', 'Non-Disclosure Agreement (NDA)', 'Software License Agreement'],
    'Partnership / Non-Commercial': ['Memorandum of Understanding (MOU)', 'Non-Disclosure Agreement (NDA)', 'Joint Venture Proposal'],
    'Employment': ['Executive Offer Letter', 'Consulting & Contractor Agreement', 'Non-Compete Agreement'],
    'Real Estate / Facilities': ['Commercial Lease Agreement', 'Sublease Agreement', 'Construction & Renovation Contract'],
    'Intellectual Property': ['IP Assignment Agreement', 'Trademark Licensing', 'Patent Filing & Registration'],
    'Corporate / Governance': ['Shareholder Agreement', 'Board Resolution', 'Merger & Acquisition Term Sheet'],
    'Non-Disclosure (NDA)': ['Mutual NDA', 'One-way NDA', 'Employee NDA']
  };

  const handleCreateNew = () => {
    router.push('/requestor/create');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f1f6f0]">
        <div className="w-12 h-12 rounded-full border-4 border-[#cbdcbe] border-t-[#4f6e43] animate-spin mb-4"></div>
        <p className="text-base font-extrabold text-[#38522c]">Loading Contract Requests...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-7 min-h-screen bg-[#f1f6f0] text-[#1c2918]">
      {/* Top Navigation */}
      <nav className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
        <div className="relative w-full max-w-md">
          <svg className="w-5 h-5 text-[#4f6e43] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"
            placeholder="Search request IDs, clients, or types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-[#cbdcbe] rounded-2xl text-sm font-bold text-[#1c2918] placeholder-[#76876c] focus:outline-none focus:ring-2 focus:ring-[#4f6e43] shadow-sm transition-all"
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 text-[#4f6e43] bg-white border border-[#cbdcbe] hover:bg-[#e4f0dd] rounded-xl transition-colors shadow-sm"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#d14e4e] rounded-full border-2 border-white"></span>
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-[#cbdcbe] rounded-2xl shadow-xl z-50 overflow-hidden">
                <div className="p-4 border-b border-[#cbdcbe] bg-[#f9fbf8]">
                  <h3 className="font-black text-[#1c2918] text-sm">Notifications</h3>
                </div>
                <div className="divide-y divide-[#e2ede0] max-h-80 overflow-y-auto">
                  {notifications?.length > 0 ? (
                    notifications.map(notif => (
                      <div 
                        key={notif.id}
                        className={`p-4 cursor-pointer transition-colors ${notif.read ? 'bg-white hover:bg-[#f9fbf8]' : 'bg-[#f3f8f1] hover:bg-[#e4f0dd]'}`}
                        onClick={() => {
                          setShowNotifications(false);
                          const relatedReq = contractRequests.find(r => r.requestId === notif.relatedRequestId);
                          if (relatedReq) setSelectedRequest(relatedReq);
                        }}
                      >
                        <p className={`text-xs ${notif.read ? 'font-medium text-[#263b1a]' : 'font-bold text-[#1c2918]'}`}>
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-[#637756] mt-1">{notif.timeAgo}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs font-bold text-[#637756]">No new notifications</div>
                  )}
                </div>
                <div className="p-3 border-t border-[#cbdcbe] text-center bg-[#f9fbf8]">
                  <button onClick={() => setShowNotifications(false)} className="text-xs font-black text-[#4f6e43] hover:underline">Mark all as read</button>
                </div>
              </div>
            )}
          </div>
          <div className="relative">
            <div 
              className="hidden sm:flex items-center gap-3 bg-[#f2f7f0] px-4 py-2.5 rounded-2xl border border-[#c4d7b7] shadow-sm cursor-pointer hover:bg-[#e4f0dd] transition-colors"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="w-9 h-9 rounded-xl bg-[#4f6e43] flex items-center justify-center text-white font-black text-sm shadow-sm">
                {user?.name?.charAt(0) || 'J'}
              </div>
              <div className="text-left pr-2">
                <p className="text-xs font-black text-[#1c2918] leading-tight">
                  {user?.name || 'John Sales (Account Executive)'}
                </p>
              </div>
            </div>
            
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-[#cbdcbe] rounded-2xl shadow-xl z-50 overflow-hidden">
                <div className="p-4 border-b border-[#cbdcbe] bg-[#f9fbf8]">
                  <p className="font-black text-[#1c2918] text-sm">{user?.name || 'John Sales'}</p>
                  <p className="text-[10px] font-bold text-[#637756] mt-0.5">{user?.email || 'john.sales@acmecorp.com'}</p>
                </div>
                <div className="p-2">
                  <button 
                    onClick={() => {
                      setShowProfileMenu(false);
                      router.push('/requestor/profile');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[#1c2918] hover:bg-[#f3f8f1] transition-colors"
                  >
                    My Profile
                  </button>
                </div>
                <div className="p-2 border-t border-[#cbdcbe]">
                  <button 
                    onClick={() => {
                      logout();
                      router.push('/login');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[#d14e4e] hover:bg-[#faeae5] transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Header Bar */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-7 rounded-3xl border border-[#cbdcbe] shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-[#1c2918] tracking-tight">
            Contract Requestor
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="primary" 
            size="lg"
            onClick={handleCreateNew}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/>
              </svg>
            }
            className="shadow-lg shadow-[#4f6e43]/25 px-6 py-3.5 font-black text-base transition-transform hover:scale-[1.02]"
          >
            Create Contract Request
          </Button>
        </div>
      </header>

      {/* Quick Metric KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard 
          title="Active Requests" 
          value={requestMetrics.totalActive || 0} 
          color="olive"
          subtitle="Agreements currently in progress"
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          }
          onClick={() => setStatusFilter('ALL')}
        />
        <MetricCard 
          title="Pending Dependencies" 
          value={requestMetrics.pendingDependencies || 0} 
          color="amber"
          subtitle="Awaiting Tech & Design leads"
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          }
          onClick={() => setStatusFilter('Dependency Gathering')}
        />
        <MetricCard 
          title="In Internal Review" 
          value={requestMetrics.inReview || 0} 
          color="sage"
          subtitle="Under Legal & Finance approval"
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
            </svg>
          }
          onClick={() => setStatusFilter('Internal Review')}
        />
        <MetricCard 
          title="Approved Deals" 
          value={requestMetrics.approved || 0} 
          color="forest"
          subtitle="Ready for Client E-Sign portal"
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/>
            </svg>
          }
          onClick={() => setStatusFilter('Approved')}
        />
      </section>

      {/* Filter & Search Toolbar */}
      <section className="bg-white rounded-3xl p-5 border border-[#cbdcbe] shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full pb-1 md:pb-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-[#5c6e53] uppercase tracking-wide whitespace-nowrap">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border-2 border-[#b9d2ab] rounded-xl px-3.5 py-2.5 text-xs font-black text-[#263b1a] focus:outline-none focus:ring-2 focus:ring-[#4f6e43] cursor-pointer shadow-2xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Submitted">Submitted</option>
              <option value="Dependency Gathering">Dependency Gathering</option>
              <option value="Drafting In Progress">Drafting In Progress</option>
              <option value="Internal Review">Internal Review</option>
              <option value="Client Negotiation">Client Negotiation</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-[#5c6e53] uppercase tracking-wide whitespace-nowrap">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setTypeFilter('ALL');
              }}
              className="bg-white border-2 border-[#b9d2ab] rounded-xl px-3.5 py-2.5 text-xs font-black text-[#263b1a] focus:outline-none focus:ring-2 focus:ring-[#4f6e43] cursor-pointer shadow-2xs max-w-[140px]"
            >
              <option value="ALL">All Categories</option>
              {Object.keys(availableContractTypes).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {categoryFilter !== 'ALL' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-[#5c6e53] uppercase tracking-wide whitespace-nowrap">Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-white border-2 border-[#b9d2ab] rounded-xl px-3.5 py-2.5 text-xs font-black text-[#263b1a] focus:outline-none focus:ring-2 focus:ring-[#4f6e43] cursor-pointer shadow-2xs max-w-[130px]"
              >
                <option value="ALL">All Types</option>
                {availableContractTypes[categoryFilter]?.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-[#5c6e53] uppercase tracking-wide whitespace-nowrap">Assignee Dept:</span>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-white border-2 border-[#b9d2ab] rounded-xl px-3.5 py-2.5 text-xs font-black text-[#263b1a] focus:outline-none focus:ring-2 focus:ring-[#4f6e43] cursor-pointer shadow-2xs"
            >
              <option value="ALL">All Depts</option>
              <option value="Legal">Legal & Operations</option>
              <option value="Finance">Finance & Procurement</option>
              <option value="Sales">Sales Support</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-[#5c6e53] uppercase tracking-wide whitespace-nowrap">Date:</span>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-white border-2 border-[#b9d2ab] rounded-xl px-3.5 py-2 text-xs font-black text-[#263b1a] focus:outline-none focus:ring-2 focus:ring-[#4f6e43] shadow-2xs uppercase"
            />
          </div>

          {(statusFilter !== 'ALL' || categoryFilter !== 'ALL' || typeFilter !== 'ALL' || departmentFilter !== 'ALL' || dateFilter !== '' || searchQuery !== '') && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => { 
                setStatusFilter('ALL'); 
                setCategoryFilter('ALL'); 
                setTypeFilter('ALL'); 
                setDepartmentFilter('ALL');
                setDateFilter('');
                setSearchQuery(''); 
              }}
              className="text-[#a13b3b] font-black text-xs whitespace-nowrap hover:bg-[#faeae5] px-3.5 py-2 rounded-xl border border-[#dfacac]"
            >
              Reset

            </Button>
          )}
        </div>
      </section>

      {/* Main Data Table */}
      <section className="bg-white rounded-3xl border border-[#cbdcbe] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#e9f2e4] border-b border-[#c4d7b7] text-xs font-black text-[#2f4820] uppercase tracking-wider">
                <th className="py-4 px-5 sm:px-6">Request ID & Name</th>
                <th className="py-4 px-4">Client/Beneficiary</th>
                <th className="py-4 px-4">Contract Type</th>
                <th className="py-4 px-4">Requester</th>
                <th className="py-4 px-4">Contract Manager</th>
                <th className="py-4 px-4">Priority</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4">Created Date</th>
                <th className="py-4 px-5 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2ede0] text-sm font-medium bg-white">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((req, index) => (
                  <tr 
                    key={req.requestId || index}
                    className="hover:bg-[#f3f8f1] transition-colors cursor-pointer group"
                    onClick={() => setSelectedRequest(req)}
                  >
                    <td className="py-4 px-5 sm:px-6">
                      <div className="flex flex-col">
                        <span className="font-black text-[#4f6e43] font-mono text-xs group-hover:underline">
                          {req.requestId}
                        </span>
                        <span className="font-extrabold text-[#1c2918] line-clamp-1 max-w-xs mt-0.5 text-base" title={req.requestName}>
                          {req.requestName}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-extrabold text-[#1c2918]">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#5d824f] inline-block"></span>
                        <span className="truncate max-w-[150px]">{req.clientName}</span>
                      </div>
                      <span className="text-[11px] font-bold text-[#567447] block mt-0.5">{req.entityType}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs bg-[#e9f2e4] text-[#2c441f] border border-[#bfd3b1] font-black">
                        {req.contractType}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-bold text-[#1c2918] text-sm">
                      {req.requesterName || user?.name || 'John Sales'}
                    </td>
                    <td className="py-4 px-4 text-xs font-bold text-[#35482a]">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#e1eee1] text-[#2c441f] border border-[#a8c79c] flex items-center justify-center font-black text-xs shadow-2xs">
                          {req.contractManager ? req.contractManager.charAt(0) : '?'}
                        </div>
                        <span>{req.contractManager || 'Unassigned'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <PriorityBadge priority={req.priority} />
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={req.currentStatus} />
                    </td>
                    <td className="py-4 px-4 text-xs font-bold text-[#5c6e53]">
                      {req.createdDate}
                    </td>
                    <td className="py-4 px-5 sm:px-6 text-right font-black" onClick={(e) => e.stopPropagation()}>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSelectedRequest(req)}
                        className="text-[#4f6e43] hover:text-white hover:bg-[#4f6e43] font-black text-xs px-4 py-1.5 rounded-xl border border-[#bcd1ae]"
                      >
                        View &rarr;
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center max-w-md mx-auto">
                      <div className="w-14 h-14 rounded-3xl bg-[#eef5eb] border border-[#bcd1ae] flex items-center justify-center text-[#4f6e43] mb-3 shadow-2xs">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                      </div>
                      <p className="text-lg font-black text-[#1c2918]">No matching contract requests</p>
                      <p className="text-xs text-[#637756] mt-1 font-bold">Try resetting your filter criteria or start a new intake request.</p>
                      <Button 
                        variant="primary" 
                        size="md" 
                        onClick={() => { setStatusFilter('ALL'); setTypeFilter('ALL'); setSearchQuery(''); }}
                        className="mt-5 font-bold"
                      >
                        Clear All Filters
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Detail Summary Preview Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141f12]/60 backdrop-blur-xs animate-fadeIn" onClick={() => setSelectedRequest(null)}>
          <div 
            className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 border-2 border-[#a4c295] shadow-2xl max-h-[90vh] overflow-y-auto space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-[#d2e0c8] pb-5">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono font-black px-3 py-0.5 bg-[#e4f0dd] text-[#2c441f] rounded-lg border border-[#afc9a0]">
                    {selectedRequest.requestId}
                  </span>
                  <StatusBadge status={selectedRequest.currentStatus} />
                  <PriorityBadge priority={selectedRequest.priority} />
                </div>
                <h2 className="text-2xl font-black text-[#1c2918] mt-1">
                  {selectedRequest.requestName}
                </h2>
                <p className="text-xs text-[#617454] font-bold mt-1">
                  Initiated by <span className="font-black text-[#364e28]">{selectedRequest.requesterName}</span> on {selectedRequest.createdDate}
                </p>
              </div>
              <button 
                onClick={() => setSelectedRequest(null)}
                className="text-[#728564] hover:text-[#25361a] p-2 rounded-xl hover:bg-[#eaf3e5] transition-colors font-black"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            {/* Commercial Parameters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#f3f8f1] p-4 rounded-2xl border border-[#cbdcbe] text-sm">
              <div>
                <p className="text-xs text-[#5e7152] font-bold">Beneficiary / Client</p>
                <p className="font-black text-[#1c2918] mt-1">{selectedRequest.clientName}</p>
              </div>
              <div>
                <p className="text-xs text-[#5e7152] font-bold">Deal Value</p>
                <p className="font-black text-[#3b572e] mt-1">
                  {selectedRequest.estimatedValue ? `$${Number(selectedRequest.estimatedValue).toLocaleString()} ${selectedRequest.currency}` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#5e7152] font-bold">Pricing Model</p>
                <p className="font-black text-[#2f4323] mt-1">{selectedRequest.pricingModel || 'Fixed Bid'}</p>
              </div>
              <div>
                <p className="text-xs text-[#5e7152] font-bold">Assigned Manager</p>
                <p className="font-black text-[#3d592b] mt-1">{selectedRequest.contractManager || 'TBD'}</p>
              </div>
            </div>

            {/* Scope Summary */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#637657]">
                Scope & Business Objective Briefing
              </h4>
              <div className="p-4 bg-[#f7faf5] rounded-2xl border border-[#cbdcbe] text-sm font-bold text-[#23331c] leading-relaxed">
                {selectedRequest.scopeSummary || 'No formal scope summary provided during intake.'}
              </div>
            </div>

            {/* Key Deliverables */}
            {selectedRequest.deliverables && selectedRequest.deliverables.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#637657]">
                  Expected Key Deliverables ({selectedRequest.deliverables.length})
                </h4>
                <div className="grid grid-cols-1 gap-2.5">
                  {selectedRequest.deliverables.map((del, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#c6d7ba] shadow-2xs text-sm">
                      <div>
                        <span className="font-black text-[#1c2918] block">{del.name}</span>
                        <span className="text-xs text-[#637657] font-semibold">{del.description}</span>
                      </div>
                      <span className="px-3 py-1 bg-[#e7f2e0] text-[#2c441f] border border-[#adc69d] rounded-lg text-xs font-black whitespace-nowrap">
                        {del.timeline || 'Target TBA'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dependencies Matrix */}
            {selectedRequest.dependencies && selectedRequest.dependencies.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#637657]">
                  Pre-Drafting Dependency Tasks Dispatched
                </h4>
                <div className="overflow-hidden rounded-2xl border border-[#cbdcbe] shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#e9f2e4] text-[#273e1c] font-black uppercase tracking-wider border-b border-[#cbdcbe]">
                      <tr>
                        <th className="py-3.5 px-4">Department</th>
                        <th className="py-3.5 px-4">Lead Assignee</th>
                        <th className="py-3.5 px-4">Task Objective</th>
                        <th className="py-3.5 px-4">SLA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#d5e4cc] text-[#24361e] font-bold bg-white">
                      {selectedRequest.dependencies.map((dep, i) => (
                        <tr key={i} className="bg-white">
                          <td className="py-3.5 px-4 font-black text-[#3d5a2c]">{dep.department}</td>
                          <td className="py-3.5 px-4 font-black">{dep.lead}</td>
                          <td className="py-3.5 px-4 font-semibold text-[#5a6e4e]">{dep.objective}</td>
                          <td className="py-3.5 px-4 font-mono text-[#aa7621] font-black">{dep.sla}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-5 border-t border-[#d5e4cc]">
              <Button variant="secondary" onClick={() => setSelectedRequest(null)} className="font-bold">
                Close Preview
              </Button>
              {selectedRequest.currentStatus === 'Draft' && (
                <Button variant="primary" onClick={() => { setSelectedRequest(null); alert(`Resuming draft editor for ${selectedRequest.requestId}`); }}>
                  Resume Drafting &rarr;
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
