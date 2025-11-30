import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-gray-900 border-b border-gray-800 py-4 px-6 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-900/20">
            V
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">VisionStruct</h1>
            <p className="text-xs text-gray-400 font-medium">Vision-to-JSON Engine</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="hidden md:flex items-center space-x-1.5 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">MCP Ready</span>
          </div>
          <span className="px-3 py-1 bg-indigo-500/10 text-indigo-300 text-xs font-semibold rounded-full border border-indigo-500/20">
            gemini-3-pro
          </span>
        </div>
      </div>
    </header>
  );
};
