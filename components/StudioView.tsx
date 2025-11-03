
import React, { useEffect, useRef, useState } from 'react';
import { Message, CanvasTool, UploadedFile, GeneratedDocument, Tool } from '../types';
import ChatMessage from './ChatMessage';
import CanvasEditor from './CanvasEditor';
import ChatInput from './ChatInput';
import SourcePanel from './SourcePanel';
import { FileIcon } from './Icons';

interface StudioViewProps {
  // Document Props
  document: GeneratedDocument;
  isGenerating: boolean;
  isStreaming: boolean;
  onGenerate: (docId: string, content: string, canvasTool: CanvasTool, sources: UploadedFile[]) => void;
  onContentChange: (newContent: string) => void;
  onExit: () => void;
  // Chat Props
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (prompt: string) => void;
  // Sources Props
  sources: UploadedFile[];
  onAddSource: (file: UploadedFile) => void;
  onRemoveSource: (index: number) => void;
  // Tools Props
  activeTool: Tool | null;
  onToolSelect: (tool: Tool) => void;
  onClearTool: () => void;
}

const StudioView: React.FC<StudioViewProps> = (props) => {
    const { 
        document, isGenerating, isStreaming, onGenerate, onContentChange, onExit,
        messages, isLoading, onSendMessage,
        sources, onAddSource, onRemoveSource,
        activeTool, onToolSelect, onClearTool
    } = props;
    
    const [isSourcePanelOpen, setIsSourcePanelOpen] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    return (
        <div className="flex-grow flex h-full bg-gray-50">
            {/* Left Panel: Chat History */}
            <div className="w-[30%] flex flex-col border-r border-gray-200 h-full bg-white flex-shrink-0">
                 <header className="p-2 flex items-center justify-between border-b border-gray-200 flex-shrink-0">
                    <div className="flex items-center">
                         <button onClick={onExit} className="px-3 py-1.5 text-sm rounded-md hover:bg-gray-100 font-semibold text-gray-700">
                            Đóng
                        </button>
                    </div>
                     <button 
                        onClick={() => setIsSourcePanelOpen(!isSourcePanelOpen)} 
                        className="p-2 rounded-lg hover:bg-gray-100 text-sm font-medium text-gray-600 flex items-center gap-2"
                        title={isSourcePanelOpen ? "Hide Sources Panel" : "Show Sources Panel"}
                    >
                        Nguồn
                        <FileIcon className="w-5 h-5"/>
                    </button>
                </header>
                <div className="flex-grow overflow-y-auto p-4">
                     <div className="w-full max-w-3xl mx-auto">
                        {messages.map((msg, index) => (
                            <ChatMessage key={index} message={msg} />
                        ))}
                        {isLoading && (
                             <div className="flex items-start gap-4 my-4">
                                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center font-bold text-white animate-pulse">R</div>
                                <div className="max-w-2xl p-4 rounded-lg bg-gray-100">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
                <ChatInput 
                    onSendMessage={onSendMessage} 
                    isLoading={isLoading} 
                    onAttachmentClick={() => { /* Inside studio, use SourcePanel to add files */ }}
                    activeTool={activeTool}
                    onToolSelect={onToolSelect}
                    onClearTool={onClearTool}
                />
            </div>

            {/* Center Panel: Canvas */}
            <div className={`flex flex-col h-full transition-all duration-300 ${isSourcePanelOpen ? 'w-[45%]' : 'w-[70%]'}`}>
                <CanvasEditor 
                    document={document}
                    isGenerating={isGenerating}
                    isStreaming={isStreaming}
                    onGenerate={(content, tool) => onGenerate(document.id, content, tool, sources)}
                    onContentChange={onContentChange}
                    sources={sources}
                />
            </div>
            
            {/* Right Panel: Sources */}
            {isSourcePanelOpen && (
                <div className="w-[25%] flex flex-col h-full border-l border-gray-200 flex-shrink-0">
                    <SourcePanel sources={sources} onAddSource={onAddSource} onRemoveSource={onRemoveSource} />
                </div>
            )}
        </div>
    );
};

export default StudioView;