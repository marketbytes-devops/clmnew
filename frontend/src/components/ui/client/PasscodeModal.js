"use client";

import React, { useState } from "react";
import { Lock, KeyRound, ArrowRight, ShieldCheck } from "lucide-react";

export default function PasscodeModal({ clientName, onSubmit, isLoading, error }) {
  const [passcode, setPasscode] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passcode.trim()) {
      onSubmit(passcode.trim());
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-xl relative overflow-hidden">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-6 text-emerald-700 shadow-sm">
          <Lock className="w-7 h-7" />
        </div>

        <h2 className="text-2xl font-bold text-slate-900 text-center mb-1">
          Security Verification
        </h2>
        <p className="text-slate-500 text-sm text-center mb-6">
          Proposal for <span className="text-emerald-700 font-semibold">{clientName || "Client"}</span> is passcode-protected.
        </p>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3 mb-5 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Enter 4-Digit Security Passcode
            </label>
            <div className="relative">
              <KeyRound className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="password"
                maxLength={8}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="e.g. 1234"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 pl-11 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-lg font-mono tracking-widest transition"
                autoFocus
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!passcode.trim() || isLoading}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-semibold text-sm transition flex items-center justify-center gap-2 shadow-sm"
          >
            {isLoading ? (
              <span>Verifying...</span>
            ) : (
              <>
                <span>Unlock Proposal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-500 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          End-to-End Encrypted Verification
        </div>
      </div>
    </div>
  );
}
