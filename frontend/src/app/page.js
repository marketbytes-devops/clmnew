'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '../context/appContext';
import { getRoleRedirectPath } from '../utils/roleUtils';

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAppContext();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || !user) {
        router.push('/login');
      } else {
        const redirectPath = getRoleRedirectPath(user);
        router.push(redirectPath);
      }
    }
  }, [loading, isAuthenticated, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200 font-medium">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span>Redirecting to your workspace...</span>
      </div>
    </div>
  );
}
