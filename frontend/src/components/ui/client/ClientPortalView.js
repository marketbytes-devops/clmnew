"use client";

import React, { useState } from "react";
import {
  FileText,
  Clock,
  ShieldCheck,
  Download,
  MessageSquare,
  PenTool,
  CheckCircle2,
  Building2,
  ChevronRight,
  Sparkles,
  Leaf,
  Edit3,
  Tag,
  History,
  Check
} from "lucide-react";

import ClientRedlineModal from "./ClientRedlineModal";
import ClientFeedbackDrawer from "./ClientFeedbackDrawer";
import ESignatureModal from "./ESignatureModal";

export default function ClientPortalView({
  contract,
  token,
  onRedlinesSubmit,
  onSignSubmit,
  isSubmitting,
  isSigning
}) {
  const [activeSection, setActiveSection] = useState("sec-1");
  const [selectedText, setSelectedText] = useState("");
  const [showRedlineModal, setShowRedlineModal] = useState(false);
  const [showFeedbackDrawer, setShowFeedbackDrawer] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);

  const [localRedlines, setLocalRedlines] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const [inspectRedline, setInspectRedline] = useState(null);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 3) {
      const text = selection.toString().trim();
      setSelectedText(text);
    }
  };

  const handleAddRedline = (redlineItem) => {
    setLocalRedlines((prev) => [...prev, redlineItem]);
    showToast("Redline added to queue! Perform all required edits across the contract, then click 'Request Changes' to send to the Contract Manager.");
  };

  const handleRemoveRedline = (index) => {
    setLocalRedlines((prev) => prev.filter((_, i) => i !== index));
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleDownloadPDF = () => {
    showToast("Generating PDF contract package...");
    setTimeout(() => {
      window.print();
    }, 400);
  };

  const contentSections = contract?.content_json?.sections || [];
  const activeSectionData = contentSections.find((s) => s.id === activeSection);
  const dbRedlines = contract?.redlines || [];
  const allRedlines = [...dbRedlines, ...localRedlines];

  const formatTimestamp = (tsStr) => {
    if (!tsStr) return "";
    const str = String(tsStr);
    const isoStr = (str.endsWith("Z") || str.includes("+")) ? str : str + "Z";
    const dateObj = new Date(isoStr);
    return isNaN(dateObj.getTime()) ? str : dateObj.toLocaleString();
  };

  const isExecuted = contract?.status === "EXECUTED";
  const isClientSigned = contract?.status === "CLIENT_SIGNED";
  const isNegotiation = contract?.status === "CLIENT_NEGOTIATION";
  const isRedispatchedV11 = (contract?.version === "v1.1" || contract?.version === "v1.2") && !isNegotiation;
  const isReadOnly = contract?.is_readonly || isExecuted || isClientSigned;
  const daysRemaining = 12;

  const clientSig = contract?.client_signature || contract?.signature;
  const companySig = contract?.company_signature;

  // Helper for natural inline track-changes redline rendering
  const renderHighlightedText = (contentStr) => {
    if (!allRedlines.length || !contentStr) return contentStr;

    let elements = [contentStr];

    allRedlines.forEach((redline, rIdx) => {
      const targetStr = redline.selected_text;
      if (!targetStr || !contentStr.includes(targetStr)) return;

      let nextElements = [];
      elements.forEach((elem) => {
        if (typeof elem !== "string") {
          nextElements.push(elem);
          return;
        }

        const parts = elem.split(targetStr);
        parts.forEach((part, pIdx) => {
          if (part) nextElements.push(part);
          if (pIdx < parts.length - 1) {
            nextElements.push(
              <span
                key={`redline-${rIdx}-${pIdx}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setInspectRedline(redline);
                }}
                className="inline font-sans cursor-pointer group"
              >
                <del className="bg-rose-100 text-rose-800 line-through decoration-rose-600 px-1 py-0.5 rounded font-normal text-xs sm:text-sm hover:bg-rose-200 transition" title="Original text removed by client">
                  {targetStr}
                </del>
                <ins className="bg-emerald-100 text-emerald-900 no-underline font-semibold border-b-2 border-emerald-600 px-1 py-0.5 rounded text-xs sm:text-sm hover:bg-emerald-200 transition ml-1" title="Client proposed wording">
                  {redline.proposed_wording}
                </ins>
                <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-800 text-white ml-1 align-middle inline-block">
                  {redline.category || "Edit"}
                </span>
              </span>
            );
          }
        });
      });
      elements = nextElements;
    });

    return elements;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Banner */}
      {isExecuted ? (
        <div className="no-print bg-emerald-50 border-b border-emerald-200 text-emerald-800 py-2.5 px-4 text-xs text-center font-semibold flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>This proposal has been officially executed & signed. Redline modifications are locked.</span>
        </div>
      ) : isRedispatchedV11 ? (
        <div className="no-print bg-emerald-50 border-b border-emerald-300 text-emerald-900 py-3 px-4 text-xs text-center font-semibold flex items-center justify-center gap-2 shadow-xs">
          <Sparkles className="w-4 h-4 text-emerald-700 animate-pulse" />
          <span>Proposal Updated to Version {contract?.version} — Updated by Contract Manager based on your redline feedback. Ready for your review & signature!</span>
        </div>
      ) : isNegotiation ? (
        <div className="no-print bg-amber-50 border-b border-amber-200 text-amber-900 py-2.5 px-4 text-xs text-center font-semibold flex items-center justify-center gap-2">
          <Edit3 className="w-4 h-4 text-amber-700" />
          <span>Client Modifications Submitted — {allRedlines.length} clause edit(s) sent to Contract Manager for review.</span>
        </div>
      ) : null}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="no-print fixed top-4 right-4 z-50 bg-emerald-700 text-white px-4 py-3 rounded-xl shadow-xl font-bold text-xs flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-40 backdrop-blur-md px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-9 px-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-800 font-bold text-xs">
            <Leaf className="w-4 h-4 text-emerald-700" />
            <span>CLM</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 hidden sm:block" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-slate-900">{contract?.title}</h1>
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                isExecuted
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : isNegotiation
                  ? "bg-amber-50 text-amber-800 border-amber-300"
                  : "bg-blue-50 text-blue-700 border-blue-200"
              }`}>
                {isExecuted ? "EXECUTED" : isNegotiation ? "CLIENT NEGOTIATION" : contract?.status || "APPROVED"}
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {contract?.version || "v1.0"}
              </span>
            </div>
            <p className="text-xs text-slate-500">Client: <strong className="text-slate-700">{contract?.client_name}</strong> | ID: {contract?.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Expires in: <strong className="text-slate-800">{daysRemaining} Days</strong></span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified Token Link</span>
          </div>
          <button
            onClick={handleDownloadPDF}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Download PDF</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 pb-28">
        {/* Left Column: TOC Navigation */}
        <div className="no-print lg:col-span-1 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sticky top-20 shadow-xs space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-2">
                Document Sections
              </h3>
              <nav className="space-y-1">
                {contentSections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => {
                      setActiveSection(sec.id);
                      document.getElementById(sec.id)?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition flex items-center justify-between ${
                      activeSection === sec.id
                        ? "bg-emerald-50/80 border border-emerald-300 text-emerald-800 font-bold shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <span className="truncate">{sec.number}. {sec.title}</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-50 shrink-0" />
                  </button>
                ))}
              </nav>
            </div>

            {/* Version Revision Notes Box */}
            {contract?.version_notes && (
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                  <History className="w-4 h-4 text-emerald-700" />
                  <span>Version {contract.version} Revision Notes:</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-snug italic">
                  "{contract.version_notes}"
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 px-2">
                <span>Contract Value:</span>
                <strong className="text-emerald-700 font-mono text-sm">${contract?.total_value?.toLocaleString()} {contract?.currency}</strong>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 px-2">
                <span>Target Timeline:</span>
                <strong className="text-slate-800">{contract?.timeline_weeks} Weeks</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Document Canvas */}
        <div className="lg:col-span-3 print-full-width">
          <div
            onMouseUp={handleTextSelection}
            className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-8 relative min-h-[650px]"
          >
            {/* Selection Tooltip */}
            {selectedText && !isReadOnly && (
              <div className="no-print fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-white border border-emerald-300 shadow-2xl rounded-xl p-2 flex items-center gap-2 animate-bounce">
                <span className="text-xs text-slate-700 px-2 font-mono truncate max-w-xs">
                  "{selectedText.substring(0, 30)}..."
                </span>
                <button
                  onClick={() => setShowRedlineModal(true)}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1 shadow-sm"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Propose Redline
                </button>
                <button
                  onClick={() => setSelectedText("")}
                  className="text-slate-400 hover:text-slate-600 text-xs px-2"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Inspect Redline Modal Popover */}
            {inspectRedline && (
              <div className="no-print fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-3 font-sans">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-amber-800 uppercase flex items-center gap-1.5">
                      <Edit3 className="w-4 h-4 text-amber-600" />
                      Client Redline Details
                    </span>
                    <button
                      onClick={() => setInspectRedline(null)}
                      className="text-slate-400 hover:text-slate-700 text-xs font-bold px-2 py-1 bg-slate-100 rounded-lg"
                    >
                      Close
                    </button>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Category</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {inspectRedline.category}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Original Text (Removed)</span>
                    <p className="text-xs text-rose-700 line-through bg-rose-50 p-2 rounded-lg font-mono border border-rose-200">
                      "{inspectRedline.selected_text}"
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Client Proposed Addition</span>
                    <p className="text-xs text-emerald-900 bg-emerald-50 font-semibold p-2 rounded-lg font-mono border border-emerald-200">
                      "{inspectRedline.proposed_wording}"
                    </p>
                  </div>
                  {inspectRedline.reason && (
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Client Note / Reason</span>
                      <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded-lg">
                        {inspectRedline.reason}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Document Header Info */}
            <div className="border-b border-slate-100 pb-6">
              <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-widest block mb-1">
                Statement of Work & Legal Clauses (Version {contract?.version || "v1.0"})
              </span>
              <h2 className="text-2xl font-bold text-slate-900">{contract?.title}</h2>
              <p className="text-xs text-slate-500 mt-1">Prepared by {contract?.vendor_name} for {contract?.client_name}</p>
            </div>

            {/* Render Document Sections */}
            {contentSections.map((section) => (
              <div key={section.id} id={section.id} className="space-y-4 pt-2 border-b border-slate-100 pb-6 last:border-b-0">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center text-xs font-mono">
                    {section.number}
                  </span>
                  {section.title}
                </h3>

                <div className="text-sm text-slate-700 leading-relaxed font-sans">
                  {renderHighlightedText(section.content)}
                </div>

                {/* Standard Enterprise Metadata Grid for Variables */}
                {section.tokens && section.tokens.length > 0 && (
                  <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 mt-3">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Mapped Contract Metadata</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {section.tokens.map((t, idx) => {
                        const cleanLabel = t.key.replace(/^\{\{|\}\}$/g, "").replace(/_/g, " ");
                        return (
                          <div key={idx} className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-2xs flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                              {cleanLabel}
                            </span>
                            <span className="text-xs font-semibold text-slate-800 truncate">
                              {t.value}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Deliverables Table */}
                {section.deliverables && (
                  <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50/50 mt-3">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
                        <tr>
                          <th className="p-3">Deliverable Item</th>
                          <th className="p-3">Effort Estimate</th>
                          <th className="p-3">Lead Role</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-700">
                        {section.deliverables.map((d, idx) => (
                          <tr key={idx} className="hover:bg-white">
                            <td className="p-3 font-medium text-slate-900">{d.name}</td>
                            <td className="p-3 font-mono text-emerald-700 font-semibold">{d.hours}</td>
                            <td className="p-3 text-slate-500">{d.lead}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Milestones Table */}
                {section.milestones && (
                  <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50/50 mt-3">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
                        <tr>
                          <th className="p-3">Payment Milestone</th>
                          <th className="p-3">Percentage</th>
                          <th className="p-3">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-700">
                        {section.milestones.map((m, idx) => (
                          <tr key={idx} className="hover:bg-white">
                            <td className="p-3 font-medium text-slate-900">{m.name}</td>
                            <td className="p-3 text-amber-700 font-semibold">{m.percentage}</td>
                            <td className="p-3 font-mono text-emerald-700 font-bold">{m.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}

            {/* E-Signature & Execution Certificate Block */}
            {(isExecuted || isClientSigned || clientSig) && (
              <div className="mt-12 pt-8 border-t-2 border-emerald-500 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-800">
                    <ShieldCheck className="w-5 h-5 text-emerald-700" />
                    <h3 className="text-sm font-extrabold uppercase tracking-wider">
                      IN WITNESS WHEREOF — E-SIGNATURE EXECUTION BLOCK
                    </h3>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${
                    isExecuted 
                      ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                      : isClientSigned 
                      ? "bg-blue-100 text-blue-900 border-blue-300"
                      : "bg-slate-100 text-slate-700 border-slate-300"
                  }`}>
                    STATUS: {isExecuted ? "FULLY EXECUTED & DUAL SIGNED" : isClientSigned ? "SIGNED BY CLIENT — PENDING COMPANY COUNTERSIGN" : "AWAITING CLIENT SIGNATURE"} ({contract?.version || "v1.0"})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-emerald-50/50 border border-emerald-200 rounded-2xl p-6">
                  {/* Vendor / Company Signatory */}
                  <div className="space-y-3 border-b sm:border-b-0 sm:border-r border-emerald-200/60 pb-4 sm:pb-0 sm:pr-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      COMPANY / ISSUING ENTITY
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-900">
                      {contract?.vendor_name || "MarketBytes Enterprise"}
                    </h4>
                    
                    <div className="h-16 flex items-center justify-start border-b border-emerald-200 py-1">
                      {companySig?.signature_data && companySig.signature_data.startsWith("data:image") ? (
                        <img src={companySig.signature_data} alt="Company Signature" className="h-14 object-contain" />
                      ) : companySig?.signature_data && companySig.signature_data.startsWith("TYPED:") ? (
                        <div className={`italic text-2xl text-emerald-900 font-bold tracking-wide ${companySig.signature_data.split(":")[1] || "font-serif"}`}>
                          {companySig.signature_data.split(":")[2] || companySig.signer_name}
                        </div>
                      ) : companySig ? (
                        <div className="font-serif italic text-2xl text-emerald-950 font-bold tracking-wide">
                          {companySig.signer_name}
                        </div>
                      ) : (
                        <div className="text-xs italic text-slate-400 font-medium">
                          Pending Company Countersign (Will be applied by Contract Manager)
                        </div>
                      )}
                    </div>

                    <div className="text-xs space-y-1 text-slate-600">
                      <p><strong>Signed By:</strong> {companySig?.signer_name || "Sarah Jenkins (Pending Countersign)"}</p>
                      <p><strong>Title:</strong> {companySig?.signer_title || "Contract Manager & Authorized Officer"}</p>
                      {companySig?.signed_at && (
                        <p className="text-[11px] text-slate-400 font-mono">
                          Timestamp: {formatTimestamp(companySig.signed_at)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Client Signatory */}
                  <div className="space-y-3 sm:pl-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      CLIENT / ACCEPTING ENTITY
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-900">
                      {contract?.client_name}
                    </h4>
                    
                    <div className="h-16 flex items-center justify-start border-b border-emerald-200 py-1">
                      {clientSig?.signature_data && clientSig.signature_data.startsWith("data:image") ? (
                        <img
                          src={clientSig.signature_data}
                          alt="Client E-Signature"
                          className="h-14 object-contain"
                        />
                      ) : clientSig?.signature_data && clientSig.signature_data.startsWith("TYPED:") ? (
                        <div className={`italic text-2xl text-emerald-900 font-bold tracking-wide ${clientSig.signature_data.split(":")[1] || "font-serif"}`}>
                          {clientSig.signature_data.split(":")[2] || clientSig.signer_name}
                        </div>
                      ) : clientSig ? (
                        <div className="font-serif italic text-2xl text-emerald-950 font-medium tracking-wide">
                          {clientSig.signature_data || clientSig.signer_name || "Signed"}
                        </div>
                      ) : (
                        <div className="text-xs italic text-slate-400 font-medium">
                          Click "Accept & Sign Proposal" below to execute signature
                        </div>
                      )}
                    </div>

                    <div className="text-xs space-y-1 text-slate-600">
                      <p><strong>Signed By:</strong> {clientSig?.signer_name || contract?.client_name}</p>
                      <p><strong>Title:</strong> {clientSig?.signer_title || "Authorized Signatory"}</p>
                      {clientSig?.signed_at && (
                        <p className="text-[11px] text-slate-400 font-mono">
                          Timestamp: {formatTimestamp(clientSig.signed_at)}
                        </p>
                      )}
                      {clientSig?.ip_address && (
                        <p className="text-[10px] text-slate-400 font-mono">
                          IP: {clientSig.ip_address} | Token Verified
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-emerald-200 rounded-xl p-3 text-[11px] text-slate-500 flex flex-wrap items-center justify-between font-mono gap-2">
                  <span>Audit Hash: {clientSig && clientSig.sha256_hash ? "SHA256-" + clientSig.sha256_hash.substring(0, 16) + "..." : "SHA256-PENDING-SIGNATURE"}</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {isExecuted ? "Dual Signed & Cryptographically Locked" : isClientSigned ? "Client Signed — Pending Company Countersign" : "Ready for Client Signature"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Bottom Action Bar */}
      <div className="no-print fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 py-3.5 px-6 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-end gap-4">
          <div className="flex items-center gap-3">
            {!isReadOnly && !isNegotiation && (
              <button
                onClick={() => setShowFeedbackDrawer(true)}
                className="px-5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold transition flex items-center gap-2 relative shadow-xs"
              >
                <MessageSquare className="w-4 h-4 text-amber-700" />
                <span>Request Changes / Redlines ({allRedlines.length})</span>
                {localRedlines.length > 0 && (
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping absolute -top-1 -right-1" />
                )}
              </button>
            )}

            {isExecuted ? (
              <div className="px-5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Contract Fully Executed & Locked ({contract?.version || "v1.0"})</span>
              </div>
            ) : isClientSigned ? (
              <div className="px-5 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-700" />
                <span>Signed by Client — Awaiting Company Countersignature</span>
              </div>
            ) : isNegotiation ? (
              <div className="px-5 py-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-2 shadow-xs">
                <Clock className="w-4 h-4 text-amber-700 animate-pulse" />
                <span>Redlines Submitted — Awaiting CM Review & v1.1 Re-Dispatch</span>
              </div>
            ) : (
              <button
                onClick={() => setShowSignModal(true)}
                className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition flex items-center gap-2 shadow-sm"
              >
                <PenTool className="w-4 h-4" />
                <span>Accept & Sign Proposal ({contract?.version || "v1.0"})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Redline Modal */}
      <ClientRedlineModal
        isOpen={showRedlineModal}
        onClose={() => {
          setShowRedlineModal(false);
          setSelectedText("");
        }}
        selectedText={selectedText}
        onAddRedline={handleAddRedline}
        sectionTitle={activeSectionData?.title}
      />

      {/* Feedback Drawer */}
      <ClientFeedbackDrawer
        isOpen={showFeedbackDrawer}
        onClose={() => setShowFeedbackDrawer(false)}
        redlines={allRedlines}
        onRemoveRedline={handleRemoveRedline}
        onSubmitFeedback={(data) => {
          onRedlinesSubmit(data);
          setShowFeedbackDrawer(false);
          setLocalRedlines([]);
        }}
        isSubmitting={isSubmitting}
      />

      {/* E-Signature Modal */}
      <ESignatureModal
        isOpen={showSignModal}
        onClose={() => setShowSignModal(false)}
        contractTitle={contract?.title}
        clientName={contract?.client_name}
        onSignSubmit={(sigData) => {
          onSignSubmit(sigData);
          setShowSignModal(false);
        }}
        isSigning={isSigning}
      />
    </div>
  );
}
