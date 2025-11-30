import React, { useState, useEffect, useMemo } from 'react';

interface JsonDisplayProps {
  data: string;
}

type Theme = 'dark' | 'light';
type Indent = 0 | 2 | 4;

export const JsonDisplay: React.FC<JsonDisplayProps> = ({ data }) => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [indent, setIndent] = useState<Indent>(2);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [copied, setCopied] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (!data) {
      setParsedData(null);
      setError(false);
      return;
    }
    try {
      const parsed = JSON.parse(data);
      setParsedData(parsed);
      setError(false);
    } catch (e) {
      setParsedData(data); // Store raw string if parsing fails
      setError(true);
    }
  }, [data]);

  // Format the data string based on indentation preference
  const formattedContent = useMemo(() => {
    if (parsedData === null) return '';
    if (error) return String(parsedData);
    return JSON.stringify(parsedData, null, indent);
  }, [parsedData, error, indent]);

  // Apply syntax highlighting
  const highlightedContent = useMemo(() => {
    if (error || parsedData === null) return formattedContent;
    
    // Escape HTML special characters to prevent injection
    const safeJson = formattedContent
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    // Regex to match JSON tokens
    return safeJson.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
        let cls = '';
        
        // Determine token type
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                // Key
                cls = theme === 'dark' ? 'text-sky-300' : 'text-blue-700';
            } else {
                // String
                cls = theme === 'dark' ? 'text-amber-300' : 'text-green-700';
            }
        } else if (/true|false/.test(match)) {
            // Boolean
            cls = theme === 'dark' ? 'text-rose-400' : 'text-purple-600';
        } else if (/null/.test(match)) {
            // Null
            cls = theme === 'dark' ? 'text-gray-400' : 'text-slate-500';
        } else {
            // Number
            cls = theme === 'dark' ? 'text-emerald-300' : 'text-orange-600';
        }
        return `<span class="${cls}">${match}</span>`;
    });
  }, [formattedContent, error, parsedData, theme]);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!data) return null;

  const lineCount = formattedContent.split('\n').length;
  
  // Theme-based style classes
  const containerClass = theme === 'dark' 
    ? 'bg-[#1e1e1e] border-gray-700' 
    : 'bg-white border-gray-200';
    
  const textClass = theme === 'dark' 
    ? 'text-[#d4d4d4]' 
    : 'text-gray-800';
    
  const gutterClass = theme === 'dark' 
    ? 'bg-[#1e1e1e] text-gray-500 border-gray-700' 
    : 'bg-gray-50 text-gray-400 border-gray-200';
    
  const toolbarClass = theme === 'dark' 
    ? 'bg-[#252526] border-gray-700 text-gray-300' 
    : 'bg-gray-50 border-gray-200 text-gray-600';

  const buttonClass = (active: boolean) => `p-1.5 rounded transition-colors flex items-center justify-center ${active 
    ? (theme === 'dark' ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700') 
    : (theme === 'dark' ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500')}`;

  const indentBtnClass = (size: number) => `text-xs px-2 py-0.5 rounded transition-colors ${indent === size 
    ? (theme === 'dark' ? 'bg-indigo-600 text-white' : 'bg-indigo-500 text-white') 
    : (theme === 'dark' ? 'bg-gray-700 text-gray-400 hover:text-gray-200' : 'bg-gray-200 text-gray-600 hover:text-gray-900')}`;

  return (
    <div className={`w-full h-full flex flex-col rounded-xl overflow-hidden shadow-sm border ${containerClass} transition-colors duration-200`}>
      {/* Toolbar */}
      <div className={`flex items-center justify-between px-3 py-2 border-b ${toolbarClass}`} role="toolbar" aria-label="JSON Viewer Controls">
        <div className="flex items-center space-x-3 md:space-x-4 overflow-x-auto no-scrollbar">
            {/* Theme Toggle */}
            <div className="flex items-center">
              <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
                className={buttonClass(false)} 
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                    </svg>
                )}
              </button>
            </div>
            
            <div className={`h-4 w-px ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}></div>

            {/* Indentation Controls */}
            <div className="flex items-center space-x-2" role="group" aria-label="Indentation Controls">
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-60" aria-hidden="true">Indent</span>
                <button onClick={() => setIndent(0)} className={indentBtnClass(0)} title="Minify JSON" aria-label="Minify JSON">Min</button>
                <button onClick={() => setIndent(2)} className={indentBtnClass(2)} title="Indent 2 spaces" aria-label="Indent 2 spaces">2</button>
                <button onClick={() => setIndent(4)} className={indentBtnClass(4)} title="Indent 4 spaces" aria-label="Indent 4 spaces">4</button>
            </div>

            <div className={`h-4 w-px ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}></div>

            {/* Line Numbers Toggle */}
            <button 
              onClick={() => setShowLineNumbers(!showLineNumbers)} 
              className={`flex items-center space-x-1.5 ${buttonClass(showLineNumbers)}`}
              title="Toggle Line Numbers"
              aria-label={showLineNumbers ? "Hide line numbers" : "Show line numbers"}
              aria-pressed={showLineNumbers}
            >
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                 </svg>
                 <span className="text-xs font-medium hidden sm:inline">Lines</span>
            </button>
            
            {error && (
              <span className="ml-2 text-xs text-red-400 font-mono hidden md:inline-block" role="alert">Invalid JSON</span>
            )}
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          aria-label="Copy to clipboard"
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors border ${
              theme === 'dark' 
              ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-600' 
              : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-300 shadow-sm'
          }`}
        >
          {copied ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 text-green-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <span className="text-green-500">Copied</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Editor Body */}
      <div className={`flex-1 relative overflow-auto custom-scrollbar flex ${textClass}`}>
         {showLineNumbers && (
             <div className={`flex flex-col items-end px-3 py-4 text-xs md:text-sm font-mono select-none border-r ${gutterClass} min-h-full`} aria-hidden="true">
                 {Array.from({ length: lineCount }).map((_, i) => (
                     <div key={i} className="leading-relaxed opacity-50">{i + 1}</div>
                 ))}
             </div>
         )}
         <div className="flex-1 p-4 overflow-auto">
            <pre 
                className="font-mono text-xs md:text-sm leading-relaxed whitespace-pre"
                dangerouslySetInnerHTML={{ __html: highlightedContent }}
                tabIndex={0}
                aria-label="JSON Output"
            />
         </div>
      </div>
    </div>
  );
};