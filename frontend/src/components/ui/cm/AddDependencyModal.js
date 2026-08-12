import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

export default function AddDependencyModal({ isOpen, onClose, onAdd, requestId }) {
  const [formData, setFormData] = useState({
    department: 'Engineering',
    assignee_name: '',
    task_objective: '',
    sla_deadline: '',
    required_inputs: {
      hours_estimate: true,
      resource_count: true,
      costing: true,
      feasibility_note: true
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onAdd({
        ...formData,
        request_id: requestId
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to add dependency.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const departments = [
    "Engineering", "Design", "Legal", "Finance", "Security", "Compliance"
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Add Dependency</h2>
            <p className="text-xs text-gray-500 mt-1">Assign pre-drafting work to another department</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="add-dep-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Department</label>
                <select 
                  value={formData.department}
                  onChange={e => setFormData({...formData, department: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                >
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Assignee (Approver Role)</label>
                <input 
                  required
                  type="text" 
                  value={formData.assignee_name}
                  onChange={e => setFormData({...formData, assignee_name: e.target.value})}
                  placeholder="e.g. Alex Approver"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Task Objective</label>
              <textarea 
                required
                value={formData.task_objective}
                onChange={e => setFormData({...formData, task_objective: e.target.value})}
                placeholder="Describe what you need them to do or review..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all min-h-[100px] resize-y"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">SLA Deadline</label>
              <input 
                required
                type="datetime-local" 
                value={formData.sla_deadline}
                onChange={e => setFormData({...formData, sla_deadline: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            <div className="pt-4 border-t border-gray-100">
              <label className="block text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider">Required Inputs (Checklist for Approver)</label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries({
                  'hours_estimate': 'Hours Estimate',
                  'resource_count': 'Resource Count',
                  'costing': 'Costing / Budget',
                  'feasibility_note': 'Feasibility Note / Risks'
                }).map(([key, label]) => (
                  <label key={key} className="flex items-center p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors ${
                      formData.required_inputs[key] 
                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                      : 'bg-white border-gray-300 text-transparent'
                    }`}>
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                    <input 
                      type="checkbox" 
                      className="hidden"
                      checked={formData.required_inputs[key]}
                      onChange={e => setFormData({
                        ...formData, 
                        required_inputs: {
                          ...formData.required_inputs,
                          [key]: e.target.checked
                        }
                      })}
                    />
                  </label>
                ))}
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="add-dep-form"
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-600/20 transition-colors disabled:opacity-70 flex items-center gap-2"
          >
            {isSubmitting ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Adding...</>
            ) : "Add Dependency"}
          </button>
        </div>
      </div>
    </div>
  );
}
