"use client";
import React, { useState } from 'react';
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
  Settings,
  FileCheck,
  Briefcase,
  Layers,
  ArrowRightLeft
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, isSidebarOpen } = useAppContext();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const isCMModule = pathname.startsWith('/cm');

  const contractManagerNavItems = [
    { name: 'CM Command Center', href: '/cm', icon: Briefcase },
    { name: 'Contracts Operations', href: '/admin/contracts', icon: FileText },
    { name: 'Requests / Intake', href: '/admin/requests', icon: Inbox },
    { name: 'Approvals & Review', href: '/admin/review', icon: CheckSquare },
    { name: 'Drafting Workbench', href: '/admin/drafting', icon: PenTool },
    { name: 'Negotiation Workbench', href: '/cm/negotiation/REQ-2026-0891', icon: Handshake },
    { name: 'Contract Repository', href: '/admin/repository', icon: Archive },
  ];

  const adminSystemItems = [
    { name: 'Users & Roles', href: '/admin/users', icon: Users },
    { name: 'Security & Access', href: '/admin/permissions', icon: ShieldCheck },
    { name: 'Departments', href: '/admin/departments', icon: Building2 },
  ];

  const adminOperationsItems = [
    { name: 'Contracts', href: '/admin/contracts', icon: FileText },
    { name: 'Approvals & Review', href: '/admin/review', icon: CheckSquare },
    { name: 'Drafting', href: '/admin/drafting', icon: PenTool },
    { name: 'Negotiation', href: '/admin/negotiation', icon: Handshake },
    { name: 'Repository', href: '/admin/repository', icon: Archive },
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
              <div suppressHydrationWarning className="w-9 h-9 rounded-full bg-[#dcfce7] text-[#15803d] font-bold text-xs flex items-center justify-center border border-emerald-200 shrink-0">
                {user?.role === 'Contract Manager' && user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'SJ'}
              </div>
              <div className="flex-1 overflow-hidden">
                <p suppressHydrationWarning className="text-xs font-bold text-slate-900 truncate">
                  {user?.role === 'Contract Manager' ? user.name : 'Sarah Jenkins'}
                </p>
                <p suppressHydrationWarning className="text-[11px] font-medium text-slate-400 truncate">
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
      <aside className={`w-64 bg-slate-900 text-slate-200 flex flex-col h-screen fixed top-0 left-0 border-r border-slate-800 shadow-xl z-40 font-sans transition-transform duration-300 ${
        isSidebarOpen !== false ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Brand Header */}
        <div className="h-20 flex items-center px-6 border-b border-slate-800 gap-3 bg-slate-950/40">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
            <Briefcase className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <span className="text-sm font-black text-white tracking-tight block">
              CONTRACT MANAGER
            </span>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mt-0.5">
              OPERATIONS PORTAL
            </span>
          </div>
        </div>
        
        {/* CM Dedicated Navigation List */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-2">
          <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
            CM Command & Workbenches
          </div>
          <ul className="space-y-1">
            {contractManagerNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/cm' && pathname.startsWith(item.href));
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-xs font-semibold ${
                      isActive
                        ? 'bg-emerald-600 text-white font-bold shadow-md'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Switch to Admin Workspace Button */}
          <div className="pt-6 px-1">
            <Link
              href="/admin"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-semibold transition-all group"
            >
              <span className="flex items-center gap-2">
                <ArrowRightLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400" /> Switch to Admin
              </span>
              <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-300">Admin</span>
            </Link>
          </div>
        </nav>

        {/* User Area at Bottom */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
          <div 
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer hover:bg-slate-850 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center border border-emerald-500/30 shrink-0">
              {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'CM'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'Sarah Jenkins'}</p>
              <p className="text-[10px] text-emerald-400 truncate">{user?.role || 'Contract Manager'}</p>
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

  // Standard Admin Sidebar View for all /admin/* routes
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
        
        {/* Main Navigation Items */}
        <div className="space-y-1">
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
            <li>
              <Link 
                href="/admin/analytics"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-sm font-medium ${
                  pathname === '/admin/analytics' || pathname.startsWith('/admin/analytics/')
                    ? 'bg-[#eaf5ea] text-[#1e5622] font-bold shadow-2xs' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <BarChart3 className={`w-4 h-4 ${pathname === '/admin/analytics' || pathname.startsWith('/admin/analytics/') ? 'text-[#16a34a]' : 'text-slate-400'}`} />
                <span>Reports & Analytics</span>
              </Link>
            </li>
            
            {/* Admin System Management Items */}
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

        {/* Portals & Operations */}
        <div className="space-y-1">
          
          {/* Contract Requestor */}
          <Link 
            href="/requestor"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname.startsWith('/requestor') 
                ? 'bg-[#eaf5ea] text-[#1e5622] font-bold shadow-2xs' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
              pathname.startsWith('/requestor') ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
            }`}>
              <Inbox className="w-3.5 h-3.5" />
            </div>
            <span>Contract Requestor</span>
          </Link>
          
          {/* Contract Operations Items */}
          <div className="pt-1">
            <ul className="space-y-1">
              {adminOperationsItems.map((sub) => {
                const Icon = sub.icon;
                const isActive = pathname === sub.href || pathname.startsWith(sub.href + '/');
                return (
                  <li key={sub.name}>
                    <Link
                      href={sub.href}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-[#eaf5ea] text-[#1e5622] font-bold shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span>{sub.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Dependencies Items */}
          <div className="pt-1">
            <ul className="space-y-1">
              <li>
                <Link
                  href="/dependency/tasks"
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    pathname.startsWith('/dependency')
                      ? 'bg-[#eaf5ea] text-[#1e5622] font-bold shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                    pathname.startsWith('/dependency') ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <Inbox className="w-3.5 h-3.5" />
                  </div>
                  <span>Dependency</span>
                </Link>
              </li>
            </ul>
          </div>

        </div>

      </nav>

      {/* User Area at Bottom */}
      <div className="p-4 border-t border-slate-100 bg-white">
        <div 
          onClick={() => setIsProfileModalOpen(true)}
          className="flex items-center justify-between gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 shadow-2xs cursor-pointer hover:bg-slate-100/80 transition-colors"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div suppressHydrationWarning className="w-9 h-9 rounded-full bg-[#dcfce7] text-[#15803d] font-bold text-xs flex items-center justify-center border border-emerald-200 shrink-0">
              {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'SK'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p suppressHydrationWarning className="text-xs font-bold text-slate-900 truncate">
                {user?.name || 'Sanket Kumar'}
              </p>
              <p suppressHydrationWarning className="text-[11px] font-medium text-slate-400 truncate">
                {user?.role || user?.title || 'Admin'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <UserProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />

    </aside>
  );
}
