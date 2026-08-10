"use client";

import React, { useState } from "react";
import { MessageSquare, X, Check, AlertCircle } from "lucide-react";

export default function ClientRedlineModal({
  isOpen,
  onClose,
  section,
  selectedText,
  onAddRedline
}) {
  const [category, setCategory] = useState("Pricing / Payment Terms");
  const [proposedWording, setProposedWording] = useState(selectedText || "");
  const [contextReason, setContextReason] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!proposedWording.trim() || !contextReason.trim()) return;

    onAddRedline({
      section_id: section?.id || "sec-gen",
      section_title: section?.title || "General Document",
      selected_text: selectedText,
      category,
      proposed_wording: proposedWording,
      context_reason: contextReason
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Request Contract Modification
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {section?.title || "Section Modification"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Selected Text Highlight */}
          <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs">
            <div className="font-medium text-amber-700 dark:text-amber-300 mb-1">
              Selected Original Text:
            </div>
            <p className="italic text-zinc-700 dark:text-zinc-300 line-clamp-3">
              "{selectedText}"
            </p>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Modification Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            >
              <option value="Pricing / Payment Terms">Pricing / Payment Terms</option>
              <option value="Timeline / Milestone">Timeline / Milestone</option>
              <option value="Scope Detail">Scope Detail</option>
              <option value="Legal Clause">Legal Clause</option>
            </select>
          </div>

          {/* Proposed Wording */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Proposed Wording / Revisions
            </label>
            <textarea
              rows={3}
              required
              value={proposedWording}
              onChange={(e) => setProposedWording(e.target.value)}
              placeholder="Enter your proposed replacement wording..."
              className="w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          {/* Reason / Context */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Reason / Context for Request
            </label>
            <textarea
              rows={2}
              required
              value={contextReason}
              onChange={(e) => setContextReason(e.target.value)}
              placeholder="Explain why this change is requested (e.g., align with internal payment policies)..."
              className="w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md transition-colors"
            >
              <Check className="w-4 h-4" />
              Save Redline Request
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
