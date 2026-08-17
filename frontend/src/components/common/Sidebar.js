'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppContext } from '../../context/appContext';
import { LayoutDashboard, FileText, Inbox, PenTool, Archive, User, FileCheck, CheckCircle } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAppContext();

  const navItems = [
    { name: 'Dashboard', path: '/requestor', icon: LayoutDashboard },
    { name: 'My Requests', path: '/requestor/requests', icon: Inbox },
    { name: 'Drafts', path: '/requestor/drafts', icon: PenTool },
    { name: 'Smart Repository', path: '/requestor/repository', icon: Archive },
    { name: 'Profile', path: '/requestor/settings', icon: User },
  ];

  const dependencyNavItems = [
    { name: 'Dashboard', path: '/dependency', icon: LayoutDashboard },
    { name: 'My Dependency Tasks', path: '/dependency/tasks', icon: Inbox },
    { name: 'History / Completed', path: '/dependency/history', icon: CheckCircle },
  ];

  const activeNavItems = pathname.includes('/dependency') ? dependencyNavItems : navItems;

  return (
    <aside className="w-72 bg-white border-r border-slate-200/80 h-screen flex flex-col fixed left-0 top-0 shadow-2xs z-40 font-sans">
      {/* Brand & Logo Area */}
      <div className="h-20 flex items-center px-6 border-b border-slate-100 gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-100/80 flex items-center justify-center text-[#16a34a] shadow-2xs">
          <FileCheck className="w-5 h-5 text-[#16a34a]" />
        </div>
        <div>
          <span className="text-lg font-extrabold text-slate-900 tracking-tight leading-none block">
            CLM
          </span>
          <span className="text-[10px] font-medium text-slate-400 leading-tight block mt-0.5">
            Requester Portal
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-1">
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Requester Menu
        </p>
        {activeNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = (item.path === '/dependency' || item.path === '/requestor') 
            ? pathname === item.path 
            : pathname === item.path || pathname.startsWith(item.path + '/');
          
          return (
            <Link 
              key={item.path} 
              href={item.path}
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
        <div className="flex items-center gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="w-9 h-9 rounded-full bg-[#dcfce7] text-[#15803d] font-bold text-xs flex items-center justify-center border border-emerald-200 shrink-0">
            {user?.name ? user.name.charAt(0) : 'J'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-bold text-slate-900 truncate">
              {user?.name || 'John Sales'}
            </p>
            <p className="text-[11px] font-medium text-slate-400 truncate">
              {user?.department || 'Sales Department'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
