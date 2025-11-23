import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';

interface ApiKeyGuardProps {
  children: (ai: GoogleGenAI) => React.ReactNode;
  fallbackMessage?: string;
}

const ApiKeyGuard: React.FC<ApiKeyGuardProps> = ({ children, fallbackMessage }) => {
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [aiClient, setAiClient] = useState<GoogleGenAI | null>(null);

  const checkKey = async () => {
    if (window.aistudio && window.aistudio.hasSelectedApiKey) {
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasKey(selected);
      if (selected) {
        // When key is selected, we can instantiate the client.
        // The env var process.env.API_KEY is injected by the platform if selected.
        // However, in this specific environment context provided by the prompt instructions:
        // "The selected API key is available via process.env.API_KEY"
        if (process.env.API_KEY) {
           setAiClient(new GoogleGenAI({ apiKey: process.env.API_KEY }));
        }
      }
    }
  };

  useEffect(() => {
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio && window.aistudio.openSelectKey) {
      await window.aistudio.openSelectKey();
      // Assume success and re-check immediately
      await checkKey();
    }
  };

  if (!hasKey || !aiClient) {
    return (
      <div className="flex flex-col items-center justify-center h-96 p-8 glass-panel rounded-2xl text-center space-y-6 border border-indigo-500/30">
        <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11.536 9.464l-2.293 2.293-2.475-2.475-1.71 1.71M9.465 9.464l2.475 2.475M11.536 9.464L7 11.707 4.293 9 7 11.707V17a2 2 0 002 2h2a2 2 0 002-2v-4.586l4.707-4.707C19.071 8.354 19.071 7.646 17.657 6.243A4.001 4.001 0 0015 7z" />
          </svg>
        </div>
        <div>
          <h3 className="text-2xl font-display font-bold text-white mb-2">Premium Feature Access</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            {fallbackMessage || "This feature requires a paid API key from Google Cloud Project."}
          </p>
        </div>
        <button 
          onClick={handleSelectKey}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg font-medium shadow-lg shadow-indigo-500/30 transition-all transform hover:scale-105 active:scale-95"
        >
          Select API Key
        </button>
        <a 
          href="https://ai.google.dev/gemini-api/docs/billing" 
          target="_blank" 
          rel="noreferrer"
          className="text-sm text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
        >
          View Billing Documentation
        </a>
      </div>
    );
  }

  return <>{children(aiClient)}</>;
};

export default ApiKeyGuard;