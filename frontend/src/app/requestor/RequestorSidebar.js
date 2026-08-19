'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppContext } from '../../context/appContext';
import { LayoutDashboard, Inbox, FileText, Archive, Settings, Shield, User } from 'lucide-react';

export default function RequestorSidebar() {
  const pathname = usePathname();
  const { user } = useAppContext();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { 
      name: 'Requestor Dashboard', 
      path: '/requestor', 
      icon: LayoutDashboard
    },
    { 
      name: 'My Requests', 
      path: '/requestor/requests', 
      icon: Inbox
    },
    { 
      name: 'Saved Drafts', 
      path: '/requestor/drafts', 
      icon: FileText
    },
    { 
      name: 'Smart Repository', 
      path: '/requestor/repository', 
      icon: Archive
    },
    { 
      name: 'Profile', 
      path: '/requestor/profile', 
      icon: Settings
    },
  ];

  return (
    <div className="w-72 bg-white border-r border-[#cbdcbe] h-screen flex flex-col fixed left-0 top-0 shadow-xl shadow-[#4f6e43]/5 z-40">
      {/* Brand & Logo Area */}
      <div className="p-7 border-b border-[#cbdcbe] flex items-center gap-3">
        <div className="w-10 h-10 bg-[#4f6e43] rounded-xl flex items-center justify-center text-white shadow-md">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-black text-[#1c2918] tracking-tight leading-none">
            MarketBytes
          </h2>
          <p className="text-[11px] font-bold text-[#5c6e53] uppercase tracking-widest mt-1">
            Requestor Portal
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        <p className="px-3 text-[10px] font-black uppercase text-[#8ba37e] tracking-wider mb-2">
          Requestor Menu
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          
          // Match active route
          const isActive = item.path === '/requestor'
            ? pathname === '/requestor'
            : (pathname === item.path || pathname.startsWith(item.path + '/'));
          
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-[#4f6e43] text-white shadow-lg shadow-[#4f6e43]/20' 
                  : 'text-[#5c6e53] hover:bg-[#f0f5ee] hover:text-[#1c2918]'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#5c6e53] group-hover:text-[#1c2918]'}`} />
              <span className={`font-semibold text-sm ${isActive ? 'text-white' : ''}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* User Area at Bottom */}
      <div className="p-5 border-t border-[#cbdcbe] bg-[#fcfdfb]">
        <div className="flex items-center gap-3 bg-white border border-[#cbdcbe] p-3 rounded-xl shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-[#e7f2df] text-[#2c441f] border border-[#a8c79c] flex items-center justify-center font-bold text-sm">
            {mounted && user?.name ? user.name.charAt(0) : <User className="w-4 h-4" />}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold text-[#1c2918] truncate">
              {mounted && user?.name ? user.name : 'Requestor'}
            </p>
            <p className="text-[11px] font-medium text-[#5c6e53] truncate">
              {mounted && (user?.title || user?.role) ? (user.title || user.role) : 'Requestor'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
