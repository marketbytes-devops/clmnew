'use client';

import React from 'react';

export default function MetricCard({ title, value, icon, subtitle, color = 'olive', onClick = null }) {
  const borderColors = {
    olive: 'border-t-[#4f6e43]',
    sage: 'border-t-[#749666]',
    amber: 'border-t-[#c4923e]',
    forest: 'border-t-[#324929]',
    emerald: 'border-t-[#4f6e43]',
  };

  const iconBgColors = {
    olive: 'bg-[#e7f1e1] text-[#3d5733] border border-[#cbdcbe]',
    sage: 'bg-[#f0f6ec] text-[#4f6e43] border border-[#d6e5cc]',
    amber: 'bg-[#fcf5e8] text-[#9c6f21] border border-[#eedab5]',
    forest: 'bg-[#d8e6d1] text-[#26381e] border border-[#bad1af]',
    emerald: 'bg-[#e7f1e1] text-[#3d5733] border border-[#cbdcbe]',
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border border-[#ceddbf] border-t-4 shadow-xs hover:shadow-md transition-all duration-200 ${borderColors[color] || borderColors.olive} ${onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:border-[#86a877]' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wider text-[#5f7454] mb-1.5">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-black text-[#1c2918] tracking-tight">
            {value}
          </h3>
          {subtitle && (
            <p className="text-[11px] font-bold text-[#537046] mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div className={`p-3.5 rounded-xl ${iconBgColors[color] || iconBgColors.olive} flex-shrink-0 shadow-2xs`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
