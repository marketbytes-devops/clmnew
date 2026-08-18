"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RolesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/permissions');
  }, [router]);

  return (
    <div className="p-8 flex items-center justify-center min-h-[50vh] text-slate-500 font-medium">
      Redirecting to Role-Based Permissions...
    </div>
  );
}
