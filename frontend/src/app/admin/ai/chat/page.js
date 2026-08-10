"use client";
import React, { useState } from 'react';
import { APIService } from '@/service/api_service';
import { Send, User, Bot, Loader2 } from 'lucide-react';

export default function AIChatPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your AI assistant for the CLM. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await APIService.aiChat(newMessages);
      setMessages([...newMessages, { role: 'assistant', content: response.reply }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 h-[calc(100vh-64px)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">AI Chat Assistant</h1>
        <p className="text-slate-600">Interact with the AI to analyze contracts or generate clauses.</p>
      </div>

      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <Bot className="w-6 h-6 text-blue-600" />
                </div>
              )}
              <div className={`px-5 py-3 rounded-2xl max-w-[80%] ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-sm' 
                  : 'bg-slate-100 text-slate-800 rounded-tl-sm'
              }`}>
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                  <User className="w-6 h-6 text-slate-600" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <Bot className="w-6 h-6 text-blue-600" />
              </div>
              <div className="px-5 py-3 rounded-2xl bg-slate-100 text-slate-800 rounded-tl-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                Thinking...
              </div>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <div className="relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me to review a clause, summarize a contract, or check for compliance..."
              className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
