"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "../../../components/common/Button";
import api from "@/service/api";

export default function DependencyHistory() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/api/v1/dependencies/me');
        if (response.status === 200) {
          const data = response.data;
          const mappedData = data.map(dep => ({
            ...dep,
            date: dep.createdAt ? new Date(dep.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            client: dep.brief?.clientName || "Unknown Client",
            task_objective: dep.taskObjective || dep.description || "Task",
            id: `REQ-000${dep.id || 0}`
          }));
          setTasks(mappedData.filter(t => t.status === "Completed" || t.status === "Waived"));
        } else {
          console.error("Failed to fetch history from backend");
        }
      } catch (err) {
        console.error("Failed to fetch history", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, []);

  const handleTaskClick = (token) => {
    router.push(`/dependency/${token}`);
  };

  const filteredTasks = tasks.filter(req => {
    const query = searchQuery.toLowerCase();
    return !query || 
      req.id?.toLowerCase().includes(query) ||
      req.client?.toLowerCase().includes(query) ||
      req.task_objective?.toLowerCase().includes(query);
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f1f6f0]">
        <div className="w-12 h-12 rounded-full border-4 border-[#cbdcbe] border-t-[#4f6e43] animate-spin mb-4"></div>
        <p className="text-base font-extrabold text-[#38522c]">Loading History...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 w-full space-y-7 min-h-screen bg-[#f1f6f0] text-[#1c2918]">
      {/* Top Navigation */}
      <nav className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
        <div className="relative w-full max-w-md">
          <svg className="w-5 h-5 text-[#4f6e43] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"
            placeholder="Search completed tasks, clients, or IDs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-[#cbdcbe] rounded-2xl text-sm font-bold text-[#1c2918] placeholder-[#76876c] focus:outline-none focus:ring-2 focus:ring-[#4f6e43] shadow-sm transition-all"
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              title="Notifications"
              className="relative p-2.5 text-[#4f6e43] bg-white border border-[#cbdcbe] hover:bg-[#e4f0dd] rounded-xl transition-colors shadow-sm"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Header Bar */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-7 rounded-3xl border border-[#cbdcbe] shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-[#1c2918] tracking-tight">
            History / Completed
          </h1>
          <p className="text-sm font-bold text-[#637756] mt-1">Archive of all dependency estimations you have completed.</p>
        </div>
      </header>

      {/* Main Data Table */}
      <section className="bg-white rounded-3xl border border-[#cbdcbe] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#e9f2e4] border-b border-[#c4d7b7] text-xs font-black text-[#2f4820] uppercase tracking-wider">
                <th className="py-4 px-5 sm:px-6">Request ID</th>
                <th className="py-4 px-4">Date</th>
                <th className="py-4 px-4">Client</th>
                <th className="py-4 px-4">Priority</th>
                <th className="py-4 px-4">SLA</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-5 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2ede0] text-sm font-medium bg-white">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task, index) => (
                  <tr 
                    key={index}
                    className="hover:bg-[#f3f8f1] transition-colors"
                  >
                    <td className="py-4 px-5 sm:px-6">
                      <div className="flex flex-col">
                        <span className="font-black text-[#4f6e43] font-mono text-xs">
                          {task.id}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs font-bold text-[#637756]">
                      {task.date}
                    </td>
                    <td className="py-4 px-4 font-extrabold text-[#1c2918]">
                      <div className="flex items-center gap-2">
                        <span className="truncate max-w-[150px]">{task.client}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                       <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black bg-[#e9f2e4] text-[#2c441f] border border-[#bfd3b1]`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border font-black bg-gray-100 text-gray-700 border-gray-300">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                          No SLA
                        </span>
                    </td>
                    <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-[#e9f2e4] text-[#2c441f] border border-[#bfd3b1] font-black">
                           <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                           Completed
                        </span>
                    </td>
                    <td className="py-4 px-5 sm:px-6 text-right font-black" onClick={(e) => e.stopPropagation()}>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleTaskClick(task.token)}
                        className="text-[#4f6e43] hover:text-white hover:bg-[#4f6e43] font-black text-xs px-4 py-1.5 rounded-xl border border-[#bcd1ae]"
                      >
                        View &rarr;
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center max-w-md mx-auto">
                      <div className="w-14 h-14 rounded-3xl bg-[#eef5eb] border border-[#bcd1ae] flex items-center justify-center text-[#4f6e43] mb-3 shadow-2xs">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                      </div>
                      <p className="text-lg font-black text-[#1c2918]">No completed tasks</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
