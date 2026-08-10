"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { APIService } from '@/service/apiService';
import { Save, ArrowLeft, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

const MODULES = ['Contracts', 'Users', 'Departments', 'Analytics', 'AI', 'Roles'];
const ACTIONS = ['View', 'Create', 'Edit', 'Delete', 'Approve', 'Reject', 'Archive', 'Restore', 'Export', 'Import', 'Assign'];

function RoleCreateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: {}
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize permissions matrix
    const initPerms = {};
    MODULES.forEach(mod => {
      initPerms[mod.toLowerCase()] = {};
      ACTIONS.forEach(act => {
        initPerms[mod.toLowerCase()][act.toLowerCase()] = false;
      });
    });

    if (editId) {
      fetchRole(editId, initPerms);
    } else {
      setFormData(prev => ({ ...prev, permissions: initPerms }));
    }
  }, [editId]);

  const fetchRole = async (id, initPerms) => {
    try {
      const roles = await APIService.getAllRoles();
      const role = roles.find(r => r.id === parseInt(id));
      if (role) {
        // Merge fetched permissions with the matrix structure
        const mergedPerms = { ...initPerms };
        if (role.permissions) {
          Object.keys(role.permissions).forEach(mod => {
            if (mergedPerms[mod]) {
              Object.keys(role.permissions[mod]).forEach(act => {
                mergedPerms[mod][act] = role.permissions[mod][act];
              });
            }
          });
        }
        setFormData({
          name: role.name,
          description: role.description || '',
          permissions: mergedPerms
        });
      }
    } catch (err) {
      console.error("Failed to fetch role", err);
    }
  };

  const togglePermission = (module, action) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: {
          ...prev.permissions[module],
          [action]: !prev.permissions[module][action]
        }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await APIService.updateRole(editId, formData);
      } else {
        await APIService.createRole(formData);
      }
      router.push('/admin/roles');
    } catch (err) {
      alert(err.message || "Failed to save role");
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/admin/roles" className="text-slate-500 hover:text-indigo-600 flex items-center gap-2 mb-4 transition-colors w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to Roles
        </Link>
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-indigo-600" />
          {editId ? 'Edit Role' : 'Create New Role'}
        </h1>
        <p className="text-slate-600 mt-2">Define the role details and assign fine-grained module access permissions.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-3">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role Name</label>
              <input 
                type="text" required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="e.g. Compliance Officer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <input 
                type="text" 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Brief description of the role's responsibilities"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-lg font-semibold text-slate-800">Permission Matrix</h2>
            <p className="text-sm text-slate-500 mt-1">Configure which actions this role can perform across different modules.</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold sticky left-0 bg-slate-50 border-r border-slate-200 z-10">Module</th>
                  {ACTIONS.map(act => (
                    <th key={act} className="px-4 py-4 font-medium text-center rotate-[-45deg] whitespace-nowrap min-w-[80px]">
                      {act}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MODULES.map((mod, idx) => {
                  const modKey = mod.toLowerCase();
                  return (
                    <tr key={mod} className={`border-b border-slate-100 hover:bg-slate-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                      <td className={`px-6 py-4 font-medium text-slate-800 sticky left-0 border-r border-slate-200 z-10 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                        {mod}
                      </td>
                      {ACTIONS.map(act => {
                        const actKey = act.toLowerCase();
                        const isChecked = formData.permissions[modKey]?.[actKey] || false;
                        return (
                          <td key={act} className="px-4 py-4 text-center">
                            <label className="inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => togglePermission(modKey, actKey)}
                                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                              />
                            </label>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Saving...' : 'Save Role Permissions'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function RoleCreatePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading...</div>}>
      <RoleCreateForm />
    </Suspense>
  );
}
