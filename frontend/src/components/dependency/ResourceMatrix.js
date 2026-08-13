"use client";

import React from "react";
import { Plus, Trash2, Wand2 } from "lucide-react";

const RATE_CARDS = {
  "UI/UX Design": {
    "Senior Designer": 120,
    "UX Researcher": 95,
    "UI Developer": 105
  },
  "Legal": {
    "Senior Counsel": 250,
    "Paralegal": 90
  },
  "Engineering": {
    "Senior Engineer": 150,
    "DevOps Engineer": 130,
    "QA Engineer": 85
  },
  "Default": {
    "Specialist": 100,
    "Analyst": 75
  }
};

const DEFAULT_TEMPLATES = {
  "UI/UX Design": [
    { role: "Senior Designer", hours: 20, count: 1, timeline: "2 Weeks", rate: 120, cost: 2400 },
    { role: "UX Researcher", hours: 15, count: 1, timeline: "1 Week", rate: 95, cost: 1425 }
  ],
  "Engineering": [
    { role: "Senior Engineer", hours: 40, count: 2, timeline: "3 Weeks", rate: 150, cost: 6000 }
  ],
  "Legal": [
    { role: "Senior Counsel", hours: 5, count: 1, timeline: "3 Days", rate: 250, cost: 1250 }
  ]
};

