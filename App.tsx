import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUpload } from './components/ImageUpload';
import { JsonDisplay } from './components/JsonDisplay';
import { BotConsole } from './components/BotConsole';
import { analyzeImageToJSON } from './services/geminiService';

export default function App() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<{ base64: string; mimeType: string } | null>(null);
  const [jsonResult, setJsonResult] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'success' | 'error'>('idle');
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  
  // Rotating status messages to simulate bot thinking
  useEffect(() => {
    if (status !== 'analyzing') return;
    
    setConsoleLogs(["Initiating VisionStruct Protocol...", "Image data received."]);

    const messages = [
      "Performing Macro Sweep...",
      "Identifying global lighting & atmosphere...",
      "Performing Micro Sweep...",
      "Scanning textures & imperfections...",
      "Performing Relationship Sweep...",
      "Mapping spatial connections...",
      "Constructing schema...",
      "Serializing data to JSON..."
    ];
    
    let i = 0;
    const interval = setInterval(() => {
      if (i < messages.length) {
        setConsoleLogs(prev => [...prev, messages[i]]);
        i++;
      }
    }, 1200);
    
    return () => clearInterval(interval);
  }, [status]);

  const handleImageSelect = (base64: string, mimeType: string, preview: string) => {
    setImageData({ base64, mimeType });
    setImagePreview(preview);
    setJsonResult('');
    setStatus('idle');
    setConsoleLogs(["Image loaded. Ready to analyze."]);
  };

  const handleAnalyze = async () => {
    if (!imageData) return;

    setStatus('analyzing');
    try {
      const result = await analyzeImageToJSON(imageData.base64, imageData.mimeType);
      setJsonResult(result);
      setConsoleLogs(prev => [...prev, "Serialization complete.", "Output generated successfully."]);
      setStatus('success');
    } catch (error) {
      console.error(error);
      setJsonResult('Error: Failed to analyze image. Please check your API key and try again.');
      setConsoleLogs(prev => [...prev, "CRITICAL ERROR: Analysis failed.", "Check API connection."]);
      setStatus('error');
    }
  };

  const handleReset = () => {
    setImagePreview(null);
    setImageData(null);
    setJsonResult('');
    setStatus('idle');
    setConsoleLogs([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-gray-100">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8">
        {/* ARIA Live Region for screen readers to announce status changes */}
        <div className="sr-only" aria-live="polite">
            {status === 'analyzing' && "VisionStruct is analyzing the image."}
            {status === 'success' && "Analysis complete. JSON output is available."}
            {status === 'error' && "An error occurred during analysis."}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
          {/* Left Column: Input */}
          <div className="flex flex-col space-y-6">
            
            <div className="bg-gray-900 rounded-2xl shadow-lg border border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs mr-2 font-bold" aria-hidden="true">1</span>
                Input Source
              </h2>
              
              {!imagePreview ? (
                <ImageUpload onImageSelected={handleImageSelect} isLoading={status === 'analyzing'} />
              ) : (
                <div className="relative group rounded-xl overflow-hidden border border-gray-700 bg-gray-800/50">
                  <img 
                    src={imagePreview} 
                    alt="Preview of the uploaded image to be analyzed" 
                    className="w-full h-auto max-h-[500px] object-contain mx-auto"
                  />
                  <div className="absolute top-2 right-2 flex space-x-2">
                     <button 
                      onClick={handleReset}
                      disabled={status === 'analyzing'}
                      className="p-2 bg-gray-900/80 hover:bg-gray-900 text-gray-300 hover:text-white rounded-full shadow-sm backdrop-blur-sm transition-all disabled:opacity-50 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 outline-none border border-gray-700"
                      title="Remove image"
                      aria-label="Remove image and reset"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Action Area with Bot Console */}
            <div className="space-y-4">
                <button
                  onClick={handleAnalyze}
                  disabled={!imageData || status === 'analyzing'}
                  aria-label="Start analysis to generate JSON structure"
                  className={`w-full py-4 px-6 rounded-xl font-bold text-lg shadow-xl transform transition-all duration-200 flex items-center justify-center space-x-2 focus:ring-4 focus:ring-indigo-900 outline-none ${
                    !imageData 
                      ? 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700' 
                      : status === 'analyzing'
                      ? 'bg-indigo-900/50 text-indigo-300 cursor-wait border border-indigo-800'
                      : 'bg-indigo-600 hover:bg-indigo-500 hover:scale-[1.02] text-white active:scale-[0.98] shadow-indigo-900/50 border border-indigo-500'
                  }`}
                >
                  {status === 'analyzing' ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
                        <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                        <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
                      </svg>
                      <span>Analyze Vision Structure</span>
                    </>
                  )}
                </button>

                {/* The Bot Console for System Status */}
                {(status === 'analyzing' || consoleLogs.length > 0) && (
                    <BotConsole status={status} logs={consoleLogs} />
                )}
            </div>
          </div>

          {/* Right Column: Output */}
          <div className="flex flex-col h-full min-h-[500px]">
             <div className="bg-gray-900 rounded-2xl shadow-lg border border-gray-800 p-6 flex flex-col h-full">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs mr-2 font-bold" aria-hidden="true">2</span>
                  JSON Output
                </div>
              </h2>
              
              <div className="flex-1 relative">
                {status === 'idle' && !jsonResult && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-800 rounded-xl bg-gray-800/20">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mb-2 opacity-40" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                    </svg>
                    <p className="text-sm font-medium">Awaiting analysis...</p>
                  </div>
                )}
                
                {jsonResult && (
                   <JsonDisplay data={jsonResult} />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}