"use client";

import React, { useState, useRef } from "react";
import { PenTool, X, ShieldCheck, FileCheck } from "lucide-react";

export default function ESignatureModal({ isOpen, onClose, contractTitle, clientName, onSignSubmit, isSigning }) {
  const [signerName, setSignerName] = useState("");
  const [signerTitle, setSignerTitle] = useState("");
  const [signMode, setSignMode] = useState("draw");
  const [typedSignature, setTypedSignature] = useState("");
  const [agreeChecked, setAgreeChecked] = useState(false);

  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  if (!isOpen) return null;

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#15803d"; // Emerald dark green stroke
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agreeChecked || !signerName.trim()) return;

    let signatureData = "";
    if (signMode === "draw" && canvasRef.current) {
      signatureData = canvasRef.current.toDataURL("image/png");
    } else {
      signatureData = typedSignature.trim() || signerName.trim();
    }

    onSignSubmit({
      signer_name: signerName.trim(),
      signer_title: signerTitle.trim() || "Authorized Officer",
      signature_data: signatureData
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn font-sans">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-slate-800 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700">
            <PenTool className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Accept & Execute Proposal</h3>
            <p className="text-xs text-slate-500">Electronic Signature for {clientName || "Client"}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Your Full Legal Name *
              </label>
              <input
                type="text"
                value={signerName}
                onChange={(e) => {
                  setSignerName(e.target.value);
                  if (!typedSignature) setTypedSignature(e.target.value);
                }}
                placeholder="e.g. Tony Stark"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Official Title / Designation *
              </label>
              <input
                type="text"
                value={signerTitle}
                onChange={(e) => setSignerTitle(e.target.value)}
                placeholder="e.g. CEO / Director"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Signature Format
              </label>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setSignMode("draw")}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition ${
                    signMode === "draw" ? "bg-emerald-700 text-white" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Draw
                </button>
                <button
                  type="button"
                  onClick={() => setSignMode("type")}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition ${
                    signMode === "type" ? "bg-emerald-700 text-white" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Type
                </button>
              </div>
            </div>

            {signMode === "draw" ? (
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  width={450}
                  height={120}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl cursor-crosshair touch-none"
                />
                {!hasDrawn && (
                  <span className="absolute inset-0 flex items-center justify-center text-xs text-slate-400 pointer-events-none italic">
                    Draw signature here...
                  </span>
                )}
                {hasDrawn && (
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="absolute top-2 right-2 text-[10px] text-slate-600 hover:text-rose-600 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm"
                  >
                    Clear Canvas
                  </button>
                )}
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  value={typedSignature}
                  onChange={(e) => setTypedSignature(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-4 text-2xl font-serif italic text-emerald-800 text-center tracking-wide focus:outline-none focus:border-emerald-600"
                  placeholder="Type signature..."
                />
              </div>
            )}
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-start gap-3">
            <input
              type="checkbox"
              id="agree-checkbox"
              checked={agreeChecked}
              onChange={(e) => setAgreeChecked(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600 bg-white"
            />
            <label htmlFor="agree-checkbox" className="text-xs text-slate-700 leading-relaxed cursor-pointer">
              I confirm that I am an authorized representative of <strong className="text-slate-900">{clientName || "Client"}</strong> and agree to execute <strong className="text-slate-900">{contractTitle}</strong> digitally.
            </label>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Audit Logged & Timestamped
            </span>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition border border-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!agreeChecked || !signerName.trim() || isSigning}
                className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-semibold text-sm transition flex items-center gap-2 shadow-sm"
              >
                {isSigning ? (
                  <span>Executing...</span>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4" />
                    <span>Confirm & Sign</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
