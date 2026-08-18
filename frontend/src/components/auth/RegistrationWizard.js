'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { initiateRegistration, verifyRegistration } from '../../api/auth';
import { useAppContext } from '../../context/appContext';

export default function RegistrationWizard() {
  const router = useRouter();
  const { login } = useAppContext();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Step 1 State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    orgName: '',
    agreeToTerms: false
  });
  
  // Step 2 State
  const [otpCode, setOtpCode] = useState('');

  const handleInitiate = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }
    
    if (!formData.agreeToTerms) {
      return setError("You must agree to the terms");
    }

    setLoading(true);
    try {
      await initiateRegistration({
        full_name: formData.fullName,
        email: formData.email,
        password: formData.password,
        org_name: formData.orgName
      });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to initiate registration');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // First verify OTP which creates the user
      await verifyRegistration({
        email: formData.email,
        otp_code: otpCode
      });
      
      // Then automatically log them in
      const loginData = await import('../../api/auth').then(m => m.loginUser({
        email: formData.email,
        password: formData.password
      }));
      
      login(loginData.user, loginData.access_token);
      router.push('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900 p-4">
      <div className="bg-white border border-gray-100 p-8 rounded-2xl shadow-xl w-full max-w-lg transition-all duration-300 hover:shadow-2xl">
        
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            {step === 1 ? 'Register Organization' : 'Verify Email'}
          </h2>
          <div className="text-sm font-medium text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Step {step} of 2
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-6 text-sm animate-pulse">
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleInitiate} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400"
                  placeholder="Acme Corp"
                  value={formData.orgName}
                  onChange={(e) => setFormData({...formData, orgName: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Work Email</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400"
                placeholder="john@acme.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                />
              </div>
            </div>

            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                id="terms"
                className="w-4 h-4 text-blue-600 bg-gray-50 border-gray-300 rounded focus:ring-blue-500"
                checked={formData.agreeToTerms}
                onChange={(e) => setFormData({...formData, agreeToTerms: e.target.checked})}
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                I agree to the Terms and Conditions
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md transform transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Sending Verification...' : 'Continue'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerify} className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <p className="text-gray-600 text-sm">
              We've sent a 6-digit verification code to <span className="font-semibold text-gray-900">{formData.email}</span>.
            </p>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
              <input
                type="text"
                required
                maxLength={6}
                className="w-full text-center tracking-widest text-2xl px-4 py-4 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400"
                placeholder="000000"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-medium py-3 px-4 rounded-xl transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md transform transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Create Account'}
              </button>
            </div>
          </form>
        )}

        <p className="mt-8 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <button onClick={() => router.push('/login')} className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
