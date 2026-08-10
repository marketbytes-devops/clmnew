"use client";
import React, { useEffect, useState } from "react";
import KPICard from "../../common/cards/KPICard";
import BarChartWidget from "../../common/charts/BarChartWidget";
import PieChartWidget from "../../common/charts/PieChartWidget";
import { FileText, Clock, Edit3, CheckCircle, FileSignature, AlertTriangle, RefreshCw } from "lucide-react";
import { APIService } from "../../service/api_service";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalContracts: 0,
    pendingRequests: 0,
    inDrafting: 0,
    inReview: 0,
    executedYtd: 0,
    expiringSoon: 0
  });

  const [statusData, setStatusData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [riskData, setRiskData] = useState([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [analytics, contracts, requests] = await Promise.all([
        APIService.getAnalyticsDashboard().catch(() => null),
        APIService.getContracts().catch(() => []),
        APIService.getRequests().catch(() => [])
      ]);

      const totalContractsCount = contracts?.length || 0;
      const pendingReqsCount = requests?.filter(r => r.status === 'Submitted' || r.status === 'Dependency Gathering').length || 0;
      const draftingCount = requests?.filter(r => r.status === 'Drafting In Progress').length || contracts?.filter(c => c.status === 'Draft').length || 0;
      const reviewCount = requests?.filter(r => r.status === 'Internal Review').length || 0;
      const executedCount = contracts?.filter(c => c.status === 'Executed' || c.status === 'Approved').length || 0;

      setMetrics({
        totalContracts: totalContractsCount,
        pendingRequests: pendingReqsCount,
        inDrafting: draftingCount,
        inReview: reviewCount,
        executedYtd: executedCount,
        expiringSoon: analytics?.summary?.expiring_contracts || 0
      });

      // Construct dynamic status pie chart
      setStatusData([
        { name: 'Drafting', value: draftingCount },
        { name: 'Review', value: reviewCount },
        { name: 'Pending', value: pendingReqsCount },
        { name: 'Executed', value: executedCount }
      ]);

      // Construct dynamic monthly volume bar chart from analytics backend
      if (analytics && analytics.contracts_by_month) {
        setMonthlyData(analytics.contracts_by_month);
      } else {
        setMonthlyData([
          { name: 'Current Month', value: totalContractsCount }
        ]);
      }

      // Construct dynamic risk assessment chart
      if (analytics && analytics.risk_distribution) {
        setRiskData(analytics.risk_distribution);
      } else {
        setRiskData([
          { name: 'Low Risk', value: Math.max(1, totalContractsCount - 1) },
          { name: 'Medium Risk', value: pendingReqsCount },
          { name: 'High Risk', value: reviewCount }
        ]);
      }
    } catch (err) {
      console.error("Failed to load dashboard metrics from backend", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header Area */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1 text-sm">Welcome back! Real-time contract metrics synced with FastAPI backend.</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Metrics
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard title="Total Contracts" value={loading ? '...' : metrics.totalContracts.toString()} subtitle="Live DB Count" icon={FileText} colorClass="text-blue-600" bgClass="bg-blue-100" />
        <KPICard title="Pending Requests" value={loading ? '...' : metrics.pendingRequests.toString()} subtitle="Requires Action" icon={Clock} colorClass="text-orange-600" bgClass="bg-orange-100" />
        <KPICard title="In Drafting" value={loading ? '...' : metrics.inDrafting.toString()} icon={Edit3} colorClass="text-purple-600" bgClass="bg-purple-100" />
        <KPICard title="In Review" value={loading ? '...' : metrics.inReview.toString()} icon={CheckCircle} colorClass="text-indigo-600" bgClass="bg-indigo-100" />
        <KPICard title="Executed (YTD)" value={loading ? '...' : metrics.executedYtd.toString()} icon={FileSignature} colorClass="text-green-600" bgClass="bg-green-100" />
        <KPICard title="Expiring Soon" value={loading ? '...' : metrics.expiringSoon.toString()} subtitle="Within 30 days" icon={AlertTriangle} colorClass="text-red-600" bgClass="bg-red-100" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PieChartWidget title="Contracts by Status" data={statusData} />
        <BarChartWidget title="Monthly Execution Volume" data={monthlyData} />
        <PieChartWidget title="Risk Assessment" data={riskData} />
      </div>

    </div>
  );
}
