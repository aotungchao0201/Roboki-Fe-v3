
import React, { useState, useRef, ChangeEvent } from 'react';
import { SendIcon, AttachmentIcon, MicrophoneIcon, ToolsIcon, CanvasIcon, CloseIcon } from './Icons';
import { Tool } from '../types';

interface ChatInputProps {
    onSendMessage: (prompt: string) => void;
    isLoading: boolean;
    onAttachmentClick: () => void;
    activeTool: Tool | null;
    onToolSelect: (tool: Tool) => void;
    onClearTool: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, onAttachmentClick, activeTool, onToolSelect, onClearTool }) => {
    const [prompt, setPrompt] = useState('');
    const [isToolMenuOpen, setToolMenuOpen] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
   
    const handlePromptChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setPrompt(e.target.value);
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    };

    const handleSend = () => {
        if (isLoading || !prompt.trim()) return;
        onSendMessage(prompt);
        setPrompt('');
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };
    
    const handleToolSelect = (tool: Tool) => {
        onToolSelect(tool);
        setToolMenuOpen(false);
    };

    const toolOptions = [
        { id: Tool.CANVAS, label: 'Canvas', icon: CanvasIcon },
        // Add other tools here when ready
    ];

    return (
        <div className="w-full max-w-3xl mx-auto p-4 bg-white sticky bottom-0">
            <div className="relative">
                 {isToolMenuOpen && (
                    <div className="absolute bottom-full mb-2 w-72 bg-gray-800 text-white rounded-lg shadow-lg p-2">
                        {toolOptions.map((tool) => (
                             <button
                                key={tool.id}
                                onClick={() => handleToolSelect(tool.id)}
                                className={`w-full text-left flex items-center gap-3 p-2 rounded-md hover:bg-gray-700 ${activeTool === tool.id ? 'bg-gray-900' : ''}`}
                            >
                                <tool.icon className="w-5 h-5" />
                                <span>{tool.label}</span>
                            </button>
                        ))}
                    </div>
                )}
                <div className="flex items-end border border-gray-300 rounded-xl p-2 shadow-sm">
                    <div className="flex items-center">
                        <button onClick={onAttachmentClick} className="p-2 text-gray-500 hover:text-gray-800">
                            <AttachmentIcon className="w-5 h-5"/>
                        </button>
                         <button onClick={() => setToolMenuOpen(!isToolMenuOpen)} className="p-2 text-gray-500 hover:text-gray-800">
                            <ToolsIcon className="w-5 h-5"/>
                        </button>
                    </div>

                    {activeTool && (
                        <div className="flex items-center gap-1 bg-blue-100 text-blue-800 text-sm font-semibold px-2 py-1 rounded-md mx-2">
                           <CanvasIcon className="w-4 h-4" />
                           <span>{activeTool}</span>
                           <button onClick={onClearTool} className="ml-1 p-0.5 rounded-full hover:bg-blue-200">
                               <CloseIcon className="w-3 h-3" />
                           </button>
                        </div>
                    )}

                    <textarea
                        ref={textareaRef}
                        value={prompt}
                        onChange={handlePromptChange}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="Nhắn tin với Roboki"
                        className="flex-grow bg-transparent focus:outline-none resize-none px-2 text-gray-800 placeholder-gray-500 max-h-48 overflow-y-auto"
                        rows={1}
                    />
                    <div className="flex items-center gap-1">
                        <button className="p-2 text-gray-500 hover:text-gray-800">
                            <MicrophoneIcon className="w-5 h-5" />
                        </button>
                        <button onClick={handleSend} disabled={isLoading || !prompt.trim()} className="p-2 text-orange-500 disabled:text-gray-400 hover:text-orange-600 transition-colors">
                            <SendIcon className="w-5 h-5"/>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatInput;