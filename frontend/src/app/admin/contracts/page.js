"use client";
import React, { useState } from 'react';
import { Search, Filter, MoreVertical, Plus, X } from 'lucide-react';
import PrimaryButton from '../../../common/buttons/PrimaryButton';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useAppContext } from '../../../context/appContext';

export default function ContractsList() {
  const pathname = usePathname();
  const basePath = pathname.startsWith('/cm') ? '/cm' : '/admin';
  const { contracts, fetchContracts, addContract } = useAppContext();
  const [selectedIds, setSelectedIds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch contracts on mount
  React.useEffect(() => {
    fetchContracts();
  }, []);

  // New Contract Form State
  const [formData, setFormData] = useState({ title: '', counterparty: '', value: '', owner: '' });

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleCreateContract = async (e) => {
    e.preventDefault();
    const newContractData = {
      title: formData.title,
      metadata_data: { counterparty: formData.counterparty }, // Store counterparty in JSON metadata
      status: 'Draft',
      owner_id: 1, // Defaulting to 1 since we don't have login yet
      value: formData.value ? parseFloat(formData.value) : null,
    };
    try {
      await addContract(newContractData);
      setIsModalOpen(false);
      setFormData({ title: '', counterparty: '', value: '', owner: '' });
    } catch(err) {
      alert("Failed to create contract");
    }
  };

  return (
    <div className="flex flex-col gap-6 relative">
      
      {/* Header Area */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contract Management</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage, filter, and track all contracts across the organization.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`${basePath}/contracts/create`}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-2xs"
          >
            <Plus className="w-4 h-4" /> New Contract
          </Link>
        </div>
      </div>

      {/* Toolbar (Search & Filters) */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search contracts by title, counterparty, or tags..." 
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">
            <Filter className="w-4 h-4" /> Advanced Filters
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex justify-between items-center">
          <span className="text-sm font-medium text-blue-800">{selectedIds.length} contracts selected</span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-white border border-blue-200 rounded text-sm font-medium text-blue-700 hover:bg-blue-100">Reassign Owner</button>
            <button className="px-3 py-1.5 bg-red-50 border border-red-200 rounded text-sm font-medium text-red-600 hover:bg-red-100">Bulk Delete</button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="p-4 w-12 text-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                </th>
                <th className="p-4 font-medium">Contract Title</th>
                <th className="p-4 font-medium">Counterparty</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Value</th>
                <th className="p-4 font-medium">Owner</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {contracts && contracts.map(contract => (
                <tr key={contract.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="p-4 text-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedIds.includes(contract.id)}
                      onChange={() => toggleSelect(contract.id)}
                    />
                  </td>
                  <td className="p-4">
                    <Link href={`${basePath}/contracts/${contract.id}`} className="font-semibold text-emerald-700 hover:underline block">
                      {contract.title}
                    </Link>
                    <span className="text-xs text-gray-400">Updated {new Date(contract.updated_at).toLocaleDateString()}</span>
                  </td>
                  <td className="p-4 text-gray-600">
                    {contract.metadata_data?.counterparty || 'N/A'}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      contract.status === 'Executed' ? 'bg-green-100 text-green-700' :
                      contract.status === 'Draft' ? 'bg-gray-100 text-gray-700' :
                      contract.status === 'Review' ? 'bg-indigo-100 text-indigo-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {contract.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600 font-medium">
                    {contract.value ? `$${contract.value.toLocaleString()}` : 'N/A'}
                  </td>
                  <td className="p-4 text-gray-600">User #{contract.owner_id || 'N/A'}</td>
                  <td className="p-4 text-right">
                    <button className="p-1.5 text-gray-400 hover:text-gray-700 rounded-md hover:bg-gray-200">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Contract Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">Create New Contract</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateContract} className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contract Title *</label>
                <input 
                  required
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Stark Industries MSA"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Counterparty *</label>
                <input 
                  required
                  type="text" 
                  value={formData.counterparty}
                  onChange={(e) => setFormData({...formData, counterparty: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Stark Industries"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contract Value</label>
                  <input 
                    type="number" 
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. 50000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
                  <input 
                    type="text" 
                    value={formData.owner}
                    onChange={(e) => setFormData({...formData, owner: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. Jane Doe"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <PrimaryButton type="submit">
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
