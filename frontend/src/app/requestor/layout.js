'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import RequestorSidebar from './RequestorSidebar';

export default function RequestorLayout({ children }) {
  const pathname = usePathname();
  const isCreatePage = pathname === '/requestor/create';

  if (isCreatePage) {
    return (
      <div className="min-h-screen bg-[#f8faf8]">
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8faf8]">
      <RequestorSidebar />
      <div className="flex-1 ml-72 overflow-x-hidden bg-[#f8faf8]">
        {children}
      </div>
    </div>
  );
}
