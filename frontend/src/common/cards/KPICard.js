import React from 'react';

export default function KPICard({ title, value, subtitle, icon: Icon, colorClass = "text-blue-600", bgClass = "bg-blue-50" }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-2 font-medium">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bgClass} ${colorClass}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}
