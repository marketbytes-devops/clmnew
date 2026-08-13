'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '../context/appContext';

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, loading, logout } = useAppContext();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Contract Lifecycle Management</h1>
            <p className="text-purple-100 mt-1">Welcome back, {user.fullName}</p>
          </div>
          <button 
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Logout
          </button>
        </div>
        
        <div className="p-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Your Profile Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border border-gray-100 dark:border-gray-600">
              <h3 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold mb-2">Organization</h3>
              <p className="text-lg text-gray-900 dark:text-white font-medium">Organization ID: {user.orgId}</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border border-gray-100 dark:border-gray-600">
              <h3 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold mb-2">Role</h3>
              <div className="flex flex-wrap gap-2">
                {user.roles && user.roles.map(role => (
                  <span key={role.id} className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200 px-3 py-1 rounded-full text-sm font-medium">
                    {role.name}
                  </span>
                ))}
                {(!user.roles || user.roles.length === 0) && (
                  <span className="text-gray-500">No roles assigned</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
