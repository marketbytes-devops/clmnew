"use client";

import React, { useState } from "react";
import { MessageSquare, X, Trash2, Send, AlertCircle, HelpCircle } from "lucide-react";

export default function ClientFeedbackDrawer({
  isOpen,
  onClose,
  redlines = [],
  onRemoveRedline,
  onSubmitFeedback,
  isSubmitting
}) {
  const [submissionNote, setSubmissionNote] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  if (!isOpen) return null;

  const handleOpenConfirm = (e) => {
    e.preventDefault();
    if (redlines.length > 0) {
      setShowConfirmModal(true);
    }
  };

  const handleConfirmSubmit = () => {
    setShowConfirmModal(false);
    onSubmitFeedback({
      submission_note: submissionNote,
      redlines
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-sm animate-fadeIn font-sans">
        <div className="bg-white border-l border-slate-200 w-full max-w-md h-full p-6 shadow-2xl flex flex-col text-slate-800 relative">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Client Redlines Queue</h3>
                <p className="text-xs text-slate-500">{redlines.length} modification request(s)</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 mb-3 text-xs text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">Perform all edits first</strong>
              <span>You can queue multiple redlines across sections before submitting. Click 'Submit Redlines' when you're finished.</span>
            </div>
          </div>

          {redlines.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <AlertCircle className="w-12 h-12 mb-3 text-slate-300" />
              <p className="text-sm font-medium text-slate-700">No Redlines Added Yet</p>
              <p className="text-xs mt-1 text-slate-500">Select any text block in the contract document to propose a modification or comment.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {redlines.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {item.category}
                    </span>
                    <button
                      onClick={() => onRemoveRedline(idx)}
                      className="text-slate-400 hover:text-rose-600 transition"
                      title="Remove Redline"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-0.5">Original</span>
                    <p className="text-xs text-slate-600 line-through bg-white p-2 rounded-lg font-mono border border-slate-200">
                      "{item.selected_text}"
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] text-emerald-700 uppercase font-semibold block mb-0.5">Proposed</span>
                    <p className="text-xs text-slate-900 bg-emerald-50/60 border border-emerald-200 p-2 rounded-lg font-mono">
                      "{item.proposed_wording}"
                    </p>
                  </div>

                  {item.reason && (
                    <p className="text-[11px] text-slate-500 italic pt-1">
                      Note: {item.reason}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {redlines.length > 0 && (
            <form onSubmit={handleOpenConfirm} className="pt-4 border-t border-slate-100 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Client Cover Note to Sales Team / CM
                </label>
                <textarea
                  rows={2}
                  value={submissionNote}
                  onChange={(e) => setSubmissionNote(e.target.value)}
                  placeholder="Add overall notes or summary for your Contract Manager..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm transition flex items-center justify-center gap-2 shadow-sm"
              >
                {isSubmitting ? (
                  <span>Submitting Redlines...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Redlines ({redlines.length})</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn font-sans">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Send Edits to Contract Manager?</h3>
                <p className="text-xs text-slate-500">Confirm submission to requestor</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 border border-slate-200 p-3 rounded-xl">
              You are about to send <strong>{redlines.length} proposed redline modification(s)</strong> to the Contract Manager. Once submitted, your Contract Manager will review your requested changes and issue an updated contract version (v1.1).
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition"
              >
                Continue Editing
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center gap-2 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Confirm & Send to Requestor</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
