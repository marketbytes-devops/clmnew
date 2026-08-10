import React from 'react';
import { Search, Bell, Calendar, Settings, User } from 'lucide-react';

export default function Header() {
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
        
        <button className="flex items-center gap-2 hover:bg-gray-50 p-1.5 rounded-lg transition-colors border border-transparent hover:border-gray-200">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
            <User className="w-4 h-4" />
          </div>
          <div className="text-sm text-left hidden sm:block">
            <p className="font-semibold text-gray-700 leading-tight">Admin User</p>
            <p className="text-xs text-gray-500">Super Admin</p>
          </div>
        </button>
      </div>
      
    </header>
  );
}
