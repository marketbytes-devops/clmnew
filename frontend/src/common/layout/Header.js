"use client";
import React, { useState } from 'react';
<<<<<<< HEAD
import { Search, Bell, Calendar, ChevronDown, Menu } from 'lucide-react';

export default function Header() {
  const [dateRange, setDateRange] = useState('May 12 – May 18, 2025');
=======
import { Search, Bell, Calendar, Settings, User, ChevronDown } from 'lucide-react';
import { useAppContext } from '../../context/appContext';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user, switchUserRole, MOCK_USERS } = useAppContext();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleUserChange = (userId) => {
    const newUser = switchUserRole(userId);
    setDropdownOpen(false);
    if (newUser) {
      if (newUser.role === 'Admin') {
        router.push('/admin');
      } else if (newUser.role === 'Requester') {
        router.push('/requestor');
      } else if (newUser.role === 'Reviewer') {
        router.push('/reviewer');
      } else if (newUser.role === 'Contract Manager') {
        router.push('/admin');
      }
    }
  };
>>>>>>> 7ca0c63fd39acedef4288b4e85c831bf61510776

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-6 sticky top-0 z-10 shadow-2xs">
      
      {/* Page / Hamburger Toggle */}
      <div className="flex items-center gap-3">
        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden">
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-base font-bold text-slate-800 hidden sm:block">Dashboard</h2>
      </div>

      {/* Global Search Bar (Matching Screenshot) */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search contracts, parties, clauses..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-xs focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all placeholder:text-slate-400 text-slate-800"
          />
        </div>
      </div>

      {/* Right User & Actions Bar */}
      <div className="flex items-center gap-3">
        
        {/* Date Filter Dropdown Pill */}
        <div className="hidden md:flex items-center gap-2 bg-white border border-slate-200 text-xs font-medium text-slate-700 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-slate-50 shadow-2xs">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{dateRange}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>

        {/* Notifications Bell Button */}
        <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors relative cursor-pointer">
          <Bell className="w-5 h-5 text-slate-600" />
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-emerald-500 text-white font-bold text-[9px] rounded-full flex items-center justify-center border-2 border-white">
            3
          </span>
        </button>
        
        <div className="h-6 w-px bg-slate-200 mx-1"></div>
        
<<<<<<< HEAD
        {/* User Profile Pill matching screenshot (Sanket Kumar / Admin) */}
        <div className="flex items-center gap-2.5 p-1 rounded-xl cursor-pointer">
          <div className="w-9 h-9 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full flex items-center justify-center border border-emerald-200 shadow-2xs">
            SK
          </div>
          <div className="text-left hidden sm:block">
            <p className="font-bold text-xs text-slate-900 leading-tight">Sanket Kumar</p>
            <p className="text-[11px] text-slate-400 font-medium leading-tight mt-0.5">Admin</p>
          </div>
        </div>

=======
        {/* User Switcher Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 hover:bg-gray-50 p-1.5 rounded-lg transition-colors border border-gray-200 shadow-sm"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
              {user?.name?.charAt(0) || <User className="w-4 h-4" />}
            </div>
            <div className="text-sm text-left hidden sm:block">
              <p className="font-semibold text-gray-700 leading-tight">{user?.name || 'Guest'}</p>
              <p className="text-xs text-gray-500">{user?.title || user?.role || 'Guest Role'}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-500 ml-1" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2 border-b border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Switch Account</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {MOCK_USERS?.map((mock) => (
                  <button
                    key={mock.id}
                    onClick={() => handleUserChange(mock.id)}
                    className={`w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors flex items-center gap-3 border-l-2 ${
                      user?.id === mock.id ? 'border-blue-600 bg-blue-50/20' : 'border-transparent'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      mock.role === 'Admin' ? 'bg-red-100 text-red-700' :
                      mock.role === 'Contract Manager' ? 'bg-purple-100 text-purple-700' :
                      mock.role === 'Reviewer' ? 'bg-indigo-100 text-indigo-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {mock.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-800 leading-tight">{mock.name}</p>
                      <p className="text-[10px] text-gray-500">{mock.title} ({mock.department})</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
>>>>>>> 7ca0c63fd39acedef4288b4e85c831bf61510776
      </div>
      
    </header>
  );
}
