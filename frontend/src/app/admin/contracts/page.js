"use client";
import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Plus, X, Eye, FileText } from 'lucide-react';
import PrimaryButton from '../../../common/buttons/PrimaryButton';
import Link from 'next/link';
import { useAppContext } from '../../../context/appContext';

export default function ContractsList() {
  const { contracts, fetchContracts, addContract } = useAppContext();
  const [selectedIds, setSelectedIds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch contracts on mount
  useEffect(() => {
    fetchContracts();
  }, []);

  // New Contract Form State
  const [formData, setFormData] = useState({ title: '', counterparty: '', value: '', owner: '' });

  const formatRupees = (val) => {
    const num = parseFloat(val) || 0;
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)} Lakhs`;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleCreateContract = async (e) => {
    e.preventDefault();
    const newContractData = {
      title: formData.title,
      metadata_data: { counterparty: formData.counterparty },
      status: 'Drafting In Progress',
      owner_id: 1,
      value: formData.value ? parseFloat(formData.value) : 0,
    };
    try {
      await addContract(newContractData);
      setIsModalOpen(false);
      setFormData({ title: '', counterparty: '', value: '', owner: '' });
    } catch(err) {
      alert("Failed to create contract");
    }
  };

  const filteredContracts = (contracts || []).filter(c => {
    const term = searchTerm.toLowerCase();
    const titleMatch = c.title ? c.title.toLowerCase().includes(term) : false;
    const cp = c.metadata_data?.counterparty || c.counterparty || c.metadata_data?.partyInfo?.secondPartyName || '';
    const cpMatch = cp.toLowerCase().includes(term);
    const statusMatch = (c.status || '').toLowerCase().includes(term);
    return titleMatch || cpMatch || statusMatch;
  });

  return (
    <div className="flex flex-col gap-6 relative font-sans">
      
      {/* Header Area */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contract Management</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage, filter, and track all active contracts across the organization.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/contracts/create"
            className="px-4 py-2.5 bg-[#16a34a] hover:bg-[#15803d] text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> New Contract Request
          </Link>
        </div>
      </div>

      {/* Toolbar (Search & Filters) */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search contracts by title, counterparty, or status..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100">
            <Filter className="w-4 h-4" /> Advanced Filters
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex justify-between items-center">
          <span className="text-sm font-medium text-emerald-800">{selectedIds.length} contracts selected</span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-white border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-700 hover:bg-emerald-100">Reassign Owner</button>
            <button className="px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-100">Bulk Delete</button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[11px] font-extrabold uppercase tracking-wider border-b border-gray-200">
                <th className="p-4 w-12 text-center">
                  <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                </th>
                <th className="p-4 font-bold">Contract Title</th>
                <th className="p-4 font-bold">Counterparty</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Value (INR ₹)</th>
                <th className="p-4 font-bold">Owner</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredContracts.length > 0 ? (
                filteredContracts.map(contract => {
                  const counterpartyName = contract.metadata_data?.counterparty || contract.counterparty || contract.metadata_data?.partyInfo?.secondPartyName || 'Counterparty Entity';
                  const dateStr = contract.updated_at ? new Date(contract.updated_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Recently';

                  return (
                    <tr key={contract.id} className="hover:bg-emerald-50/40 transition-colors group">
                      <td className="p-4 text-center">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          checked={selectedIds.includes(contract.id)}
                          onChange={() => toggleSelect(contract.id)}
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="font-extrabold text-slate-900">{contract.title}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-0.5">Updated {dateStr}</span>
                      </td>
                      <td className="p-4 text-slate-700 font-semibold">
                        {counterpartyName}
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#eaf5ea] text-[#1e5622] border border-emerald-200 inline-block">
                          {contract.status || 'Drafting In Progress'}
                        </span>
                      </td>
                      <td className="p-4 text-emerald-700 font-extrabold">
                        {formatRupees(contract.value || 0)}
                      </td>
                      <td className="p-4 text-slate-600 font-semibold">Sarah Jenkins</td>
                      <td className="p-4 text-right">
                        <button className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No contracts found. Click <b>+ New Contract Request</b> to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Quick Contract Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-slate-50">
              <h2 className="text-base font-bold text-gray-900">Create Quick Contract</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateContract} className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Contract Title *</label>
                <input 
                  required
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g. Hooli Inc Statement of Work (SOW)"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Counterparty *</label>
                <input 
                  required
                  type="text" 
                  value={formData.counterparty}
                  onChange={(e) => setFormData({...formData, counterparty: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g. Hooli Inc"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Contract Value (₹ INR)</label>
                  <input 
                    type="number" 
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="e.g. 500000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Owner</label>
                  <input 
                    type="text" 
                    value={formData.owner}
                    onChange={(e) => setFormData({...formData, owner: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="e.g. Sarah Jenkins"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <PrimaryButton type="submit" className="bg-[#16a34a] hover:bg-[#15803d]">
                  Create Contract
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}
      
    </div>
  );
}
