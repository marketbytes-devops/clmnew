'use client';

import React from 'react';

export default function PriorityBadge({ priority = 'Medium' }) {
  const priorityConfig = {
    'Low': {
      style: 'bg-[#f1f6ef] text-[#5b6e52] border-[#ccdabb] font-bold',
      icon: '↓'
    },
    'Medium': {
      style: 'bg-[#e5f1df] text-[#385429] border-[#a1c490] font-extrabold',
      icon: '→'
    },
    'High': {
      style: 'bg-[#fef4e2] text-[#946919] border-[#e5ca91] font-black',
      icon: '↑'
    },
    'Urgent': {
      style: 'bg-[#fbe8e8] text-[#9b2a2a] border-[#e89d9d] font-black animate-pulse shadow-2xs',
      icon: '⚠'
    },
    'Urgent / Escalated': {
      style: 'bg-[#fbe8e8] text-[#9b2a2a] border-[#e89d9d] font-black animate-pulse shadow-2xs',
      icon: '⚠'
    }
  };

  const config = priorityConfig[priority] || priorityConfig['Medium'];

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] border ${config.style}`}>
      <span className="font-extrabold">{config.icon}</span>
      <span>{priority}</span>
    </span>
  );
}
