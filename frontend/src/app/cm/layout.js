"use client";

import React from 'react';
import Sidebar from '../../components/common/Sidebar';
import Header from '../../common/layout/Header';
import { useAppContext } from '../../context/appContext';

export default function CMLayout({ children }) {
  const { isSidebarOpen } = useAppContext();

  return (
    <div className="flex h-screen bg-[#f8faf8] overflow-hidden font-sans text-slate-900">
      <Sidebar />
      <div className={`flex-1 flex flex-col transition-all duration-300 overflow-hidden ${
        isSidebarOpen !== false ? 'ml-64' : 'ml-0'
      }`}>
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#f8faf8] p-6 sm:p-8 w-full max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
