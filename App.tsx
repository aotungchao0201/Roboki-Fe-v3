
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import StudioView from './components/StudioView';
import FileUploadModal from './components/FileUploadModal';
import { useChat } from './hooks/useChat';
import { useStudio } from './hooks/useStudio';
import { UploadedFile, GeneratedDocument, Tool } from './types';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'chat' | 'studio'>('chat');
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [documents, setDocuments] = useState<Record<string, GeneratedDocument>>({});
  const [activeTool, setActiveTool] = useState<Tool | null>(null);

  const handleContentUpdate = (docId: string, newContent: string) => {
    setDocuments(prev => {
        if (prev[docId]) {
            return { ...prev, [docId]: { ...prev[docId], content: newContent }};
        }
        return prev;
    });
  }

  const handleGenerationComplete = (docId: string, generatedHtml: string) => {
    setDocuments(prev => {
        if (prev[docId]) {
            return { ...prev, [docId]: { ...prev[docId], generatedHtml }};
        }
        return prev;
    });
  };

  const studioHook = useStudio(handleContentUpdate, handleGenerationComplete);

  const handleCreateAndStreamDocument = async (prompt: string, title: string, summary: string): Promise<string> => {
      const docId = `doc_${Date.now()}`;
      const newDoc: GeneratedDocument = {
          id: docId,
          title: title,
          content: '',
          generatedHtml: '',
          createdAt: new Date().toISOString(),
      };
      setDocuments(prev => ({ ...prev, [docId]: newDoc }));
      
      studioHook.openDocument(newDoc);
      setActiveTool(Tool.CANVAS);
      setViewMode('studio');

      // Wait for the content streaming to finish
      await studioHook.streamDocumentContent(newDoc, prompt);
      
      return docId; // Return the ID for the chat hook to use
  };
  
  const handleOpenDocument = (docId: string) => {
      const docToOpen = documents[docId];
      if (docToOpen) {
          studioHook.openDocument(docToOpen);
          setActiveTool(Tool.CANVAS);
          setViewMode('studio');
      }
  }
  
  const handleToolSelect = (tool: Tool) => {
    setActiveTool(tool);
    if (tool === Tool.CANVAS) {
        const docId = `doc_${Date.now()}`;
        const newDoc: GeneratedDocument = {
            id: docId,
            title: 'Untitled Document',
            content: '',
            generatedHtml: '',
            createdAt: new Date().toISOString(),
        };
        setDocuments(prev => ({ ...prev, [docId]: newDoc }));
        studioHook.openDocument(newDoc);
        setViewMode('studio');
    }
    // Handle other tools later if needed
  };
  
  const handleClearTool = () => {
      setActiveTool(null);
      if (viewMode === 'studio') {
          setViewMode('chat');
      }
  }

  const chatHook = useChat(handleCreateAndStreamDocument);
  
  const handleNewChat = () => {
    chatHook.clearChat();
    studioHook.clearStudio();
    setDocuments({});
    setActiveTool(null);
    setViewMode('chat');
  };

  const handleFileUpload = (file: UploadedFile) => {
    chatHook.addSource(file);
    setUploadModalOpen(false);
  };
  
  const handleExitStudio = () => {
      setViewMode('chat');
      setActiveTool(null);
  }

  return (
    <div className="flex h-screen w-full font-sans bg-white">
      {viewMode === 'chat' && <Sidebar onNewChat={handleNewChat} />}
      
      {viewMode === 'studio' && studioHook.currentDocument ? (
        <StudioView 
            document={studioHook.currentDocument}
            isGenerating={studioHook.isGenerating}
            isStreaming={studioHook.isStreaming}
            onGenerate={studioHook.generateVisualization}
            onContentChange={(newContent) => handleContentUpdate(studioHook.currentDocument!.id, newContent)}
            onExit={handleExitStudio}
            messages={chatHook.messages}
            isLoading={chatHook.isLoading}
            onSendMessage={chatHook.sendMessage}
            sources={chatHook.sources}
            onAddSource={chatHook.addSource}
            onRemoveSource={chatHook.removeSource}
            activeTool={activeTool}
            onToolSelect={handleToolSelect}
            onClearTool={handleClearTool}
        />
      ) : (
        <ChatView 
            messages={chatHook.messages} 
            isLoading={chatHook.isLoading} 
            onSendMessage={chatHook.sendMessage}
            onAttachmentClick={() => setUploadModalOpen(true)}
            onOpenDocument={handleOpenDocument}
            activeTool={activeTool}
            onToolSelect={handleToolSelect}
            onClearTool={handleClearTool}
        />
      )}

      {isUploadModalOpen && (
        <FileUploadModal 
            onClose={() => setUploadModalOpen(false)}
            onFileUpload={handleFileUpload}
        />
      )}
    </div>
  );
};

export default App;