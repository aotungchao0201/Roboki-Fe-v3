
import React, { useEffect, useRef } from 'react';
import { Message, Tool } from '../types';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { ChatbotIcon, PointsIcon, FireIcon } from './Icons';

interface ChatViewProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (prompt: string) => void;
  onAttachmentClick: () => void;
  onOpenDocument: (docId: string) => void;
  activeTool: Tool | null;
  onToolSelect: (tool: Tool) => void;
  onClearTool: () => void;
}

const WelcomeScreen: React.FC = () => (
    <div className="flex-grow flex flex-col justify-center items-center text-center">
        <h1 className="text-4xl font-bold text-gray-700">
            Tôi có thể giúp gì cho bạn?
        </h1>
    </div>
);

const UserProfile: React.FC = () => (
    <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full">
            <PointsIcon className="w-5 h-5 text-yellow-500"/>
            <span className="font-semibold text-sm text-gray-700">59</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-red-200 rounded-full text-red-500">
            <FireIcon className="w-5 h-5"/>
            <span className="font-semibold text-sm">11 tích lũy</span>
        </div>
        <img src="https://i.pravatar.cc/40?u=a042581f4e29026704d" alt="User Avatar" className="w-10 h-10 rounded-full" />
    </div>
);

const ChatView: React.FC<ChatViewProps> = (props) => {
    const { 
      messages, isLoading, onSendMessage, onAttachmentClick, onOpenDocument,
      activeTool, onToolSelect, onClearTool 
    } = props;
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    return (
        <div className="flex-grow flex flex-col bg-white relative">
            <header className="p-4 flex justify-between items-center text-gray-800 sticky top-0 bg-white z-10 border-b border-gray-200">
                 <div className="flex items-center gap-2">
                    <ChatbotIcon className="w-8 h-8 text-orange-500"/>
                    <h2 className="text-xl font-semibold">Chat bot</h2>
                    <span className="text-gray-400 cursor-pointer">⌄</span>
                 </div>
                 <UserProfile />
            </header>

            <div className="flex-grow overflow-y-auto p-4">
                {messages.length === 0 && !isLoading ? (
                    <WelcomeScreen />
                ) : (
                    <div className="w-full max-w-3xl mx-auto">
                        {messages.map((msg, index) => (
                            <ChatMessage key={index} message={msg} onOpenDocument={onOpenDocument} />
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
                )}
            </div>
            
            <ChatInput 
              onSendMessage={onSendMessage} 
              isLoading={isLoading} 
              onAttachmentClick={onAttachmentClick}
              activeTool={activeTool}
              onToolSelect={onToolSelect}
              onClearTool={onClearTool}
            />
        </div>
    );
};

export default ChatView;