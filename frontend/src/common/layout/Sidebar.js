"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Inbox, 
  FileText, 
  PenTool, 
  CheckSquare, 
  Handshake, 
  Archive, 
  BarChart3, 
  Users, 
  Building2, 
  ShieldAlert, 
  Cpu, 
  Settings 
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Contracts', href: '/admin/contracts', icon: FileText },
  { name: 'Drafting', href: '/admin/drafting', icon: PenTool },
  { name: 'Review', href: '/admin/review', icon: CheckSquare },
  { name: 'Negotiation', href: '/admin/negotiation', icon: Handshake },
  { name: 'Repository', href: '/admin/repository', icon: Archive },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Departments', href: '/admin/departments', icon: Building2 },
  { name: 'Roles', href: '/admin/roles', icon: ShieldAlert },
  { name: 'AI', href: '/admin/ai', icon: Cpu },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen fixed top-0 left-0">
      <div className="h-16 flex items-center justify-center border-b border-slate-700 bg-slate-950">
        <span className="text-xl font-bold text-white tracking-wider flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-500" />
          CLM Admin
        </span>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link 
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-blue-600 text-white font-medium shadow-md' 
                      : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
