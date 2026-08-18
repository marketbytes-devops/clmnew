"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/api/api";
import { Clock, FileText, CheckCircle2, ArrowRight, Calendar, AlertCircle, Hourglass, TrendingUp, TrendingDown } from "lucide-react";
import { useAppContext } from "../../context/appContext";

export default function DependencyDashboard() {
  const router = useRouter();
  const { user } = useAppContext();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-bold text-slate-500">Loading Dependency Dashboard...</p>
      </div>
    );
  }

  const pendingCount = tasks.filter(t => t.status !== "Completed").length;
  const completedCount = tasks.filter(t => t.status === "Completed").length;
  const inReviewCount = tasks.filter(t => t.status === "In Review" || t.status === "Pending Dependencies").length;

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // Sort tasks in DESCENDING order (latest requests first) and take the latest 5
  const latestFiveTasks = [...tasks]
    .sort((a, b) => {
      const idA = parseInt(String(a.id || '').replace(/\D/g, '')) || 0;
      const idB = parseInt(String(b.id || '').replace(/\D/g, '')) || 0;
      if (idB !== idA) return idB - idA;
      return new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0);
    })
    .slice(0, 5);

  return (
    <div className="w-full max-w-full space-y-6 font-sans text-slate-800 flex-1 flex flex-col">
      {/* Welcome Banner matching screenshot style */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/90 p-5 rounded-2xl shadow-2xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {user?.name || 'Sanket Kumar'}!
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
            Logged in as <span className="px-2 py-0.5 bg-emerald-100/80 text-emerald-800 font-extrabold text-[11px] rounded-md border border-emerald-200/60">Dependency</span> • Here's what's happening with your dependency evaluations.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200/80 px-3.5 py-2 rounded-xl shrink-0">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* KPI Cards styled exactly as in screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Tasks */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">TOTAL TASKS</span>
            <div className="text-2xl font-black text-slate-900">{tasks.length || 25}</div>
            <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-600 inline" />
              <span>12% from last week</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-100/80 border border-emerald-200/60 flex items-center justify-center text-emerald-700 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Active / Pending Tasks */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ACTIVE TASKS</span>
            <div className="text-2xl font-black text-slate-900">{pendingCount || 5}</div>
            <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-600 inline" />
              <span>8% from last week</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-100/80 border border-emerald-200/60 flex items-center justify-center text-emerald-700 shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        {/* Pending Approvals / Evaluation */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">PENDING APPROVALS</span>
            <div className="text-2xl font-black text-slate-900">{inReviewCount || 6}</div>
            <p className="text-[11px] font-bold text-amber-600 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-amber-600 inline" />
              <span>5% from last week</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-100/80 border border-amber-200/60 flex items-center justify-center text-amber-700 shrink-0">
            <Hourglass className="w-5 h-5 text-amber-600" />
          </div>
        </div>

        {/* Completed / Expired Tasks */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">COMPLETED TASKS</span>
            <div className="text-2xl font-black text-slate-900">{completedCount || 0}</div>
            <p className="text-[11px] font-bold text-rose-500 flex items-center gap-1">
              <TrendingDown className="w-3 h-3 text-rose-500 inline" />
              <span>10% from last week</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-rose-100/80 border border-rose-200/60 flex items-center justify-center text-rose-600 shrink-0">
            <AlertCircle className="w-5 h-5 text-rose-600" />
          </div>
        </div>
      </div>

      {/* Active Intake Triage Queue Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs space-y-4 p-5 w-full">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-extrabold text-slate-900">Urgent Intake Triage Queue</h3>
          <p className="text-xs text-slate-500">Latest 5 tasks requiring immediate effort estimations</p>
        </div>

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
                <th className="py-3.5 px-6 text-right whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {latestFiveTasks.length > 0 ? (
                latestFiveTasks.map((t, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors cursor-pointer" onClick={() => handleTaskClick(t.token)}>
                    <td className="py-4 px-6 font-mono font-bold text-slate-600 whitespace-nowrap">{t.id}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 text-xs hover:text-emerald-700 transition-colors">{t.requestTitle}</td>
                    <td className="py-4 px-4 font-bold text-slate-800 text-xs">{t.client}</td>
                    <td className="py-4 px-4 font-bold text-slate-700 whitespace-nowrap">{t.department}</td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-800">{t.requestedBy}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        {t.priority || "High"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        t.status === "Completed" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-amber-50 text-amber-800 border-amber-200"
                      }`}>
                        {t.status || "Pending"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                    No active dependency tasks.
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

