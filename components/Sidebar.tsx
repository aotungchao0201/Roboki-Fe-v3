
import React from 'react';
import { RobokiLogoIcon, EditIcon, NewChatIcon, ChatbotIcon } from './Icons';

const recentChats = [
  { name: "Chat Roboki", color: "text-orange-500", icon: <ChatbotIcon className="w-5 h-5" /> },
  { name: "Ôn tập và luyện thi TNTHPT - Toán", color: "bg-gray-500" },
  { name: "Soạn giáo án", color: "bg-green-500" },
  { name: "Agent Main", color: "bg-purple-500" },
];

const Sidebar: React.FC<{ onNewChat: () => void; }> = ({ onNewChat }) => {
  return (
    <div className="bg-gray-100 p-4 flex flex-col h-full w-64 flex-shrink-0">
      <div className="flex items-center justify-between mb-8">
        <RobokiLogoIcon />
        <div className="flex items-center gap-2">
            <button onClick={onNewChat} className="p-2 rounded-lg hover:bg-gray-200">
                <EditIcon className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-200">
                <NewChatIcon className="w-5 h-5 text-gray-600" />
            </button>
        </div>
      </div>
      
      <div className="flex-grow overflow-y-auto">
        {recentChats.map((chat, index) => (
          <div key={index} className="flex items-center p-2 rounded-lg hover:bg-gray-200 cursor-pointer mb-2">
            {chat.icon ? (
                <span className={chat.color}>{chat.icon}</span>
            ) : (
                <span className={`w-4 h-4 rounded-full ${chat.color}`}></span>
            )}
            <span className="ml-3 text-sm font-medium text-gray-700 truncate">{chat.name}</span>
          </div>
        ))}
      </div>

      <div className="mt-auto">
        <button className="w-full text-left p-2 rounded-lg hover:bg-gray-200 text-sm font-semibold text-gray-600">
            Xem tất cả ⌄
        </button>
      </div>
    </div>
  );
};

export default Sidebar;