'use client';

import React, { useMemo } from 'react';
import { useAppContext } from '../../../context/appContext';
import Button from '../../../components/common/Button';
import PriorityBadge from '../../../components/common/PriorityBadge';
import { useRouter } from 'next/navigation';

export default function DraftsPage() {
  const { contractRequests, loading } = useAppContext();
  const router = useRouter();

  // Filter requests that are in 'Draft' status
  const drafts = useMemo(() => {
    return contractRequests.filter(req => req.currentStatus?.toLowerCase() === 'draft');
  }, [contractRequests]);

  const handleResume = (draftId) => {
    router.push(`/requestor/create?draftId=${draftId}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f1f6f0]">
        <div className="w-12 h-12 rounded-full border-4 border-[#cbdcbe] border-t-[#4f6e43] animate-spin mb-4"></div>
        <p className="text-base font-extrabold text-[#38522c]">Loading Drafts...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-7 min-h-screen bg-[#f1f6f0] text-[#1c2918]">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-7 rounded-3xl border border-[#cbdcbe] shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-[#1c2918] tracking-tight">Saved Drafts</h1>
          <p className="text-xs font-bold text-[#637756] mt-1">Pick up where you left off. Incomplete contract requests are saved here securely.</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => router.push('/requestor/create')}
          className="shadow-lg shadow-[#4f6e43]/20 px-6 py-3 font-black text-sm"
        >
          + New Request
        </Button>
      </header>

      {/* Draft Grid Layout */}
      {drafts.length > 0 ? (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drafts.map((draft, idx) => (
            <div 
              key={draft.requestId || idx}
              className="bg-white rounded-3xl border border-[#cbdcbe] p-6 hover:shadow-lg hover:border-[#8cb07c] transition-all flex flex-col justify-between space-y-5 group cursor-pointer"
              onClick={() => handleResume(draft.requestId)}
            >
              <div className="space-y-3">
                {/* Meta header */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black text-[#4f6e43] px-2.5 py-0.5 bg-[#f1f6f0] border border-[#cbdcbe] rounded-lg">
                    {draft.requestId}
                  </span>
                  <PriorityBadge priority={draft.priority} />
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-[#1c2918] leading-snug group-hover:text-[#4f6e43] transition-colors line-clamp-2">
                    {draft.requestName || `${draft.clientName || 'Untitled Client'} - ${draft.contractType}`}
                  </h3>
                  <p className="text-xs text-[#637756] font-bold">
                    Client: <span className="font-black text-[#2f4621]">{draft.clientName || 'Unnamed Entity'}</span>
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-bold text-[#4e6543]">
                  <span className="px-2.5 py-1 bg-[#eef5eb] border border-[#c6d7ba] rounded-lg">
                    Category: {draft.contractCategory}
                  </span>
                  <span className="px-2.5 py-1 bg-[#eef5eb] border border-[#c6d7ba] rounded-lg">
                    Type: {draft.contractType}
                  </span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 border-t border-[#f0f5ee] flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#8ba37e]">
                  Saved on: {draft.createdDate}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); handleResume(draft.requestId); }}
                  className="text-[#4f6e43] font-black text-xs px-4 py-2 border border-[#cbdcbe] rounded-xl hover:bg-[#4f6e43] hover:text-white transition-all group-hover:scale-[1.02]"
                >
                  Resume &rarr;
                </Button>
              </div>
            </div>
          ))}
        </section>
      ) : (
        <section className="bg-white rounded-3xl border border-[#cbdcbe] py-20 text-center shadow-sm">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 rounded-3xl bg-[#eef5eb] border border-[#bcd1ae] flex items-center justify-center text-[#4f6e43] mx-auto shadow-2xs">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </div>
            <h3 className="text-lg font-black text-[#1c2918]">No saved drafts</h3>
            <p className="text-xs text-[#637756] font-bold">You don't have any incomplete contract requests at the moment. Your pipeline is clean!</p>
            <Button 
              variant="primary" 
              onClick={() => router.push('/requestor/create')}
              className="font-bold"
            >
              Start New Request
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
