'use client';

import React, { useState } from 'react';
import { useAppContext } from '../../../context/appContext';
import Button from '../../../components/common/Button';

export default function SettingsPage() {
  const { user, setUser, logout } = useAppContext();

  // Local form state initialized from global user context
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  // Success indicator banner state
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    if (!name || !email) {
      alert("Name and Email are required fields.");
      return;
    }

    // Save changes to the global context state
    setUser({
      ...user,
      name,
      email
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-7 min-h-screen bg-[#f1f6f0] text-[#1c2918]">
      {/* Header */}
      <header className="bg-white p-7 rounded-3xl border border-[#cbdcbe] shadow-sm">
        <h1 className="text-3xl font-black text-[#1c2918] tracking-tight">Profile Settings</h1>
        <p className="text-xs font-bold text-[#637756] mt-1">Manage your account profile details.</p>
      </header>

      {/* Settings Form Container */}
      <div className="bg-white rounded-3xl border border-[#cbdcbe] shadow-sm overflow-hidden p-6 sm:p-8 space-y-8">
        
        {/* Profile Card Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5 pb-6 border-b border-[#f0f5ee]">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-[#4f6e43] text-white flex items-center justify-center font-black text-3xl shadow-md">
              {name ? name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-black text-[#1c2918]">{name || 'Requester User'}</h3>
              <p className="text-xs font-bold text-[#637756] mt-0.5">{email || 'user@company.com'}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-[#e7f2df] text-[#2c441f] border border-[#a8c79c] rounded-full text-[10px] font-black uppercase tracking-wider">
                Role: Requester
              </span>
            </div>
          </div>
          <div className="sm:self-start">
            <Button
              variant="secondary"
              onClick={() => {
                logout();
                window.location.href = '/login';
              }}
              className="text-[#a13b3b] font-black text-xs hover:bg-[#faeae5] border border-[#dfacac] px-4 py-2 rounded-xl flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </Button>
          </div>
        </div>

        {/* Success Banner */}
        {saveSuccess && (
          <div className="p-4 bg-[#dcf0d2] border border-[#7ca66c] text-[#284f1b] rounded-2xl text-xs font-black animate-fadeIn flex items-center gap-2">
            <span>✓</span> Profile settings saved successfully! Your default details are synchronized.
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Personal Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#436137] border-b border-[#f0f5ee] pb-2">
              Profile Information
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-black text-[#314627] mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm font-bold text-[#1c2918] focus:outline-none focus:ring-2 focus:ring-[#4f6e43]"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[#314627] mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#f4f9f2] border border-[#cbdcbe] text-sm font-bold text-[#1c2918] focus:outline-none focus:ring-2 focus:ring-[#4f6e43]"
                  placeholder="e.g. john.doe@company.com"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-6 border-t border-[#f0f5ee] flex justify-end">
            <Button
              variant="primary"
              type="submit"
              className="px-8 py-3.5 font-black text-sm shadow-md"
            >
              Save Changes
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
}
