"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  FileText, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft, 
  Plus, Trash2, ShieldCheck, DollarSign, Calendar, Upload, Bot, RefreshCw, 
  HelpCircle, Check, Eye, GitCompare, Edit3, Shield, Info, Layers, Lock, UserCheck, Briefcase, Award, GraduationCap, PanelRightClose, PanelRightOpen, X, Printer
} from 'lucide-react';
import PrimaryButton from '../../../../common/buttons/PrimaryButton';
import { APIService } from '../../../../service/apiService';
import { useAppContext } from '../../../../context/appContext';

const CONTRACT_TAXONOMY = {
  "Sales / Revenue Contracts": [
    {
      group: "Proposal",
      options: ["Standard Proposal", "Technical Proposal", "Commercial Proposal", "Budgetary Proposal"]
    },
    {
      group: "Master Service Agreement (MSA)",
      options: ["Standard MSA", "Global MSA", "Enterprise MSA"]
    },
    {
      group: "Statement of Work (SOW)",
      options: ["Fixed Price SOW", "Time & Material SOW", "Milestone-Based SOW"]
    },
    {
      group: "Change Order",
      options: ["Scope Change", "Budget Change", "Timeline Extension", "Resource Change"]
    },
    {
      group: "Service Agreement",
      options: ["Annual Service Agreement", "Support Services Agreement", "Managed Services Agreement", "Professional Services Agreement"]
    },
    {
      group: "Subscription Agreement",
      options: ["SaaS Subscription", "Annual Subscription", "Multi-Year Subscription"]
    }
  ],
  "Procurement Contracts": [
    {
      group: "Vendor Agreement",
      options: ["Preferred Vendor Agreement", "Strategic Vendor Agreement", "Approved Vendor Agreement"]
    },
    {
      group: "Purchase Agreement",
      options: ["Standard Purchase Agreement", "Blanket Purchase Agreement", "Framework Purchase Agreement"]
    },
    {
      group: "Supply Agreement",
      options: ["Long-Term Supply Agreement", "Raw Material Supply Agreement", "Product Supply Agreement"]
    },
    {
      group: "Service Procurement",
      options: ["Consulting Agreement", "Maintenance Agreement", "Facility Management Agreement", "Outsourcing Agreement"]
    },
    {
      group: "Software & Technology",
      options: ["Software License Agreement", "SaaS Agreement", "Cloud Service Agreement", "Hardware Purchase Agreement", "IT Support Agreement"]
    },
    {
      group: "Logistics",
      options: ["Transportation Agreement", "Warehousing Agreement", "Distribution Agreement", "Freight Agreement"]
    },
    {
      group: "Manufacturing",
      options: ["OEM Agreement", "Manufacturing Agreement", "Production Agreement"]
    },
    {
      group: "Procurement Amendment",
      options: ["Contract Renewal", "Contract Extension", "Change Order", "Amendment"]
    }
  ],
  "Legal & Compliance Contracts": [
    {
      group: "Non-Disclosure Agreement (NDA)",
      options: ["Mutual NDA", "One-Way NDA", "Employee NDA", "Vendor NDA"]
    },
    {
      group: "Data Privacy Agreement",
      options: ["Data Processing Agreement (DPA)", "Data Sharing Agreement", "GDPR Compliance Agreement"]
    },
    {
      group: "Compliance Agreement",
      options: ["Regulatory Compliance", "Security Compliance", "Audit Compliance"]
    },
    {
      group: "Intellectual Property",
      options: ["IP Assignment", "IP License", "Patent License", "Trademark License"]
    },
    {
      group: "Settlement Agreement",
      options: ["Legal Settlement", "Dispute Settlement", "Arbitration Agreement"]
    }
  ],
  "HR & Employment Contracts": [
    {
      group: "Employment Agreement",
      options: ["Permanent Employee Agreement", "Contract Employee Agreement", "Part-Time Employee Agreement", "Temporary Employee Agreement"]
    },
    {
      group: "Internship Agreement",
      options: ["Paid Internship Agreement", "Unpaid Internship Agreement"]
    },
    {
      group: "Consultant Agreement",
      options: ["Individual Consultant Agreement", "Freelance Consultant Agreement"]
    },
    {
      group: "Non-Compete Agreement",
      options: ["Employee Non-Compete", "Executive Non-Compete"]
    },
    {
      group: "Separation Agreement",
      options: ["Resignation Agreement", "Mutual Separation Agreement", "Termination Agreement"]
    }
  ],
  "Partnership Contracts": [
    {
      group: "Partnership Agreement",
      options: ["Strategic Partnership", "Joint Venture Agreement", "Business Partnership"]
    },
    {
      group: "Reseller Agreement",
      options: ["Authorized Reseller Agreement", "Distributor Agreement", "Channel Partner Agreement"]
    },
    {
      group: "Affiliate Agreement",
      options: ["Marketing Affiliate Agreement", "Referral Partner Agreement"]
    },
    {
      group: "Collaboration Agreement",
      options: ["Research Collaboration", "Technology Collaboration", "Co-Marketing Agreement"]
    }
  ],
  "Finance Contracts": [
    {
      group: "Loan Agreement",
      options: ["Business Loan Agreement", "Internal Loan Agreement"]
    },
    {
      group: "Investment Agreement",
      options: ["Equity Investment Agreement", "Venture Investment Agreement"]
    },
    {
      group: "Payment Agreement",
      options: ["Installment Agreement", "Deferred Payment Agreement"]
    },
    {
      group: "Guarantee Agreement",
      options: ["Bank Guarantee", "Corporate Guarantee"]
    }
  ],
  "Real Estate & Infrastructure": [
    {
      group: "Lease Agreement",
      options: ["Office Lease Agreement", "Equipment Lease Agreement", "Vehicle Lease Agreement"]
    },
    {
      group: "Rental Agreement",
      options: ["Commercial Rental Agreement", "Warehouse Rental Agreement"]
    },
    {
      group: "Construction Agreement",
      options: ["EPC Contract", "Construction Services Agreement", "Renovation Contract"]
    }
  ]
};

