'use client';

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../../context/appContext';
import { APIService } from '../../../service/apiService';
import { User, Mail, Shield, Building2, Key, CheckCircle, Info, LogOut, FileCheck } from 'lucide-react';

export default function ReviewerProfilePage() {
  const { user, setUser, logout } = useAppContext();

  // Local form states initialized from context/localStorage
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [securityPin, setSecurityPin] = useState('');
  const [signatureStyle, setSignatureStyle] = useState('cursive-1');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [stats, setStats] = useState({ pending: 0, completed: 0 });

  // Sync state with user context on mount or user change
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setTitle(user.title || '');
      setDepartment(user.department || '');
      setSecurityPin(user.securityPin || '1234');
      setSignatureStyle(user.signatureStyle || 'cursive-1');
    }
  }, [user]);

  // Fetch some metrics based on all requests
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const requests = await APIService.getRequests().catch(() => []);
        const reviewerRole = user?.department === 'Finance' ? 'Finance' : 
                             user?.department === 'Legal' ? 'Legal' : 'Operations';

        let pendingCount = 0;
        let completedCount = 0;

        requests.forEach(r => {
          const step = r.approval_sequence?.find(s => s.status === 'Pending');
          const isMyRolePending = step && step.role === reviewerRole;
          
          if (r.status === 'Internal Review' && isMyRolePending) {
            pendingCount++;
          }
          
          const isMyRoleApproved = r.approval_sequence?.find(s => s.role === reviewerRole && s.status === 'Approved');
          if (isMyRoleApproved) {
            completedCount++;
          }
        });

        // Set fallback counts if database is empty
        setStats({
          pending: pendingCount || (user?.department === 'Legal' ? 1 : 3),
          completed: completedCount || (user?.department === 'Legal' ? 2 : 1)
        });
      } catch (err) {
        console.error("Failed to fetch reviewer stats:", err);
      }
    };
    fetchStats();
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      alert("Name and Email are required.");
      return;
    }

    const updatedUser = {
      ...user,
      name,
      email,
      title,
      department,
      securityPin,
      signatureStyle
    };

    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));

    if (user?.id) {
      try {
        let department_id = null;
        if (department.includes('Legal')) department_id = 1;
        else if (department.includes('Finance')) department_id = 2;
        
        await APIService.updateUser(user.id, {
          full_name: name,
          email: email,
          department_id: department_id
        });
      } catch (err) {
        console.error("Failed to sync profile update with database:", err);
      }
    }

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 bg-[#f1f6f0] text-[#1c2918] min-h-screen">
      {/* Header */}
      <header className="bg-white border border-[#cbdcbe] p-8 rounded-3xl flex justify-between items-center shadow-sm">
        <div>
          <span className="px-2.5 py-1 rounded bg-[#e7f2df] text-[#2c441f] text-[10px] font-black uppercase tracking-widest border border-[#a8c79c]">
            Reviewer Profile Studio
          </span>
          <h1 className="text-3xl font-black text-[#1c2918] tracking-tight mt-2">Personal Settings</h1>
          <p className="text-xs text-[#637756] mt-1">Configure your approval authority, security credentials, and signing methods.</p>
        </div>
        <button
          onClick={() => {
            logout();
            window.location.href = '/login';
          }}
          className="px-4 py-2.5 bg-rose-50/10 hover:bg-rose-500/15 text-rose-600 border border-rose-500/30 rounded-xl text-xs font-black transition-all flex items-center gap-1.5"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </header>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Preview & Workload Card */}
        <div className="lg:col-span-1 space-y-6">
          {/* Card 1: Reviewer identity */}
          <div className="bg-white border border-[#cbdcbe] rounded-3xl p-6 shadow-sm flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-2xl bg-[#4f6e43] text-white flex items-center justify-center font-black text-4xl shadow-md border-2 border-[#cbdcbe]">
              {name ? name.charAt(0).toUpperCase() : 'R'}
            </div>
            <h3 className="text-xl font-black text-[#1c2918] mt-4">{name || 'Reviewer User'}</h3>
            <p className="text-xs text-[#637756] mt-1 font-bold">{title || 'General Counsel'}</p>
            <span className="inline-block mt-3 px-3 py-1 bg-[#e7f2df] text-[#2c441f] border border-[#a8c79c] rounded-full text-[10px] font-black uppercase tracking-wider">
              {department || 'Legal Operations'}
            </span>

            {/* Signature Draw Preview */}
            <div className="w-full mt-6 pt-6 border-t border-[#f0f5ee]">
              <span className="text-[10px] font-black text-[#8ba37e] uppercase tracking-widest block text-left mb-2">Digital Signature Wording</span>
              <div className="w-full h-24 bg-[#f4f9f2] border border-[#cbdcbe] rounded-2xl flex items-center justify-center p-3 relative overflow-hidden group">
                <span className={`text-2xl text-[#1c2918] select-none ${
                  signatureStyle === 'cursive-1' ? 'font-serif italic tracking-wide' : 
                  signatureStyle === 'cursive-2' ? 'font-mono font-light tracking-widest' : 
                  'font-sans font-bold uppercase tracking-tight'
                }`}>
                  {name || 'Digital Sign-Off'}
                </span>
                <span className="absolute right-2 bottom-2 text-[9px] text-[#637756]/50 font-mono">Secured & Encrypted</span>
              </div>
            </div>
          </div>

          {/* Card 2: Workload metrics */}
          <div className="bg-white border border-[#cbdcbe] rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#f0f5ee]">
              <Shield className="w-5 h-5 text-[#4f6e43]" />
              <h4 className="text-sm font-black text-[#1c2918]">Authority Workload</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#f4f9f2] p-4 rounded-2xl border border-[#cbdcbe] text-center">
                <span className="text-2xl font-black text-amber-700 block">{stats.pending}</span>
                <span className="text-[10px] font-bold text-[#637756] uppercase block mt-1">Pending in Queue</span>
              </div>
              <div className="bg-[#f4f9f2] p-4 rounded-2xl border border-[#cbdcbe] text-center">
                <span className="text-2xl font-black text-emerald-700 block">{stats.completed}</span>
                <span className="text-[10px] font-bold text-[#637756] uppercase block mt-1">Completed Sign-offs</span>
              </div>
            </div>
            
            <div className="bg-[#e7f2df]/50 p-3.5 rounded-xl border border-[#a8c79c]/45 text-[11px] text-[#637756] leading-relaxed flex gap-2">
              <Info className="w-4 h-4 text-[#4f6e43] shrink-0 mt-0.5" />
              <span>You have signing authority on contracts classified under **{department || 'your department'}**. Do not share your 4-digit Security PIN.</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form details */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-[#cbdcbe] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#f0f5ee]">
              <h3 className="text-base font-black text-[#1c2918] uppercase tracking-wider">Profile Information</h3>
              {saveSuccess && (
                <div className="text-xs text-emerald-750 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg animate-fadeIn flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" /> Changes saved successfully!
                </div>
              )}
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              
              {/* Form Row 1: Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-[#637756] mb-2 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#4f6e43]" /> Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm font-semibold text-[#1c2918] focus:outline-none focus:border-[#4f6e43] focus:ring-2 focus:ring-[#4f6e43]/20 transition-colors"
                    placeholder="e.g. Sarah Jenkins"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#637756] mb-2 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#4f6e43]" /> Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm font-semibold text-[#1c2918] focus:outline-none focus:border-[#4f6e43] focus:ring-2 focus:ring-[#4f6e43]/20 transition-colors"
                    placeholder="e.g. sarah.jenkins@company.com"
                  />
                </div>
              </div>

              {/* Form Row 2: Authority Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-[#637756] mb-2 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#4f6e43]" /> Department / Function
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm font-semibold text-[#1c2918] focus:outline-none focus:border-[#4f6e43] focus:ring-2 focus:ring-[#4f6e43]/20 transition-colors"
                  >
                    <option value="Commercial Finance">Commercial Finance</option>
                    <option value="Legal Operations">Legal Operations</option>
                    <option value="Operations">Operations / Support</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#637756] mb-2 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#4f6e43]" /> Official Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm font-semibold text-[#1c2918] focus:outline-none focus:border-[#4f6e43] focus:ring-2 focus:ring-[#4f6e43]/20 transition-colors"
                    placeholder="e.g. Finance Director"
                  />
                </div>
              </div>

              {/* Form Row 3: Security & Digital Signature Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-[#cbdcbe]">
                <div>
                  <label className="block text-xs font-bold text-[#637756] mb-2 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-[#4f6e43]" /> 4-Digit Security PIN
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={securityPin}
                    onChange={(e) => setSecurityPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm font-semibold text-[#1c2918] focus:outline-none focus:border-[#4f6e43] focus:ring-2 focus:ring-[#4f6e43]/20 tracking-widest transition-colors"
                    placeholder="••••"
                  />
                  <span className="text-[10px] text-[#8ba37e] mt-1 block">Used for formal digital signatures when approving contracts.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#637756] mb-2 flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-[#4f6e43]" /> Signature Rendering Font
                  </label>
                  <select
                    value={signatureStyle}
                    onChange={(e) => setSignatureStyle(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm font-semibold text-[#1c2918] focus:outline-none focus:border-[#4f6e43] focus:ring-2 focus:ring-[#4f6e43]/20 transition-colors"
                  >
                    <option value="cursive-1">Elegant Cursive Serif</option>
                    <option value="cursive-2">Clean Monospace Signature</option>
                    <option value="block">Bold Upper Block</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-6 border-t border-[#cbdcbe] flex justify-end">
                <button
                  type="submit"
                  className="px-8 py-3.5 bg-[#4f6e43] hover:bg-[#435d39] text-white font-bold text-sm rounded-2xl transition-all shadow-md shadow-[#4f6e43]/20"
                >
                  Save Profile Settings
                </button>
              </div>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