export default function ResourceMatrix({ resources, onChange, showCost = true, department = "Default", disabled = false, brief }) {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generationStep, setGenerationStep] = React.useState(0);

  const getRateForRole = (role) => {
    const deptRates = RATE_CARDS[department] || RATE_CARDS["Default"];
    return deptRates[role] || 100; // default $100 if not found
  };

  const handleAdd = () => {
    const defaultRole = Object.keys(RATE_CARDS[department] || RATE_CARDS["Default"])[0] || "Specialist";
    const rate = getRateForRole(defaultRole);
    onChange([
      ...resources,
      { role: defaultRole, hours: 0, count: 1, timeline: "1 Week", rate: rate, cost: 0 }
    ]);
  };

  const handleApplyDefaults = () => {
    setIsGenerating(true);
    setGenerationStep(1);
    
    // Simulate thinking process
    setTimeout(() => setGenerationStep(2), 800);
    setTimeout(() => setGenerationStep(3), 1600);
    
    setTimeout(() => {
      const template = DEFAULT_TEMPLATES[department] || DEFAULT_TEMPLATES["UI/UX Design"];
      onChange(template);
      setIsGenerating(false);
      setGenerationStep(0);
    }, 2500);
  };

  const handleUpdate = (index, field, value) => {
    const updated = [...resources];
    updated[index][field] = value;
    
    // Auto update rate if role changes
    if (field === "role") {
      updated[index].rate = getRateForRole(value);
    }
    
    updated[index].cost = updated[index].hours * updated[index].rate;
    onChange(updated);
  };

  const handleRemove = (index) => {
    onChange(resources.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h4 className="text-sm font-semibold text-slate-800">Resource Breakdown</h4>
          {!disabled && resources.length === 0 && (
            <button
              type="button"
              onClick={handleApplyDefaults}
              className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-200 hover:bg-indigo-100 transition"
            >
              <Wand2 className="w-3 h-3" /> Apply {department} Defaults
            </button>
          )}
        </div>
        {!disabled && (
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Add Resource
          </button>
        )}
      </div>

      {!disabled && resources.length === 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 shadow-sm flex items-start gap-3 animate-in slide-in-from-top-2">
          <div className="bg-indigo-100 p-2 rounded-lg shrink-0">
            {isGenerating ? (
              <Wand2 className="w-5 h-5 text-indigo-700 animate-spin" />
            ) : (
              <Wand2 className="w-5 h-5 text-indigo-700" />
            )}
          </div>
          <div className="w-full">
            <h5 className="text-sm font-bold text-indigo-900 mb-1">AI Estimation Copilot</h5>
            
            {isGenerating ? (
              <div className="space-y-1.5 mt-2">
                <p className={`text-xs ${generationStep >= 1 ? 'text-indigo-700 font-bold' : 'text-slate-400'}`}>
                  {generationStep >= 1 ? '✓' : '•'} Analyzing Scope Summary: "{brief?.title || 'Context'}"...
                </p>
                <p className={`text-xs ${generationStep >= 2 ? 'text-indigo-700 font-bold' : 'text-slate-400'}`}>
                  {generationStep >= 2 ? '✓' : '•'} Extracting Client Requirements...
                </p>
                <p className={`text-xs ${generationStep >= 3 ? 'text-indigo-700 font-bold' : 'text-slate-400'}`}>
                  {generationStep >= 3 ? '✓' : '•'} Matching historical {department} data...
                </p>
              </div>
            ) : (
              <>
                <p className="text-xs text-indigo-700 mb-2">
                  💡 <strong>AI Insight:</strong> Based on the scope for <em>"{brief?.title || "this project"}"</em>, similar past deliverables required {department} engagement of ~45 hours.
                </p>
                <button 
                  onClick={handleApplyDefaults}
                  className="text-[11px] font-bold bg-white text-indigo-700 px-3 py-1.5 rounded-md border border-indigo-200 shadow-sm hover:bg-indigo-50 transition"
                >
                  Analyze Brief & Generate Estimate
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-medium">
            <tr>
              <th className="px-4 py-2.5 uppercase tracking-wider text-[10px]">Role / Skill Group</th>
              <th className="px-4 py-2.5 uppercase tracking-wider text-[10px] w-24">Hours</th>
              <th className="px-4 py-2.5 uppercase tracking-wider text-[10px] w-24">Count</th>
              <th className="px-4 py-2.5 uppercase tracking-wider text-[10px]">Timeline</th>
              {showCost && <th className="px-4 py-2.5 uppercase tracking-wider text-[10px] w-24">Rate ($)</th>}
              {showCost && <th className="px-4 py-2.5 uppercase tracking-wider text-[10px] w-28">Total Cost</th>}
              {!disabled && <th className="px-4 py-2.5 w-12"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {resources.map((res, i) => (
              <tr key={i} className="hover:bg-slate-50/50 transition">
                <td className="p-2">
                  <input
                    type="text"
                    value={res.role}
                    disabled={disabled}
                    onChange={(e) => handleUpdate(i, "role", e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    value={res.hours}
                    disabled={disabled}
                    onChange={(e) => handleUpdate(i, "hours", parseFloat(e.target.value) || 0)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    value={res.count}
                    disabled={disabled}
                    onChange={(e) => handleUpdate(i, "count", parseInt(e.target.value) || 1)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    value={res.timeline}
                    disabled={disabled}
                    onChange={(e) => handleUpdate(i, "timeline", e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </td>
                {showCost && (
                  <td className="p-2">
                    <div className="w-full bg-slate-100 text-slate-600 rounded-lg px-3 py-1.5 text-sm border border-slate-200 cursor-not-allowed">
                      ${res.rate}/hr
                    </div>
                  </td>
                )}
                {showCost && (
                  <td className="p-2">
                    <div className="bg-emerald-50 text-emerald-800 font-mono font-bold px-2 py-1.5 rounded-lg border border-emerald-200 text-center">
                      ${(res.cost || 0).toFixed(2)}
                    </div>
                  </td>
                )}
                {!disabled && (
                  <td className="p-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemove(i)}
                      className="text-slate-400 hover:text-rose-600 transition p-1.5 rounded-lg hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {resources.length === 0 && (
              <tr>
                <td colSpan={showCost ? (disabled ? 6 : 7) : (disabled ? 4 : 5)} className="p-6 text-center text-sm text-slate-400 italic">
                  No resources allocated. {disabled ? "" : 'Click "Add Resource" to start building your estimate.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
