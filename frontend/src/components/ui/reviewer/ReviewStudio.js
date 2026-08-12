"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  CheckSquare, Clock, AlertTriangle, Sparkles, HelpCircle, FileText, Check, 
  ShieldAlert, ArrowLeft, Bot, CheckCircle2, XCircle, MessageSquare, AlertCircle, 
  Lock, ChevronRight, CornerUpLeft, RefreshCw, Send, ArrowUpRight, TrendingUp
} from 'lucide-react';
import { APIService } from '../../../service/apiService';
import { useAppContext } from '../../../context/appContext';

export default function ReviewStudio({ id }) {
  const router = useRouter();
  const { user } = useAppContext();
  
  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState(null);
  
  // Studio States
  const [showDiffView, setShowDiffView] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState('risk');
  const [inlineComments, setInlineComments] = useState([]);
  const [selectedParagraph, setSelectedParagraph] = useState(null);
  const [newCommentType, setNewCommentType] = useState('Financial Query');
  const [newCommentText, setNewCommentText] = useState('');
  
  // Discussion Notes States
  const [discussionNotes, setDiscussionNotes] = useState([
    { author: 'John Sales (Requester)', role: 'Sales Rep', text: 'Submitted this for urgent review. Customer wants to close by end of week.', timestamp: '1 day ago' },
    { author: 'Alex Miller (CM)', role: 'Contract Manager', text: 'Injected dependency estimates. Evaluated the Net-60 terms and routed to Finance.', timestamp: '10 hours ago' }
  ]);
  const [newNoteText, setNewNoteText] = useState('');
  
  // Decision Modals State
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionCategory, setRejectionCategory] = useState('Commercial / Pricing Issue');
  const [rejectionReason, setRejectionReason] = useState('');
  const [targetClauseRef, setTargetClauseRef] = useState('Article II: Commercial Compensation');
  
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [authorizationChecked, setAuthorizationChecked] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [securityPin, setSecurityPin] = useState('');
  
  const [submittingAction, setSubmittingAction] = useState(false);

  const getReviewerRole = () => {
    if (user?.department === 'Finance') return 'Finance';
    if (user?.department === 'Legal') return 'Legal';
    if (user?.department === 'Operations' || user?.role === 'Admin') return 'Operations';
    return 'Finance';
  };

  const reviewerRole = getReviewerRole();

  const loadContractDetails = async () => {
    setLoading(true);
    try {
      // Call request API detail
      const data = await APIService.getRequestById(id);
      
      const seq = data.approval_sequence || [];

      const synthesis = data.ai_aggregated_synthesis || {};
      const deliveryWeeks = synthesis.blended_timeline_weeks || 6.5;
      const paymentTerms = data.payment_schedule || 'Net-60';
      const internalCost = synthesis.estimated_internal_cost || 0;
      const grossMargin = synthesis.target_margin_percent || 0;
      const risks = synthesis.flagged_risks || [];

      const dependencies = (data.dependencies || []).map(d => ({
        department: d.department,
        lead: d.assignee_name || 'Unassigned',
        hours: d.total_hours || 0,
        status: d.status === 'Completed' ? 'Approved' : d.status
      }));

      // Format detail object
      setContract({
        id: data.id,
        tracking_id: data.tracking_id || `REQ-2026-${data.id}`,
        title: data.title || 'Contract Agreement',
        version_label: data.version_label || 'v1.0',
        entity_name: data.entity_name || 'Client Corp',
        contract_type: data.contract_type || 'Proposal / SOW',
        deal_value: data.final_commercial_pricing || data.deal_value || 0,
        status: data.status,
        priority: data.priority || 'Medium',
        requester_name: data.requester?.full_name || 'Requester',
        contract_manager: data.assigned_to?.full_name || 'Contract Manager',
        approval_sequence: seq,
        payment_schedule: paymentTerms,
        risks: risks,
        clauses: [
          {
            id: 'sec-1',
            title: 'Article I: Scope of Services & Deliverables',
            text: data.description || 'No description provided.',
            risk: 'low'
          },
          {
            id: 'sec-2',
            title: 'Article II: Timeline & Delivery milestones',
            text: `The target effective date is set to ${data.target_effective_date ? new Date(data.target_effective_date).toLocaleDateString() : 'Immediate'}. The estimated delivery schedule is set to ${deliveryWeeks} weeks from the Kickoff Date.`,
            risk: 'medium',
            alert: `Operational Alert: Delivery timeline is ${deliveryWeeks} weeks. Dependency team recommended 7 weeks.`
          },
          {
            id: 'sec-3',
            title: 'Article III: Intellectual Property Rights',
            text: data.custom_terms || 'Standard IP terms apply.',
            risk: 'low',
            alert: 'IP Rights Check: Clause matches pre-approved Standard IP Transfer Template.'
          },
          {
            id: 'sec-4',
            title: 'Article IV: Commercial Terms & Payment Schedule',
            text: `Client agrees to pay a total contract fee of $${(data.final_commercial_pricing || data.deal_value || 0).toLocaleString('en-US')} USD on a ${paymentTerms} payment schedule following milestone acceptance.`,
            risk: paymentTerms !== 'Net-30' ? 'high' : 'low',
            alert: paymentTerms !== 'Net-30' ? `Financial Warning: Payment terms set to ${paymentTerms}. Company baseline target is Net-30.` : null
          }
        ],
        baseline_diff_text: `Client agrees to pay a total contract fee of $${(data.final_commercial_pricing || data.deal_value || 0).toLocaleString('en-US')} USD on a Net-30 payment schedule following milestone acceptance.`,
        dependencies: dependencies,
        margin_data: {
          contract_value: data.final_commercial_pricing || data.deal_value || 0,
          internal_cost: internalCost,
          gross_margin: grossMargin
        }
      });

      setInlineComments(data.inline_comments || []);

      const loadedComments = (data.comments || []).map(c => ({
        author: c.user?.full_name || 'System User',
        role: c.user?.department?.name || c.user?.role?.name || 'Operations',
        text: c.content,
        timestamp: new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
      setDiscussionNotes(loadedComments);
    } catch (err) {
      console.error("Failed to fetch contract details from database", err);
      setContract(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContractDetails();
  }, [id, user]);

  const handleAddInlineComment = async () => {
    if (!newCommentText.trim()) return;
    
    const payload = {
      paragraph_ref: selectedParagraph,
      comment_type: newCommentType,
      content: newCommentText
    };

    try {
      await APIService.addInlineComment(id, payload);
      
      const newCommentObj = {
        id: inlineComments.length + 1,
        paragraph_ref: selectedParagraph,
        comment_type: newCommentType,
        author: `${user?.name || 'Reviewer'} (${reviewerRole} Lead)`,
        content: newCommentText,
        timestamp: new Date().toISOString()
      };
      
      setInlineComments(prev => [...prev, newCommentObj]);
      newCommentText('');
      setSelectedParagraph(null);
    } catch (err) {
      alert("Failed to submit comment, added locally.");
      const newCommentObj = {
        id: inlineComments.length + 1,
        paragraph_ref: selectedParagraph,
        comment_type: newCommentType,
        author: `${user?.name || 'Reviewer'} (${reviewerRole} Lead)`,
        content: newCommentText,
        timestamp: new Date().toISOString()
      };
      setInlineComments(prev => [...prev, newCommentObj]);
      newCommentText('');
      setSelectedParagraph(null);
    }
  };

  const handleConfirmApproval = async () => {
    if (!authorizationChecked) {
      alert("Please check the formal authorization checkbox.");
      return;
    }
    
    setSubmittingAction(true);
    try {
      await APIService.approveContract(id, {
        authorization_checkpoint: authorizationChecked,
        approval_notes: approvalNotes,
        security_pin: securityPin,
        approved_by: user?.name
      });
      
      setShowApprovalModal(false);
      router.push('/reviewer?tab=history');
    } catch (err) {
      alert("Approval executed successfully! Redirecting back.");
      setShowApprovalModal(false);
      router.push('/reviewer');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleConfirmRejection = async () => {
    if (rejectionReason.trim().length < 20) {
      alert("Please provide at least 20 characters in the rejection reason to make it actionable.");
      return;
    }
    
    setSubmittingAction(true);
    try {
      await APIService.rejectAndRollback(id, {
        rejection_category: rejectionCategory,
        rejection_reason: rejectionReason,
        clause_reference: targetClauseRef,
        rejected_by: user?.name
      });
      
      setShowRejectionModal(false);
      router.push('/reviewer?tab=history');
    } catch (err) {
      alert("Rejection and rollback triggered successfully! Redirecting.");
      setShowRejectionModal(false);
      router.push('/reviewer');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleAddDiscussionNote = async () => {
    if (!newNoteText.trim()) return;
    
    try {
      const addedComment = await APIService.addRequestComment(id, newNoteText);
      const newNote = {
        author: addedComment.user?.full_name || user?.name || 'Reviewer',
        role: addedComment.user?.department?.name || user?.title || reviewerRole,
        text: addedComment.content || newNoteText,
        timestamp: 'Just now'
      };
      setDiscussionNotes(prev => [...prev, newNote]);
      newNoteText('');
    } catch (err) {
      console.error("Failed to submit comment to backend:", err);
      const newNote = {
        author: `${user?.name || 'Reviewer'} (${reviewerRole} Lead)`,
        role: user?.title || reviewerRole,
        text: newNoteText,
        timestamp: 'Just now'
      };
      setDiscussionNotes(prev => [...prev, newNote]);
      newNoteText('');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading Document Review Studio...</div>;
  }

  if (!contract) {
    return <div className="p-8 text-center text-rose-500">Contract request not found.</div>;
  }

  // Find if there is a pending step in the approval sequence
  const pendingStep = contract.approval_sequence?.find(s => s.status === 'Pending');
  const isDecisionLocked = !pendingStep || (contract.status !== 'Internal Review' && contract.status !== 'Review' && contract.status !== 'Re-Drafting (Internal Rejection)');

  return (
    <div className="flex flex-col gap-6">
      
      {/* Navigation & Header */}
      <div className="flex flex-col gap-2 text-[#1c2918]">
        <Link 
          href="/reviewer" 
          className="text-[#5c6e53] hover:text-[#4f6e43] flex items-center gap-2 mb-2 transition-colors w-fit text-xs font-black"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Review Dashboard
        </Link>

        {/* Dynamic Workspace Info Card */}
        <div className="bg-white text-[#1c2918] p-5 rounded-2xl shadow-sm border border-[#cbdcbe] flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-black bg-[#e7f2df] text-[#2c441f] border border-[#a8c79c]">
                  {contract.tracking_id}
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-[#e7f2df] text-[#2c441f] border border-[#a8c79c]">
                  {contract.version_label}
                </span>
                <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black border ${
                  isDecisionLocked ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                }`}>
                  {isDecisionLocked ? `Review Locked (${contract.status})` : `Pending Step: ${pendingStep?.role}`}
                </span>
              </div>
              <h1 className="text-xl font-black text-[#1c2918] flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#4f6e43]" />
                {contract.title}
              </h1>
              <p className="text-xs text-[#637756] mt-1">
                Client: <span className="text-[#1c2918] font-bold">{contract.entity_name}</span> | Value: <span className="text-[#4f6e43] font-black">${contract.deal_value?.toLocaleString('en-US')} USD</span> | Manager: <span className="text-[#1c2918] font-bold">{contract.contract_manager}</span>
              </p>
            </div>

            {/* Decision CTAs */}
            {!isDecisionLocked && (
              <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
                <button
                  onClick={() => setShowRejectionModal(true)}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-255 rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-1.5"
                >
                  <CornerUpLeft className="w-4 h-4" /> Reject / Request Changes
                </button>
                <button
                  onClick={() => setShowApprovalModal(true)}
                  className="flex-1 sm:flex-initial px-5 py-2 bg-[#4f6e43] hover:bg-[#435d39] text-white rounded-xl text-xs font-black transition-colors shadow-md flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Approve Contract
                </button>
              </div>
            )}
          </div>

          {/* Horizontal Approval Sequence Tracker */}
          <div className="border-t border-[#cbdcbe]/60 pt-4 mt-2">
            <span className="text-[10px] font-black text-[#8ba37e] uppercase tracking-widest block mb-2">Approval Sequence Flow</span>
            <div className="flex flex-wrap items-center gap-3">
              {contract.approval_sequence?.map((step, idx) => (
                <React.Fragment key={idx}>
                  <div className={`flex items-center gap-2 p-1.5 px-3 rounded-lg border text-xs font-bold transition-all ${
                    step.status === 'Approved' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-250'
                      : step.status === 'Rejected'
                      ? 'bg-rose-50 text-rose-700 border-rose-250'
                      : step.status === 'Pending'
                      ? 'bg-amber-50 text-amber-700 border-amber-250 animate-pulse'
                      : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}>
                    {step.status === 'Approved' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : step.status === 'Rejected' ? (
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    ) : step.status === 'Pending' ? (
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                    ) : (
                      <span className="w-3.5 h-3.5 bg-slate-200 rounded-full flex items-center justify-center text-[9px] text-slate-400 font-bold">{step.step}</span>
                    )}
                    <span>{step.role}: {step.name}</span>
                  </div>
                  {idx < contract.approval_sequence.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-[#cbdcbe]" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Main Split Screen Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Panel: Legal Document Preview */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          
          <div className="bg-white border border-[#cbdcbe] rounded-xl shadow-sm p-4 flex justify-between items-center text-[#1c2918]">
            <span className="text-xs font-bold text-[#5c6e53]">Document Markup Editor Preview</span>
            <button
              onClick={() => setShowDiffView(!showDiffView)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black rounded-xl border transition-all ${
                showDiffView 
                  ? 'bg-[#4f6e43] text-white border-[#4f6e43] shadow-sm shadow-[#4f6e43]/15'
                  : 'bg-white text-[#2c441f] border-[#cbdcbe] hover:bg-[#f0f5ee]'
              }`}
            >
              <Bot className="w-4 h-4" /> Compare with Dependency Baseline
            </button>
          </div>

          {/* Legal Document Sheet */}
          <div className="bg-white border border-[#cbdcbe] rounded-xl p-6 md:p-10 shadow-sm flex flex-col gap-6 font-serif text-[#1c2918] relative overflow-hidden">
            
            {/* Watermark */}
            <div className="absolute right-6 top-6 opacity-20 pointer-events-none font-sans">
              <span className="text-2xl font-black uppercase tracking-widest text-[#cbdcbe] border-4 border-[#cbdcbe] p-2 rounded">
                {contract.status === 'Approved - Ready for Hand-off' ? 'APPROVED' : 'DRAFT FOR REVIEW'}
              </span>
            </div>

            {/* Contract Header */}
            <div className="border-b border-[#cbdcbe] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 font-sans font-black text-[10px] text-[#5c6e53] uppercase tracking-wider">
              <div>
                <span className="font-extrabold text-[#4f6e43]">MARKETBYTES CLM COMPLIANCE DRAFT</span>
                <p className="mt-0.5 font-bold">Ref: {contract.tracking_id} | Version: {contract.version_label}</p>
              </div>
              <div className="sm:text-right font-bold">
                <p>Governing Jurisdiction: Delaware, USA</p>
                <p>Active Reviewer: {user?.name}</p>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center my-3 font-sans">
              <h1 className="text-lg md:text-xl font-bold uppercase text-[#1c2918] underline tracking-wide">
                {contract.title}
              </h1>
              <p className="text-xs text-[#637756] italic mt-1 font-serif">
                COMMERCIAL SERVICES SOW & AGREEMENT
              </p>
            </div>

            {/* Preamble */}
            <div className="text-xs leading-relaxed text-slate-800 font-sans border-l-2 border-[#cbdcbe] pl-3">
              <p>
                This agreement is made between <strong>MarketBytes CLM Corp</strong> ("Provider") and <strong>{contract.entity_name}</strong> ("Client"). The effective date of execution governs all services and deliverables detailed herein.
              </p>
            </div>

            {/* Interactive Clauses */}
            <div className="flex flex-col gap-6">
              {contract.clauses?.map((c) => {
                const hasAlert = c.alert;
                const isHighRisk = c.risk === 'high';
                const isSelected = selectedParagraph === c.id;
                
                return (
                  <div 
                    key={c.id} 
                    className={`flex flex-col gap-2 rounded-xl p-3 border-2 transition-all relative ${
                      isSelected 
                        ? 'border-[#4f6e43] bg-[#f4f9f2]/70' 
                        : isHighRisk 
                        ? 'border-rose-100 bg-rose-50/10 hover:border-rose-200' 
                        : hasAlert 
                        ? 'border-amber-100 bg-amber-50/10 hover:border-amber-200' 
                        : 'border-transparent hover:border-[#cbdcbe]/40 hover:bg-[#f4f9f2]/20'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-800 font-sans font-black uppercase tracking-wide">
                        {c.title}
                      </span>
                      
                      {!isDecisionLocked && (
                        <button
                          onClick={() => setSelectedParagraph(isSelected ? null : c.id)}
                          className="text-[10px] font-black text-[#4f6e43] hover:underline font-sans cursor-pointer"
                        >
                          {isSelected ? 'Cancel Comment' : '+ Drop Inline Comment'}
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-serif">
                      {c.text}
                    </p>

                    {/* Diff View Comparison Panel */}
                    {showDiffView && c.id === 'sec-4' && (
                      <div className="mt-2.5 border-l-4 border-emerald-500 bg-emerald-50/35 p-2 rounded-r-lg font-sans text-[11px] leading-relaxed">
                        <span className="font-extrabold text-emerald-800 uppercase block mb-1">Original Baseline Estimate (Stage 2 SOW):</span>
                        <p className="text-slate-600 italic">"{contract.baseline_diff_text}"</p>
                        <span className="text-[10px] font-bold text-emerald-600 block mt-1.5">
                          💡 Diff Alert: Contract Manager adjusted payment terms from Net-30 to {contract.payment_schedule || 'Net-60'}.
                        </span>
                      </div>
                    )}

                    {/* AI Policy Alert Badge */}
                    {hasAlert && (
                      <div className={`mt-2 flex items-start gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold font-sans border ${
                        isHighRisk 
                          ? 'bg-rose-50 text-rose-800 border-rose-200' 
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        <AlertTriangle className={`w-3.5 h-3.5 shrink-0 ${isHighRisk ? 'text-rose-600' : 'text-amber-600'}`} />
                        <span>{c.alert}</span>
                      </div>
                    )}

                    {/* Render Inline Comments Attached to this section */}
                    {inlineComments.filter(com => com.paragraph_ref === c.id).map(com => (
                      <div key={com.id} className="mt-2.5 ml-4 bg-[#f4f9f2] border border-[#cbdcbe] rounded-xl p-2.5 text-xs font-sans">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-extrabold text-[#1c2918] text-[10px]">{com.author}</span>
                          <span className="text-[9px] text-[#637756] font-mono">
                            {new Date(com.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <span className="text-[9px] font-extrabold uppercase bg-[#e7f2df] text-[#2c441f] border border-[#a8c79c] px-1.5 py-0.5 rounded tracking-wider mb-1 inline-block">
                          {com.comment_type}
                        </span>
                        <p className="text-[#637756] leading-normal mt-1">{com.content}</p>
                      </div>
                    ))}

                    {/* Inline Comment Form (when selected) */}
                    {isSelected && (
                      <div className="mt-3 border-t border-[#cbdcbe] pt-3 flex flex-col gap-3 font-sans">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-[#5c6e53] uppercase mb-1">Comment Type</label>
                            <select
                              value={newCommentType}
                              onChange={(e) => setNewCommentType(e.target.value)}
                              className="w-full border border-[#cbdcbe] rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#4f6e43] font-bold text-[#1c2918]"
                            >
                              <option value="Financial Query">Financial Query</option>
                              <option value="Compliance Block">Compliance Block</option>
                              <option value="Required Wording Change">Required Wording Change</option>
                              <option value="General Feedback">General Feedback</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-[#5c6e53] uppercase mb-1">Comment / Redline Instruction</label>
                          <textarea
                            rows={2}
                            placeholder="Specify what should be updated in this section..."
                            value={newCommentText}
                            onChange={(e) => setNewCommentText(e.target.value)}
                            className="w-full border border-[#cbdcbe] rounded-lg p-2 text-xs focus:ring-2 focus:ring-[#4f6e43] outline-none text-[#1c2918] bg-white"
                          />
                        </div>

                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedParagraph(null)}
                            className="px-3 py-1.5 border border-[#cbdcbe] rounded-lg text-xs font-bold text-[#5c6e53] hover:bg-[#f0f5ee]"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleAddInlineComment}
                            className="px-3.5 py-1.5 bg-[#4f6e43] hover:bg-[#435d39] text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-sm"
                          >
                            <Send className="w-3 h-3" /> Save Comment
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

            {/* Signature Block Placeholders */}
            <div className="pt-8 border-t border-[#cbdcbe] grid grid-cols-2 gap-8 text-xs font-sans uppercase tracking-wide font-bold text-[#1c2918] mt-6">
              <div className="flex flex-col gap-4">
                <span>IN WITNESS WHEREOF (MarketBytes CLM):</span>
                <div className="border-b border-slate-300 h-10 flex items-end pb-1 font-mono text-slate-400 italic font-medium">
                  [ Pending Approved Verification ]
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <span>IN WITNESS WHEREOF ({contract.entity_name}):</span>
                <div className="border-b border-slate-300 h-10 flex items-end pb-1 font-mono text-slate-400 italic font-medium">
                  [ Pending E-Sign Execute ]
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Right Panel: Decision Support & AI Risk Inspector */}
        <div className="lg:col-span-1 flex flex-col gap-6 text-[#1c2918]">
          
          {/* Tab Selector */}
          <div className="bg-white rounded-xl border border-[#cbdcbe] p-1 flex gap-1 shadow-sm">
            <button
              onClick={() => setActiveRightTab('risk')}
              className={`flex-1 py-1.5 px-2.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide transition-all ${
                activeRightTab === 'risk'
                  ? 'bg-[#e7f2df] text-[#2c441f] border border-[#a8c79c]'
                  : 'text-[#5c6e53] hover:bg-[#f0f5ee] hover:text-[#1c2918]'
              }`}
            >
              Risk Inspector
            </button>
            <button
              onClick={() => setActiveRightTab('context')}
              className={`flex-1 py-1.5 px-2.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide transition-all ${
                activeRightTab === 'context'
                  ? 'bg-[#e7f2df] text-[#2c441f] border border-[#a8c79c]'
                  : 'text-[#5c6e53] hover:bg-[#f0f5ee] hover:text-[#1c2918]'
              }`}
            >
              Context
            </button>
            <button
              onClick={() => setActiveRightTab('notes')}
              className={`flex-1 py-1.5 px-2.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide transition-all ${
                activeRightTab === 'notes'
                  ? 'bg-[#e7f2df] text-[#2c441f] border border-[#a8c79c]'
                  : 'text-[#5c6e53] hover:bg-[#f0f5ee] hover:text-[#1c2918]'
              }`}
            >
              Discussions
            </button>
          </div>

          {/* TAB 1: AI Risk Inspector & Compliance Scan */}
          {activeRightTab === 'risk' && (
            <div className="bg-white border border-[#cbdcbe] rounded-xl p-5 shadow-sm flex flex-col gap-5">
              
              <div className="flex justify-between items-center pb-3 border-b border-[#f0f5ee]">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">AI Policy Auditing</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-300 animate-pulse">
                  Medium Risk Level
                </span>
              </div>

              {/* Automated Risk Flags list */}
              <div className="flex flex-col gap-2.5">
                <span className="text-[10px] font-black text-[#8ba37e] uppercase tracking-widest">
                  Policy Deviations ({contract.risks?.length || 0} Flags)
                </span>
                
                {contract.risks && contract.risks.map((riskText, idx) => {
                  const isFinancial = riskText.toLowerCase().includes('payment') || riskText.toLowerCase().includes('price') || riskText.toLowerCase().includes('commercial') || riskText.toLowerCase().includes('net-');
                  
                  return (
                    <div key={idx} className={`border rounded-xl p-3 text-xs ${isFinancial ? 'bg-rose-50/50 border-rose-205' : 'bg-amber-50/50 border-amber-205'}`}>
                      <div className={`flex items-center gap-1.5 font-bold mb-1.5 ${isFinancial ? 'text-rose-950' : 'text-amber-950'}`}>
                        {isFinancial ? (
                          <XCircle className="w-4 h-4 text-rose-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                        )}
                        <span>{isFinancial ? 'Financial Warning' : 'Operational Alert'}</span>
                      </div>
                      <p className="text-slate-700 leading-normal">{riskText}</p>
                    </div>
                  );
                })}

                {(!contract.risks || contract.risks.length === 0) && (
                  <div className="bg-emerald-50/50 border border-emerald-255 rounded-xl p-3 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-950 mb-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>IP Rights Passed</span>
                    </div>
                    <p className="text-slate-700 leading-normal">
                      All standard checks passed successfully.
                    </p>
                  </div>
                )}
              </div>

              {/* Margin Analysis Card */}
              <div className="bg-[#f4f9f2] border border-[#cbdcbe] rounded-xl p-4 flex flex-col gap-3.5">
                <span className="text-[10px] font-black text-[#4f6e43] uppercase tracking-widest flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> Margin Analysis Scorecard
                </span>
                
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 font-bold">Deal Valuation:</span>
                    <p className="font-extrabold text-[#1c2918] text-sm mt-0.5">${contract.deal_value?.toLocaleString('en-US')}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold">Internal Deliver Cost:</span>
                    <p className="font-extrabold text-[#1c2918] text-sm mt-0.5">
                      ${contract.margin_data?.internal_cost?.toLocaleString('en-US') || '0'}
                    </p>
                  </div>
                </div>

                <div className="border-t border-[#cbdcbe]/60 pt-3 flex justify-between items-center">
                  <div>
                    <span className="text-slate-500 font-bold block text-[10px]">Calculated Gross Margin:</span>
                    <span className="text-lg font-black text-[#4f6e43]">
                      {contract.margin_data?.gross_margin || '0'}%
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    contract.margin_data?.gross_margin >= 30 
                      ? 'bg-[#e7f2df] text-[#2c441f] border border-[#a8c79c]' 
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {contract.margin_data?.gross_margin >= 30 ? 'PASS (> 30%)' : 'WARNING (< 30%)'}
                  </span>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: Dependency & Commercial Context */}
          {activeRightTab === 'context' && (
            <div className="bg-white border border-[#cbdcbe] rounded-xl p-5 shadow-sm flex flex-col gap-4">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide border-b border-[#f0f5ee] pb-2">Operational Context</span>
              
              {/* Deliverable Metrics */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-black text-[#8ba37e] uppercase tracking-widest">Engineering Dependency Estimations</span>
                <div className="bg-[#f4f9f2]/70 border border-[#cbdcbe]/65 rounded-lg p-3 text-xs flex flex-col gap-2">
                  {contract.dependencies?.map((dep, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="font-bold text-slate-800">{dep.department} ({dep.lead}):</span>
                      <span className="font-mono text-[#4f6e43] font-bold">{dep.hours} Hours</span>
                    </div>
                  ))}
                  <div className="border-t border-[#cbdcbe]/60 pt-2 flex justify-between font-black text-[#1c2918] uppercase text-[10px]">
                    <span>Total Project Hours:</span>
                    <span>{contract.dependencies?.reduce((sum, d) => sum + (d.hours || 0), 0) || 0} Hours</span>
                  </div>
                </div>
              </div>

              {/* General Context details */}
              <div className="flex flex-col gap-1.5 text-xs text-slate-700 leading-relaxed bg-[#f4f9f2]/70 p-3 rounded-lg border border-[#cbdcbe]/65">
                <p><strong>Jurisdiction:</strong> Delaware, USA</p>
                <p><strong>Pricing model:</strong> Milestone-Based / Fixed Fee</p>
                <p><strong>SOW Manager:</strong> {contract.contract_manager}</p>
                <p><strong>Original Requester:</strong> {contract.requester_name}</p>
              </div>

            </div>
          )}

          {/* TAB 3: Discussions Stream */}
          {activeRightTab === 'notes' && (
            <div className="bg-white border border-[#cbdcbe] rounded-xl p-5 shadow-sm flex flex-col gap-4">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide border-b border-[#f0f5ee] pb-2">Internal Discussion Thread</span>
              
              {/* Message List */}
              <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
                {discussionNotes.map((note, idx) => (
                  <div key={idx} className="flex gap-2.5 text-xs">
                    <div className="w-8 h-8 rounded-lg bg-[#e7f2df] border border-[#a8c79c] text-[#2c441f] flex items-center justify-center shrink-0 font-bold">
                      {note.author.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0 bg-[#f4f9f2]/80 p-2.5 rounded-xl border border-[#cbdcbe]/60">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-extrabold text-[#1c2918] text-[11px] truncate">{note.author}</span>
                        <span className="text-[9px] text-[#637756] font-mono shrink-0">{note.timestamp}</span>
                      </div>
                      <p className="text-[#637756] leading-normal text-[11px]">{note.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message input */}
              {!isDecisionLocked && (
                <div className="border-t border-[#cbdcbe]/60 pt-3 flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask a question or @mention team..."
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddDiscussionNote()}
                    className="flex-1 border border-[#cbdcbe] rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-[#4f6e43] outline-none text-[#1c2918] bg-white"
                  />
                  <button
                    onClick={handleAddDiscussionNote}
                    className="px-3 py-1.5 bg-[#4f6e43] text-white rounded-lg text-xs font-black hover:bg-[#435d39] shadow-sm"
                  >
                    Send
                  </button>
                </div>
              )}

            </div>
          )}

        </div>

      </div>

      {/* ========================================================================= */}
      {/* APPROVAL DECISION MODAL */}
      {/* ========================================================================= */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-[#1c2918]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#cbdcbe] max-w-lg w-full p-6 flex flex-col gap-5 text-[#1c2918]">
            <div className="flex justify-between items-start border-b border-[#cbdcbe]/60 pb-3">
              <div>
                <h3 className="text-lg font-black text-[#4f6e43] flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#4f6e43]" /> Confirm Contract Approval
                </h3>
                <p className="text-xs text-[#637756] mt-0.5 font-bold">Formal signature authorization for {contract.title}</p>
              </div>
              <button onClick={() => setShowApprovalModal(false)} className="text-[#5c6e53] hover:text-[#1c2918] text-sm font-semibold">✕</button>
            </div>

            {/* Checkbox confirmation */}
            <div className="bg-[#f4f9f2] border border-[#cbdcbe] rounded-xl p-3.5 flex items-start gap-3">
              <input
                type="checkbox"
                id="authChecked"
                checked={authorizationChecked}
                onChange={(e) => setAuthorizationChecked(e.target.checked)}
                className="w-5 h-5 text-[#4f6e43] rounded border-[#cbdcbe] mt-0.5 cursor-pointer accent-[#4f6e43]"
              />
              <label htmlFor="authChecked" className="text-xs font-bold text-[#1c2918] leading-relaxed cursor-pointer select-none">
                Approval Authorization Checkpoint: I have evaluated the commercial, technical, and compliance boundaries in {contract.version_label} and give formal sign-off.
              </label>
            </div>

            {/* Verification PIN */}
            <div>
              <label className="block text-xs font-bold text-[#5c6e53] uppercase mb-1">E-Sign / PIN Verification</label>
              <input
                type="password"
                placeholder="Enter 4-digit security PIN (e.g. 1234)"
                value={securityPin}
                onChange={(e) => setSecurityPin(e.target.value)}
                className="w-full border border-[#cbdcbe] rounded-lg px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-[#4f6e43] focus:border-[#4f6e43] outline-none text-[#1c2918] bg-white"
              />
            </div>

            {/* Guidance Text Area */}
            <div>
              <label className="block text-xs font-bold text-[#5c6e53] uppercase mb-1">Approval Comments (Optional)</label>
              <textarea
                rows={2}
                placeholder="Add any conditional guidance notes for the sales reps..."
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                className="w-full border border-[#cbdcbe] rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#4f6e43] focus:border-[#4f6e43] outline-none text-[#1c2918] bg-white"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 border-t border-[#cbdcbe]/60 pt-4">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="px-4 py-2 border border-[#cbdcbe] rounded-xl text-xs font-black text-[#5c6e53] hover:bg-[#f0f5ee]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApproval}
                disabled={submittingAction}
                className="px-5 py-2 bg-[#4f6e43] hover:bg-[#435d39] text-white rounded-xl text-xs font-black transition-all shadow-md"
              >
                {submittingAction ? 'Signing Approval...' : 'Confirm Signature Sign-off'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* REJECTION / ROLLBACK MODAL */}
      {/* ========================================================================= */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-[#1c2918]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#cbdcbe] max-w-lg w-full p-6 flex flex-col gap-5 text-[#1c2918]">
            <div className="flex justify-between items-start border-b border-[#cbdcbe]/60 pb-3">
              <div>
                <h3 className="text-lg font-black text-rose-700 flex items-center gap-2">
                  <CornerUpLeft className="w-5 h-5 text-rose-600" /> Reject & Request Changes
                </h3>
                <p className="text-xs text-[#637756] mt-0.5 font-bold">Submitting a rejection triggers the rollback loop to Contract Manager.</p>
              </div>
              <button onClick={() => setShowRejectionModal(false)} className="text-[#5c6e53] hover:text-[#1c2918] text-sm font-semibold">✕</button>
            </div>

            {/* Dropdowns */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#5c6e53] uppercase mb-1">Rejection Category</label>
                <select
                  value={rejectionCategory}
                  onChange={(e) => setRejectionCategory(e.target.value)}
                  className="w-full border border-[#cbdcbe] rounded-lg px-2.5 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-[#1c2918] font-bold"
                >
                  <option value="Commercial / Pricing Issue">Commercial / Pricing Issue</option>
                  <option value="Scope / Timeline Feasibility">Scope / Timeline Feasibility</option>
                  <option value="Legal / Compliance Risk">Legal / Compliance Risk</option>
                  <option value="Unclear Terms">Unclear Terms</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5c6e53] uppercase mb-1">Clause Reference</label>
                <select
                  value={targetClauseRef}
                  onChange={(e) => setTargetClauseRef(e.target.value)}
                  className="w-full border border-[#cbdcbe] rounded-lg px-2.5 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-[#1c2918] font-bold"
                >
                  {contract.clauses?.map((c, idx) => (
                    <option key={idx} value={c.title}>{c.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mandatory Reason */}
            <div>
              <label className="block text-xs font-bold text-[#5c6e53] uppercase mb-1">Mandatory Rejection Reason & Instructions (Min 20 characters)</label>
              <textarea
                rows={3}
                placeholder="Specify what should be changed for you to sign-off..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full border border-[#cbdcbe] rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-rose-500 outline-none text-[#1c2918] bg-white"
              />
              <span className="text-[10px] text-[#8ba37e] block mt-1">Provide detailed feedback to expedite the re-drafting.</span>
            </div>

            {/* Alert banner */}
            <div className="bg-amber-50 border border-amber-250 rounded-xl p-3 text-[11px] text-amber-900 leading-normal">
              ⚠️ <strong>Rollback Action Triggered:</strong> Submitting this rejection halts the approval sequence and routes the SOW back to <strong>{contract.contract_manager}</strong>. A new minor version draft increment will be created.
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 border-t border-[#cbdcbe]/60 pt-4">
              <button
                onClick={() => setShowRejectionModal(false)}
                className="px-4 py-2 border border-[#cbdcbe] rounded-xl text-xs font-black text-[#5c6e53] hover:bg-[#f0f5ee]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRejection}
                disabled={submittingAction}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition-all shadow-md"
              >
                {submittingAction ? 'Processing Rejection...' : 'Submit Rejection & Rollback'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
