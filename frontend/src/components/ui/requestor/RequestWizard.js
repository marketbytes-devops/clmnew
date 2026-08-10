'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../../context/appContext';
import Button from '../../common/Button';
import PriorityBadge from '../../common/PriorityBadge';
import { useRouter, useSearchParams } from 'next/navigation';

export default function RequestWizard() {
  const {
    user,
    contractManagers,
    departmentLeads,
    submitNewRequest,
    triggerAIParsing,
    aiParsingState,
    contractRequests,
    loading
  } = useAppContext();

  const router = useRouter();
  const searchParams = useSearchParams();
  const draftId = searchParams.get('draftId');

  const fileInputRef = useRef(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showAiDrawer, setShowAiDrawer] = useState(true);
  const [submissionSuccess, setSubmissionSuccess] = useState(null);

  // Wizard Form State
  const [formData, setFormData] = useState({
    requesterName: user?.name || 'John Sales',
    requesterDepartment: user?.department || 'Sales',
    businessUnit: user?.businessUnit || 'Software Services',
    entityType: 'Client / Customer',
    clientName: '',
    primaryContactName: '',
    primaryContactEmail: '',
    jurisdiction: user?.jurisdiction || 'United States - Delaware',

    contractCategory: 'Revenue / Sales',
    contractType: 'Proposal',
    estimatedValue: 25000,
    currency: 'USD',
    pricingModel: 'Milestone Based',
    targetEffectiveDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    targetDeliveryDate: new Date(Date.now() + 86400000 * 45).toISOString().split('T')[0],
    priority: 'Medium',

    scopeSummary: '',
    deliverables: [
      { name: 'UI/UX Design Prototypes', description: 'Complete Figma visual identity and style guide', timeline: 'Week 2' },
      { name: 'Full Stack Integration', description: 'Next.js application with cloud API backend', timeline: 'Week 5' }
    ],
    selectedDependencies: ['UI/UX Design', 'Backend & APIs'],
    customClientTerms: '',

    managerAssignmentMode: 'manual',
    contractManager: 'Sarah Jenkins',
    requirePreDraftingSupport: true,
    dependencyMatrix: []
  });

  const availableContractTypes = {
    'Revenue / Sales': ['Proposal', 'Master Services Agreement (MSA)', 'Statement of Work (SOW)', 'Change Order'],
    'Procurement / Expenses': ['Vendor Agreement', 'Non-Disclosure Agreement (NDA)', 'Software License Agreement'],
    'Partnership / Non-Commercial': ['Memorandum of Understanding (MOU)', 'Non-Disclosure Agreement (NDA)', 'Joint Venture Proposal'],
    'Employment': ['Executive Offer Letter', 'Consulting & Contractor Agreement', 'Non-Compete Agreement'],
    'Real Estate / Facilities': ['Commercial Lease Agreement', 'Sublease Agreement', 'Construction & Renovation Contract'],
    'Intellectual Property': ['IP Assignment Agreement', 'Trademark Licensing', 'Patent Filing & Registration'],
    'Corporate / Governance': ['Shareholder Agreement', 'Board Resolution', 'Merger & Acquisition Term Sheet'],
    'Non-Disclosure (NDA)': ['Mutual NDA', 'One-way NDA', 'Employee NDA']
  };

  useEffect(() => {
    if (draftId && contractRequests && contractRequests.length > 0) {
      const draft = contractRequests.find(r => r.requestId === draftId);
      if (draft && draft.currentStatus === 'Draft') {
        // Pre-populate formData with the draft values
        setFormData({
          requesterName: draft.requesterName || user?.name || 'John Sales',
          requesterDepartment: user?.department || 'Sales',
          businessUnit: 'Software Services',
          entityType: draft.entityType || 'Client / Customer',
          clientName: draft.clientName || '',
          primaryContactName: draft.primaryContactName || '',
          primaryContactEmail: draft.primaryContactEmail || '',
          jurisdiction: draft.jurisdiction || 'United States - Delaware',
          contractCategory: draft.contractCategory || 'Revenue / Sales',
          contractType: draft.contractType || 'Proposal',
          estimatedValue: draft.estimatedValue || 25000,
          currency: draft.currency || 'USD',
          pricingModel: draft.pricingModel || 'Milestone Based',
          targetEffectiveDate: draft.targetEffectiveDate || '',
          targetDeliveryDate: draft.targetDeliveryDate || '',
          priority: draft.priority || 'Medium',
          scopeSummary: draft.scopeSummary || '',
          deliverables: draft.deliverables || [],
          selectedDependencies: draft.selectedDependencies || [],
          customClientTerms: draft.customClientTerms || '',
          managerAssignmentMode: draft.managerAssignmentMode || 'manual',
          contractManager: draft.contractManager || 'Sarah Jenkins',
          requirePreDraftingSupport: draft.requirePreDraftingSupport ?? true,
          dependencyMatrix: draft.dependencies || []
        });
      }
    }
  }, [draftId, contractRequests, user]);

  useEffect(() => {
    if (formData.selectedDependencies) {
      const updatedMatrix = formData.selectedDependencies.map(dep => {
        const existing = formData.dependencyMatrix?.find(m => m.department === dep);
        if (existing) return existing;

        const availableLeads = departmentLeads[dep] || ['Team Lead / Manager'];
        return {
          department: dep,
          lead: availableLeads[0] || 'Unassigned Lead',
          objective: `Provide technical estimation & SLA feasibility breakdown for ${dep}`,
          sla: '24 Hours',
          requiredInputs: ['Hours Estimate', 'Feasibility Note']
        };
      });
      setFormData(prev => ({ ...prev, dependencyMatrix: updatedMatrix }));
    }
  }, [formData.selectedDependencies, departmentLeads]);

  const handleChange = (field, value) => {
    setFormData(prev => {
      const newForm = { ...prev, [field]: value };
      if (field === 'contractCategory') {
        const types = availableContractTypes[value] || ['Proposal'];
        newForm.contractType = types[0];
      }
      return newForm;
    });
  };

  const addDeliverable = () => {
    setFormData(prev => ({
      ...prev,
      deliverables: [...prev.deliverables, { name: '', description: '', timeline: '' }]
    }));
  };

  const removeDeliverable = (idx) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== idx)
    }));
  };

  const updateDeliverable = (idx, key, val) => {
    const updated = [...formData.deliverables];
    updated[idx][key] = val;
    setFormData(prev => ({ ...prev, deliverables: updated }));
  };

  const updateMatrixItem = (idx, key, val) => {
    const updated = [...formData.dependencyMatrix];
    updated[idx][key] = val;
    setFormData(prev => ({ ...prev, dependencyMatrix: updated }));
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    setUploadedFile({
      name: file.name,
      size: (file.size / 1024).toFixed(1) + " KB",
      type: file.type || "Unknown file type"
    });

    setShowAiDrawer(true);
    const res = await triggerAIParsing(file);

    if (res.success && res.data) {
      setFormData(prev => ({
        ...prev,
        scopeSummary: res.data.scopeSummary || prev.scopeSummary,
        deliverables: res.data.deliverables || prev.deliverables,
        selectedDependencies: res.data.suggestedDependencies || prev.selectedDependencies,
        customClientTerms: res.data.customClientTerms || prev.customClientTerms,
        clientName: res.data.clientName || prev.clientName || 'Acme Corp Enterprise (AI Detected)'
      }));
    }
  };

  const handleSimulatedAIFileDrop = async (e, sampleFileName = "Client_RFQ_AcmeCorp_2026.pdf") => {
    if (e) e.preventDefault();

    const mockFile = {
      name: sampleFileName,
      size: 452 * 1024,
      type: "application/pdf"
    };

    handleFileUpload(mockFile);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
    setFormData(prev => ({
      ...prev,
      scopeSummary: '',
      deliverables: [],
      selectedDependencies: [],
      customClientTerms: '',
      clientName: ''
    }));
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!formData.clientName) {
        alert("Please provide an Entity / Client Name in Step 1 before proceeding.");
        return;
      }
    }
    setCurrentStep(currentStep + 1);
  };

  const handleCompleteSubmission = async (isDraft = false) => {
    if (!formData.clientName && !isDraft) {
      alert("Please provide an Entity / Client Name in Step 1 before submitting.");
      setCurrentStep(1);
      return;
    }

    const payload = {
      ...formData,
      requestName: `${formData.clientName} - ${formData.contractType}`,
      requestNameDisplay: `${formData.clientName} (${formData.contractType})`,
      dependencies: formData.requirePreDraftingSupport ? formData.dependencyMatrix : []
    };

    const res = await submitNewRequest(payload, isDraft);
    if (res && res.success) {
      setSubmissionSuccess({
        trackingId: res.trackingId,
        isDraft,
        manager: formData.contractManager,
        dependencyCount: formData.requirePreDraftingSupport ? formData.dependencyMatrix.length : 0
      });
    } else {
      alert("Error submitting request: " + (res.message || 'Unknown error'));
    }
  };

  const renderEntitySpecificFields = () => {
    switch (formData.entityType) {
      case 'Vendor / Supplier':
        return (
          <>
            <div>
              <label className="block text-xs font-black text-[#314627] mb-2">Vendor / Supplier Name <span className="text-[#b84343] font-black">*</span></label>
              <input type="text" value={formData.clientName} onChange={(e) => handleChange('clientName', e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm focus:ring-2 focus:ring-[#4f6e43] font-black text-[#1c2918] placeholder-[#8c9c81]" />
            </div>
            <div>
              <label className="block text-xs font-black text-[#314627] mb-2">Tax ID / VAT Number</label>
              <input type="text" value={formData.taxId || ''} onChange={(e) => handleChange('taxId', e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm font-bold focus:ring-2 focus:ring-[#4f6e43] text-[#1c2918]" />
            </div>
            <div>
              <label className="block text-xs font-black text-[#314627] mb-2">Payment Terms</label>
              <select value={formData.paymentTerms || ''} onChange={(e) => handleChange('paymentTerms', e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm font-black focus:ring-2 focus:ring-[#4f6e43] text-[#1c2918]">
                <option value="">Select Terms</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 60">Net 60</option>
                <option value="Due on Receipt">Due on Receipt</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-[#314627] mb-2">Primary Contact Email</label>
              <input type="email" value={formData.primaryContactEmail} onChange={(e) => handleChange('primaryContactEmail', e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm font-bold focus:ring-2 focus:ring-[#4f6e43] text-[#1c2918]" />
            </div>
          </>
        );
      case 'Internal Entity':
        return (
          <>
            <div>
              <label className="block text-xs font-black text-[#314627] mb-2">Department / Subsidiary Name <span className="text-[#b84343] font-black">*</span></label>
              <input type="text" value={formData.clientName} onChange={(e) => handleChange('clientName', e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm focus:ring-2 focus:ring-[#4f6e43] font-black text-[#1c2918]" />
            </div>
            <div>
              <label className="block text-xs font-black text-[#314627] mb-2">Cost Center / Budget Code</label>
              <input type="text" value={formData.costCenter || ''} onChange={(e) => handleChange('costCenter', e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm font-bold focus:ring-2 focus:ring-[#4f6e43] text-[#1c2918]" />
            </div>
            <div>
              <label className="block text-xs font-black text-[#314627] mb-2">Internal Project Lead</label>
              <input type="text" value={formData.primaryContactName} onChange={(e) => handleChange('primaryContactName', e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm font-bold focus:ring-2 focus:ring-[#4f6e43] text-[#1c2918]" />
            </div>
            <div>
              <label className="block text-xs font-black text-[#314627] mb-2">Region</label>
              <input type="text" value={formData.jurisdiction} onChange={(e) => handleChange('jurisdiction', e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm font-bold focus:ring-2 focus:ring-[#4f6e43] text-[#1c2918]" />
            </div>
          </>
        );
      case 'Partner':
        return (
          <>
            <div>
              <label className="block text-xs font-black text-[#314627] mb-2">Partner Organization Name <span className="text-[#b84343] font-black">*</span></label>
              <input type="text" value={formData.clientName} onChange={(e) => handleChange('clientName', e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm focus:ring-2 focus:ring-[#4f6e43] font-black text-[#1c2918]" />
            </div>
            <div>
              <label className="block text-xs font-black text-[#314627] mb-2">Partnership Type</label>
              <select value={formData.partnershipType || ''} onChange={(e) => handleChange('partnershipType', e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm font-black focus:ring-2 focus:ring-[#4f6e43] text-[#1c2918]">
                <option value="">Select Tier</option>
                <option value="Technology">Technology</option>
                <option value="Sales/Channel">Sales/Channel</option>
                <option value="Strategic">Strategic</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-[#314627] mb-2">Geography / Jurisdiction</label>
              <input type="text" value={formData.jurisdiction} onChange={(e) => handleChange('jurisdiction', e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm font-bold focus:ring-2 focus:ring-[#4f6e43] text-[#1c2918]" />
            </div>
            <div>
              <label className="block text-xs font-black text-[#314627] mb-2">Partner Contact Email</label>
              <input type="email" value={formData.primaryContactEmail} onChange={(e) => handleChange('primaryContactEmail', e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm font-bold focus:ring-2 focus:ring-[#4f6e43] text-[#1c2918]" />
            </div>
          </>
        );
      case 'Government / Public Sector':
        return (
          <>
            <div>
              <label className="block text-xs font-black text-[#314627] mb-2">Government Agency Name <span className="text-[#b84343] font-black">*</span></label>
              <input type="text" value={formData.clientName} onChange={(e) => handleChange('clientName', e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm focus:ring-2 focus:ring-[#4f6e43] font-black text-[#1c2918]" />
            </div>
            <div>
              <label className="block text-xs font-black text-[#314627] mb-2">Government Level</label>
              <select value={formData.govLevel || ''} onChange={(e) => handleChange('govLevel', e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm font-black focus:ring-2 focus:ring-[#4f6e43] text-[#1c2918]">
                <option value="">Select Level</option>
                <option value="Federal">Federal</option>
                <option value="State">State</option>
                <option value="Local">Local</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-[#314627] mb-2">Compliance Framework</label>
              <input type="text" placeholder="e.g. FedRAMP, HIPAA" value={formData.complianceFramework || ''} onChange={(e) => handleChange('complianceFramework', e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm font-bold focus:ring-2 focus:ring-[#4f6e43] text-[#1c2918]" />
            </div>
            <div>
              <label className="block text-xs font-black text-[#314627] mb-2">Agency Contact Email</label>
              <input type="email" value={formData.primaryContactEmail} onChange={(e) => handleChange('primaryContactEmail', e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm font-bold focus:ring-2 focus:ring-[#4f6e43] text-[#1c2918]" />
            </div>
          </>
        );
      case 'Affiliate':
        return (
          <>
            <div>
              <label className="block text-xs font-black text-[#314627] mb-2">Affiliate Name <span className="text-[#b84343] font-black">*</span></label>
              <input type="text" value={formData.clientName} onChange={(e) => handleChange('clientName', e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm focus:ring-2 focus:ring-[#4f6e43] font-black text-[#1c2918]" />
            </div>
            <div>
              <label className="block text-xs font-black text-[#314627] mb-2">Parent Company</label>
              <input type="text" value={formData.parentCompany || ''} onChange={(e) => handleChange('parentCompany', e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm font-bold focus:ring-2 focus:ring-[#4f6e43] text-[#1c2918]" />
            </div>
            <div>
              <label className="block text-xs font-black text-[#314627] mb-2">Geography / Jurisdiction</label>
              <input type="text" value={formData.jurisdiction} onChange={(e) => handleChange('jurisdiction', e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm font-bold focus:ring-2 focus:ring-[#4f6e43] text-[#1c2918]" />
            </div>
            <div>
              <label className="block text-xs font-black text-[#314627] mb-2">Primary Contact Email</label>
              <input type="email" value={formData.primaryContactEmail} onChange={(e) => handleChange('primaryContactEmail', e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm font-bold focus:ring-2 focus:ring-[#4f6e43] text-[#1c2918]" />
            </div>
          </>
        );
      case 'Reseller':
      case 'Distributor':
        return (
          <>
            <div>
              <label className="block text-xs font-black text-[#314627] mb-2">{formData.entityType} Name <span className="text-[#b84343] font-black">*</span></label>
              <input type="text" value={formData.clientName} onChange={(e) => handleChange('clientName', e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm focus:ring-2 focus:ring-[#4f6e43] font-black text-[#1c2918]" />
            </div>
            <div>
              <label className="block text-xs font-black text-[#314627] mb-2">Region / Territory</label>
              <input type="text" value={formData.jurisdiction} onChange={(e) => handleChange('jurisdiction', e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm font-bold focus:ring-2 focus:ring-[#4f6e43] text-[#1c2918]" />
            </div>
            <div>
              <label className="block text-xs font-black text-[#314627] mb-2">{formData.entityType === 'Reseller' ? 'Resale Tier' : 'Logistics Contact Name'}</label>
              <input type="text" value={formData.primaryContactName} onChange={(e) => handleChange('primaryContactName', e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm font-bold focus:ring-2 focus:ring-[#4f6e43] text-[#1c2918]" />
            </div>
            <div>
              <label className="block text-xs font-black text-[#314627] mb-2">Contact Email</label>
              <input type="email" value={formData.primaryContactEmail} onChange={(e) => handleChange('primaryContactEmail', e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm font-bold focus:ring-2 focus:ring-[#4f6e43] text-[#1c2918]" />
            </div>
          </>
        );
      case 'Consultant / Contractor':
        return (
          <>
            <div>
              <label className="block text-xs font-black text-[#314627] mb-2">Consultant / Contractor Name <span className="text-[#b84343] font-black">*</span></label>
              <input type="text" value={formData.clientName} onChange={(e) => handleChange('clientName', e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm focus:ring-2 focus:ring-[#4f6e43] font-black text-[#1c2918]" />
            </div>
            <div>
              <label className="block text-xs font-black text-[#314627] mb-2">Service Area / Expertise</label>
              <input type="text" value={formData.serviceArea || ''} onChange={(e) => handleChange('serviceArea', e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm font-bold focus:ring-2 focus:ring-[#4f6e43] text-[#1c2918]" />
            </div>
            <div>
              <label className="block text-xs font-black text-[#314627] mb-2">Fee Structure</label>
              <select value={formData.paymentTerms || ''} onChange={(e) => handleChange('paymentTerms', e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm font-black focus:ring-2 focus:ring-[#4f6e43] text-[#1c2918]">
                <option value="">Select Structure</option>
                <option value="Hourly">Hourly</option>
                <option value="Fixed Fee">Fixed Fee</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-[#314627] mb-2">Contact Email</label>
              <input type="email" value={formData.primaryContactEmail} onChange={(e) => handleChange('primaryContactEmail', e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm font-bold focus:ring-2 focus:ring-[#4f6e43] text-[#1c2918]" />
            </div>
          </>
        );
      case 'Non-Profit Organization':
        return (
          <>
            <div>
              <label className="block text-xs font-black text-[#314627] mb-2">Organization Name <span className="text-[#b84343] font-black">*</span></label>
              <input type="text" value={formData.clientName} onChange={(e) => handleChange('clientName', e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm focus:ring-2 focus:ring-[#4f6e43] font-black text-[#1c2918]" />
            </div>
            <div>
              <label className="block text-xs font-black text-[#314627] mb-2">Tax Exempt Status</label>
              <select value={formData.taxExempt || ''} onChange={(e) => handleChange('taxExempt', e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm font-black focus:ring-2 focus:ring-[#4f6e43] text-[#1c2918]">
                <option value="">Select Status</option>
                <option value="Yes (501c3)">Yes (501c3/Equivalent)</option>
                <option value="No">No</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-[#314627] mb-2">Contact Name</label>
              <input type="text" value={formData.primaryContactName} onChange={(e) => handleChange('primaryContactName', e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm font-bold focus:ring-2 focus:ring-[#4f6e43] text-[#1c2918]" />
            </div>
            <div>
              <label className="block text-xs font-black text-[#314627] mb-2">Contact Email</label>
              <input type="email" value={formData.primaryContactEmail} onChange={(e) => handleChange('primaryContactEmail', e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm font-bold focus:ring-2 focus:ring-[#4f6e43] text-[#1c2918]" />
            </div>
          </>
        );
      case 'Academic Institution':
        return (
          <>
            <div>
              <label className="block text-xs font-black text-[#314627] mb-2">Institution Name <span className="text-[#b84343] font-black">*</span></label>
              <input type="text" value={formData.clientName} onChange={(e) => handleChange('clientName', e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm focus:ring-2 focus:ring-[#4f6e43] font-black text-[#1c2918]" />
            </div>
            <div>
              <label className="block text-xs font-black text-[#314627] mb-2">Department / Faculty</label>
              <input type="text" value={formData.department || ''} onChange={(e) => handleChange('department', e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm font-bold focus:ring-2 focus:ring-[#4f6e43] text-[#1c2918]" />
            </div>
            <div>
              <label className="block text-xs font-black text-[#314627] mb-2">Grant / Funding Source</label>
              <input type="text" value={formData.fundingSource || ''} onChange={(e) => handleChange('fundingSource', e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm font-bold focus:ring-2 focus:ring-[#4f6e43] text-[#1c2918]" />
            </div>
            <div>
              <label className="block text-xs font-black text-[#314627] mb-2">Contact Email</label>
              <input type="email" value={formData.primaryContactEmail} onChange={(e) => handleChange('primaryContactEmail', e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm font-bold focus:ring-2 focus:ring-[#4f6e43] text-[#1c2918]" />
            </div>
          </>
        );
      case 'Joint Venture':
        return (
          <>
            <div>
              <label className="block text-xs font-black text-[#314627] mb-2">Joint Venture Name <span className="text-[#b84343] font-black">*</span></label>
              <input type="text" value={formData.clientName} onChange={(e) => handleChange('clientName', e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm focus:ring-2 focus:ring-[#4f6e43] font-black text-[#1c2918]" />
            </div>
            <div>
              <label className="block text-xs font-black text-[#314627] mb-2">Ownership Split (%)</label>
              <input type="text" placeholder="e.g. 50/50" value={formData.ownershipSplit || ''} onChange={(e) => handleChange('ownershipSplit', e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm font-bold focus:ring-2 focus:ring-[#4f6e43] text-[#1c2918]" />
            </div>
            <div>
              <label className="block text-xs font-black text-[#314627] mb-2">Geography / Jurisdiction</label>
              <input type="text" value={formData.jurisdiction} onChange={(e) => handleChange('jurisdiction', e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm font-bold focus:ring-2 focus:ring-[#4f6e43] text-[#1c2918]" />
            </div>
            <div>
              <label className="block text-xs font-black text-[#314627] mb-2">Lead Contact Email</label>
              <input type="email" value={formData.primaryContactEmail} onChange={(e) => handleChange('primaryContactEmail', e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm font-bold focus:ring-2 focus:ring-[#4f6e43] text-[#1c2918]" />
            </div>
          </>
        );
      case 'Subcontractor':
        return (
          <>
            <div>
              <label className="block text-xs font-black text-[#314627] mb-2">Subcontractor Name <span className="text-[#b84343] font-black">*</span></label>
              <input type="text" value={formData.clientName} onChange={(e) => handleChange('clientName', e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm focus:ring-2 focus:ring-[#4f6e43] font-black text-[#1c2918]" />
            </div>
            <div>
              <label className="block text-xs font-black text-[#314627] mb-2">Prime Contractor Name</label>
              <input type="text" value={formData.primeContractor || ''} onChange={(e) => handleChange('primeContractor', e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm font-bold focus:ring-2 focus:ring-[#4f6e43] text-[#1c2918]" />
            </div>
            <div>
              <label className="block text-xs font-black text-[#314627] mb-2">Scope of Work Summary</label>
              <input type="text" value={formData.sowSummary || ''} onChange={(e) => handleChange('sowSummary', e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm font-bold focus:ring-2 focus:ring-[#4f6e43] text-[#1c2918]" />
            </div>
            <div>
              <label className="block text-xs font-black text-[#314627] mb-2">Contact Email</label>
              <input type="email" value={formData.primaryContactEmail} onChange={(e) => handleChange('primaryContactEmail', e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm font-bold focus:ring-2 focus:ring-[#4f6e43] text-[#1c2918]" />
            </div>
          </>
        );
      case 'Client / Customer':
      default:
        return (
          <>
            <div>
              <label className="block text-xs font-black text-[#314627] mb-2">
                Entity Legal Name <span className="text-[#b84343] font-black">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Acme Corp, Globex Corp..."
                value={formData.clientName}
                onChange={(e) => handleChange('clientName', e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm focus:ring-2 focus:ring-[#4f6e43] focus:bg-white font-black text-[#1c2918] placeholder-[#8c9c81]"
              />
              <span className="text-[11px] font-bold text-[#6a7d5f] mt-1.5 block">Integrates with CRM/ERP auto-complete records.</span>
            </div>
            <div>
              <label className="block text-xs font-black text-[#314627] mb-2">Geography / Jurisdiction</label>
              <select
                value={formData.jurisdiction}
                onChange={(e) => handleChange('jurisdiction', e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm font-black text-[#1c2918] focus:ring-2 focus:ring-[#4f6e43]"
              >
                <option value="United States - Delaware">United States - Delaware (Default US)</option>
                <option value="India">India (GST & Indian Contract Act)</option>
                <option value="UK & EU">UK & EU (GDPR & UK Laws)</option>
                <option value="APAC">APAC (Singapore / Tokyo jurisdiction)</option>
                <option value="Custom Jurisdiction">Custom / Hybrid Jurisdiction</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-[#314627] mb-2">Primary Contact Name</label>
              <input
                type="text"
                placeholder="e.g. Jane Doe (Procurement VP)"
                value={formData.primaryContactName}
                onChange={(e) => handleChange('primaryContactName', e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm font-bold focus:ring-2 focus:ring-[#4f6e43] text-[#1c2918]"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-[#314627] mb-2">Primary Contact Email</label>
              <input
                type="email"
                placeholder="jane.doe@acmecorp.com"
                value={formData.primaryContactEmail}
                onChange={(e) => handleChange('primaryContactEmail', e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm font-bold focus:ring-2 focus:ring-[#4f6e43] text-[#1c2918]"
              />
            </div>
          </>
        );
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 min-h-screen bg-[#f1f6f0] text-[#1c2918]">
      {/* Top Wizard Header & Navigation */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-[#cbdcbe] shadow-sm">
        <div>
          <div className="flex items-center">
            <button
              onClick={() => router.push('/requestor')}
              className="text-xs font-black text-[#4f6e43] hover:underline inline-flex items-center gap-1.5 bg-[#f3f8f1] px-3.5 py-1.5 rounded-full border border-[#cbdcbe] shadow-2xs"
            >
              &larr; Return to Dashboard
            </button>
          </div>
          <h1 className="text-3xl font-black text-[#1c2918] mt-2.5">
            + Create New Contract Request
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="md" onClick={() => handleCompleteSubmission(true)} className="font-bold">
            Save as Draft
          </Button>
        </div>
      </header>

      {/* Persistent Progress Bar */}
      <section className="bg-white p-6 rounded-3xl border border-[#cbdcbe] shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
          {[
            { step: 1, label: 'Core Context', sub: 'Requester & Client Meta' },
            { step: 2, label: 'Classification', sub: 'Commercial & Timeline' },
            { step: 3, label: 'Scope Briefing', sub: 'AI Document Parsing' },
            { step: 4, label: 'Routing Setup', sub: 'Dependencies & Assignee' },
          ].map((item) => (
            <div
              key={item.step}
              onClick={() => setCurrentStep(item.step)}
              className={`flex flex-col p-4 rounded-2xl border-2 transition-all cursor-pointer ${currentStep === item.step
                  ? 'border-[#4f6e43] bg-[#eef5eb] shadow-sm ring-4 ring-[#d8ebd1]'
                  : currentStep > item.step
                    ? 'border-[#7da36d] bg-[#f3f8f1]'
                    : 'border-[#d2dec8] opacity-75 hover:opacity-100 bg-[#f8faf7]'
                }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shadow-2xs ${currentStep === item.step ? 'bg-[#4f6e43] text-white' :
                    currentStep > item.step ? 'bg-[#6a8f5a] text-white' : 'bg-[#e2ebe0] text-[#5e7154]'
                  }`}>
                  {currentStep > item.step ? '✓' : item.step}
                </span>
                <span className="text-[10px] uppercase font-black tracking-wider text-[#768a6b]">
                  Step {item.step} of 4
                </span>
              </div>
              <p className="font-black text-base text-[#1c2918]">{item.label}</p>
              <p className="text-xs text-[#5f7454] font-bold truncate mt-0.5">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Main Form Area vs AI Assistant Drawer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Step Content Studio */}
        <div className={`${showAiDrawer ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-6 transition-all duration-300`}>

          {/* STEP 1: Core Meta & Requester Context */}
          {currentStep === 1 && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#cbdcbe] shadow-sm space-y-8 animate-fadeIn">
              <div className="border-b border-[#d8e7cf] pb-5">
                <h2 className="text-xl font-black text-[#1c2918]">Step 1: Core Meta & Requester Context</h2>
                <p className="text-sm font-bold text-[#5e7152] mt-1">Captures fundamental administrative data about the initiator and target beneficiary.</p>
              </div>

              {/* Section A: Requester Information */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#436137]">Section A: Requester Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-black text-[#314627] mb-2">Requester Name (Auto-filled)</label>
                    <input
                      type="text"
                      disabled
                      value={formData.requesterName}
                      className="w-full px-4 py-3 rounded-2xl bg-[#e6ede1] border border-[#cbdcbe] text-sm font-bold text-[#627555] cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-[#314627] mb-2">Requester Department</label>
                    <select
                      value={formData.requesterDepartment}
                      onChange={(e) => handleChange('requesterDepartment', e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm font-bold text-[#1c2918] focus:ring-2 focus:ring-[#4f6e43]"
                    >
                      <option value="Sales">Sales</option>
                      <option value="Procurement">Procurement</option>
                      <option value="HR">HR</option>
                      <option value="Operations">Operations</option>
                      <option value="Executive">Executive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-[#314627] mb-2">Business Unit / Division</label>
                    <select
                      value={formData.businessUnit}
                      onChange={(e) => handleChange('businessUnit', e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm font-bold text-[#1c2918] focus:ring-2 focus:ring-[#4f6e43]"
                    >
                      <option value="Software Services">Software Services</option>
                      <option value="Product Licensing">Product Licensing</option>
                      <option value="Consulting">Consulting</option>
                      <option value="Enterprise Solutions">Enterprise Solutions</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section B: Beneficiary / Client Details */}
              <div className="space-y-5 pt-5 border-t border-[#d8e7cf]">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#436137]">Section B: Beneficiary / Client Details</h3>

                <div>
                  <label className="block text-xs font-black text-[#314627] mb-2.5">Entity Type</label>
                  <select
                    value={formData.entityType}
                    onChange={(e) => handleChange('entityType', e.target.value)}
                    className="w-full max-w-sm px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm focus:ring-2 focus:ring-[#4f6e43] focus:bg-white font-black text-[#1c2918] cursor-pointer transition-all"
                  >
                    <option value="Client / Customer">Client / Customer</option>
                    <option value="Vendor / Supplier">Vendor / Supplier</option>
                    <option value="Internal Entity">Internal Entity</option>
                    <option value="Partner">Partner</option>
                    <option value="Government / Public Sector">Government / Public Sector</option>
                    <option value="Affiliate">Affiliate</option>
                    <option value="Reseller">Reseller</option>
                    <option value="Distributor">Distributor</option>
                    <option value="Consultant / Contractor">Consultant / Contractor</option>
                    <option value="Non-Profit Organization">Non-Profit Organization</option>
                    <option value="Academic Institution">Academic Institution</option>
                    <option value="Joint Venture">Joint Venture</option>
                    <option value="Subcontractor">Subcontractor</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {renderEntitySpecificFields()}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Contract Classification & Base Parameters */}
          {currentStep === 2 && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#cbdcbe] shadow-sm space-y-8 animate-fadeIn">
              <div className="border-b border-[#d8e7cf] pb-5">
                <h2 className="text-xl font-black text-[#1c2918]">Step 2: Contract Classification & Base Parameters</h2>
                <p className="text-sm font-bold text-[#5e7152] mt-1">Defines commercial boundaries, agreement structure, and target delivery milestones.</p>
              </div>

              {/* Section A: Contract Type Selection */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#436137]">Section A: Contract Type Selection</h3>

                <div>
                  <label className="block text-xs font-black text-[#314627] mb-2.5">Contract Category (Segmented Control)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#e6eee1] p-2 rounded-2xl border border-[#cbdcbe]">
                    {Object.keys(availableContractTypes).map(cat => (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => handleChange('contractCategory', cat)}
                        className={`py-3 px-3 rounded-xl text-xs font-black transition-all ${formData.contractCategory === cat
                            ? 'bg-white text-[#2a421f] shadow-sm border border-[#a8c79c]'
                            : 'text-[#556b4a] hover:text-[#1c2918]'
                          }`}
                      >
                        {cat.split(' / ')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="max-w-md">
                  <label className="block text-xs font-black text-[#314627] mb-2">Contract Type (Dynamic Dropdown)</label>
                  <select
                    value={formData.contractType}
                    onChange={(e) => handleChange('contractType', e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl bg-[#edf6ea] border-2 border-[#a8c79c] text-sm font-black text-[#263c1c] focus:ring-2 focus:ring-[#4f6e43]"
                  >
                    {(availableContractTypes[formData.contractCategory] || ['Proposal']).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Section B: Commercial & Timeline Parameters */}
              <div className="space-y-6 pt-5 border-t border-[#d8e7cf]">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#436137]">Section B: Commercial & Timeline Parameters</h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-black text-[#314627] mb-2">Estimated Deal Value</label>
                    <div className="flex rounded-2xl overflow-hidden border-2 border-[#b8ccac] focus-within:ring-2 focus-within:ring-[#4f6e43]">
                      <select
                        value={formData.currency}
                        onChange={(e) => handleChange('currency', e.target.value)}
                        className="bg-[#e2ede0] px-3.5 text-xs font-black border-r border-[#b8ccac] text-[#2c441f] focus:outline-none"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="INR">INR (₹)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                      <input
                        type="number"
                        value={formData.estimatedValue}
                        onChange={(e) => handleChange('estimatedValue', Number(e.target.value))}
                        className="flex-1 px-4 py-3 bg-[#f3f8f1] text-base font-black text-[#1c2918] focus:outline-none focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-[#314627] mb-2">Pricing Model</label>
                    <select
                      value={formData.pricingModel}
                      onChange={(e) => handleChange('pricingModel', e.target.value)}
                      className="w-full px-4 py-3.5 rounded-2xl bg-[#f3f8f1] border border-[#cbdcbe] text-sm font-bold text-[#1c2918] focus:ring-2 focus:ring-[#4f6e43]"
                    >
                      <option value="Milestone Based">Retainer / Milestone Based</option>
                      <option value="Fixed Bid">Fixed Bid (Lump Sum)</option>
                      <option value="Time & Materials (T&M)">Time & Materials (T&M)</option>
                      <option value="Non-Monetary">Non-Monetary / Exploratory</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-[#314627] mb-2">Priority Level</label>
                    <div className="flex gap-2 mt-0.5">
                      {['Low', 'Medium', 'High', 'Urgent'].map(prio => (
                        <button
                          type="button"
                          key={prio}
                          onClick={() => handleChange('priority', prio === 'Urgent' ? 'Urgent / Escalated' : prio)}
                          className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-black border-2 transition-all ${formData.priority?.startsWith(prio)
                              ? 'border-[#4f6e43] bg-[#e6f1df] text-[#273e1c] shadow-2xs'
                              : 'border-[#ceddbf] bg-[#f4f9f2] text-[#637855] hover:bg-[#e8f1e3]'
                            }`}
                        >
                          {prio}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* DEAL VALUE > $50,000 ALERT BANNER */}
                {formData.estimatedValue >= 50000 && (
                  <div className="p-5 rounded-2xl bg-[#fbf5e8] border-2 border-[#ddbf7e] flex items-center gap-4 shadow-2xs animate-fadeIn">
                    <span className="text-3xl">⚠️</span>
                    <div>
                      <h4 className="text-xs font-black text-[#7a5818] uppercase tracking-wider">
                        Executive Approval Trigger Active (&gt;$50,000 Deal Value)
                      </h4>
                      <p className="text-xs font-bold text-[#5c400d] mt-1 leading-relaxed">
                        Because this estimated deal value exceeds <b>$50,000</b>, the system will automatically flag and route this proposal for <b>Finance Executive authorization</b> during Stage 4 Review.
                      </p>
                    </div>
                  </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                  <div>
                    <label className="block text-xs font-black text-[#314627] mb-2">Target Effective Date</label>
                    <input
                      type="date"
                      value={formData.targetEffectiveDate}
                      onChange={(e) => handleChange('targetEffectiveDate', e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm font-bold text-[#1c2918] focus:ring-2 focus:ring-[#4f6e43]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-[#314627] mb-2">Target Delivery / Completion Date</label>
                    <input
                      type="date"
                      value={formData.targetDeliveryDate}
                      onChange={(e) => handleChange('targetDeliveryDate', e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm font-bold text-[#1c2918] focus:ring-2 focus:ring-[#4f6e43]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Dynamic Scope Briefing & Document Parsing (AI-Assisted) */}
          {currentStep === 3 && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#cbdcbe] shadow-sm space-y-8 animate-fadeIn">
              <div className="border-b border-[#d8e7cf] pb-5">
                <h2 className="text-xl font-black text-[#1c2918]">Step 3: Dynamic Scope Briefing & AI Parser</h2>
                <p className="text-sm font-bold text-[#5e7152] mt-1">Captures operational requirements to empower the Contract Manager to resolve dependencies.</p>
              </div>

              {/* Section A: Smart AI Document Upload */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#436137] flex items-center gap-1.5">
                    <span>✨ Section A: Smart AI Document Upload (Shortcut)</span>
                  </h3>
                  <span className="text-[10px] font-black px-3.5 py-1 bg-[#e7f2df] text-[#2c441f] rounded-full border border-[#a8c79c] shadow-2xs">
                    Powered by DeepMind Copilot
                  </span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.docx,.txt,.eml,.html,.md,.csv,.rtf"
                  className="hidden"
                />

                <div
                  onClick={triggerFileInput}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all cursor-pointer group shadow-xs ${isDragging
                      ? 'border-[#4f6e43] bg-[#e7f1e1]'
                      : uploadedFile
                        ? 'border-[#82a573] bg-[#f8fcf7]'
                        : 'border-[#8ba87c] bg-[#f2f8ef] hover:bg-[#e7f1e1] hover:border-[#4f6e43]'
                    }`}
                >
                  {uploadedFile ? (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="w-16 h-16 rounded-2xl bg-[#dcf0d2] text-[#2c441f] border-2 border-[#6f985c] flex items-center justify-center mx-auto shadow-2xs">
                        <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-base font-black text-[#1c2918]">{uploadedFile.name}</p>
                        <p className="text-xs font-bold text-[#637756] mt-1">
                          Size: {uploadedFile.size} • Type: {uploadedFile.type}
                        </p>
                      </div>
                      <div className="flex justify-center gap-3 pt-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); removeUploadedFile(); }}
                          className="text-[#a13b3b] font-black text-xs hover:bg-[#faeae5] border border-[#dfacac] px-4 py-2 rounded-xl"
                        >
                          Clear File
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-2xl bg-[#dcedd4] text-[#3c582c] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-2xs border border-[#a8c79c]">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                      </div>
                      <p className="text-base font-black text-[#1c2918]">
                        Drag-and-drop Client RFQ, Email Thread, or SOW file here
                      </p>
                      <p className="text-xs font-bold text-[#5c6e53] mt-1.5">
                        Supported: PDF, DOCX, TXT, EML • <span className="text-[#3c582c] font-black underline">Click to choose a file or drag it here</span>
                      </p>
                      <div className="mt-4 inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#e0eee0] hover:bg-[#d5e8d5] text-[#2c441f] text-[10px] font-black rounded-lg border border-[#aacba8] transition-colors" onClick={(e) => { e.stopPropagation(); handleSimulatedAIFileDrop(e, "Client_RFQ_AcmeCorp_2026.pdf"); }}>
                        <span>⚡</span> Click here to simulate AI Document auto-extraction for demo
                      </div>
                    </>
                  )}
                </div>

                {aiParsingState.loading && (
                  <div className="p-5 rounded-2xl bg-[#edf6e9] border border-[#a3c396] flex items-center gap-4 text-xs font-black text-[#263b1a] animate-pulse">
                    <div className="w-6 h-6 rounded-full border-2 border-[#82a873] border-t-[#385429] animate-spin"></div>
                    <span><b>AI Copilot Scanning File...</b> Extracting deliverables, timelines, and technical department dependencies...</span>
                  </div>
                )}
              </div>

              {/* Section B: Scope & Technical Requirements */}
              <div className="space-y-6 pt-5 border-t border-[#d8e7cf]">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#436137]">Section B: Scope & Technical Requirements</h3>

                <div>
                  <label className="block text-xs font-black text-[#314627] mb-2">
                    Scope Summary / Business Objective <span className="text-[#b84343] font-black">*</span>
                  </label>
                  <textarea
                    rows="4"
                    placeholder="Describe the client's request in detail (e.g., Development of an e-commerce platform with custom payment gateway and mobile app)..."
                    value={formData.scopeSummary}
                    onChange={(e) => handleChange('scopeSummary', e.target.value)}
                    className="w-full p-4 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm font-semibold focus:ring-2 focus:ring-[#4f6e43] focus:bg-white leading-relaxed text-[#1c2918]"
                  />
                </div>

                {/* Key Deliverables Repeater */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-[#314627]">
                      Expected Key Deliverables <span className="text-[#738865] font-semibold">(At least 1 required)</span>
                    </label>
                    <Button variant="outline" size="sm" onClick={addDeliverable} icon="+" className="py-1.5 px-4 text-xs font-black border-2 border-[#4f6e43] text-[#2c441f] rounded-xl">
                      Add Deliverable
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {formData.deliverables.map((del, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row items-center gap-3 p-4 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] shadow-2xs">
                        <input
                          type="text"
                          placeholder="Deliverable Name (e.g. Design UI)"
                          value={del.name}
                          onChange={(e) => updateDeliverable(idx, 'name', e.target.value)}
                          className="w-full sm:w-1/3 px-3.5 py-2.5 bg-white border border-[#cbdcbe] rounded-xl text-xs font-black text-[#1c2918]"
                        />
                        <input
                          type="text"
                          placeholder="Short Description..."
                          value={del.description}
                          onChange={(e) => updateDeliverable(idx, 'description', e.target.value)}
                          className="w-full sm:flex-1 px-3.5 py-2.5 bg-white border border-[#cbdcbe] rounded-xl text-xs font-semibold text-[#2f4323]"
                        />
                        <input
                          type="date"
                          value={del.timeline}
                          onChange={(e) => updateDeliverable(idx, 'timeline', e.target.value)}
                          className="w-full sm:w-36 px-3.5 py-2.5 bg-[#e7f2df] border border-[#a8c79c] rounded-xl text-xs font-black text-[#263b1a] text-center uppercase"
                        />
                        <button
                          type="button"
                          onClick={() => removeDeliverable(idx)}
                          className="text-[#b84343] hover:text-[#8e2929] font-black px-2.5 py-1.5 text-lg"
                          title="Remove deliverable"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Technical / Operational Dependencies Multi-Select */}
                <div className="space-y-3">
                  <label className="block text-xs font-black text-[#314627]">
                    Technical / Operational Dependencies Identified by Sales
                  </label>
                  <p className="text-[11px] font-bold text-[#627755]">Checked items will automatically set up SLA task tracking in Step 4.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                    {[
                      'UI/UX Design',
                      'Frontend Engineering',
                      'Backend & APIs',
                      'DevOps & Infrastructure',
                      'Legal & Compliance Review',
                      'Finance & Tax Review'
                    ].map(dep => {
                      const isChecked = formData.selectedDependencies.includes(dep);
                      return (
                        <label
                          key={dep}
                          className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${isChecked
                              ? 'border-[#4f6e43] bg-[#e8f3e2] text-[#233818] font-black shadow-2xs'
                              : 'border-[#cbdcbe] text-[#556b49] hover:bg-[#f4f9f2] font-bold'
                            }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setFormData(prev => ({
                                ...prev,
                                selectedDependencies: checked
                                  ? [...prev.selectedDependencies, dep]
                                  : prev.selectedDependencies.filter(d => d !== dep)
                              }));
                            }}
                            className="w-4 h-4 text-[#4f6e43] rounded focus:ring-[#4f6e43]"
                          />
                          <span className="text-xs">{dep}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Terms */}
                <div>
                  <label className="block text-xs font-black text-[#314627] mb-2">
                    Special / Custom Client Terms <span className="text-[#768a68] font-bold">(Optional)</span>
                  </label>
                  <textarea
                    rows="2"
                    placeholder="Specify any non-standard requests from the client (e.g., custom payment schedule, strict SLA penalties, IP ownership terms)..."
                    value={formData.customClientTerms}
                    onChange={(e) => handleChange('customClientTerms', e.target.value)}
                    className="w-full p-4 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-xs font-semibold text-[#1c2918] focus:ring-2 focus:ring-[#4f6e43]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Routing, Assignment & Dependency Trigger Setup */}
          {currentStep === 4 && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#cbdcbe] shadow-sm space-y-8 animate-fadeIn">
              <div className="border-b border-[#d8e7cf] pb-5">
                <h2 className="text-xl font-black text-[#1c2918]">Step 4: Routing & Pre-Drafting Dependency Setup</h2>
                <p className="text-sm font-bold text-[#5e7152] mt-1">Assign the Contract Manager and configure automated task triggers for technical team leads.</p>
              </div>

              {/* Section A: Management Assignment */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#436137]">Section A: Management Assignment</h3>

                {/* Assignment Mode Toggle */}
                <div className="flex bg-[#e6eee1] p-1.5 rounded-xl border border-[#cbdcbe] max-w-sm">
                  <button
                    type="button"
                    onClick={() => handleChange('managerAssignmentMode', 'manual')}
                    className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${formData.managerAssignmentMode === 'manual' ? 'bg-white text-[#2a421f] shadow-sm border border-[#a8c79c]' : 'text-[#556b4a] hover:text-[#1c2918]'}`}
                  >
                    Manual Assignment
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleChange('managerAssignmentMode', 'ai');
                      handleChange('contractManager', 'Mark Thompson');
                    }}
                    className={`flex-1 py-2 rounded-lg text-xs font-black transition-all flex justify-center items-center gap-1.5 ${formData.managerAssignmentMode === 'ai' ? 'bg-[#4f6e43] text-white shadow-sm' : 'text-[#556b4a] hover:text-[#1c2918]'}`}
                  >
                    <span className="text-sm">✨</span> AI Auto-Assign
                  </button>
                </div>

                {formData.managerAssignmentMode === 'manual' ? (
                  <div className="max-w-md animate-fadeIn">
                    <label className="block text-xs font-black text-[#314627] mb-2">Select Contract Manager</label>
                    <select
                      value={formData.contractManager}
                      onChange={(e) => handleChange('contractManager', e.target.value)}
                      className="w-full px-4 py-3.5 rounded-2xl bg-[#f4f9f2] border-2 border-[#b8ccab] text-sm font-black text-[#1c2918] focus:ring-2 focus:ring-[#4f6e43]"
                    >
                      {contractManagers.length > 0 ? (
                        contractManagers.map((cm, i) => (
                          <option key={i} value={cm.name}>{cm.name} • ({cm.workload})</option>
                        ))
                      ) : (
                        <option value="Sarah Jenkins">Sarah Jenkins (Normal Workload - Default)</option>
                      )}
                    </select>
                  </div>
                ) : (
                  <div className="max-w-md p-4 rounded-2xl bg-[#f2f8ef] border-2 border-[#82a573] shadow-sm flex gap-3 animate-fadeIn">
                    <div className="text-2xl mt-0.5">🤖</div>
                    <div>
                      <p className="text-sm font-black text-[#1c2918]">AI Optimal Assignment</p>
                      <p className="text-xs font-bold text-[#4f6e43] mt-1 leading-relaxed">
                        Based on historical E-Commerce contract data and current workload analysis, AI has auto-assigned <span className="font-black text-[#2a421f]">Mark Thompson</span> (Finance & Procurement).
                      </p>
                    </div>
                  </div>
                )}
              </div>


            </div>
          )}

          {/* Bottom Wizard Navigation Footer */}
          <div className="flex items-center justify-between pt-4">
            <div>
              {currentStep > 1 ? (
                <Button variant="secondary" size="md" onClick={() => setCurrentStep(currentStep - 1)} className="font-bold">
                  &larr; Previous Step
                </Button>
              ) : (
                <Button variant="ghost" size="md" onClick={() => router.push('/requestor')} className="font-bold text-[#627655]">
                  Cancel
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button variant="secondary" size="md" onClick={() => handleCompleteSubmission(true)} className="font-bold">
                Save as Draft
              </Button>

              {currentStep < 4 ? (
                <Button variant="primary" size="md" onClick={handleNextStep} className="px-8 font-black text-base">
                  Next Step &rarr;
                </Button>
              ) : (
                <Button variant="success" size="lg" onClick={() => handleCompleteSubmission(false)} loading={loading} className="px-10 font-black tracking-wide text-base shadow-xl shadow-[#3b5930]/30">
                  Submit Request &rarr;
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* AI Assistant Side Drawer */}
        {showAiDrawer && (
          <aside className="lg:col-span-5 bg-white rounded-3xl border-[3px] border-[#557847] shadow-2xl p-7 space-y-6 animate-fadeIn sticky top-6">
            <div className="flex items-center justify-between border-b border-[#d8e7cf] pb-4">
              <div className="flex items-center gap-3">
                <span className="p-3 rounded-2xl bg-[#e7f2df] text-[#2f4621] font-black text-lg border border-[#afcaa0]">💡</span>
                <div>
                  <h3 className="font-black text-base text-[#1c2918]">AI Copilot</h3>
                  <p className="text-[11px] font-black text-[#4f6e43]">Stage 1 Smart Assistant</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#f2f8ef] border border-[#bcd3af] text-[#263c1c] space-y-2">
                <p className="font-black text-[#385329] text-sm">Historical Memory Suggestion:</p>
                <p className="leading-relaxed font-semibold text-xs text-[#4b633b]">
                  "For similar E-Commerce agreements completed in 2025–2026 (e.g., <i>Project YoKoBaine Phase 1</i>), average UI design estimation was <b>45 hours</b> and Backend integration averaged <b>110 hours</b>."
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#f7fbf6] border border-[#cbdcbe] space-y-3">
                <p className="font-black text-[#1c2918]">Recommended Next Action:</p>
                <p className="text-[#55694a] font-semibold">
                  Click below to apply baseline deliverables and pre-select UI/UX and Engineering dependency teams.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleSimulatedAIFileDrop(null, "Project_YoKoBaine_Baseline.docx")}
                  className="w-full text-xs py-3 bg-[#4f6e43] hover:bg-[#3d5733] font-black shadow-md shadow-[#4f6e43]/20"
                >
                  Apply AI Baseline Estimates
                </Button>
              </div>

              {aiParsingState?.data && (
                <div className="p-4 rounded-2xl bg-[#dcf0d2] border-2 border-[#6f985c] text-[#213b15] space-y-2 animate-fadeIn shadow-2xs">
                  <p className="font-black text-[#28461b]">✓ AI Document Extractor Success</p>
                  <p className="text-[11px] font-bold leading-relaxed text-[#355824]">Auto-filled Scope Summary with 3 key milestones and flagged Net-45 payment terms.</p>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* Post-Submission Celebration Modal */}
      {submissionSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a2915]/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center border-2 border-[#769c65] shadow-2xl space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-[#e3f0da] text-[#3d592b] flex items-center justify-center mx-auto text-4xl font-black shadow-md animate-bounce border border-[#a2bf92]">
              ✓
            </div>

            <div>
              <span className="text-xs font-mono font-black px-4 py-1.5 bg-[#e4f1dc] text-[#243818] rounded-full border border-[#a5c294] shadow-2xs">
                {submissionSuccess.trackingId}
              </span>
              <h3 className="text-2xl font-black text-[#1c2918] mt-4">
                {submissionSuccess.isDraft ? 'Draft Saved Successfully!' : 'Request Dispatched!'}
              </h3>
              <p className="text-xs text-[#55694a] font-bold mt-2 leading-relaxed">
                {submissionSuccess.isDraft
                  ? 'Your progress has been preserved in your Requester Queue without notifying technical teams.'
                  : `Notification sent to Contract Manager (${submissionSuccess.manager}) and ${submissionSuccess.dependencyCount} dependency leads (UI, Tech, Ops).`}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#f3f8f1] text-left space-y-3 border border-[#cbdcbe] text-xs">
              <div className="flex items-center justify-between font-bold">
                <span className="text-[#647958]">New State Transition:</span>
                <span className="font-black text-[#3d592a]">
                  {submissionSuccess.isDraft ? 'Draft' : 'Dependency Gathering ➔'}
                </span>
              </div>
              <div className="flex items-center justify-between font-bold">
                <span className="text-[#647958]">SLA Countdown Trigger:</span>
                <span className="font-mono font-black text-[#a67420]">24h 00m Remaining</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push('/requestor')}
              className="w-full font-black shadow-xl shadow-[#4f6e43]/30 py-4 text-base bg-[#4f6e43] hover:bg-[#3b5530]"
            >
              Return to Request Tracker &rarr;
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
