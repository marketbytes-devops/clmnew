"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Calendar, Settings, User, ChevronDown, Menu, LogOut, FileCheck, User as UserIcon, Settings as SettingsIcon } from 'lucide-react';
import { useAppContext } from '../../context/appContext';
import { useRouter, usePathname } from 'next/navigation';
import UserProfileModal from '../../components/common/UserProfileModal';

export default function Header() {
  const { user, logout, toggleSidebar, isSidebarOpen } = useAppContext();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const pathname = usePathname();

  const handleOpenProfileModal = () => {
    setDropdownOpen(false);
    setIsProfileModalOpen(true);
  };

  const handleLogout = () => {
    if (logout) logout();
    setDropdownOpen(false);
    router.push('/login');
  };

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const getPageTitle = () => {
    if (pathname.includes('/dependency/tasks')) return 'My Dependency Tasks';
    if (pathname.includes('/dependency/history')) return 'Completed Tasks History';
    if (pathname.includes('/dependency/')) return 'Task Portal Brief';
    if (pathname === '/dependency') return 'Dashboard';
    if (pathname.includes('/cm/contracts') || pathname.includes('/admin/contracts')) return 'Contracts';
    if (pathname.includes('/cm/requests') || pathname.includes('/admin/requests')) return 'Requests / Intake';
    if (pathname.includes('/cm/review') || pathname.includes('/admin/review')) return 'Approvals & Review';
    if (pathname.includes('/cm/drafting') || pathname.includes('/admin/drafting')) return 'Drafting';
    if (pathname.includes('/cm/negotiation') || pathname.includes('/admin/negotiation')) return 'Negotiation';
    if (pathname.includes('/cm/repository') || pathname.includes('/admin/repository')) return 'Repository';
    if (pathname === '/cm') return 'Contracts';
    if (pathname.includes('/requestor/requests')) return 'My Requests';
    return 'Dashboard';
  };

  const userName = user?.full_name || user?.name || (user?.email ? user.email.split('@')[0] : 'User');
  const userInitial = userName ? userName.charAt(0).toUpperCase() : 'U';
  const userEmail = user?.email || '';

  const notificationsList = [
    {
      id: 1,
      title: "New Dependency Assigned",
      desc: "Provide technical estimation & SLA feasibility breakdown for Backend & APIs (REQ-2)",
      time: "10 mins ago",
      unread: true,
      color: "bg-emerald-500"
    },
    {
      id: 2,
      title: "SLA Deadline Approaching",
      desc: "REQ-2 evaluation deadline expires in 2 hours",
      time: "1 hour ago",
      unread: true,
      color: "bg-amber-500"
    },
    {
      id: 3,
      title: "Contract SOW Approved",
      desc: "Global Retail Solutions SOW 2026 approved by Contract Manager",
      time: "3 hours ago",
      unread: false,
      color: "bg-blue-500"
    }
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-6 sticky top-0 z-30 font-sans shadow-2xs">
      
      {/* Left: Page Title / Sidebar Toggle */}
      <div className="flex items-center gap-3">
        <button 
          onClick={toggleSidebar}
          title="Toggle Navigation Menu" 
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5 text-slate-600" />
        </button>

        {!isSidebarOpen && (
          <div className="flex items-center gap-2 pr-3 border-r border-slate-200">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700">
              <FileCheck className="w-4 h-4 text-emerald-700" />
            </div>
            <span className="font-black text-slate-900 text-sm tracking-tight">CLM</span>
          </div>
        )}

        <h2 className="text-base font-bold text-slate-900">{getPageTitle()}</h2>
      </div>

      {/* Right: Notifications Bell & User Profile Dropdown Pill */}
      <div className="flex items-center gap-3">

        {/* Notifications Bell Button & Popover */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            title="Notifications"
            className="w-10 h-10 bg-white border border-slate-200/90 hover:bg-slate-50 rounded-2xl flex items-center justify-center transition-all relative cursor-pointer shadow-2xs"
          >
            <Bell className="w-5 h-5 text-emerald-700" />
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-emerald-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
              2
            </span>
          </button>

          {/* Notifications Dropdown Popover */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-200/90 rounded-2xl shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-slate-900 text-sm">Notifications</h3>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                    2 New
                  </span>
                </div>
                <button 
                  onClick={() => setNotificationsOpen(false)}
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                >
                  Clear all
                </button>
              </div>

              <div className="py-2 divide-y divide-slate-100 max-h-72 overflow-y-auto space-y-1">
                {notificationsList.map((notif) => (
                  <div key={notif.id} className="py-2.5 px-1 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
                    <div className="flex items-start gap-2.5">
                      <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${notif.color}`} />
                      <div className="flex-1 space-y-0.5">
                        <p className="text-xs font-extrabold text-slate-900 leading-snug">{notif.title}</p>
                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{notif.desc}</p>
                        <span className="text-[10px] font-bold text-slate-400 block pt-1">{notif.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Logout Button */}
        <button
          onClick={handleLogout}
          title="Sign Out"
          className="w-10 h-10 bg-white border border-slate-200/90 hover:bg-slate-50 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-2xs text-slate-600 hover:text-rose-600"
        >
          <LogOut className="w-4 h-4" />
        </button>
        
        {/* User Pill Button & Dropdown Popover */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl transition-all shadow-2xs cursor-pointer"
          >
            <div className="w-8 h-8 bg-[#15803d] text-white rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              {userInitial}
            </div>
            <div className="text-left hidden sm:block">
              <span className="font-bold text-slate-900 text-xs tracking-tight block leading-tight">
                {userName}
              </span>
              <span className="text-[10px] font-medium text-slate-400 block leading-tight mt-0.5">
                {user?.title || (typeof user?.role === 'object' ? user?.role?.name : user?.role) || 'User'}
              </span>
            </div>
          </button>

          {/* Profile Dropdown Popover */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2.5 w-64 bg-white border border-slate-200/90 rounded-2xl shadow-xl py-3 px-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              
              {/* User Header */}
              <div className="pb-2.5">
                <p className="font-extrabold text-slate-900 text-sm leading-tight">
                  {userName}
                </p>
                <p className="text-xs font-medium text-slate-500 mt-0.5 truncate">
                  {userEmail}
                </p>
              </div>

              <div className="border-t border-slate-100 my-1" />

              {/* Menu Links */}
              <div className="py-1 space-y-0.5">
                <button
                  type="button"
                  onClick={handleOpenProfileModal}
                  className="w-full text-left px-1 py-1.5 text-xs font-bold text-slate-800 hover:text-emerald-700 transition-colors cursor-pointer"
                >
                  My Profile
                </button>
              </div>

              <div className="border-t border-slate-100 my-1" />

              {/* Sign Out Button */}
              <button
                onClick={handleLogout}
                className="w-full text-left px-1 py-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
              >
                Sign Out
              </button>

            </div>
          )}
        </div>

      </div>

      {/* User Profile & Account Settings Modal */}
      <UserProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
      
    </header>
  );
}
