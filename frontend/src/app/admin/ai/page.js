"use client";
import React from 'react';
import Link from 'next/link';
import { Cpu, Settings, MessageSquare, BookOpen } from 'lucide-react';

export default function AIPage() {
  const aiFeatures = [
    {
      title: "AI Chat Assistant",
      description: "Chat with the AI for contract analysis, clause generation, and queries.",
      icon: MessageSquare,
      href: "/admin/ai/chat",
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      title: "Prompt Library",
      description: "Manage system prompts for generation and analysis tasks.",
      icon: BookOpen,
      href: "/admin/ai/prompts",
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    },
    {
      title: "AI Settings",
      description: "Configure models, providers, and API keys for AI integration.",
      icon: Settings,
      href: "/admin/ai/settings",
      color: "text-green-500",
      bg: "bg-green-500/10"
    }
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <Cpu className="w-8 h-8 text-blue-600" />
          AI Capabilities
        </h1>
        <p className="text-slate-600 mt-2">
          Manage all AI-powered features, configurations, and tools across the CLM platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {aiFeatures.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link key={feature.title} href={feature.href}>
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group h-full">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${feature.bg}`}>
                  <Icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
