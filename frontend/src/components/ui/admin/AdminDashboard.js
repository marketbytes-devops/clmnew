'use client';

import React from 'react';
import { useAppContext } from '../../../context/appContext';

export default function AdminDashboard() {
  const { user, isAuthenticated, loading } = useAppContext();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your application settings and view system statistics.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">1,248</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Sessions</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">142</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">System Status</h3>
          <div className="flex items-center mt-2">
            <span className="h-3 w-3 rounded-full bg-green-500 inline-block mr-2"></span>
            <p className="text-xl font-semibold text-green-600 dark:text-green-400">Operational</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium text-sm">
            Refresh Analytics
          </button>
          <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors duration-200 font-medium text-sm">
            Manage Permissions
          </button>
          <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors duration-200 font-medium text-sm">
            View Error Logs
          </button>
        </div>
      </div>
    </div>
  );
}
