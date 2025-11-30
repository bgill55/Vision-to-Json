import React, { useRef, useState } from 'react';

interface ImageUploadProps {
  onImageSelected: (base64: string, mimeType: string, preview: string) => void;
  isLoading: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelected, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // Extract base64 data and mime type
      const mimeType = result.split(';')[0].split(':')[1];
      const base64Data = result.split(',')[1];
      
      onImageSelected(base64Data, mimeType, result);
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Keyboard accessibility handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        fileInputRef.current?.click();
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleChange}
        accept="image/*"
        className="hidden"
        disabled={isLoading}
        aria-hidden="true"
        tabIndex={-1}
      />
      <div
        role="button"
        aria-label="Upload Image. Drag and drop an image here, or press Enter to select a file."
        tabIndex={isLoading ? -1 : 0}
        onKeyDown={!isLoading ? handleKeyDown : undefined}
        className={`relative flex flex-col items-center justify-center w-full h-64 rounded-xl border-2 border-dashed transition-all duration-200 outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 overflow-hidden ${
          dragActive 
            ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]' 
            : 'border-gray-700 bg-gray-800/50 hover:bg-gray-800 hover:border-gray-600 cursor-pointer'
        } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="text-center px-4 pointer-events-none">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center shadow-md border border-gray-700 text-indigo-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-200">
            <span className="text-indigo-400">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP up to 10MB</p>
        </div>
      </div>
    </div>
  );
};