export default function ContractCreationWizardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const basePath = pathname?.startsWith('/cm') ? '/cm' : '/admin';
  const { addContract, fetchContracts } = useAppContext();
  const [currentStep, setCurrentStep] = useState(1);
  const [maxReachedStep, setMaxReachedStep] = useState(1);
  const [isCopilotOpen, setIsCopilotOpen] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [requestOptions, setRequestOptions] = useState([]);
  const [selectedRequestId, setSelectedRequestId] = useState('');

  // Step 1: Contract Info State
  const [contractInfo, setContractInfo] = useState({
    title: '',
    category: '',
    contractGroup: '',
    contractType: '',
    template: '',
    jurisdiction: '',
    currency: 'INR',
    language: 'English (US)',
    effectiveDate: '',
    expirationDate: ''
  });

  const isHiringContract = contractInfo.category === 'HR & Employment Contracts';
  const isUnpaidInternship = isHiringContract && (contractInfo.contractType || '').toLowerCase().includes('unpaid internship');

  // Step 2: Parties State (Domain Adaptive)
  const [partyInfo, setPartyInfo] = useState({
    firstPartyName: '',
    firstPartyEntity: '',
    firstPartyAddress: '',
    firstPartyTaxId: '',
    secondPartyName: '',
    secondPartyType: '',
    secondPartyAddress: '',
    secondPartyEmail: '',
    secondPartyPhone: '',
    signatoryName: '',
    signatoryRole: '',
    signatoryEmail: '',
    signatoryAuthority: '',
    hiringDepartment: '',
    reportingManager: '',
    candidateName: '',
    candidateEmail: '',
    candidatePhone: '',
    candidateAddress: '',
    candidateSsn: '',
    hrSignatoryName: '',
    hrSignatoryRole: ''
  });

  // Step 3: Commercials / Compensation State
  const [commercialInfo, setCommercialInfo] = useState({
    totalValue: '',
    currency: 'INR',
    pricingModel: '',
    taxPercent: '',
    discount: '',
    paymentStructure: '',
    advancePayment: '',
    billingFrequency: '',
    lateCharges: '',
    warrantyPeriod: '',
    supportSla: '',
    baseSalary: '',
    payFrequency: '',
    performanceBonus: '',
    equityOptions: '',
    probationPeriod: '',
    healthPerks: ''
  });

  // Step 4: Scope / Job Duties State
  const [scopeSummary, setScopeSummary] = useState('');
  const [deliverables, setDeliverables] = useState([]);
  const [hiringDetails, setHiringDetails] = useState({
    workLocation: '',
    equipment: '',
    workingHours: ''
  });

  // Step 5: Legal Clauses State
  const [clauses, setClauses] = useState([]);

  // Step 6: Milestones / Onboarding Schedule State
  const [milestones, setMilestones] = useState([]);

  // Step 7: Review & AI Copilot Chat State
  const [aiChatMessages, setAiChatMessages] = useState([
    { sender: 'ai', text: 'Hello! I am your AI Contract Copilot. Complete the contract details to generate your draft. How can I assist you?' }
  ]);
  const [userQuery, setUserQuery] = useState('');

  // Fetch Requests on Load
  useEffect(() => {
    APIService.getRequests().then(reqs => {
      if (reqs && reqs.length > 0) {
        setRequestOptions(reqs);
        setSelectedRequestId(reqs[0].id.toString());
      }
    }).catch(() => {});
  }, []);

  // 1. AUTO-FETCH WHEN INTAKE REQUEST REFERENCE IS SELECTED
  const handleRequestSelect = (reqIdStr) => {
    setSelectedRequestId(reqIdStr);
    const req = requestOptions.find(r => r.id.toString() === reqIdStr);
    if (req) {
      setContractInfo(prev => ({
        ...prev,
        title: req.title ? `${req.title} Agreement` : prev.title
      }));
      setPartyInfo(prev => ({
        ...prev,
        secondPartyName: req.client_name || req.requester?.full_name || prev.secondPartyName,
        secondPartyEmail: req.requester?.email || prev.secondPartyEmail,
        candidateName: req.requester?.full_name || prev.candidateName,
        candidateEmail: req.requester?.email || prev.candidateEmail
      }));
      if (req.estimated_cost && !isUnpaidInternship) {
        setCommercialInfo(prev => ({
          ...prev,
          totalValue: req.estimated_cost.toString(),
          baseSalary: req.estimated_cost.toString()
        }));
      }
    }
  };

  // 2. DOMAIN ADAPTATION & AUTO-DEFAULTING (UNPAID INTERNSHIP AUTO ₹0)
  useEffect(() => {
    if (isUnpaidInternship) {
      setCommercialInfo(prev => ({
        ...prev,
        baseSalary: '0',
        payFrequency: 'Unpaid / Academic Credit',
        performanceBonus: '0',
        equityOptions: 'N/A (Unpaid Internship)',
        healthPerks: 'Academic College Credit & Learning Mentorship (No Monetary Compensation)'
      }));

      setScopeSummary(`Unpaid Internship Learning Agreement for ${partyInfo.candidateName} in the ${partyInfo.hiringDepartment} department. Focuses on practical engineering training, mentorship, and college credit completion.`);

      setDeliverables([
        { name: 'Engineering Training & Code Shadowing', description: 'Participate in engineering architecture reviews and code walkthroughs', owner: partyInfo.candidateName, timeline: 'Month 1' },
        { name: 'Supervised Project Contribution', description: 'Develop feature enhancements under senior mentor guidance', owner: partyInfo.candidateName, timeline: 'Month 2' },
        { name: 'Academic Credit Final Presentation', description: 'Present technical learnings and complete university evaluation form', owner: partyInfo.candidateName, timeline: 'Month 3' }
      ]);

      setMilestones([
        { name: 'Day 1 Mentorship & Orientation', deliverable: 'University Academic Agreement Signoff', startDate: '2026-09-01', endDate: '2026-09-01', percentage: 0, amount: 0, department: 'HR & University Relations', status: 'Planned' },
        { name: 'Mid-Term Internship Evaluation', deliverable: 'Progress Report to Academic Advisor', startDate: '2026-10-15', endDate: '2026-10-15', percentage: 0, amount: 0, department: 'Engineering Mentors', status: 'Planned' },
        { name: 'Final Internship Completion', deliverable: 'Academic Credit Certificate Signoff', startDate: '2026-12-01', endDate: '2026-12-01', percentage: 0, amount: 0, department: 'HR Leadership', status: 'Planned' }
      ]);

      setClauses([
        { id: 'unpaid_nature', category: 'Unpaid Academic Internship', text: `This internship is an unpaid learning experience. ${partyInfo.candidateName} acknowledges that no monetary salary, wages, or employee benefits will be provided.`, risk: 'Low Risk', standard: true },
        { id: 'academic_credit', category: 'College Credit & Mentorship', text: `${partyInfo.firstPartyName} agrees to provide academic progress reports and complete university credit evaluation documentation.`, risk: 'Low Risk', standard: true },
        { id: 'hiring_confidentiality', category: 'Intern Confidentiality', text: `${partyInfo.candidateName} agrees to protect all proprietary code, customer data, and trade secrets during and after the internship.`, risk: 'Low Risk', standard: true },
        { id: 'hiring_ip', category: 'Inventions & Training IP', text: `All code and work products created by ${partyInfo.candidateName} during the internship belong exclusively to ${partyInfo.firstPartyName}.`, risk: 'Low Risk', standard: true }
      ]);
    } else if (isHiringContract) {
      if (commercialInfo.baseSalary === '0') {
        setCommercialInfo(prev => ({
          ...prev,
          baseSalary: '1200000',
          payFrequency: 'Monthly',
          performanceBonus: '15',
          equityOptions: '5,000 ESOP Shares',
          healthPerks: 'Comprehensive Health, Dental, Vision & PF Match'
        }));
      }

      setScopeSummary(`Job Description & Duties for ${partyInfo.candidateName} as ${contractInfo.contractType} in the ${partyInfo.hiringDepartment} department under ${partyInfo.reportingManager}.`);
      
      setDeliverables([
        { name: 'Core Software Development Duties', description: 'Design frontend UI components and backend REST APIs', owner: partyInfo.candidateName, timeline: 'Sprint Cycle' },
        { name: 'Technical Architecture & Code Reviews', description: 'Perform peer PR reviews and maintain 90%+ code coverage', owner: partyInfo.candidateName, timeline: 'Ongoing' },
        { name: 'Quarterly Project Milestones', description: 'Deliver quarterly product roadmap Epics', owner: partyInfo.candidateName, timeline: 'Quarterly' }
      ]);

      const baseVal = parseFloat(commercialInfo.baseSalary) || 1200000;
      setMilestones([
        { name: 'Day 1 IT & HR Orientation', deliverable: 'Laptop Setup & Benefits Enrollment', startDate: '2026-09-01', endDate: '2026-09-01', percentage: 10, amount: (baseVal * 0.1), department: 'HR & IT', status: 'Planned' },
        { name: '30-Day Initial Performance Review', deliverable: 'First Sprint Delivery Signoff', startDate: '2026-09-02', endDate: '2026-10-01', percentage: 20, amount: (baseVal * 0.2), department: 'Engineering', status: 'Planned' },
        { name: '90-Day Probation Confirmation', deliverable: 'Full Employee Confirmation & Bonus Eligibility', startDate: '2026-10-02', endDate: '2026-12-01', percentage: 70, amount: (baseVal * 0.7), department: 'HR Leadership', status: 'Planned' }
      ]);

      setClauses([
        { id: 'hiring_confidentiality', category: 'Employee Confidentiality', text: `${partyInfo.candidateName} agrees to keep all trade secrets, source code, and internal customer records confidential.`, risk: 'Low Risk', standard: true },
        { id: 'hiring_ip', category: 'Inventions & IP Assignment', text: `All software, code, and inventions developed by ${partyInfo.candidateName} during employment belong exclusively to ${partyInfo.firstPartyName}.`, risk: 'Low Risk', standard: true },
        { id: 'hiring_noncompete', category: 'Non-Compete & Non-Solicit', text: `${partyInfo.candidateName} agrees not to solicit employees or clients for 12 months post employment under ${contractInfo.jurisdiction} law.`, risk: 'Medium Risk', standard: false },
        { id: 'hiring_termination', category: 'Employment At-Will', text: `Employment is at-will and may be terminated by either ${partyInfo.firstPartyName} or ${partyInfo.candidateName} with 14 days notice.`, risk: 'Low Risk', standard: true }
      ]);
    } else {
      const autoScope = `Scope of Work for ${contractInfo.title} executed under ${contractInfo.contractType} terms. Provider will deliver technical architecture, implementation, and quality signoff.`;
      setScopeSummary(autoScope);

      const fName = partyInfo.firstPartyName || 'MarketBytes CLM Corp';
      const sName = partyInfo.secondPartyName || 'Client Entity';
      const jur = contractInfo.jurisdiction || 'India (New Delhi / Mumbai)';
      const totalVal = parseFloat(commercialInfo.totalValue) || 750000;

      setClauses([
        { id: 'confidentiality', category: 'Confidentiality', text: `Both parties, ${fName} and ${sName}, agree to protect proprietary information for a period of 5 years following disclosure.`, risk: 'Low Risk', standard: true },
        { id: 'ip_rights', category: 'Intellectual Property', text: `All custom deliverables created under this agreement shall belong exclusively to ${sName} upon final payment.`, risk: 'Low Risk', standard: true },
        { id: 'liability', category: 'Limitation of Liability', text: `Neither ${fName} nor ${sName} shall be liable for indirect or consequential damages exceeding total fees under ${jur} governing law.`, risk: 'Medium Risk', standard: false },
        { id: 'indemnity', category: 'Indemnification', text: `${fName} agrees to indemnify ${sName} against third-party IP infringement claims arising from deliverables.`, risk: 'Low Risk', standard: true },
        { id: 'termination', category: 'Termination', text: `Either party (${fName} or ${sName}) may terminate this agreement with 30 days written notice for cause.`, risk: 'Low Risk', standard: true }
      ]);

      setMilestones([
        { name: 'Initial Kickoff & Architecture Specs', deliverable: 'Core Architecture & API Schemas', startDate: '2026-09-01', endDate: '2026-09-15', percentage: 30, amount: (totalVal * 30) / 100, department: 'Engineering', status: 'Planned' },
        { name: 'Phase 1 Frontend & Backend Integration', deliverable: 'Figma UI/UX Prototypes', startDate: '2026-09-16', endDate: '2026-10-10', percentage: 40, amount: (totalVal * 40) / 100, department: 'Engineering', status: 'Planned' },
        { name: 'Final Delivery & Acceptance Signoff', deliverable: 'Production Deployment & Acceptance', startDate: '2026-10-11', endDate: '2026-10-31', percentage: 30, amount: (totalVal * 30) / 100, department: 'DevOps & QA', status: 'Planned' }
      ]);
    }
  }, [contractInfo.category, contractInfo.contractType, contractInfo.title, partyInfo.candidateName, partyInfo.secondPartyName]);

  // 3-Tier Classification Handlers
  const handleCategoryChange = (newCat) => {
    const availableGroups = CONTRACT_TAXONOMY[newCat] || [];
    const firstGroup = availableGroups.length > 0 ? availableGroups[0].group : '';
    const firstType = availableGroups.length > 0 && availableGroups[0].options.length > 0 
      ? availableGroups[0].options[0] 
      : '';

    setContractInfo({
      ...contractInfo,
      category: newCat,
      contractGroup: firstGroup,
      contractType: firstType
    });
  };

  const handleGroupChange = (newGroup) => {
    const categoryGroups = CONTRACT_TAXONOMY[contractInfo.category] || [];
    const foundGroupObj = categoryGroups.find(g => g.group === newGroup);
    const firstType = foundGroupObj && foundGroupObj.options.length > 0 ? foundGroupObj.options[0] : '';

    setContractInfo({
      ...contractInfo,
      contractGroup: newGroup,
      contractType: firstType
    });
  };

  // Step Validation Function
  const validateStep = (stepNum) => {
    if (stepNum === 1) {
      if (!contractInfo.title.trim()) {
        alert("Step 1 Validation Required: Please enter a Contract Title.");
        return false;
      }
      if (!contractInfo.category || !contractInfo.contractGroup || !contractInfo.contractType) {
        alert("Step 1 Validation Required: Please select Category, Classification Group, and Specific Contract Type.");
        return false;
      }
    } else if (stepNum === 2) {
      if (isHiringContract) {
        if (!partyInfo.firstPartyName.trim() || !partyInfo.candidateName.trim() || !partyInfo.candidateEmail.trim()) {
          alert("Step 2 Validation Required: Please enter Company Name, Candidate Full Name, and Candidate Email.");
          return false;
        }
      } else {
        if (!partyInfo.firstPartyName.trim() || !partyInfo.secondPartyName.trim() || !partyInfo.secondPartyEmail.trim()) {
          alert("Step 2 Validation Required: Please enter Legal Names for First Party, Second Party, and Client Email.");
          return false;
        }
      }
    } else if (stepNum === 3) {
      if (!isUnpaidInternship) {
        const val = parseFloat(isHiringContract ? commercialInfo.baseSalary : commercialInfo.totalValue);
        if (isNaN(val) || val <= 0) {
          alert("Step 3 Validation Required: Valuation / Base Salary must be greater than ₹0.");
          return false;
        }
      }
    } else if (stepNum === 4) {
      if (!scopeSummary.trim()) {
        alert("Step 4 Validation Required: Please enter a Scope / Job Summary statement.");
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 7) {
        const next = currentStep + 1;
        setCurrentStep(next);
        if (next > maxReachedStep) setMaxReachedStep(next);
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleStepClick = (targetStep) => {
    if (targetStep <= currentStep) {
      setCurrentStep(targetStep);
      return;
    }
    for (let s = currentStep; s < targetStep; s++) {
      if (!validateStep(s)) return;
    }
    setCurrentStep(targetStep);
    if (targetStep > maxReachedStep) setMaxReachedStep(targetStep);
  };

  const addDeliverableRow = () => {
    setDeliverables([
      ...deliverables,
      { name: 'New Duty / Deliverable', description: 'Requirement description', owner: isHiringContract ? partyInfo.candidateName : 'Lead Role', timeline: 'Quarterly' }
    ]);
  };

  const removeDeliverableRow = (idx) => {
    setDeliverables(deliverables.filter((_, i) => i !== idx));
  };

  const addMilestoneRow = () => {
    const totalVal = isUnpaidInternship ? 0 : parseFloat(isHiringContract ? commercialInfo.baseSalary : commercialInfo.totalValue) || 750000;
    setMilestones([
      ...milestones,
      { name: 'New Milestone / Review', deliverable: 'Deliverable item', startDate: '', endDate: '', percentage: 20, amount: totalVal * 0.2, department: 'General', status: 'Planned' }
    ]);
  };

  const removeMilestoneRow = (idx) => {
    setMilestones(milestones.filter((_, i) => i !== idx));
  };

  const handleAiChatSubmit = (e) => {
    e.preventDefault();
    if (!userQuery.trim()) return;
    const newMsg = { sender: 'user', text: userQuery };
    setAiChatMessages([...aiChatMessages, newMsg]);
    const queryLower = userQuery.toLowerCase();
    setUserQuery('');

    setTimeout(() => {
      let responseText = "I've analyzed your contract parameters against standard policy guidelines. Terms look solid!";
      if (isUnpaidInternship) {
        responseText = `Unpaid Internship terms validated for ${partyInfo.candidateName}. ₹0 monetary compensation set with academic credit & university evaluation milestones.`;
      } else if (queryLower.includes("scope") || queryLower.includes("hiring")) {
        responseText = `Based on uploaded specs, I generated an Employment & Duties SOW for ${partyInfo.candidateName} as ${contractInfo.contractType}.`;
      } else if (queryLower.includes("clause") || queryLower.includes("rewrite")) {
        responseText = `I reviewed Clause #3 (Non-Compete / Liability). Suggest rewording to cap post-employment restrictions to 12 months for standard compliance.`;
      } else if (queryLower.includes("pricing") || queryLower.includes("salary")) {
        responseText = `Base Annual Salary of ₹${parseFloat(commercialInfo.baseSalary || 1200000).toLocaleString()} is within benchmark ranges for ${partyInfo.hiringDepartment}.`;
      }
      setAiChatMessages(prev => [...prev, { sender: 'ai', text: responseText }]);
    }, 800);
  };

  const handleGenerateDraft = async () => {
    for (let s = 1; s <= 6; s++) {
      if (!validateStep(s)) {
        setCurrentStep(s);
        return;
      }
    }
    setGenerating(true);
    try {
      const payload = {
        title: contractInfo.title,
        metadata_data: {
          category: contractInfo.category,
          contract_group: contractInfo.contractGroup,
          contract_type: contractInfo.contractType,
          template: contractInfo.template,
          jurisdiction: contractInfo.jurisdiction,
          effectiveDate: contractInfo.effectiveDate,
          counterparty: isHiringContract ? partyInfo.candidateName : partyInfo.secondPartyName,
          signatory: isHiringContract ? partyInfo.hrSignatoryName : partyInfo.signatoryName,
          isHiringContract,
          isUnpaidInternship,
          partyInfo,
          commercialInfo,
          deliverables,
          clauses,
          scopeSummary
        },
        status: 'Drafting In Progress',
        owner_id: 1,
        value: isUnpaidInternship ? 0 : parseFloat(isHiringContract ? commercialInfo.baseSalary : commercialInfo.totalValue) || 0,
        ai_summary: scopeSummary
      };

      if (addContract) {
        await addContract(payload);
      } else {
        await APIService.createContract(payload);
      }
      if (fetchContracts) {
        await fetchContracts();
      }
      alert("Success! Contract v0.1 Initial Draft created and saved. Transitioning to Drafting Workspace...");
      router.push(`${basePath}/drafting`);
    } catch (err) {
      console.error("Failed to generate contract draft:", err);
      alert(`Failed to generate contract draft: ${err.message || 'Unknown error'}`);
    } finally {
      setGenerating(false);
    }
  };

  const stepsList = [
    { step: 1, title: 'Contract Info' },
    { step: 2, title: isHiringContract ? 'Employer & Candidate' : 'Parties & Signatories' },
    { step: 3, title: isUnpaidInternship ? 'Academic Credit Details' : isHiringContract ? 'Compensation & Perks' : 'Commercial Details' },
    { step: 4, title: isHiringContract ? 'Duties & Equipment' : 'Scope & Deliverables' },
    { step: 5, title: 'Legal Clauses' },
    { step: 6, title: isUnpaidInternship ? 'Academic Milestones' : isHiringContract ? 'Onboarding Timeline' : 'Milestones & Payments' },
    { step: 7, title: 'Review & AI Validation' }
  ];

  const availableGroups = CONTRACT_TAXONOMY[contractInfo.category] || [];
  const currentGroupObj = availableGroups.find(g => g.group === contractInfo.contractGroup) || availableGroups[0] || { group: '', options: [] };
  const availableTypes = currentGroupObj.options || [];

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto p-4 md:p-6">
      
      {/* TOP HEADER & PROGRESS STEPPER */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">Create New Contract</h1>
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                  isUnpaidInternship ? 'bg-blue-100 text-blue-800 border border-blue-300' : isHiringContract ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
                }`}>
                  {isUnpaidInternship ? 'Unpaid Academic Internship Mode (₹0)' : isHiringContract ? 'Hiring & Employment Form Mode' : 'Screen 3.0: Commercial Contract Wizard'}
                </span>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                  Draft
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isUnpaidInternship ? 'Generate unpaid internship training agreements, university credit signoffs, and mentorship milestones.' : isHiringContract ? 'Generate offer letters, employment agreements, non-competes, and onboarding schedules.' : 'Map approved intake data & dependency outputs into legal contract templates.'}
              </p>
            </div>
          </div>

          {/* Request Reference Selector & Actions */}
          <div className="flex items-center gap-2">
            {requestOptions.length > 0 && (
              <select
                value={selectedRequestId}
                onChange={(e) => handleRequestSelect(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs bg-white font-bold text-slate-800"
              >
                {requestOptions.map(r => (
                  <option key={r.id} value={r.id}>Ref Request: {r.tracking_id || `REQ-${r.id}`} - {r.title}</option>
                ))}
              </select>
            )}

            {/* TOGGLE HIDE / SHOW AI COPILOT BUTTON */}
            <button
              type="button"
              onClick={() => setIsCopilotOpen(!isCopilotOpen)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                isCopilotOpen ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              {isCopilotOpen ? 'Hide AI Copilot ➔' : '✨ Show AI Copilot'}
            </button>

            <button
              type="button"
              className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Save Draft
            </button>
            <Link
              href={`${basePath}/contracts`}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
            >
              Exit Wizard
            </Link>
          </div>
        </div>

        {/* Horizontal 7-Step Progress Stepper with Step Locking */}
        <div className="pt-3 border-t border-slate-100">
          <div className="grid grid-cols-7 gap-1 text-center">
            {stepsList.map(s => {
              const isCurrent = currentStep === s.step;
              const isPassed = currentStep > s.step;
              const isLocked = s.step > maxReachedStep && s.step > currentStep + 1;

              return (
                <button
                  key={s.step}
                  onClick={() => handleStepClick(s.step)}
                  className={`py-2 px-1 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/50'
                      : isPassed
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : isLocked
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-mono font-bold">Step {s.step}</span>
                    {isPassed && <Check className="w-3 h-3 text-emerald-600" />}
                    {isLocked && <Lock className="w-3 h-3 text-slate-400" />}
                  </div>
                  <span className="truncate w-full text-[11px]">{s.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* MAIN SPLIT LAYOUT: Dynamic Full-Width Expansion when Copilot is Closed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ========================================================================= */}
        {/* LEFT PANEL: Multi-Step Contract Creation Wizard (Expands 8 -> 12 cols) */}
        {/* ========================================================================= */}
        <div className={`${isCopilotOpen ? 'lg:col-span-8' : 'lg:col-span-12'} transition-all duration-300 flex flex-col gap-6`}>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-6">
            
            {/* STEP 1: CONTRACT INFORMATION */}
            {currentStep === 1 && (
              <div className="flex flex-col gap-5">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wider">Step 1: Contract Primary Information</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Captures primary metadata, category classification, and template governance selection.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Contract Title *</label>
                    <input
                      type="text"
                      required
                      value={contractInfo.title}
                      onChange={(e) => setContractInfo({ ...contractInfo, title: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* 3-TIER CASCADING CLASSIFICATION BOXES */}
                  <div className="col-span-2 bg-blue-50/40 p-4 rounded-xl border border-blue-100 flex flex-col gap-3">
                    <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                      Contract Classification Taxonomy
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* BOX 1: CONTRACT CATEGORY */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">1. Contract Category *</label>
                        <select
                          value={contractInfo.category}
                          onChange={(e) => handleCategoryChange(e.target.value)}
                          className="w-full border border-blue-300 rounded-lg px-2.5 py-2 text-xs bg-white font-bold text-blue-700 focus:ring-2 focus:ring-blue-500 shadow-sm"
                        >
                          {Object.keys(CONTRACT_TAXONOMY).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      {/* BOX 2: CONTRACT CLASSIFICATION GROUP */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">2. Classification Group *</label>
                        <select
                          value={contractInfo.contractGroup}
                          onChange={(e) => handleGroupChange(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg px-2.5 py-2 text-xs bg-white font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-sm"
                        >
                          {availableGroups.map(g => (
                            <option key={g.group} value={g.group}>{g.group}</option>
                          ))}
                        </select>
                      </div>

                      {/* BOX 3: SPECIFIC CONTRACT TYPE */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">3. Specific Contract Type *</label>
                        <select
                          value={contractInfo.contractType}
                          onChange={(e) => setContractInfo({ ...contractInfo, contractType: e.target.value })}
                          className="w-full border border-emerald-300 rounded-lg px-2.5 py-2 text-xs bg-white font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500 shadow-sm"
                        >
                          {availableTypes.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Contract Template *</label>
                    <select
                      value={contractInfo.template}
                      onChange={(e) => setContractInfo({ ...contractInfo, template: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white font-semibold text-slate-800"
                    >
                      <option value="Company Standard Template">Company Standard Template (2026)</option>
                      <option value="AI Generated">AI Dynamic Template Generator</option>
                      <option value="Blank Contract">Blank Custom Contract</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Governing Jurisdiction *</label>
                    <select
                      value={contractInfo.jurisdiction}
                      onChange={(e) => setContractInfo({ ...contractInfo, jurisdiction: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white font-semibold text-slate-800"
                    >
                      <option value="India (New Delhi / Mumbai)">India (New Delhi / Mumbai)</option>
                      <option value="Delaware, USA">Delaware, USA</option>
                      <option value="California, USA">California, USA</option>
                      <option value="United Kingdom">United Kingdom</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Effective Date</label>
                    <input
                      type="date"
                      value={contractInfo.effectiveDate}
                      onChange={(e) => setContractInfo({ ...contractInfo, effectiveDate: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Expiration / Delivery Target Date</label>
                    <input
                      type="date"
                      value={contractInfo.expirationDate}
                      onChange={(e) => setContractInfo({ ...contractInfo, expirationDate: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: PARTIES & SIGNATORIES */}
            {currentStep === 2 && (
              <div className="flex flex-col gap-5">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wider">
                    {isHiringContract ? 'Step 2: Employer Entity & Candidate Details' : 'Step 2: Parties & Authorized Signatories'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isHiringContract ? 'Defines the hiring corporate entity and candidate personal details.' : 'Defines corporate entities and legally authorized signing representatives.'}
                  </p>
                </div>

                {isHiringContract ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 flex flex-col gap-3">
                      <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider border-b border-emerald-200 pb-1 flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4 text-emerald-600" /> Section A: Employer & Hiring Entity
                      </span>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Company / Employer Name *</label>
                        <input
                          type="text"
                          required
                          value={partyInfo.firstPartyName}
                          onChange={(e) => setPartyInfo({ ...partyInfo, firstPartyName: e.target.value })}
                          className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Hiring Department</label>
                        <input
                          type="text"
                          value={partyInfo.hiringDepartment}
                          onChange={(e) => setPartyInfo({ ...partyInfo, hiringDepartment: e.target.value })}
                          className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Reporting Manager</label>
                        <input
                          type="text"
                          value={partyInfo.reportingManager}
                          onChange={(e) => setPartyInfo({ ...partyInfo, reportingManager: e.target.value })}
                          className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white"
                        />
                      </div>
                    </div>

                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-200 flex flex-col gap-3">
                      <span className="text-xs font-bold text-blue-900 uppercase tracking-wider border-b border-blue-200 pb-1 flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-blue-600" /> Section B: Candidate / Intern Details
                      </span>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Candidate / Intern Full Name *</label>
                        <input
                          type="text"
                          required
                          value={partyInfo.candidateName}
                          onChange={(e) => setPartyInfo({ ...partyInfo, candidateName: e.target.value })}
                          className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Personal Email Address *</label>
                        <input
                          type="email"
                          required
                          value={partyInfo.candidateEmail}
                          onChange={(e) => setPartyInfo({ ...partyInfo, candidateEmail: e.target.value })}
                          className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Contact Phone Number</label>
                        <input
                          type="text"
                          value={partyInfo.candidatePhone}
                          onChange={(e) => setPartyInfo({ ...partyInfo, candidatePhone: e.target.value })}
                          className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white"
                        />
                      </div>
                    </div>

                    <div className="col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col gap-3">
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Section C: Authorized HR Signatories & Candidate Info
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">HR Signatory Name</label>
                          <input
                            type="text"
                            value={partyInfo.hrSignatoryName}
                            onChange={(e) => setPartyInfo({ ...partyInfo, hrSignatoryName: e.target.value })}
                            className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">HR Title / Role</label>
                          <input
                            type="text"
                            value={partyInfo.hrSignatoryRole}
                            onChange={(e) => setPartyInfo({ ...partyInfo, hrSignatoryRole: e.target.value })}
                            className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Candidate Tax ID / PAN Card</label>
                          <input
                            type="text"
                            value={partyInfo.candidateSsn}
                            onChange={(e) => setPartyInfo({ ...partyInfo, candidateSsn: e.target.value })}
                            className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col gap-3">
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                        Section A: First Party (Service Provider)
                      </span>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Company Name *</label>
                        <input
                          type="text"
                          required
                          value={partyInfo.firstPartyName}
                          onChange={(e) => setPartyInfo({ ...partyInfo, firstPartyName: e.target.value })}
                          className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Registered Tax / Reg ID</label>
                        <input
                          type="text"
                          value={partyInfo.firstPartyTaxId}
                          onChange={(e) => setPartyInfo({ ...partyInfo, firstPartyTaxId: e.target.value })}
                          className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col gap-3">
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                        Section B: Second Party (Client / Customer)
                      </span>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Client Legal Name *</label>
                        <input
                          type="text"
                          required
                          value={partyInfo.secondPartyName}
                          onChange={(e) => setPartyInfo({ ...partyInfo, secondPartyName: e.target.value })}
                          className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Primary Contact Email *</label>
                        <input
                          type="email"
                          required
                          value={partyInfo.secondPartyEmail}
                          onChange={(e) => setPartyInfo({ ...partyInfo, secondPartyEmail: e.target.value })}
                          className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
                        />
                      </div>
                    </div>

                    <div className="col-span-2 bg-blue-50/50 p-4 rounded-xl border border-blue-200 flex flex-col gap-3">
                      <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                        Section C: Client Authorized Signatory
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Signatory Name *</label>
                          <input
                            type="text"
                            required
                            value={partyInfo.signatoryName}
                            onChange={(e) => setPartyInfo({ ...partyInfo, signatoryName: e.target.value })}
                            className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Designation / Title</label>
                          <input
                            type="text"
                            value={partyInfo.signatoryRole}
                            onChange={(e) => setPartyInfo({ ...partyInfo, signatoryRole: e.target.value })}
                            className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Signing Authority Limit</label>
                          <input
                            type="text"
                            value={partyInfo.signatoryAuthority}
                            onChange={(e) => setPartyInfo({ ...partyInfo, signatoryAuthority: e.target.value })}
                            className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: COMMERCIAL DETAILS VS UNPAID INTERNSHIP AUTO-DEFAULT */}
            {currentStep === 3 && (
              <div className="flex flex-col gap-5">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wider">
                    {isUnpaidInternship 
                      ? 'Step 3: Academic Credit & Learning Mentorship Details (₹0 Unpaid)'
                      : isHiringContract 
                      ? 'Step 3: Employee Compensation & Benefits Package' 
                      : 'Step 3: Commercial & Payment Terms'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isUnpaidInternship 
                      ? 'Unpaid Academic Internship - ₹0 monetary compensation (College credit & university mentorship agreement).'
                      : isHiringContract 
                      ? 'Defines base annual salary, bonus structure, stock options, and health benefits.' 
                      : 'Defines contract valuation, pricing structure, and warranty SLA parameters.'}
                  </p>
                </div>

                {isUnpaidInternship ? (
                  <div className="flex flex-col gap-4">
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-center gap-3">
                      <GraduationCap className="w-8 h-8 text-blue-600 shrink-0" />
                      <div>
                        <span className="text-xs font-bold text-blue-900 block">Unpaid Academic Internship Mode Active</span>
                        <p className="text-xs text-blue-700 mt-0.5">
                          Financial compensation fields are automatically defaulted to ₹0. Internship is conducted for academic credit and hands-on technical mentorship.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Base Annual Salary (₹ INR)</label>
                        <input
                          type="text"
                          disabled
                          value="₹0 (Unpaid Academic Credit)"
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-500 bg-slate-100"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Pay Frequency</label>
                        <input
                          type="text"
                          disabled
                          value="Unpaid / Academic Credit"
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 bg-slate-100"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Target Annual Bonus (%)</label>
                        <input
                          type="text"
                          disabled
                          value="0% (N/A)"
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-500 bg-slate-100"
                        />
                      </div>

                      <div className="col-span-3 bg-white p-3.5 rounded-lg border border-slate-200 flex flex-col gap-2">
                        <span className="text-xs font-bold text-slate-800 uppercase">Non-Monetary Mentorship & College Credit Summary</span>
                        <input
                          type="text"
                          value={commercialInfo.healthPerks}
                          onChange={(e) => setCommercialInfo({ ...commercialInfo, healthPerks: e.target.value })}
                          className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                ) : isHiringContract ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Base Annual Salary (₹ INR) *</label>
                      <input
                        type="number"
                        required
                        value={commercialInfo.baseSalary}
                        onChange={(e) => setCommercialInfo({ ...commercialInfo, baseSalary: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Pay Frequency *</label>
                      <select
                        value={commercialInfo.payFrequency}
                        onChange={(e) => setCommercialInfo({ ...commercialInfo, payFrequency: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white font-semibold text-slate-800"
                      >
                        <option value="Monthly">Monthly</option>
                        <option value="Bi-Weekly">Bi-Weekly (Every 2 Weeks)</option>
                        <option value="Semi-Monthly">Semi-Monthly (15th & 30th)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Target Annual Bonus (%)</label>
                      <input
                        type="number"
                        value={commercialInfo.performanceBonus}
                        onChange={(e) => setCommercialInfo({ ...commercialInfo, performanceBonus: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-900"
                      />
                    </div>

                    <div className="col-span-3 bg-emerald-50/40 p-4 rounded-xl border border-emerald-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Equity & ESOP Option Grant</label>
                        <input
                          type="text"
                          value={commercialInfo.equityOptions}
                          onChange={(e) => setCommercialInfo({ ...commercialInfo, equityOptions: e.target.value })}
                          className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs bg-white font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Probation Period Duration</label>
                        <input
                          type="text"
                          value={commercialInfo.probationPeriod}
                          onChange={(e) => setCommercialInfo({ ...commercialInfo, probationPeriod: e.target.value })}
                          className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs bg-white font-semibold"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Health Insurance & Benefits Package Summary</label>
                        <input
                          type="text"
                          value={commercialInfo.healthPerks}
                          onChange={(e) => setCommercialInfo({ ...commercialInfo, healthPerks: e.target.value })}
                          className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs bg-white text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Total Contract Value (₹ INR) *</label>
                      <input
                        type="number"
                        required
                        value={commercialInfo.totalValue}
                        onChange={(e) => setCommercialInfo({ ...commercialInfo, totalValue: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Pricing Model *</label>
                      <select
                        value={commercialInfo.pricingModel}
                        onChange={(e) => setCommercialInfo({ ...commercialInfo, pricingModel: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white font-semibold text-slate-800"
                      >
                        <option value="100% Upfront">100% Upfront</option>
                        <option value="50% Upfront / 50% Completion">50% Upfront / 50% Completion</option>
                        <option value="Milestone-Based Payments">Milestone-Based Payments</option>
                        <option value="Monthly Retainer">Monthly Retainer</option>
                        <option value="Time & Materials (T&M)">Time & Materials (T&M)</option>
                        <option value="Net 30">Net 30</option>
                        <option value="Net 60">Net 60</option>
                        <option value="Custom Schedule">Custom Schedule</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Advance Payment (%)</label>
                      <input
                        type="number"
                        value={commercialInfo.advancePayment}
                        onChange={(e) => setCommercialInfo({ ...commercialInfo, advancePayment: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-900"
                      />
                    </div>

                    <div className="col-span-3 bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Late Payment Charge Terms</label>
                        <input
                          type="text"
                          value={commercialInfo.lateCharges}
                          onChange={(e) => setCommercialInfo({ ...commercialInfo, lateCharges: e.target.value })}
                          className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Warranty & Support SLA</label>
                        <input
                          type="text"
                          value={commercialInfo.supportSla}
                          onChange={(e) => setCommercialInfo({ ...commercialInfo, supportSla: e.target.value })}
                          className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: SCOPE VS JOB DUTIES & EQUIPMENT */}
            {currentStep === 4 && (
              <div className="flex flex-col gap-5">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wider">
                    {isHiringContract ? 'Step 4: Job Duties, Performance KPIs & IT Equipment' : 'Step 4: Scope of Work & Deliverables'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isHiringContract ? 'Detail primary job responsibilities, performance metrics, and equipment provisioning.' : 'Detail scope statement, deliverables list, technical assumptions, and attachments.'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isHiringContract ? 'Job Summary & Key Duties Statement *' : 'Scope of Work Summary Statement *'}
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={scopeSummary}
                    onChange={(e) => setScopeSummary(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-3 text-xs focus:ring-2 focus:ring-blue-500 font-sans"
                  />
                </div>

                {isHiringContract && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Work Location & Remote Model</label>
                      <input
                        type="text"
                        value={hiringDetails.workLocation}
                        onChange={(e) => setHiringDetails({ ...hiringDetails, workLocation: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs bg-white font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Company Laptop & IT Provisioning</label>
                      <input
                        type="text"
                        value={hiringDetails.equipment}
                        onChange={(e) => setHiringDetails({ ...hiringDetails, equipment: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs bg-white"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-semibold text-slate-700">
                      {isHiringContract ? 'Employee Key Performance Indicators (KPIs) Matrix *' : 'Project Deliverables Matrix *'}
                    </label>
                    <button
                      type="button"
                      onClick={addDeliverableRow}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> {isHiringContract ? 'Add KPI Metric' : 'Add Deliverable'}
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-700 uppercase">
                        <tr>
                          <th className="px-3 py-2.5">{isHiringContract ? 'KPI Metric' : 'Deliverable Name'}</th>
                          <th className="px-3 py-2.5">Description</th>
                          <th className="px-3 py-2.5">Owner</th>
                          <th className="px-3 py-2.5 w-24">Review Cycle</th>
                          <th className="px-2 py-2.5 w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {deliverables.map((d, idx) => (
                          <tr key={idx}>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={d.name}
                                onChange={(e) => {
                                  const updated = [...deliverables];
                                  updated[idx].name = e.target.value;
                                  setDeliverables(updated);
                                }}
                                className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs font-semibold"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={d.description}
                                onChange={(e) => {
                                  const updated = [...deliverables];
                                  updated[idx].description = e.target.value;
                                  setDeliverables(updated);
                                }}
                                className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={d.owner}
                                onChange={(e) => {
                                  const updated = [...deliverables];
                                  updated[idx].owner = e.target.value;
                                  setDeliverables(updated);
                                }}
                                className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={d.timeline}
                                onChange={(e) => {
                                  const updated = [...deliverables];
                                  updated[idx].timeline = e.target.value;
                                  setDeliverables(updated);
                                }}
                                className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs font-bold"
                              />
                            </td>
                            <td className="px-2 py-2 text-center">
                              <button
                                type="button"
                                onClick={() => removeDeliverableRow(idx)}
                                className="text-rose-500 hover:text-rose-700 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: LEGAL TERMS & CLAUSES */}
            {currentStep === 5 && (
              <div className="flex flex-col gap-5">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wider">Step 5: Legal Terms & Clause Configuration</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Configure standard and custom legal clauses tailored to contract category.</p>
                </div>

                <div className="flex flex-col gap-3">
                  {clauses.map(clause => (
                    <div key={clause.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900 text-xs">{clause.category}</span>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            clause.risk === 'Low Risk' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {clause.risk}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = clauses.map(c => c.id === clause.id ? { ...c, text: c.text + ' (Simplified by AI Copilot)' } : c);
                              setClauses(updated);
                            }}
                            className="text-[10px] font-bold text-purple-600 hover:text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200"
                          >
                            ✨ AI Simplify Wording
                          </button>
                        </div>
                      </div>
                      <p className="text-slate-700 text-xs bg-white p-2.5 rounded border border-slate-200 font-sans">{clause.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 6: MILESTONES & ONBOARDING TIMELINE */}
            {currentStep === 6 && (
              <div className="flex flex-col gap-5">
                <div className="border-b border-slate-100 pb-3 border-slate-100">
                  <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wider">
                    {isUnpaidInternship
                      ? 'Step 6: Academic Credit & Mentorship Milestones (₹0 Schedule)'
                      : isHiringContract 
                      ? 'Step 6: Onboarding Timeline & Probation Review Schedule' 
                      : 'Step 6: Milestones & Commercial Payment Schedule'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isUnpaidInternship
                      ? 'Define academic credit signoff dates, progress reports, and mentorship evaluation milestones.'
                      : isHiringContract 
                      ? 'Define employee onboarding milestones, IT setup, and 30/90-day evaluation benchmarks.' 
                      : 'Define project phases and commercial payment percentages.'}
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-700">
                    {isUnpaidInternship ? 'Academic Milestone Schedule' : isHiringContract ? 'Onboarding & Probation Schedule' : 'Milestone Payment Breakdown'} *
                  </span>
                  <button
                    type="button"
                    onClick={addMilestoneRow}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> {isHiringContract ? 'Add Onboarding Phase' : 'Add Milestone'}
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-700 uppercase">
                      <tr>
                        <th className="px-3 py-2.5">{isHiringContract ? 'Phase Milestone' : 'Milestone'}</th>
                        <th className="px-3 py-2.5">Deliverable / Objective</th>
                        <th className="px-3 py-2.5 w-20">{isUnpaidInternship ? 'Credit Weight' : isHiringContract ? 'Weight %' : 'Payment %'}</th>
                        <th className="px-3 py-2.5 text-right w-28">{isHiringContract ? 'Value (₹)' : 'Amount (₹)'}</th>
                        <th className="px-2 py-2.5 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {milestones.map((m, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={m.name}
                              onChange={(e) => {
                                const updated = [...milestones];
                                updated[idx].name = e.target.value;
                                setMilestones(updated);
                              }}
                              className="w-full border border-slate-300 rounded px-2 py-1 text-xs font-semibold"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={m.deliverable}
                              onChange={(e) => {
                                const updated = [...milestones];
                                updated[idx].deliverable = e.target.value;
                                setMilestones(updated);
                              }}
                              className="w-full border border-slate-300 rounded px-2 py-1 text-xs font-bold text-blue-700"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              value={m.percentage}
                              onChange={(e) => {
                                const updated = [...milestones];
                                const pct = parseFloat(e.target.value) || 0;
                                const tot = isUnpaidInternship ? 0 : parseFloat(isHiringContract ? commercialInfo.baseSalary : commercialInfo.totalValue) || 750000;
                                updated[idx].percentage = pct;
                                updated[idx].amount = (tot * pct) / 100;
                                setMilestones(updated);
                              }}
                              className="w-full border border-slate-300 rounded px-2 py-1 text-xs text-center font-bold"
                            />
                          </td>
                          <td className="px-3 py-2 text-right font-mono font-bold text-slate-900">
                            ₹{m.amount?.toLocaleString()}
                          </td>
                          <td className="px-2 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeMilestoneRow(idx)}
                              className="text-rose-500 hover:text-rose-700 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* STEP 7: REVIEW & LIVE CONTRACT DOCUMENT PREVIEW */}
            {currentStep === 7 && (
              <div className="flex flex-col gap-6">
                <div className="border-b border-slate-100 pb-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div>
                    <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wider">
                      Step 7: Pre-Draft Review & Live Contract Document Preview
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Inspect the complete formatted legal contract document draft before finalizing and sending to the drafting workspace.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print / Export PDF
                    </button>
                  </div>
                </div>

                {/* QUICK SCORECARD METRICS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-center">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 block">Legal Compliance</span>
                    <span className="text-xl font-bold text-emerald-700">98%</span>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-center">
                    <span className="text-[10px] uppercase font-bold text-blue-800 block">Policy Readiness</span>
                    <span className="text-xl font-bold text-blue-700">95%</span>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 p-3 rounded-xl text-center">
                    <span className="text-[10px] uppercase font-bold text-purple-800 block">Compensation Check</span>
                    <span className="text-xl font-bold text-purple-700">{isUnpaidInternship ? '100% (₹0 Academic)' : '100%'}</span>
                  </div>
                  <div className="bg-slate-900 text-white p-3 rounded-xl text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-300 block">Overall Risk Score</span>
                    <span className="text-xl font-bold text-emerald-400">Low Risk</span>
                  </div>
                </div>

                {/* LIVE FORMATTED LEGAL DOCUMENT PAPER VIEWER */}
                <div className="bg-white border-2 border-slate-300 rounded-xl p-6 md:p-8 shadow-md flex flex-col gap-6 font-serif text-slate-900 relative overflow-hidden">
                  
                  {/* CONFIDENTIAL WATERMARK */}
                  <div className="absolute right-6 top-6 opacity-15 pointer-events-none">
                    <span className="text-3xl md:text-4xl font-extrabold tracking-widest text-slate-400 uppercase font-sans">
                      DRAFT - CONFIDENTIAL
                    </span>
                  </div>

                  {/* DOCUMENT HEADER */}
                  <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 font-sans">
                    <div>
                      <span className="text-xs font-extrabold uppercase tracking-widest text-blue-700">MARKETBYTES CLM LEGAL CONTRACT DRAFT</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">Ref: CTR-2026-PREVIEW | Category: {contractInfo.category}</p>
                    </div>
                    <div className="sm:text-right text-[11px]">
                      <p className="font-bold text-slate-800">Effective Date: {contractInfo.effectiveDate}</p>
                      <p className="text-slate-600">Governing Jurisdiction: {contractInfo.jurisdiction}</p>
                    </div>
                  </div>

                  {/* CONTRACT TITLE */}
                  <div className="text-center my-2">
                    <h1 className="text-lg md:text-xl font-bold uppercase text-slate-900 tracking-wide underline font-sans">
                      {contractInfo.title}
                    </h1>
                    <p className="text-xs text-slate-600 italic mt-1 font-sans">
                      {isUnpaidInternship 
                        ? 'UNPAID ACADEMIC INTERNSHIP & PRACTICAL MENTORSHIP AGREEMENT'
                        : isHiringContract 
                        ? 'EMPLOYMENT & SERVICES AGREEMENT' 
                        : `COMMERCIAL AGREEMENT (${contractInfo.contractType})`}
                    </p>
                  </div>

                  {/* PREAMBLE */}
                  <div className="text-xs leading-relaxed text-slate-800 font-sans">
                    <p>
                      <strong>THIS AGREEMENT</strong> is made and entered into as of <strong>{contractInfo.effectiveDate}</strong>, by and between:
                    </p>
                    <p className="mt-2 pl-3 border-l-2 border-slate-400">
                      <strong>FIRST PARTY (EMPLOYER / PROVIDER):</strong> {partyInfo.firstPartyName}, a {partyInfo.firstPartyEntity || 'Corporation'} located at {partyInfo.firstPartyAddress || 'Wilmington, DE'} (Tax ID: {partyInfo.firstPartyTaxId || 'DE-987654321'}), represented by {partyInfo.hrSignatoryName} ({partyInfo.hrSignatoryRole}).
                    </p>
                    <p className="mt-2 pl-3 border-l-2 border-blue-500">
                      <strong>SECOND PARTY ({isHiringContract ? 'CANDIDATE / INTERN' : 'CLIENT / COUNTERPARTY'}):</strong> {isHiringContract ? partyInfo.candidateName : partyInfo.secondPartyName}, located at {isHiringContract ? partyInfo.candidateAddress : partyInfo.secondPartyAddress} (Email: {isHiringContract ? partyInfo.candidateEmail : partyInfo.secondPartyEmail}).
                    </p>
                  </div>

                  {/* ARTICLE 1: SCOPE OF WORK & DUTIES */}
                  <div className="flex flex-col gap-2 font-sans">
                    <h3 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-300 pb-1">
                      ARTICLE I: SCOPE OF WORK & PRIMARY DUTIES
                    </h3>
                    <p className="text-xs text-slate-700 leading-relaxed font-serif">
                      {scopeSummary}
                    </p>
                    
                    <div className="mt-2 border border-slate-200 rounded-lg overflow-hidden font-sans">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                          <tr>
                            <th className="p-2">{isHiringContract ? 'KPI Metric' : 'Deliverable Name'}</th>
                            <th className="p-2">Description</th>
                            <th className="p-2">Owner</th>
                            <th className="p-2">Cycle</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-slate-700">
                          {deliverables.map((d, i) => (
                            <tr key={i}>
                              <td className="p-2 font-semibold text-slate-900">{d.name}</td>
                              <td className="p-2">{d.description}</td>
                              <td className="p-2">{d.owner}</td>
                              <td className="p-2 font-bold text-blue-700">{d.timeline}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* ARTICLE 2: COMPENSATION & COMMERCIAL TERMS */}
                  <div className="flex flex-col gap-2 font-sans">
                    <h3 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-300 pb-1">
                      ARTICLE II: COMMERCIAL COMPENSATION & FINANCIAL TERMS
                    </h3>
                    {isUnpaidInternship ? (
                      <div className="bg-blue-50/80 p-3 rounded-lg border border-blue-200 text-xs text-blue-950">
                        <p className="font-bold">§ 2.1 Unpaid Academic Credit Terms:</p>
                        <p className="mt-1">
                          This agreement is executed for <strong>₹0 monetary salary</strong>. Compensation is provided solely in the form of university academic college credit, practical technical training, and direct mentorship from {partyInfo.firstPartyName}.
                        </p>
                      </div>
                    ) : isHiringContract ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                        <div><span className="text-slate-500 font-bold">Base Salary:</span> <p className="font-bold text-emerald-700">₹{parseFloat(commercialInfo.baseSalary || 0).toLocaleString('en-US')} / Year</p></div>
                        <div><span className="text-slate-500 font-bold">Pay Frequency:</span> <p className="font-bold text-slate-800">{commercialInfo.payFrequency}</p></div>
                        <div><span className="text-slate-500 font-bold">Target Bonus:</span> <p className="font-bold text-slate-800">{commercialInfo.performanceBonus}% Annual</p></div>
                        <div><span className="text-slate-500 font-bold">Equity:</span> <p className="font-bold text-slate-800">{commercialInfo.equityOptions}</p></div>
                        <div className="col-span-2"><span className="text-slate-500 font-bold">Benefits:</span> <p className="text-slate-800">{commercialInfo.healthPerks}</p></div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                        <div><span className="text-slate-500 font-bold">Total Contract Value:</span> <p className="font-bold text-slate-900">₹{parseFloat(commercialInfo.totalValue || 0).toLocaleString('en-US')}</p></div>
                        <div><span className="text-slate-500 font-bold">Pricing Structure:</span> <p className="font-bold text-slate-800">{commercialInfo.pricingModel}</p></div>
                        <div><span className="text-slate-500 font-bold">Advance Payment:</span> <p className="font-bold text-slate-800">{commercialInfo.advancePayment}%</p></div>
                      </div>
                    )}
                  </div>

                  {/* ARTICLE 3: LEGAL CLAUSES */}
                  <div className="flex flex-col gap-2 font-sans">
                    <h3 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-300 pb-1">
                      ARTICLE III: LEGAL TERMS, CLAUSES & COVENANTS
                    </h3>
                    <div className="flex flex-col gap-2 text-xs font-serif text-slate-800">
                      {clauses.map((c, i) => (
                        <p key={c.id}>
                          <strong>§ 3.{i + 1} {c.category}:</strong> {c.text}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* ARTICLE 4: SIGNATURE BLOCKS */}
                  <div className="pt-6 border-t-2 border-slate-900 font-sans grid grid-cols-2 gap-8 text-xs mt-4">
                    <div className="flex flex-col gap-4">
                      <span className="font-bold text-slate-900 uppercase">IN WITNESS WHEREOF (FIRST PARTY):</span>
                      <div className="border-b border-slate-900 h-10 flex items-end pb-1 font-mono text-slate-400 italic">
                        [ Digital Signature Line ]
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{partyInfo.hrSignatoryName || partyInfo.firstPartyName}</p>
                        <p className="text-slate-600">{partyInfo.hrSignatoryRole || 'Authorized Representative'}</p>
                        <p className="text-slate-500 text-[10px]">Date: ________________________</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <span className="font-bold text-slate-900 uppercase">IN WITNESS WHEREOF (SECOND PARTY):</span>
                      <div className="border-b border-slate-900 h-10 flex items-end pb-1 font-mono text-slate-400 italic">
                        [ Digital Signature Line ]
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{isHiringContract ? partyInfo.candidateName : partyInfo.signatoryName}</p>
                        <p className="text-slate-600">{isHiringContract ? 'Candidate / Intern' : partyInfo.signatoryRole}</p>
                        <p className="text-slate-500 text-[10px]">Date: ________________________</p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* STEP STEPPER BUTTONS */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={currentStep === 1}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                ← Previous Step
              </button>

              {currentStep < 7 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  Next Step →
                </button>
              ) : (
                <PrimaryButton
                  onClick={handleGenerateDraft}
                  disabled={generating}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {generating ? 'Generating v0.1 Initial Draft...' : 'Generate Draft (v0.1)'}
                </PrimaryButton>
              )}
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT PANEL (30%): Persistent & Collapsible AI Contract Copilot Drawer */}
        {/* ========================================================================= */}
        {isCopilotOpen && (
          <div className="lg:col-span-4 transition-all duration-300 flex flex-col gap-4">
            <div className="bg-gradient-to-b from-indigo-950 to-slate-900 text-white rounded-xl p-5 shadow-lg border border-indigo-900 flex flex-col gap-4 h-fit sticky top-4">
              
              <div className="flex items-center justify-between border-b border-indigo-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-sm text-white">AI Contract Copilot</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCopilotOpen(false)}
                  className="text-xs font-bold text-indigo-300 hover:text-white bg-indigo-900/80 hover:bg-indigo-800 px-2 py-1 rounded border border-indigo-700 flex items-center gap-1 transition-colors"
                  title="Hide AI Copilot for 100% full width table view"
                >
                  <X className="w-3.5 h-3.5" /> Hide
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">Copilot Assistant Chat</span>
                
                <div className="bg-indigo-950/90 border border-indigo-800/80 rounded-lg p-3 max-h-48 overflow-y-auto flex flex-col gap-2 text-xs">
                  {aiChatMessages.map((msg, i) => (
                    <div key={i} className={`p-2 rounded-lg text-[11px] ${
                      msg.sender === 'user' ? 'bg-indigo-600 text-white self-end ml-4' : 'bg-indigo-900/80 text-indigo-100 self-start mr-4'
                    }`}>
                      {msg.text}
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAiChatSubmit} className="flex gap-1.5 mt-1">
                  <input
                    type="text"
                    placeholder="Ask AI: 'Rewrite terms'..."
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    className="flex-1 bg-indigo-900/40 border border-indigo-700/60 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-indigo-300/50 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg"
                  >
                    Ask
                  </button>
                </form>
              </div>

              <div className="bg-indigo-950/80 p-3.5 rounded-lg border border-indigo-800/80 flex flex-col gap-1.5 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Active Deal Context</span>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Domain Mode:</span>
                  <span className="font-bold text-emerald-400 text-[11px]">{isUnpaidInternship ? 'Unpaid Internship (₹0)' : isHiringContract ? 'Hiring & Employment' : 'Commercial B2B'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">{isHiringContract ? 'Candidate:' : 'Client:'}</span>
                  <span className="font-bold text-white text-[11px] truncate max-w-[140px]">
                    {isHiringContract ? partyInfo.candidateName : partyInfo.secondPartyName}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Contract Type:</span>
                  <span className="font-bold text-indigo-300 text-[11px]">{contractInfo.contractType}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-indigo-800/60">
                  <span className="text-slate-300">{isUnpaidInternship ? 'Compensation:' : isHiringContract ? 'Base Salary:' : 'Contract Value:'}</span>
                  <span className="font-bold text-emerald-400">
                    {isUnpaidInternship ? '₹0 (Unpaid Academic)' : `₹${parseFloat(isHiringContract ? commercialInfo.baseSalary : commercialInfo.totalValue || 750000).toLocaleString('en-US')}`}
                  </span>
                </div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-lg border border-indigo-900 flex flex-col gap-2 text-xs">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">Wizard Progress:</span>
                  <span className="font-bold text-indigo-300">{Math.round((currentStep / 7) * 100)}% Complete</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5">
                  <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${(currentStep / 7) * 100}%` }}></div>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                  <span>Draft Readiness Score:</span>
                  <span className="font-bold text-emerald-400">98 / 100</span>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
}
