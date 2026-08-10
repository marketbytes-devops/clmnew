import React from 'react';
import Sidebar from '../../components/common/Sidebar';

export default function RequestorLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#f1f6f0]">
      <Sidebar />
      <div className="flex-1 ml-72 overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
