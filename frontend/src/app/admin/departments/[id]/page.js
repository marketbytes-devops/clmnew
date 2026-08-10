"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Users, Mail, Phone, Building2, Briefcase, ChevronLeft, Calendar, FileText, Settings, ShieldCheck, DollarSign, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { APIService } from '../../../../service/apiService';

export default function DepartmentDetails() {
  const params = useParams();
  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('members');

  const fetchDepartmentDetail = async () => {
    setLoading(true);
    try {
      const data = await APIService.getDepartments();
      const found = (data || []).find(d => d.id === parseInt(params.id) || d.id === params.id);
      if (found) {
        setDepartment(found);
      } else {
        setDepartment({
          id: params.id,
          name: `Department #${params.id}`,
          head: 'Unassigned',
          budgetAllocated: 0,
          slaCompliance: 100,
          description: 'Department details configured via CLM Admin.',
          members: []
        });
      }
    } catch (err) {
      console.error("Failed to fetch department detail", err);
      setDepartment(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartmentDetail();
  }, [params.id]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading department details from backend...</div>;
  }

  if (!department) {
    return (
      <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-gray-200">
        Department record not found in backend database.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 relative">
      
      {/* Navigation Breadcrumb */}
      <div>
        <Link href="/admin/departments" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Departments
        </Link>
      </div>

      {/* Header Area */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{department.name}</h1>
            <p className="text-gray-500 mt-1 text-sm">{department.description || 'Department configured in backend.'}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
          <div className="text-right">
            <span className="text-xs text-gray-400 font-semibold block uppercase">Department Head</span>
            <p className="text-base font-bold text-gray-900">{department.head || 'Unassigned'}</p>
          </div>
          <div className="h-8 w-px bg-gray-200"></div>
          <div className="text-right">
            <span className="text-xs text-gray-400 font-semibold block uppercase">Annual Budget</span>
            <p className="text-base font-bold text-emerald-600">${department.budgetAllocated ? department.budgetAllocated.toLocaleString() : '0'}</p>
          </div>
        </div>
      </div>

      {/* Detail Content Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col gap-6">
        <div className="flex border-b border-gray-200 gap-6">
          <button
            onClick={() => setActiveTab('members')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'members' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Department Members
          </button>
        </div>

        {activeTab === 'members' && (
          <div className="flex flex-col gap-4">
            {department.members && department.members.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {department.members.map((member) => (
                  <div key={member.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex flex-col gap-2">
                    <span className="font-bold text-gray-900 text-sm">{member.name}</span>
                    <span className="text-xs text-gray-500">{member.role}</span>
                    <span className="text-xs text-blue-600">{member.email}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400 border border-dashed border-gray-200 rounded-xl">
                No individual team members assigned to this department in the backend database.
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
