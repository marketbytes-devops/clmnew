"use client";
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function BarChartWidget({ data, title }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col h-80">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="flex-1 w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
            <Tooltip 
              cursor={{fill: '#f8fafc'}}
              contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
            />
            <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
