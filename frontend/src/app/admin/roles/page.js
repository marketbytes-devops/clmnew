"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { APIService } from '@/service/api_service';
import { ShieldAlert, Plus, Edit2, Trash2 } from 'lucide-react';

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const data = await APIService.getAllRoles();
      setRoles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    try {
      await APIService.deleteRole(id);
      fetchRoles();
    } catch (err) {
      alert(err.message || 'Failed to delete role');
    }
  };

  if (loading) return <div className="p-8">Loading roles...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-indigo-600" />
            Role Management
          </h1>
          <p className="text-slate-600 mt-2">Define roles and manage fine-grained access control permissions.</p>
        </div>
        <Link 
          href="/admin/roles/create"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Role
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map(role => (
          <div key={role.id} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-slate-800">{role.name}</h3>
              <div className="flex gap-2 text-slate-400">
                <Link href={`/admin/roles/create?id=${role.id}`} className="hover:text-indigo-600 transition-colors">
                  <Edit2 className="w-4 h-4" />
                </Link>
                <button onClick={() => handleDelete(role.id)} className="hover:text-red-600 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-slate-600 flex-1 mb-6 text-sm">{role.description || "No description provided."}</p>
            
            <div className="border-t border-slate-100 pt-4">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Permissions Overview</h4>
              {role.permissions ? (
                <div className="flex flex-wrap gap-1">
                  {Object.keys(role.permissions).slice(0, 3).map(module => (
                    <span key={module} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full capitalize">
                      {module}
                    </span>
                  ))}
                  {Object.keys(role.permissions).length > 3 && (
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                      +{Object.keys(role.permissions).length - 3} more
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-sm text-slate-400 italic">No custom permissions configured.</span>
              )}
            </div>
          </div>
        ))}
        {roles.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-200 border-dashed">
            No roles found. Create one to get started.
          </div>
        )}
      </div>
    </div>
  );
}
