"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Lock, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import PrimaryButton from '../../common/buttons/PrimaryButton';
import { APIService } from '../../service/apiService';

function SetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing token.');
      setVerifying(false);
      setLoading(false);
      return;
    }

    APIService.verifyToken(token)
      .then((data) => {
        setUserEmail(data.email);
        setVerifying(false);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'The invitation link is invalid or has expired.');
        setVerifying(false);
        setLoading(false);
      });
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      await APIService.setPassword(token, password);
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to set password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium">Verifying invitation link...</p>
      </div>
    );
  }

  if (error && !success) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md mx-auto text-center border border-gray-100">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Link</h2>
        <p className="text-gray-500 mb-6">{error}</p>
        <PrimaryButton onClick={() => router.push('/login')} className="w-full justify-center">
          Back to Login
        </PrimaryButton>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md mx-auto text-center border border-gray-100">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Set!</h2>
        <p className="text-gray-500 mb-6">Your password has been successfully saved. You will be redirected to the login page momentarily.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md mx-auto border border-gray-100 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
      
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-blue-100">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Set Your Password</h2>
        <p className="text-sm text-gray-500 mt-2">
          Create a secure password for <strong className="text-gray-800">{userEmail}</strong> to finish setting up your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">New Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Confirm Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="password"
              required
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
            />
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-600 text-sm p-3 rounded-lg border border-rose-100">
            {error}
          </div>
        )}

        <PrimaryButton 
          type="submit" 
          disabled={loading === true}
          className="w-full flex items-center justify-center gap-2 py-3 mt-4 text-sm shadow-md hover:shadow-lg transition-all"
        >
          {loading ? 'Saving...' : 'Set Password'} 
          {!loading && <ArrowRight className="w-4 h-4" />}
        </PrimaryButton>
      </form>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium">Loading...</p>
        </div>
      }>
        <SetPasswordContent />
      </Suspense>
    </div>
  );
}
