"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, Plus, Inbox, CheckSquare, PenTool, Handshake, Archive,
  ArrowRight, Sparkles, Clock, AlertTriangle, CheckCircle2, ShieldCheck,
  TrendingUp, BarChart3, Search, Filter, RefreshCw, ChevronRight,
  DollarSign, Calendar, Users, Eye, Bot, Layers, ArrowUpRight, Cpu
} from 'lucide-react';
import { useAppContext } from '../../context/appContext';
import { APIService } from '../../service/apiService';

export default function CMDashboardPage() {
  const { user, contracts: contextContracts, contractRequests: contextRequests } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [fetchedRequests, setFetchedRequests] = useState([]);

  useEffect(() => {
    const loadRequests = async () => {
      setLoading(true);
      try {
        const res = await APIService.getRequests().catch(() => []);
        setFetchedRequests(Array.isArray(res) ? res : []);
      } catch (err) {
        console.error("Failed to load CM requests", err);
      } finally {
        setLoading(false);
      }
    };
    loadRequests();
  }, [contextRequests]);

  // Combine live submitted requests with baseline lifecycle samples
  const combinedRequestsList = React.useMemo(() => {
    const map = new Map();
    
    // Add live requests from context & API first
    const allLive = [...(fetchedRequests || []), ...(contextRequests || [])];
    allLive.forEach(r => {
      if (r && (r.id || r.tracking_id || r.title || r.requestName)) {
        const key = r.tracking_id || (r.id ? `REQ-${r.id}` : r.title || r.requestName);
        if (!map.has(key)) {
          const valNum = r.deal_value || r.estimatedValue || r.value || 0;
          map.set(key, {
            id: key,
            title: r.title || r.requestName || (r.entity_name ? `${r.entity_name} - ${r.contract_type || 'Request'}` : 'Contract Request'),
            client: r.entity_name || r.clientName || r.counterparty || r.primary_contact_name || 'Acme Corp',
            category: r.category || r.contract_type || 'Sales / Proposal',
            value: typeof valNum === 'number' ? `$${valNum.toLocaleString()}` : String(valNum),
            stage: r.status === 'Drafting In Progress' ? 'Stage 3: Authoring & Drafting' : (r.status === 'In Review' ? 'Stage 4: Internal Review' : 'Stage 1: Intake & Request'),
            stageSlug: r.status === 'Drafting In Progress' ? '/cm/drafting' : (r.status === 'In Review' ? '/cm/review' : '/cm/requests'),
            status: r.status || r.current_status || 'Pending Intake',
            priority: r.priority || 'Medium',
            manager: r.assigned_to?.full_name || 'Sarah Jenkins',
            updated: 'Just now',
            badgeColor: r.status === 'Drafting In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-[#eaf5ea] text-[#1e5622] border-emerald-200'
          });
        }
      }
    });

    // Add baseline demo samples
    const sampleData = [
      {
        id: 'REQ-2026-0891',
        title: 'Proposal_E-Commerce_Web_App_v1.0.docx',
        client: 'Acme Corp',
        category: 'Sales / Proposal',
        value: '$22,000',
        stage: 'Stage 4: Internal Review',
        stageSlug: '/cm/review',
        status: 'Internal Review',
        priority: 'High',
        manager: 'Sarah Jenkins',
        updated: '10 mins ago',
        badgeColor: 'bg-amber-50 text-amber-700 border-amber-200'
      },
      {
        id: 'REQ-2026-0902',
        title: 'Global Master Services Agreement (MSA)',
        client: 'Stark Industries',
        category: 'Revenue / MSA',
        value: '$120,000',
        stage: 'Stage 2: Dependency Hub',
        stageSlug: '/cm/requests',
        status: 'Dependency Gathering',
        priority: 'Urgent',
        manager: 'Sarah Jenkins',
        updated: '1 hour ago',
        badgeColor: 'bg-teal-50 text-teal-700 border-teal-200'
      },
      {
        id: 'REQ-2026-0877',
        title: 'Cloud Infrastructure Migration SOW v1.1',
        client: 'Wayne Enterprises',
        category: 'Statement of Work',
        value: '$85,000',
        stage: 'Stage 5: Client Negotiation',
        stageSlug: '/cm/negotiation',
        status: 'Client Negotiation',
        priority: 'High',
        manager: 'Sarah Jenkins',
        updated: '3 hours ago',
        badgeColor: 'bg-purple-50 text-purple-700 border-purple-200'
      },
      {
        id: 'REQ-2026-0850',
        title: 'Annual Enterprise SaaS License Agreement',
        client: 'Cyberdyne Systems',
        category: 'Software License',
        value: '$45,000',
        stage: 'Stage 3: Authoring & Drafting',
        stageSlug: '/cm/drafting',
        status: 'Drafting In Progress',
        priority: 'Medium',
        manager: 'Sarah Jenkins',
        updated: 'Yesterday',
        badgeColor: 'bg-blue-50 text-blue-700 border-blue-200'
      },
      {
        id: 'CTR-2026-0092',
        title: 'Digital Experience Platform SOW (Executed)',
        client: 'TechCorp International',
        category: 'Executed SOW',
        value: '$92,000',
        stage: 'Stage 6: Smart Repository',
        stageSlug: '/cm/repository',
        status: 'Active Vault',
        priority: 'Low',
        manager: 'Sarah Jenkins',
        updated: '2 days ago',
        badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
      }
    ];

    sampleData.forEach(item => {
      if (!map.has(item.id)) map.set(item.id, item);
    });

    return Array.from(map.values());
  }, [fetchedRequests, contextRequests]);

  const stages = [
    {
      number: '1',
      name: 'Intake & Requests',
      desc: 'Capture requirements & assign CM',
      icon: Inbox,
      count: `${combinedRequestsList.filter(r => r.stage.includes('Intake') || r.stage.includes('Dependency')).length} Requests`,
      href: '/cm/requests',
      color: 'from-amber-500/10 to-amber-500/5 text-amber-700 border-amber-200/80',
      iconBg: 'bg-amber-100 text-amber-700'
    },
    {
      number: '2',
      name: 'Dependency Hub',
      desc: 'UI/UX, Tech & Ops estimation',
      icon: Cpu,
      count: '3 Active Hubs',
      href: '/cm/requests',
      color: 'from-teal-500/10 to-teal-500/5 text-teal-700 border-teal-200/80',
      iconBg: 'bg-teal-100 text-teal-700'
    },
    {
      number: '3',
      name: 'Authoring Studio',
      desc: 'Smart tokens & clause library',
      icon: PenTool,
      count: `${combinedRequestsList.filter(r => r.stage.includes('Drafting') || r.stage.includes('Authoring')).length} In Drafting`,
      href: '/cm/drafting',
      color: 'from-blue-500/10 to-blue-500/5 text-blue-700 border-blue-200/80',
      iconBg: 'bg-blue-100 text-blue-700'
    },
    {
      number: '4',
      name: 'Internal Approvals',
      desc: 'Ops, Finance & Legal governance',
      icon: CheckSquare,
      count: `${combinedRequestsList.filter(r => r.stage.includes('Review')).length} In Review`,
      href: '/cm/review',
      color: 'from-emerald-500/10 to-emerald-500/5 text-emerald-800 border-emerald-200/80',
      iconBg: 'bg-emerald-100 text-emerald-700'
    },
    {
      number: '5',
      name: 'Client Negotiation',
      desc: 'Dispatched & external redlines',
      icon: Handshake,
      count: `${combinedRequestsList.filter(r => r.stage.includes('Negotiation')).length} In Negotiation`,
      href: '/cm/negotiation',
      color: 'from-purple-500/10 to-purple-500/5 text-purple-700 border-purple-200/80',
      iconBg: 'bg-purple-100 text-purple-700'
    },
    {
      number: '6',
      name: 'Smart Repository',
      desc: 'Executed vault & obligations',
      icon: Archive,
      count: '18 Executed',
      href: '/cm/repository',
      color: 'from-indigo-500/10 to-indigo-500/5 text-indigo-700 border-indigo-200/80',
      iconBg: 'bg-indigo-100 text-indigo-700'
    }
  ];

  const filteredContracts = combinedRequestsList.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 pb-12 font-sans text-slate-800">
      
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0d3319] via-[#14532d] to-[#1e3a8a] text-white p-7 sm:p-9 rounded-3xl shadow-xl shadow-emerald-950/10 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-200 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            Contract Lifecycle Management • Command Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            Welcome back, {user?.name || 'Sarah Jenkins'}
          </h1>
          <p className="text-emerald-100/90 text-sm mt-1.5 leading-relaxed">
            Orchestrate intake requests, synthesize technical dependencies, draft compliant proposals, and monitor post-signature obligations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <Link
            href="/cm/contracts/create"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Contract Request</span>
          </Link>
          <Link
            href="/cm/review"
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/15 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm transition-all backdrop-blur-md"
          >
            <CheckSquare className="w-4 h-4 text-emerald-300" />
            <span>Approvals Queue</span>
          </Link>
        </div>

        {/* Subtle Decorative Background Rings */}
        <div className="absolute -right-12 -bottom-16 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -top-16 w-60 h-60 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Portfolio Value</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">$1.42M</p>
          <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1">
            <TrendingUp className="w-3.5 h-3.5" /> +18% vs Last Quarter
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active In Pipeline</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">14 Contracts</p>
          <p className="text-xs font-medium text-slate-400 mt-1">
            Avg Velocity: 4.2 Days w/ AI
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Approvals</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">4 Pending</p>
          <p className="text-xs font-semibold text-amber-700 flex items-center gap-1 mt-1">
            <AlertTriangle className="w-3.5 h-3.5" /> 1 SLA alert (Finance Lead)
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Executed & Vault</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Archive className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">18 Executed</p>
          <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Policy Compliance
          </p>
        </div>

      </div>

      {/* 6-Stage Lifecycle Flow Navigator */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              CLM 6-Stage Lifecycle Workflow
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click on any stage to jump directly to its dedicated workspace.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {stages.map((stage) => {
            const Icon = stage.icon;
            return (
              <Link
                key={stage.number}
                href={stage.href}
                className={`bg-gradient-to-b ${stage.color} bg-white p-4 rounded-2xl border transition-all hover:scale-[1.02] hover:shadow-md group flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-8 h-8 rounded-xl ${stage.iconBg} flex items-center justify-center shadow-2xs`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-white/80 border border-slate-200/80 text-slate-600">
                      Stage {stage.number}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">
                    {stage.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 leading-tight line-clamp-2">
                    {stage.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-800">{stage.count}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Active Contracts Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
        
        {/* Table Filter Toolbar */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Active Contract Lifecycle Queue</h3>
            <p className="text-xs text-slate-500">Live monitoring across all stages and departments</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search contract, client, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:border-emerald-500 focus:outline-hidden transition-all w-60"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-slate-700 focus:outline-hidden font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="Pending Intake">Pending Intake</option>
              <option value="Dependency Gathering">Dependency Gathering</option>
              <option value="Drafting In Progress">Drafting In Progress</option>
              <option value="Internal Review">Internal Review</option>
              <option value="Client Negotiation">Client Negotiation</option>
              <option value="Active Vault">Active Vault</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-5">Tracking ID & Title</th>
                <th className="py-3.5 px-4">Client / Beneficiary</th>
                <th className="py-3.5 px-4">Deal Value</th>
                <th className="py-3.5 px-4">Current Lifecycle Stage</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredContracts.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  
                  {/* Tracking ID & Title */}
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <Link 
                          href={item.stageSlug}
                          className="font-bold text-slate-900 hover:text-emerald-700 block transition-colors"
                        >
                          {item.title}
                        </Link>
                        <span className="text-[11px] text-slate-400 font-mono font-semibold">
                          {item.id} • {item.category}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Client */}
                  <td className="py-4 px-4">
                    <span className="font-bold text-slate-900">{item.client}</span>
                    <span className="text-[10px] text-slate-400 block">{item.updated}</span>
                  </td>

                  {/* Deal Value */}
                  <td className="py-4 px-4">
                    <span className="font-bold text-slate-900">{item.value}</span>
                  </td>

                  {/* Current Stage */}
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold ${item.badgeColor}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {item.stage}
                    </span>
                  </td>

                  {/* Priority */}
                  <td className="py-4 px-4">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                      item.priority === 'Urgent'
                        ? 'bg-rose-100 text-rose-800'
                        : item.priority === 'High'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {item.priority}
                    </span>
                  </td>

                  {/* Action Link */}
                  <td className="py-4 px-4 text-right">
                    <Link
                      href={item.stageSlug}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 font-bold transition-all text-xs shadow-2xs"
                    >
                      <span>Open Workspace</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredContracts.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            <Inbox className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold">No contracts match your search filter.</p>
          </div>
        )}

      </div>

    </div>
  );
}
