'use client';

import React from 'react';

export default function StatusBadge({ status = 'Draft' }) {
  const statusStyles = {
    'Draft': 'bg-[#f2f5f1] text-[#55674c] border-[#cedabf]',
    'Submitted': 'bg-[#e5f1df] text-[#37522a] border-[#a9c999] font-extrabold',
    'Dependency Gathering': 'bg-[#fef8ea] text-[#8c651b] border-[#ecd39a] font-black animate-pulse',
    'Drafting In Progress': 'bg-[#e4f2ec] text-[#2c5e4b] border-[#9fd3bc] font-bold',
    'Internal Review': 'bg-[#dcf0d3] text-[#274718] border-[#89b575] font-black',
    'Client Negotiation': 'bg-[#fdf2e8] text-[#935222] border-[#e7bc96] font-bold',
    'Approved': 'bg-[#d4edd6] text-[#1c3e1f] border-[#72b076] font-black shadow-2xs',
    'Rejected': 'bg-[#fdeeee] text-[#9e3333] border-[#ebb0b0] font-bold',
    'Active / Executed': 'bg-[#4f6e43] text-white font-black shadow-xs border-[#4f6e43]',
  };

  const currentStyle = statusStyles[status] || 'bg-[#e7f1e1] text-[#3d5733] border-[#bed2b2] font-semibold';

  return (
    <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-black border ${currentStyle}`}>
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-75"></span>
      {status}
    </span>
  );
}
