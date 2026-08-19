'use client';

import React, { Suspense } from 'react';
import ReviewerSidebar from './ReviewerSidebar';
import Header from '../../common/layout/Header';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

export default function ReviewerLayout({ children }) {
  return (
    <ProtectedRoute allowedRoles={['admin', 'reviewer', 'legal', 'department lead', 'lead']}>
      <div className="flex h-screen bg-[#f1f6f0] overflow-hidden font-sans text-gray-900">
        <Suspense fallback={<div className="w-72 bg-white border-r border-[#cbdcbe] h-screen shrink-0" />}>
          <ReviewerSidebar />
        </Suspense>
        <div className="flex-1 flex flex-col ml-72 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#f1f6f0] p-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
