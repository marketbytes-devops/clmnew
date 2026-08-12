"use client";
import React, { useState } from 'react';
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

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
      
      {/* Global Search */}
      <div className="flex-1 max-w-lg">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search contracts, proposals, users..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent rounded-lg focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4 ml-4">
        <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
        <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
          <Calendar className="w-5 h-5" />
        </button>
        <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
          <Settings className="w-5 h-5" />
        </button>
        
        <div className="h-8 w-px bg-gray-200 mx-2"></div>
        
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
      </div>
      
    </header>
  );
}
