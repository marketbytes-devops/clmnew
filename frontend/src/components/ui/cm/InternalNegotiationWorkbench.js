import React, { useState } from 'react';
import ESignatureModal from "@/components/ui/client/ESignatureModal";
import { Building2, CheckCircle2, Send, ShieldCheck, Clock, FileText, ChevronRight } from "lucide-react";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function InternalNegotiationWorkbench({
  negotiationData,
  onRedispatchSubmit,
  isSubmitting
}) {
  const contract = negotiationData?.contract || {};
  const redlines = negotiationData?.redlines || [];
  const contentJson = negotiationData?.content_json || {};

  const [actions, setActions] = useState({});
  const [cmNotes, setCmNotes] = useState("");
  const [showCountersignModal, setShowCountersignModal] = useState(false);
  const [isCountersigning, setIsCountersigning] = useState(false);
  const [countersignSuccess, setCountersignSuccess] = useState(false);

  const isClientSigned = contract?.status === "CLIENT_SIGNED";
  const isExecuted = contract?.status === "EXECUTED";

  const handleActionChange = (redlineId, action, counterWording = "") => {
    setActions((prev) => ({
      ...prev,
      [redlineId]: { action, counterWording }
    }));
  };

  const handleCountersignSubmit = async (sigData) => {
    setIsCountersigning(true);
    try {
      await axios.post(`${API_BASE_URL}/api/client/countersign`, {
        contract_id: contract.id,
        signer_name: sigData.signer_name || "Sarah Jenkins",
        signer_title: sigData.signer_title || "Contract Manager & Authorized Officer",
        signature_data: sigData.signature_data,
        audit_sha256: sigData.audit_sha256
      });
      setCountersignSuccess(true);
      setShowCountersignModal(false);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to apply company countersignature.");
    } finally {
      setIsCountersigning(false);
    }
  };

  const handleRedispatch = (e) => {
    e.preventDefault();

    const actionList = Object.keys(actions).map((id) => ({
      redline_id: parseInt(id),
      action: actions[id].action,
      counter_wording: actions[id].counterWording
    }));

    onRedispatchSubmit({
      contract_id: contract.id,
      cm_notes: cmNotes,
      actions: actionList
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans flex flex-col">
      {/* Header Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-4 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-9 px-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-800 font-bold text-xs">
            <Building2 className="w-4 h-4 text-emerald-700" />
            <span>Screen 5.3: CM Negotiation Workbench</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900">{contract.title}</h1>
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                isExecuted 
                  ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                  : isClientSigned 
                  ? "bg-blue-100 text-blue-900 border-blue-300"
                  : "bg-amber-50 text-amber-800 border-amber-300"
              }`}>
                {contract.status || "CLIENT_NEGOTIATION"}
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                Current: {contract.version || "v1.0"}
              </span>
            </div>
            <p className="text-xs text-slate-500">Client: <strong className="text-slate-700">{contract.client_name}</strong> ({contract.client_email}) | ID: {contract.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isClientSigned && (
            <button
              onClick={() => setShowCountersignModal(true)}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition flex items-center gap-2 shadow-sm animate-bounce shadow-emerald-700/20"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Countersign & Execute Contract</span>
            </button>
          )}
          <span className="text-xs text-slate-500 flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <History className="w-3.5 h-3.5 text-blue-600" />
            Version: <strong className="text-emerald-700">{contract.version || "v1.0"}</strong>
          </span>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl w-full mx-auto p-6 space-y-6 flex-1 pb-24">
        {/* CLIENT SIGNED ACTION BANNER */}
        {isClientSigned && (
          <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm animate-fadeIn">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-blue-100 rounded-2xl text-blue-800">
                <ShieldCheck className="w-7 h-7 text-blue-700" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-extrabold text-blue-950">Action Required: Client Has Executed Signature</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-200 text-blue-900 font-bold text-[10px] uppercase font-mono">
                    Client Signed
                  </span>
                </div>
                <p className="text-xs text-blue-800 leading-relaxed">
                  <strong className="text-blue-950">{contract.client_name}</strong> has reviewed and signed this proposal. Please review the client signature and click <strong>"Countersign & Execute"</strong> to apply the company signature, lock the contract as EXECUTED, and dispatch dual copies.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCountersignModal(true)}
              className="px-6 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs transition flex items-center gap-2 shadow-md"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Apply Company Countersignature</span>
            </button>
          </div>
        )}

        {/* EXECUTED LOCKED BANNER */}
        {isExecuted && (
          <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-800">
                <CheckCircle2 className="w-7 h-7 text-emerald-700" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-emerald-950">Contract Fully Executed & Cryptographically Locked</h3>
                <p className="text-xs text-emerald-800">
                  This contract has been signed by both <strong className="text-emerald-950">{contract.client_name}</strong> and <strong className="text-emerald-950">MarketBytes Enterprise</strong>. Signed copies have been emailed to both parties.
                </p>
              </div>
            </div>
            <span className="px-4 py-2 rounded-xl bg-emerald-200 text-emerald-900 font-bold text-xs font-mono border border-emerald-300">
              STATUS: EXECUTED (Dual Signed)
            </span>
          </div>
        )}
        {/* Banner Alert */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-xl text-amber-800">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900">Client Redlines Awaiting Contract Manager Decision</h3>
              <p className="text-xs text-amber-800">
                Review each client-submitted redline below. Choose to Accept, Counter-offer, or Reject each item.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-amber-200 text-amber-900 rounded-lg">
            {redlines.length} Pending Redline(s)
          </span>
        </div>

        {/* Redline Triage Matrix Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-700" />
              Client Redlines Triage Matrix
            </h3>
            <span className="text-xs text-slate-500">Select Accept / Counter / Reject for each item</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="p-3">Category</th>
                  <th className="p-3">Original Wording (v1.0)</th>
                  <th className="p-3">Client Proposed Change</th>
                  <th className="p-3">Client Reason</th>
                  <th className="p-3 text-center">Contract Manager Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {redlines.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      No active client redlines for this contract.
                    </td>
                  </tr>
                ) : (
                  redlines.map((item) => {
                    const currentAction = actions[item.id]?.action;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3 font-semibold text-slate-700 whitespace-nowrap">
                          <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {item.category}
                          </span>
                        </td>
                        <td className="p-3 text-rose-700 line-through bg-rose-50/60 font-mono text-[11px] rounded-lg max-w-xs border border-rose-200">
                          "{item.selected_text}"
                        </td>
                        <td className="p-3 text-emerald-900 bg-emerald-50/60 font-semibold font-mono text-[11px] rounded-lg max-w-xs border border-emerald-200">
                          "{item.proposed_wording}"
                        </td>
                        <td className="p-3 text-slate-500 italic max-w-xs">
                          {item.reason || "No reason specified"}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleActionChange(item.id, "ACCEPTED")}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1 ${
                                currentAction === "ACCEPTED"
                                  ? "bg-emerald-700 text-white shadow-sm"
                                  : "bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-800"
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              Accept
                            </button>
                            <button
                              type="button"
                              onClick={() => handleActionChange(item.id, "COUNTERED")}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1 ${
                                currentAction === "COUNTERED"
                                  ? "bg-amber-600 text-white shadow-sm"
                                  : "bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-800"
                              }`}
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Counter
                            </button>
                            <button
                              type="button"
                              onClick={() => handleActionChange(item.id, "REJECTED")}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1 ${
                                currentAction === "REJECTED"
                                  ? "bg-rose-600 text-white shadow-sm"
                                  : "bg-slate-100 text-slate-600 hover:bg-rose-100 hover:text-rose-800"
                              }`}
                            >
                              <X className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </div>

                          {currentAction === "COUNTERED" && (
                            <div className="mt-2 text-left">
                              <input
                                type="text"
                                placeholder="Enter counter-offer wording..."
                                value={actions[item.id]?.counterWording || ""}
                                onChange={(e) => handleActionChange(item.id, "COUNTERED", e.target.value)}
                                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                              />
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Re-Dispatch Controls & Version Upgrade Form */}
        <form onSubmit={handleRedispatch} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Re-Dispatch Version v1.1 to Client</h3>
              <p className="text-xs text-slate-500">
                Applying decisions will update the document, bump version from <strong className="text-slate-800 font-mono">v1.0 ➔ v1.1</strong>, and send the re-dispatch link back to the client.
              </p>
            </div>
            <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-xs font-bold rounded-lg">
              Target Version: v1.1
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Contract Manager Version Notes / Revision Cover Note
            </label>
            <textarea
              rows={3}
              value={cmNotes}
              onChange={(e) => setCmNotes(e.target.value)}
              placeholder="e.g. Accepted payment deposit change to 35% as requested. Updated timeline to 7 weeks..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Re-dispatching automatically notifies client and enables signature for v1.1.
            </span>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs transition flex items-center gap-2 shadow-sm"
            >
              {isSubmitting ? (
                <span>Updating & Re-Dispatching v1.1...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Apply Decisions & Re-Dispatch v1.1 to Client</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Company Countersignature Modal */}
      <ESignatureModal
        isOpen={showCountersignModal}
        onClose={() => setShowCountersignModal(false)}
        contractTitle={contract?.title}
        clientName="MarketBytes Enterprise (Company)"
        onSignSubmit={handleCountersignSubmit}
        isSigning={isCountersigning}
      />
    </div>
  );
}
