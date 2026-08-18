"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppContext } from '../../context/appContext';
import UserProfileModal from '../../components/common/UserProfileModal';
import { 
  LayoutDashboard, 
  FileText, 
  CheckSquare, 
  Inbox, 
  PenTool, 
  Handshake, 
  Archive, 
  BarChart3, 
  Users, 
  Building2, 
  ShieldCheck, 
  Cpu, 
  Settings,
  FileCheck,
  ChevronDown,
  ChevronRight,
  Briefcase,
  UserCheck,
  User
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, isSidebarOpen } = useAppContext();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Contract Manager Sub-pages routes check
  const contractManagerRoutes = [
    '/admin/contracts',
    '/admin/requests',
    '/admin/review',
    '/admin/drafting',
    '/admin/negotiation',
    '/admin/repository'
  ];

  const isContractManagerActive = contractManagerRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  const isReviewerActive = pathname === '/admin/review' || pathname.startsWith('/admin/review/');
  
  const dependencyRoutes = ['/dependency', '/dependency/tasks', '/dependency/history'];
  const isDependencyActive = dependencyRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  const [contractManagerOpen, setContractManagerOpen] = useState(true);
  const [reviewerOpen, setReviewerOpen] = useState(true);
  const [dependencyOpen, setDependencyOpen] = useState(true);

  useEffect(() => {
    if (isContractManagerActive) {
      setContractManagerOpen(true);
    }
    if (isReviewerActive) {
      setReviewerOpen(true);
    }
    if (isDependencyActive) {
      setDependencyOpen(true);
    }
  }, [pathname, isContractManagerActive, isReviewerActive, isDependencyActive]);

  const contractManagerSubItems = [
    { name: 'Contracts', href: '/admin/contracts', icon: FileText },
    { name: 'Requests / Intake', href: '/admin/requests', icon: Inbox },
    { name: 'Approvals & Review', href: '/admin/review', icon: CheckSquare },
    { name: 'Drafting', href: '/admin/drafting', icon: PenTool },
    { name: 'Negotiation', href: '/admin/negotiation', icon: Handshake },
    { name: 'Repository', href: '/admin/repository', icon: Archive },
  ];

  const reviewerSubItems = [
    { name: 'Approvals & Review', href: '/admin/review', icon: CheckSquare },
  ];

  const dependencySubItems = [
    { name: 'Dashboard', href: '/dependency', icon: LayoutDashboard },
    { name: 'My Dependency Tasks', href: '/dependency/tasks', icon: Inbox },
    { name: 'History / Completed', href: '/dependency/history', icon: CheckSquare },
  ];

  const adminSystemItems = [
    { name: 'Users & Roles', href: '/admin/users', icon: Users },
    { name: 'Security & Access', href: '/admin/permissions', icon: ShieldCheck },
    { name: 'Audit Logs', href: '/admin/departments', icon: Building2 },
    { name: 'Reports & Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'System Settings', href: '/admin/settings', icon: Settings },
  ];

  // Specific Sidebar View when in /cm (Contract Manager) route slug
  if (pathname.startsWith('/cm') || pathname.startsWith('/contract-manager')) {
    const cmNavItems = [
      { name: 'Dashboard', href: '/cm', icon: LayoutDashboard },
      { name: 'Contracts', href: '/cm/contracts', icon: FileText },
      { name: 'Requests / Intake', href: '/cm/requests', icon: Inbox },
      { name: 'Approvals & Review', href: '/cm/review', icon: CheckSquare },
      { name: 'Drafting', href: '/cm/drafting', icon: PenTool },
      { name: 'Negotiation', href: '/cm/negotiation', icon: Handshake },
      { name: 'Repository', href: '/cm/repository', icon: Archive },
    ];

    return (
      <aside className={`w-64 bg-white text-slate-700 flex flex-col h-screen fixed top-0 left-0 border-r border-slate-200/80 shadow-2xs z-40 font-sans transition-transform duration-300 ${
        isSidebarOpen !== false ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Brand Header */}
        <div className="h-20 flex items-center px-6 border-b border-slate-100 gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100/80 flex items-center justify-center text-emerald-600 shadow-2xs shrink-0">
            <FileCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <span className="text-lg font-extrabold text-slate-900 tracking-tight leading-none block">
              CLM
            </span>
            <span className="text-[10px] font-bold text-emerald-700 leading-tight block mt-0.5 tracking-wider uppercase">
              CONTRACT MANAGER
            </span>
          </div>
        </div>

        {/* Navigation List - Flat clean structure matching Dependency sidebar */}
        <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Contract Manager Menu
          </p>
          {cmNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = (item.href === '/cm') 
              ? pathname === item.href 
              : pathname === item.href || pathname.startsWith(item.href + '/');
            
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-sm font-medium ${
                  isActive 
                    ? 'bg-[#eaf5ea] text-[#1e5622] font-bold shadow-2xs' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#16a34a]' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Area at Bottom */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <div 
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center justify-between gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 shadow-2xs cursor-pointer hover:bg-slate-100/80 transition-colors"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-[#dcfce7] text-[#15803d] font-bold text-xs flex items-center justify-center border border-emerald-200 shrink-0">
                {user?.role === 'Contract Manager' && user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'SJ'}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {user?.role === 'Contract Manager' ? user.name : 'Sarah Jenkins'}
                </p>
                <p className="text-[11px] font-medium text-slate-400 truncate">
                  {user?.role === 'Contract Manager' ? (user.title || 'Contract Manager') : 'Contract Specialist'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* User Profile Modal */}
        <UserProfileModal 
          isOpen={isProfileModalOpen} 
          onClose={() => setIsProfileModalOpen(false)} 
        />
      </aside>
    );
  }

  // Specific Sidebar View when in /dependency route slug
  if (pathname.startsWith('/dependency')) {
    return (
      <aside className={`w-64 bg-white text-slate-700 flex flex-col h-screen fixed top-0 left-0 border-r border-slate-200/80 shadow-2xs z-40 font-sans transition-transform duration-300 ${
        isSidebarOpen !== false ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Brand Header */}
        <div className="h-20 flex items-center px-6 border-b border-slate-100 gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100/80 flex items-center justify-center text-emerald-600 shadow-2xs shrink-0">
            <FileCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <span className="text-lg font-extrabold text-slate-900 tracking-tight leading-none block">
              CLM
            </span>
            <span className="text-[10px] font-bold text-emerald-700 leading-tight block mt-0.5 tracking-wider uppercase">
              DEPENDENCY PORTAL
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Dependency Menu
          </p>
          {dependencySubItems.map((item) => {
            const Icon = item.icon;
            const isActive = (item.href === '/dependency') 
              ? pathname === item.href 
              : pathname === item.href || pathname.startsWith(item.href + '/');
            
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-sm font-medium ${
                  isActive 
                    ? 'bg-[#eaf5ea] text-[#1e5622] font-bold shadow-2xs' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#16a34a]' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Area at Bottom */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <div 
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center justify-between gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 shadow-2xs cursor-pointer hover:bg-slate-100/80 transition-colors"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-[#dcfce7] text-[#15803d] font-bold text-xs flex items-center justify-center border border-emerald-200 shrink-0">
                {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'JS'}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {user?.name || 'John Sales'}
                </p>
                <p className="text-[11px] font-medium text-slate-400 truncate">
                  {user?.title || user?.department || 'Dependency Lead'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* User Profile Modal */}
        <UserProfileModal 
          isOpen={isProfileModalOpen} 
          onClose={() => setIsProfileModalOpen(false)} 
        />
      </aside>
    );
  }

  // Default Admin Sidebar for all other portal routes
  return (
    <aside className={`w-64 bg-white text-slate-700 flex flex-col h-screen fixed top-0 left-0 border-r border-slate-200/80 shadow-2xs z-40 font-sans transition-transform duration-300 ${
      isSidebarOpen !== false ? 'translate-x-0' : '-translate-x-full'
    }`}>
      
      {/* Brand Header */}
      <div className="h-20 flex items-center px-6 border-b border-slate-100 gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-100/80 flex items-center justify-center text-emerald-600 shadow-2xs shrink-0">
          <FileCheck className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <span className="text-lg font-extrabold text-slate-900 tracking-tight leading-none block">
            CLM
          </span>
          <span className="text-[10px] font-medium text-slate-400 leading-tight block mt-0.5">
            CONTRACT LIFECYCLE MANAGEMENT
          </span>
        </div>
      </div>
      
      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-4">
        
        {/* Main Dashboard */}
        <div>
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Main Portals
          </p>
          <ul className="space-y-1">
            <li>
              <Link 
                href="/admin"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-sm font-medium ${
                  pathname === '/admin' 
                    ? 'bg-[#eaf5ea] text-[#1e5622] font-bold shadow-2xs' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className={`w-4 h-4 ${pathname === '/admin' ? 'text-[#16a34a]' : 'text-slate-400'}`} />
                <span>Dashboard</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Role-Based Portals */}
        <div>
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Role Access
          </p>
          
          <div className="space-y-1">

            {/* Requester */}
            <Link 
              href="/requestor"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-sm font-medium ${
                pathname.startsWith('/requestor') 
                  ? 'bg-[#eaf5ea] text-[#1e5622] font-bold shadow-2xs' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <Inbox className="w-3.5 h-3.5" />
              </div>
              <span>Requester Portal</span>
            </Link>
            
            {/* Contract Manager */}
            <div className="space-y-1">
              <button
                onClick={() => setContractManagerOpen(!contractManagerOpen)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  isContractManagerActive 
                    ? 'bg-emerald-50/80 text-emerald-900 border border-emerald-200/60' 
                    : 'text-slate-800 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Briefcase className="w-3.5 h-3.5" />
                  </div>
                  <span>Contract Manager</span>
                </div>
                {contractManagerOpen ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {/* Expandable Sub-pages */}
              {contractManagerOpen && (
                <ul className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-emerald-100 ml-5">
                  {contractManagerSubItems.map((sub) => {
                    const Icon = sub.icon;
                    const isActive = pathname === sub.href || pathname.startsWith(sub.href + '/');
                    return (
                      <li key={sub.name}>
                        <Link
                          href={sub.href}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                            isActive
                              ? 'bg-[#eaf5ea] text-[#1e5622] font-bold shadow-2xs'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#16a34a]' : 'text-slate-400'}`} />
                          <span>{sub.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Dependencies */}
            <div className="space-y-1">
              <button
                onClick={() => setDependencyOpen(!dependencyOpen)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  isDependencyActive 
                    ? 'bg-emerald-50/80 text-emerald-900 border border-emerald-200/60' 
                    : 'text-slate-800 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                    <Cpu className="w-3.5 h-3.5" />
                  </div>
                  <span>Dependencies</span>
                </div>
                {dependencyOpen ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {/* Expandable Dependency Sub-pages */}
              {dependencyOpen && (
                <ul className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-teal-100 ml-5">
                  {dependencySubItems.map((sub) => {
                    const Icon = sub.icon;
                    const isActive = (sub.href === '/dependency') 
                      ? pathname === sub.href 
                      : pathname === sub.href || pathname.startsWith(sub.href + '/');
                    return (
                      <li key={sub.name}>
                        <Link
                          href={sub.href}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                            isActive
                              ? 'bg-[#eaf5ea] text-[#1e5622] font-bold shadow-2xs'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#16a34a]' : 'text-slate-400'}`} />
                          <span>{sub.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Reviewer */}
            <div className="space-y-1">
              <button
                onClick={() => setReviewerOpen(!reviewerOpen)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  isReviewerActive 
                    ? 'bg-blue-50/80 text-blue-900 border border-blue-200/60' 
                    : 'text-slate-800 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                  <span>Reviewer</span>
                </div>
                {reviewerOpen ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {/* Expandable Sub-pages */}
              {reviewerOpen && (
                <ul className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-blue-100 ml-5">
                  {reviewerSubItems.map((sub) => {
                    const Icon = sub.icon;
                    const isActive = pathname === sub.href || pathname.startsWith(sub.href + '/');
                    return (
                      <li key={sub.name}>
                        <Link
                          href={sub.href}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                            isActive
                              ? 'bg-[#eaf5ea] text-[#1e5622] font-bold shadow-2xs'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#16a34a]' : 'text-slate-400'}`} />
                          <span>{sub.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Client */}
            <Link 
              href="/client"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-sm font-medium ${
                pathname.startsWith('/client') 
                  ? 'bg-[#eaf5ea] text-[#1e5622] font-bold shadow-2xs' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="w-6 h-6 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                <User className="w-3.5 h-3.5" />
              </div>
              <span>Client</span>
            </Link>

          </div>
        </div>

        {/* Administration Section */}
        <div>
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            System & Admin
          </p>
          <ul className="space-y-1">
            {adminSystemItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-sm font-medium ${
                      isActive
                        ? 'bg-[#eaf5ea] text-[#1e5622] font-bold shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#16a34a]' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

      </nav>

      {/* User Area at Bottom */}
      <div className="p-4 border-t border-slate-100 bg-white">
        <div 
          onClick={() => setIsProfileModalOpen(true)}
          className="flex items-center justify-between gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 shadow-2xs cursor-pointer hover:bg-slate-100/80 transition-colors"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-[#dcfce7] text-[#15803d] font-bold text-xs flex items-center justify-center border border-emerald-200 shrink-0">
              {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'SK'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-slate-900 truncate">
                {user?.name || 'Sanket Kumar'}
              </p>
              <p className="text-[11px] font-medium text-slate-400 truncate">
                {user?.role || user?.title || 'Admin'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* User Profile & Account Settings Modal */}
      <UserProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />

    </aside>
  );
}


