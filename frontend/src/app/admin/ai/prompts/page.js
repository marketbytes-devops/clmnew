"use client";
import React, { useState, useEffect } from 'react';
import { APIService } from '@/service/api_service';
import { BookOpen, Plus, Save } from 'lucide-react';

export default function AIPromptsPage() {
  const [prompts, setPrompts] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    prompt_template: ''
  });

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const data = await APIService.getAIPrompts();
      setPrompts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await APIService.createAIPrompt(formData);
      setIsFormOpen(false);
      setFormData({ name: '', description: '', prompt_template: '' });
      fetchPrompts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-purple-600" />
            Prompt Library
          </h1>
          <p className="text-slate-600 mt-2">Manage system prompts used for various AI tasks.</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Prompt
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Prompt</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input 
                type="text" required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="e.g. Contract_Summary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <input 
                type="text" 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="Brief description of what this prompt does"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Template</label>
              <textarea 
                required rows={5}
                value={formData.prompt_template}
                onChange={(e) => setFormData({...formData, prompt_template: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none font-mono text-sm"
                placeholder="You are an expert lawyer... {input}"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Prompt
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {prompts.map(prompt => (
          <div key={prompt.id} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-semibold text-slate-800">{prompt.name}</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${prompt.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                {prompt.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-slate-600 mb-4 text-sm">{prompt.description}</p>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono">
                {prompt.prompt_template.length > 150 
                  ? prompt.prompt_template.substring(0, 150) + '...' 
                  : prompt.prompt_template}
              </pre>
            </div>
          </div>
        ))}
        {prompts.length === 0 && !isFormOpen && (
          <div className="col-span-full text-center py-12 text-slate-500">
            No prompts found. Create one to get started.
          </div>
        )}
      </div>
    </div>
  );
}
