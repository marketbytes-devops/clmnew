'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppContext } from '../../context/appContext';
import { LayoutDashboard, FileText, Inbox, PenTool, Archive, User, FileCheck } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAppContext();

  const navItems = [
<<<<<<< HEAD
    { name: 'Dashboard', path: '/requestor', icon: LayoutDashboard },
    { name: 'My Requests', path: '/requestor/requests', icon: Inbox },
    { name: 'Drafts', path: '/requestor/drafts', icon: PenTool },
    { name: 'Smart Repository', path: '/requestor/repository', icon: Archive },
    { name: 'Profile', path: '/requestor/settings', icon: User },
=======
    { 
      name: 'Dashboard', 
      path: '/requestor', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
        </svg>
      ) 
    },
    { 
      name: 'My Requests', 
      path: '/requestor/requests', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
      )
    },
    { 
      name: 'Drafts', 
      path: '/requestor/drafts', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
        </svg>
      ) 
    },
    { 
      name: 'Smart Repository', 
      path: '/requestor/repository', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
        </svg>
      ) 
    },
    { 
      name: 'Profile', 
      path: '/requestor/profile', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ) 
    },
>>>>>>> 7ca0c63fd39acedef4288b4e85c831bf61510776
  ];

  const dependencyNavItems = [
    { 
      name: 'Dashboard', 
      path: '/dependency', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
        </svg>
      ) 
    },
    { 
      name: 'My Dependency Tasks', 
      path: '/dependency/tasks', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
      )
    },
    { 
      name: 'History / Completed', 
      path: '/dependency/history', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      ) 
    },
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
<<<<<<< HEAD
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path || (item.path !== '/requestor' && pathname.startsWith(item.path + '/'));
=======
        {activeNavItems.map((item) => {
          const isActive = (item.path === '/dependency' || item.path === '/requestor') 
            ? pathname === item.path 
            : pathname === item.path || pathname.startsWith(item.path + '/');
>>>>>>> 7ca0c63fd39acedef4288b4e85c831bf61510776
          
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
