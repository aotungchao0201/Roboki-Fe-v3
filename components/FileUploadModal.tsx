
import React, { useState, useCallback, ChangeEvent, DragEvent } from 'react';
import { UploadedFile } from '../types';
import { UploadIcon } from './Icons';

interface FileUploadModalProps {
  onClose: () => void;
  onFileUpload: (file: UploadedFile) => void;
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

const FileUploadModal: React.FC<FileUploadModalProps> = ({ onClose, onFileUpload }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileProcess = async (file: File) => {
    if (file) {
      try {
        const base64Data = await fileToBase64(file);
        onFileUpload({
          name: file.name,
          type: file.type,
          base64Data,
        });
      } catch (error) {
        console.error('Error converting file to base64:', error);
        // Optionally, show an error to the user
      }
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      handleFileProcess(event.target.files[0]);
    }
  };

  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  }, [onFileUpload]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg mx-4 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Tải nguồn lên</h2>
        <p className="text-gray-600 mb-6">Kéo và thả hoặc chọn tệp để tải lên.</p>
        
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-12 transition-colors ${
            isDragging ? 'border-orange-500 bg-orange-50' : 'border-gray-300 bg-gray-50'
          }`}
        >
          <UploadIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileChange}
          />
          <label htmlFor="file-upload" className="font-semibold text-orange-600 hover:text-orange-500 cursor-pointer">
            Chọn tệp
          </label>
          <p className="text-sm text-gray-500 mt-2">hoặc kéo và thả</p>
        </div>
        
        <p className="text-xs text-gray-400 mt-4">Các loại tệp được hỗ trợ: PDF, .txt, Markdown, Âm thanh (ví dụ: mp3), .docx</p>

        <button 
          onClick={onClose}
          className="mt-6 text-sm font-semibold text-gray-500 hover:text-gray-700"
        >
          Hủy
        </button>
      </div>
    </div>
  );
};

export default FileUploadModal;