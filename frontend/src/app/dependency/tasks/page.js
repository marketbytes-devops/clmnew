"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "../../../components/common/Button";
import api from "@/service/api";

export default function MyDependencyTasks() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  useEffect(() => {
    const fetchTasks = async () => {
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
          setTasks(mappedData);
        } else {
          console.error("Failed to fetch tasks from backend");
        }
      } catch (err) {
        console.error("Network error fetching tasks", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, []);

  const handleTaskClick = (token) => {
    router.push(`/dependency/${token}`);
  };

  const filteredTasks = tasks.filter(req => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = !query || 
      req.id?.toLowerCase().includes(query) ||
      req.client?.toLowerCase().includes(query) ||
      req.task_objective?.toLowerCase().includes(query);

    const matchesStatus = statusFilter === 'ALL' || req.status?.toLowerCase() === statusFilter.toLowerCase();
    const matchesPriority = priorityFilter === 'ALL' || req.priority?.toLowerCase() === priorityFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f1f6f0]">
        <div className="w-12 h-12 rounded-full border-4 border-[#cbdcbe] border-t-[#4f6e43] animate-spin mb-4"></div>
        <p className="text-base font-extrabold text-[#38522c]">Loading Tasks...</p>
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
            placeholder="Search tasks, clients, or IDs..."
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
              {tasks.filter(t => t.status === "Pending" || t.status === "Reopened").length > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#d14e4e] rounded-full border-2 border-white"></span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Header Bar */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-7 rounded-3xl border border-[#cbdcbe] shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-[#1c2918] tracking-tight">
            My Dependency Tasks
          </h1>
          <p className="text-sm font-bold text-[#637756] mt-1">Full list of all tasks assigned to you for estimation and review.</p>
        </div>
      </header>

      {/* Filter & Search Toolbar */}
      <section className="bg-white rounded-3xl p-5 border border-[#cbdcbe] shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full pb-1 md:pb-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-[#5c6e53] uppercase tracking-wide whitespace-nowrap">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border-2 border-[#b9d2ab] rounded-xl px-3.5 py-2.5 text-xs font-black text-[#263b1a] focus:outline-none focus:ring-2 focus:ring-[#4f6e43] cursor-pointer shadow-2xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-[#5c6e53] uppercase tracking-wide whitespace-nowrap">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-white border-2 border-[#b9d2ab] rounded-xl px-3.5 py-2.5 text-xs font-black text-[#263b1a] focus:outline-none focus:ring-2 focus:ring-[#4f6e43] cursor-pointer shadow-2xs"
            >
              <option value="ALL">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {(statusFilter !== 'ALL' || priorityFilter !== 'ALL' || searchQuery !== '') && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => { 
                setStatusFilter('ALL'); 
                setPriorityFilter('ALL'); 
                setSearchQuery(''); 
              }}
              className="text-[#a13b3b] font-black text-xs whitespace-nowrap hover:bg-[#faeae5] px-3.5 py-2 rounded-xl border border-[#dfacac]"
            >
              Reset
            </Button>
          )}
        </div>
      </section>

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
                        <span className="truncate max-w-[150px]">{task.client || "No Client"}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                       <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black ${
                        task.priority === 'Urgent' ? 'bg-[#faeae5] text-[#b93b3b] border border-[#dfacac]' : 
                        task.priority === 'High' ? 'bg-[#fcf5e8] text-[#c4923e] border border-[#eedab5]' : 
                        task.priority === 'Medium' ? 'bg-[#e4f0dd] text-[#4f6e43] border border-[#cbdcbe]' :
                        'bg-[#e9f2e4] text-[#2c441f] border border-[#bfd3b1]'
                      }`}>
                        {task.priority || "Medium"}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border font-black ${
                          !task.sla_deadline ? 'bg-gray-100 text-gray-700 border-gray-300' :
                          task.sla_deadline.includes("04h") ? 'bg-[#faeae5] text-[#b93b3b] border-[#dfacac]' :
                          'bg-[#fcf5e8] text-[#c4923e] border-[#eedab5]'
                        }`}>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                          {task.sla_deadline || "No SLA"}
                        </span>
                    </td>
                    <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black ${
                        task.status === 'Reopened' ? 'bg-[#faeae5] text-[#b93b3b] border border-[#dfacac]' : 
                        task.status === 'In Progress' ? 'bg-[#e4f0dd] text-[#4f6e43] border border-[#cbdcbe]' : 
                        task.status === 'Completed' ? 'bg-[#e9f2e4] text-[#2c441f] border border-[#bfd3b1]' :
                        'bg-[#fcf5e8] text-[#c4923e] border border-[#eedab5]'
                      }`}>
                        {task.status || "Pending"}
                      </span>
                    </td>
                    <td className="py-4 px-5 sm:px-6 text-right font-black" onClick={(e) => e.stopPropagation()}>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleTaskClick(task.token)}
                        className="text-[#4f6e43] hover:text-white hover:bg-[#4f6e43] font-black text-xs px-4 py-1.5 rounded-xl border border-[#bcd1ae]"
                      >
                        {task.status === "Completed" ? "View" : "Review Task"} &rarr;
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
                      <p className="text-lg font-black text-[#1c2918]">No matching tasks</p>
                      <p className="text-xs text-[#637756] mt-1 font-bold">Try resetting your filter criteria.</p>
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
