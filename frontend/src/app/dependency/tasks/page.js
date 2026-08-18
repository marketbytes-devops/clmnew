"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/api/api";
import { CheckSquare, Search, Filter, ArrowUpRight, Clock, ShieldCheck, User, ArrowRight } from "lucide-react";

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
            token: dep.token || dep.accessToken || dep.access_token || dep.id,
            date: dep.createdAt ? new Date(dep.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
            client: dep.brief?.clientName || dep.clientName || "Acme Corporation",
            requestTitle: dep.brief?.title || dep.taskObjective || dep.description || "Technical SOW Evaluation",
            requestedBy: dep.requestedBy || "Sarah Jenkins",
            requestedByEmail: dep.requestedByEmail || "sjenkins@marketbytes.com",
            id: `REQ-${dep.id || 92}`,
            department: dep.department || "UI/UX & Frontend"
          }));
          setTasks(mappedData);
        }
      } catch (err) {
        console.error("Failed to load dependency tasks", err);
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
      req.requestTitle?.toLowerCase().includes(query) ||
      req.department?.toLowerCase().includes(query);

    const matchesStatus = statusFilter === 'ALL' || req.status?.toLowerCase() === statusFilter.toLowerCase();
    const matchesPriority = priorityFilter === 'ALL' || req.priority?.toLowerCase() === priorityFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-bold text-slate-500">Loading Dependency Queue...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full space-y-4 font-sans text-slate-800 flex-1 flex flex-col">
      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by department, description, client name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200/90 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer shadow-2xs"
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>

          <div className="flex items-center gap-1 text-slate-400">
            <Filter className="w-4 h-4" />
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-white border border-slate-200/90 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer shadow-2xs"
          >
            <option value="ALL">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Main Queue Data Table (Matching Screenshot Table Layout) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-6 whitespace-nowrap">ID</th>
                <th className="py-3.5 px-4 w-4/12 whitespace-nowrap">Request Title</th>
                <th className="py-3.5 px-4 w-2/12 whitespace-nowrap">Client / Company</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Department</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Requested By</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Priority</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Submitted</th>
                <th className="py-3.5 px-6 text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task, idx) => (
                  <tr
                    key={idx}
                    onClick={() => handleTaskClick(task.token)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-6 font-mono font-bold text-slate-600 whitespace-nowrap">
                      {task.id}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 text-xs group-hover:text-emerald-700 transition-colors">
                      {task.requestTitle}
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-800 text-xs">
                      {task.client}
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-700 whitespace-nowrap">
                      {task.department}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-800">{task.requestedBy}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${
                        task.priority === "High" || task.priority === "Urgent"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : task.priority === "Medium"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}>
                        {task.priority || "High"}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${
                        task.status === "Completed"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : task.status === "Pending Dependencies"
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-blue-50 text-blue-800 border-blue-200"
                      }`}>
                        {task.status || "Submitted"}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-500 text-xs whitespace-nowrap">
                      {task.date}
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTaskClick(task.token);
                        }}
                        className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 italic">
                    No intake requests match the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
