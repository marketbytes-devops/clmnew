"use client";

import React from "react";
import { ShieldAlert, AlertTriangle, Clock, RefreshCw, Mail } from "lucide-react";

export default function InvalidTokenView({ errorDetail, onRetry }) {
  const isExpired = errorDetail?.includes("expired");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-xl">
        <div className="mx-auto w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mb-6 text-rose-600">
          {isExpired ? <Clock className="w-8 h-8 animate-pulse" /> : <ShieldAlert className="w-8 h-8" />}
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {isExpired ? "Proposal Link Expired" : "Access Denied"}
        </h1>

        <p className="text-slate-600 text-sm leading-relaxed mb-6">
          {errorDetail || "The portal invite link you are using is invalid, expired, or has been revoked."}
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 text-left text-xs text-slate-600 space-y-2">
          <div className="flex items-center gap-2 text-slate-800 font-semibold">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Security Notice:
          </div>
          <p>• Client portal links are single-use and time-bound (14 days max).</p>
          <p>• Please contact your Contract Manager to issue a fresh invite link.</p>
        </div>

        <div className="flex flex-col gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-sm transition flex items-center justify-center gap-2 shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          )}

          <a
            href="mailto:support@marketbytes.com"
            className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm transition flex items-center justify-center gap-2 border border-slate-300"
          >
            <Mail className="w-4 h-4" />
            Contact Contract Manager
          </a>
        </div>
      </div>
    </div>
  );
}
