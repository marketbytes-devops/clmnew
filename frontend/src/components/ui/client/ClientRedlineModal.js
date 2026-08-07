"use client";

import React, { useState } from "react";
import { MessageSquarePlus, X, Check } from "lucide-react";

export default function ClientRedlineModal({ isOpen, onClose, selectedText, onAddRedline }) {
  const [category, setCategory] = useState("Pricing / Payment Terms");
  const [proposedWording, setProposedWording] = useState(selectedText || "");
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (proposedWording.trim()) {
      onAddRedline({
        selected_text: selectedText,
        category,
        proposed_wording: proposedWording.trim(),
        reason: reason.trim()
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn font-sans">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl text-slate-800 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700">
            <MessageSquarePlus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Propose Redline / Modification</h3>
            <p className="text-xs text-slate-500">Specify your requested changes to this clause</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Original Text Selected
            </label>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-amber-800 font-mono italic max-h-24 overflow-y-auto">
              "{selectedText}"
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Change Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
            >
              <option value="Pricing / Payment Terms">Pricing / Payment Terms</option>
              <option value="Timeline / Milestone">Timeline / Milestone</option>
              <option value="Scope Detail">Scope Detail</option>
              <option value="Legal Clause">Legal Clause</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Proposed Client Wording
            </label>
            <textarea
              rows={3}
              value={proposedWording}
              onChange={(e) => setProposedWording(e.target.value)}
              placeholder="Enter your replacement clause text..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Reason / Context (Optional)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Requires internal legal policy alignment..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition border border-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold transition flex items-center gap-2 shadow-sm"
            >
              <Check className="w-4 h-4" />
              Add Redline
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
