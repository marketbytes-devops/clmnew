'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '../../components/common/Sidebar';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

export default function RequestorLayout({ children }) {
  const pathname = usePathname();
  const isCreatePage = pathname === '/requestor/create';

  return (
    <ProtectedRoute allowedRoles={['requester', 'sales']}>
      {isCreatePage ? (
        <div className="min-h-screen bg-[#f8faf8]">
          {children}
        </div>
      ) : (
        <div className="flex min-h-screen bg-[#f8faf8]">
          <Sidebar />
          <div className="flex-1 ml-72 overflow-x-hidden bg-[#f8faf8]">
            {children}
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
