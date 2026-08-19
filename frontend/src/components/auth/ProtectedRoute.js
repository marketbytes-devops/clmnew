'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '../../context/appContext';
import { getUserRole, getRoleRedirectPath } from '../../utils/roleUtils';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAppContext();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || !user) {
        router.push('/login');
        return;
      }

      const role = getUserRole(user).toLowerCase().replace(/_/g, ' ');
      const isAdmin = role.includes('admin');
      const isAllowed = isAdmin || allowedRoles.length === 0 || allowedRoles.some(r => {
        const normalized = r.toLowerCase().replace(/_/g, ' ');
        return role.includes(normalized) || normalized.includes(role);
      });

      if (!isAllowed) {
        const allowedPath = getRoleRedirectPath(user);
        router.push(allowedPath);
      }
    }
  }, [loading, isAuthenticated, user, allowedRoles, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-gray-600 font-medium">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Verifying access permissions...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const role = getUserRole(user).toLowerCase().replace(/_/g, ' ');
  const isAdmin = role.includes('admin');
  const isAllowed = isAdmin || allowedRoles.length === 0 || allowedRoles.some(r => {
    const normalized = r.toLowerCase().replace(/_/g, ' ');
    return role.includes(normalized) || normalized.includes(role);
  });

  if (!isAllowed) {
    return null;
  }

  return <>{children}</>;
}
