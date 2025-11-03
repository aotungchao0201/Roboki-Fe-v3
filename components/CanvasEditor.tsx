
import React, { useState, useEffect } from 'react';
import { CanvasTool, UploadedFile, GeneratedDocument } from '../types';
import { InfographicIcon, QuizIcon, FlashcardsIcon, ArrowLeftIcon, MindMapIcon } from './Icons';

interface CanvasEditorProps {
    document: GeneratedDocument;
    isGenerating: boolean;
    isStreaming: boolean;
    onGenerate: (content: string, canvasTool: CanvasTool) => void;
    onContentChange: (newContent: string) => void;
    sources: UploadedFile[];
}

const canvasToolConfig = {
    [CanvasTool.INFOGRAPHIC]: { icon: InfographicIcon },
    [CanvasTool.QUIZ]: { icon: QuizIcon },
    [CanvasTool.FLASHCARDS]: { icon: FlashcardsIcon },
    [CanvasTool.MIND_MAP]: { icon: MindMapIcon },
};

type CanvasViewMode = 'editor' | 'preview';
type PreviewTab = 'code' | 'preview';

const CanvasEditor: React.FC<CanvasEditorProps> = ({ document, isGenerating, isStreaming, onGenerate, onContentChange, sources }) => {
    const [editorContent, setEditorContent] = useState(document.content);
    const [selectedCanvasTool, setSelectedCanvasTool] = useState<CanvasTool>(CanvasTool.INFOGRAPHIC);
    const [viewMode, setViewMode] = useState<CanvasViewMode>('editor');
    const [previewTab, setPreviewTab] = useState<PreviewTab>('preview');

    // Sync internal editor state with the document content from props
    useEffect(() => {
        setEditorContent(document.content);
    }, [document.content]);
    
    // Switch to preview mode automatically when generation starts
    useEffect(() => {
        if (isGenerating) {
            setViewMode('preview');
            setPreviewTab('preview');
        }
    }, [isGenerating]);
    
     // If the document already has HTML, start in preview mode
    useEffect(() => {
        if (document.generatedHtml) {
            setViewMode('preview');
        } else {
            setViewMode('editor');
        }
    }, [document.id, document.generatedHtml]);


    const handleGenerateClick = () => {
        onGenerate(editorContent, selectedCanvasTool);
    };
    
    const handleEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value;
        setEditorContent(newContent);
        onContentChange(newContent);
    };

    if (viewMode === 'preview') {
        const TabButton: React.FC<{tab: PreviewTab, children: React.ReactNode}> = ({ tab, children }) => (
            <button
                onClick={() => setPreviewTab(tab)}
                className={`px-4 py-2 text-sm font-semibold rounded-md ${previewTab === tab ? 'bg-gray-200 text-gray-800' : 'text-gray-500 hover:bg-gray-100'}`}
            >
                {children}
            </button>
        );

        return (
            <div className="flex-grow flex flex-col h-full bg-gray-100">
                <header className="p-2 flex justify-between items-center border-b border-gray-200 flex-shrink-0 bg-white">
                    <div className="flex items-center gap-2">
                        <button onClick={() => setViewMode('editor')} className="p-2 rounded-full hover:bg-gray-100">
                            <ArrowLeftIcon className="w-5 h-5 text-gray-600"/>
                        </button>
                        <div>
                             <h2 className="text-lg font-semibold text-gray-800">Canvas Preview</h2>
                             <p className="text-xs text-gray-500 truncate" title={document.title}>{document.title}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
                        <TabButton tab="preview">Preview</TabButton>
                        <TabButton tab="code">Code</TabButton>
                    </div>
                </header>
                <div className="flex-grow p-4 overflow-auto">
                    {previewTab === 'preview' ? (
                        <div className="w-full h-full bg-white rounded-lg overflow-hidden shadow-lg">
                            {isGenerating && !document.generatedHtml && (
                                 <div className="flex items-center justify-center h-full">
                                    <div className="text-gray-500">Generating preview...</div>
                                </div>
                            )}
                            <iframe
                                srcDoc={document.generatedHtml}
                                title="Canvas Preview"
                                className="w-full h-full border-0"
                                sandbox="allow-same-origin"
                            />
                        </div>
                    ) : (
                         <div className="w-full h-full bg-gray-800 text-white rounded-lg overflow-auto font-mono text-sm p-3">
                            <pre><code>{document.generatedHtml || "<!-- HTML code will appear here -->"}</code></pre>
                         </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="flex-grow flex flex-col h-full bg-white p-4">
            <header className="flex justify-between items-center mb-4">
                 <div>
                    <h2 className="text-xl font-semibold text-gray-800">Canvas</h2>
                    <p className="text-sm text-gray-500 truncate" title={document.title}>{document.title}</p>
                </div>
            </header>
             <p className="text-sm text-gray-500 mb-4">Welcome to the Canvas! Paste or write your content here and transform it with the tools below.</p>

            <textarea
                value={editorContent}
                onChange={handleEditorChange}
                className="w-full flex-grow bg-white border border-gray-200 rounded-lg p-3 text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-orange-400 mb-4"
                placeholder={isStreaming ? "AI is writing..." : "Your content goes here..."}
                disabled={isStreaming}
            />
            
            <div className="mt-auto">
                 <h3 className="text-sm font-semibold text-gray-500 mb-2">Công cụ</h3>
                <div className="grid grid-cols-2 gap-2 mb-4">
                     {Object.values(CanvasTool).map(tool => {
                         const Icon = canvasToolConfig[tool].icon;
                         const isSelected = selectedCanvasTool === tool;
                         return (
                             <button 
                                key={tool}
                                onClick={() => setSelectedCanvasTool(tool)}
                                className={`p-2 flex items-center gap-2 rounded-lg text-left transition-colors ${isSelected ? 'bg-orange-100 border-orange-500 text-orange-600 border' : 'bg-white border border-gray-200 hover:bg-gray-100 text-gray-700'}`}
                            >
                                <Icon className="w-5 h-5"/>
                                <span className="text-sm font-medium">{tool}</span>
                            </button>
                         )
                     })}
                </div>
             
                 <button
                    onClick={handleGenerateClick}
                    disabled={isGenerating || isStreaming || (!editorContent.trim() && sources.length === 0)}
                    className="w-full p-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                    {isGenerating ? 'Đang tạo...' : 'Tạo'}
                </button>
            </div>
        </div>
    );
};

export default CanvasEditor;