
import React, { useRef, ChangeEvent } from 'react';
import { UploadedFile } from '../types';
import { FileIcon, UploadIcon, CloseIcon } from './Icons';

interface SourcePanelProps {
  sources: UploadedFile[];
  onAddSource: (file: UploadedFile) => void;
  onRemoveSource: (index: number) => void;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

const SourcePanel: React.FC<SourcePanelProps> = ({ sources, onAddSource, onRemoveSource }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const base64Data = await fileToBase64(file);
        onAddSource({
          name: file.name,
          type: file.type,
          base64Data,
        });
        if (event.target) {
            event.target.value = ''; // Reset file input
        }
      } catch (error) {
        console.error('Error processing file:', error);
      }
    }
  };

  const handleAddSourceClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="p-4 border-b border-gray-200 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-800">Nguồn</h2>
      </header>
      
      <div className="flex-grow p-4 overflow-y-auto">
        {sources.length === 0 ? (
          <div className="text-center text-gray-500 h-full flex flex-col items-center justify-center">
             <UploadIcon className="w-10 h-10 mb-2 text-gray-400" />
             <p className="text-sm">Chưa có nguồn nào.</p>
             <p className="text-xs mt-1">Thêm một nguồn để bắt đầu.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {sources.map((source, index) => (
              <li key={index} className="p-2 bg-white border border-gray-200 rounded-md flex items-center gap-3 group">
                <FileIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                <span className="text-sm text-gray-700 truncate flex-grow" title={source.name}>
                  {source.name}
                </span>
                <button 
                    onClick={() => onRemoveSource(index)}
                    className="ml-auto p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    aria-label={`Remove ${source.name}`}
                >
                    <CloseIcon className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
        />
        <button
          onClick={handleAddSourceClick}
          className="w-full p-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
        >
          Thêm nguồn
        </button>
      </div>
    </div>
  );
};

export default SourcePanel;