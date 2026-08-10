"use client";
import React, { useState, useEffect } from 'react';
import { APIService } from '@/service/apiService';
import { Settings, Save, AlertCircle } from 'lucide-react';

export default function AISettingsPage() {
  const [configs, setConfigs] = useState([]);
  const [formData, setFormData] = useState({
    provider: 'openai',
    model_name: 'gpt-4',
    temperature: '0.7',
    max_tokens: 2000,
    api_key_env_var: 'OPENAI_API_KEY'
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const data = await APIService.getAIConfigs();
      setConfigs(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    try {
      await APIService.createAIConfig(formData);
      setSuccessMsg('Configuration saved successfully!');
      fetchConfigs();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <Settings className="w-8 h-8 text-green-600" />
          AI Settings
        </h1>
        <p className="text-slate-600 mt-2">Configure LLM providers and model parameters for the platform.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-xl font-semibold mb-6 border-b pb-4">New Configuration</h2>
          {successMsg && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {successMsg}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Provider</label>
              <select 
                value={formData.provider}
                onChange={(e) => setFormData({...formData, provider: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              >
                <option value="openai">OpenAI</option>
                <option value="gemini">Google Gemini</option>
                <option value="anthropic">Anthropic</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Model Name</label>
              <input 
                type="text" 
                value={formData.model_name}
                onChange={(e) => setFormData({...formData, model_name: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="e.g. gpt-4"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Temperature</label>
              <input 
                type="text" 
                value={formData.temperature}
                onChange={(e) => setFormData({...formData, temperature: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Max Tokens</label>
              <input 
                type="number" 
                value={formData.max_tokens}
                onChange={(e) => setFormData({...formData, max_tokens: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Saving...' : 'Save Configuration'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-xl font-semibold mb-6 border-b pb-4">Active Configurations</h2>
          {configs.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No configurations found.</p>
          ) : (
            <div className="space-y-4">
              {configs.map(config => (
                <div key={config.id} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-slate-800 capitalize">{config.provider} - {config.model_name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${config.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                      {config.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600 flex gap-4">
                    <span>Temp: {config.temperature}</span>
                    <span>Max Tokens: {config.max_tokens}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
