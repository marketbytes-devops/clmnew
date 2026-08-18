import React from "react";
import Sidebar from "../../common/layout/Sidebar";
import Header from "../../common/layout/Header";

export default function AdminLayout({ children }) {
  return (
    <div className="flex h-screen bg-[#f8faf8] overflow-hidden font-sans text-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#f8faf8] p-6 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
