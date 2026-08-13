"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, FileBox } from "lucide-react";
import DependenciesTab from "@/components/ui/cm/DependenciesTab";

export default function AdminRequestDetailPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const requestId = params?.id || "1";
  
  const [activeTab, setActiveTab] = useState("Dependencies");
  
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-10">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/admin/contracts" className="text-gray-400 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Request #{requestId}</h1>
            <p className="text-xs text-gray-500 font-medium">Stark Industries MSA • Pending Processing</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 shadow-sm">
            Save Draft
          </button>
          <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow-sm">
            Approve & Route
          </button>
        </div>
      </div>
      
      {/* Tabs Layout */}
      <div className="max-w-7xl mx-auto px-8 mt-8">
        <div className="border-b border-gray-200 flex gap-8 mb-6">
          {["Overview", "Documents", "Approvals", "Dependencies"].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 font-semibold text-sm border-b-2 transition-colors ${
                activeTab === tab 
                ? "border-emerald-600 text-emerald-700" 
                : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[500px]">
          {activeTab === "Dependencies" && <DependenciesTab requestId={requestId} />}
          
          {activeTab !== "Dependencies" && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-gray-400 gap-4">
              <FileBox className="w-12 h-12 opacity-50" />
              <p className="text-sm font-medium">{activeTab} tab is under construction.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
