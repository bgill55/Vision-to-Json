import React, { useEffect, useRef, useState } from 'react';

interface BotConsoleProps {
  status: 'idle' | 'analyzing' | 'success' | 'error';
  logs: string[];
}

export const BotConsole: React.FC<BotConsoleProps> = ({ status, logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of logs
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  if (status === 'idle' && logs.length === 0) return null;

  return (
    <div 
      className="bg-gray-900 rounded-xl border border-gray-700 font-mono text-sm overflow-hidden shadow-lg flex flex-col h-64 md:h-auto md:min-h-[160px]"
      role="log" 
      aria-live="polite" 
      aria-label="VisionStruct System Log"
    >
      <div className="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${status === 'analyzing' ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
            <span className="text-gray-300 text-xs font-bold tracking-wider">SYSTEM_LOG</span>
        </div>
        <div className="text-xs text-gray-500">v1.0.0</div>
      </div>
      
      <div className="p-4 overflow-y-auto flex-1 custom-scrollbar space-y-2">
        {logs.length === 0 && status === 'idle' && (
             <div className="text-gray-500 italic">System ready. Awaiting visual input...</div>
        )}
        
        {logs.map((log, index) => (
          <div key={index} className="flex items-start space-x-2 animate-fadeIn">
            <span className="text-indigo-400 select-none">{">"}</span>
            <span className="text-gray-300 break-words">{log}</span>
          </div>
        ))}

        {status === 'analyzing' && (
            <div className="flex items-center space-x-2">
                 <span className="text-green-500 animate-pulse">_</span>
            </div>
        )}
        
        <div ref={bottomRef} />
      </div>
    </div>
  );
};