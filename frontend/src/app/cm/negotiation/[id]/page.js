"use client";

import React, { useState, useEffect, use } from "react";
import axios from "axios";
import InternalNegotiationWorkbench from "@/components/ui/cm/InternalNegotiationWorkbench";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function CMNegotiationPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const contractId = params?.id || "REQ-2026-0891";

  const [isLoading, setIsLoading] = useState(true);
  const [negotiationData, setNegotiationData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  const fetchNegotiationData = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/client/negotiation/${contractId}`);
      setNegotiationData(res.data);
    } catch (err) {
      alert("Failed to load CM negotiation workbench payload.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNegotiationData();
  }, [contractId]);

  const handleRedispatchSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/client/negotiation/redispatch`, data);
      setSuccessMessage(res.data.message || "Proposal v1.1 successfully re-dispatched to client!");
      await fetchNegotiationData();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to re-dispatch contract.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 font-sans text-slate-700">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold">Loading Screen 5.3 CM Negotiation Workbench...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#F8FAFC]">
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-700 text-white px-5 py-3 rounded-xl shadow-2xl font-bold text-xs flex items-center gap-2 animate-bounce">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="ml-2 underline text-[10px]">Close</button>
        </div>
      )}

      <InternalNegotiationWorkbench
        negotiationData={negotiationData}
        onRedispatchSubmit={handleRedispatchSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
