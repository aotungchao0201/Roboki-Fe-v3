
import React, { useState } from 'react';
import { Message, MessageRole, Citation } from '../types';
import { FileIcon } from './Icons';

const CitationTooltip: React.FC<{ citation: Citation }> = ({ citation }) => {
  return (
    <span className="relative group inline-block cursor-pointer">
      <sup className="bg-gray-200 text-gray-600 rounded-full px-1.5 py-0.5 text-xs font-semibold">
        {citation.index}
      </sup>
      <span
        className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-80 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-xl 
                   opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity pointer-events-none z-10 
                   before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 
                   before:border-8 before:border-transparent before:border-t-gray-900"
      >
        "{citation.text}"
      </span>
    </span>
  );
};

const ParsedMessage: React.FC<{ message: Message }> = ({ message }) => {
  if (!message.text) return null;

  // Regex to split the text by citation markers like [1], [2], etc.
  const parts = message.text.split(/(\[\d+\])/g);

  return (
    <p className="whitespace-pre-wrap">
      {parts.map((part, index) => {
        const match = part.match(/\[(\d+)\]/);
        if (match) {
          const citationIndex = parseInt(match[1], 10);
          const citation = message.citations?.find(c => c.index === citationIndex);
          if (citation) {
            return <CitationTooltip key={index} citation={citation} />;
          }
        }
        return <span key={index}>{part}</span>;
      })}
    </p>
  );
};


const DocumentCard: React.FC<{ title: string; timestamp: string; summary: string; onOpen: () => void; }> = ({ title, timestamp, summary, onOpen }) => {
    const formattedDate = new Date(timestamp).toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        month: 'short',
        day: 'numeric',
    });

    return (
        <div className="bg-gray-100 p-4 rounded-xl my-2 border border-gray-200 w-full">
            <div className="flex items-center gap-3 mb-3">
                <div className="bg-white p-2 rounded-full border border-gray-200">
                    <FileIcon className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                    <p className="font-semibold text-gray-900">{title}</p>
                    <p className="text-xs text-gray-500">{formattedDate}</p>
                </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">{summary}</p>
            <button 
                onClick={onOpen}
                className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors w-full sm:w-auto"
            >
                Mở
            </button>
        </div>
    )
}

interface ChatMessageProps {
    message: Message;
    onOpenDocument?: (docId: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onOpenDocument }) => {
  const isModel = message.role === MessageRole.MODEL;

  // If it's a model message with a document, render the new card
  if (isModel && message.documentId && message.documentTitle && message.summary && message.timestamp && onOpenDocument) {
      return (
         <div className={`flex items-start gap-4 my-4`}>
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white bg-orange-500`}>
                R
            </div>
            <div className={`w-full max-w-2xl`}>
                 <DocumentCard 
                    title={message.documentTitle}
                    timestamp={message.timestamp}
                    summary={message.summary}
                    onOpen={() => onOpenDocument(message.documentId!)}
                />
            </div>
        </div>
      )
  }

  // Otherwise, render a normal chat bubble
  return (
    <div className={`flex items-start gap-4 my-4`}>
      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white ${isModel ? 'bg-orange-500' : 'bg-blue-500'}`}>
        {isModel ? 'R' : 'B'}
      </div>
      <div className={`w-full max-w-2xl`}>
          <div className={`p-4 rounded-lg ${isModel ? 'bg-gray-100 text-gray-800' : 'bg-blue-50 text-gray-800'}`}>
            <div className="prose max-w-none">
               {isModel ? <ParsedMessage message={message} /> : <p>{message.text}</p>}
            </div>
          </div>
      </div>
    </div>
  );
};

export default ChatMessage;