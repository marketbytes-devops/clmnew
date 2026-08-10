"use client";
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function PieChartWidget({ data, title }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col h-80">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <div className="flex-1 w-full h-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '12px'}} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
