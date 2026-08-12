'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppContext } from '../../context/appContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAppContext();

  const navItems = [
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
  ];

  return (
    <div className="w-72 bg-white border-r border-[#cbdcbe] h-screen flex flex-col fixed left-0 top-0 shadow-xl shadow-[#4f6e43]/5 z-40">
      {/* Brand & Logo Area */}
      <div className="p-7 border-b border-[#cbdcbe] flex items-center gap-3">
        <div className="w-10 h-10 bg-[#4f6e43] rounded-xl flex items-center justify-center text-white shadow-md">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-black text-[#1c2918] tracking-tight leading-none">
            MarketBytes
          </h2>
          <p className="text-[11px] font-bold text-[#5c6e53] uppercase tracking-widest mt-1">
            CLM Portal
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        <p className="px-3 text-[10px] font-black uppercase text-[#8ba37e] tracking-wider mb-2">
          Main Menu
        </p>
        {navItems.map((item) => {
          const isActive = item.path === '/requestor'
            ? pathname === '/requestor'
            : (pathname === item.path || pathname.startsWith(item.path + '/'));
          
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-[#4f6e43] text-white shadow-md shadow-[#4f6e43]/20' 
                  : 'text-[#4c6a40] hover:bg-[#f3f8f1] hover:text-[#1c2918]'
              }`}
            >
              <div className={`${isActive ? 'text-white' : 'text-[#708c60] group-hover:text-[#4f6e43]'}`}>
                {item.icon}
              </div>
              <span className={`font-black text-sm ${isActive ? 'text-white' : ''}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* User Area at Bottom */}
      <div className="p-5 border-t border-[#cbdcbe] bg-[#fafdf9]">
        <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-[#e2ede0] shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#e4f0dd] text-[#364e28] flex items-center justify-center font-black text-sm border border-[#c4d7b7]">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-black text-[#1c2918] truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-[11px] font-bold text-[#617454] truncate">
              {user?.department || 'Department'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
