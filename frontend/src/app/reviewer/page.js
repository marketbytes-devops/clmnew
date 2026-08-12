"use client";
import React, { Suspense } from 'react';
import { RefreshCw } from 'lucide-react';
import ReviewerDashboard from '../../components/ui/reviewer/ReviewerDashboard';

export default function ReviewerDashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-slate-500 mb-2" />
        Loading Dashboard...
      </div>
    }>
      <ReviewerDashboard />
    </Suspense>
  );
}
