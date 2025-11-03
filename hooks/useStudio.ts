
import { useState } from 'react';
import { CanvasTool, UploadedFile, GeneratedDocument } from '../types';
import { generateVisualizationStream, generateTextStream } from '../services/geminiService';

// Utility to remove markdown backticks from the start and end of the AI response
const cleanHtmlResponse = (html: string): string => {
    let cleaned = html.trim();
    if (cleaned.startsWith('```html')) {
        cleaned = cleaned.substring(7).trim();
    }
    if (cleaned.endsWith('```')) {
        cleaned = cleaned.substring(0, cleaned.length - 3).trim();
    }
    return cleaned;
};

export const useStudio = (
    onContentUpdate: (docId: string, newContent: string) => void,
    onGenerationComplete: (docId: string, generatedHtml: string) => void
) => {
    const [currentDocument, setCurrentDocument] = useState<GeneratedDocument | null>(null);
    const [isGenerating, setIsGenerating] = useState(false); // For visualization generation
    const [isStreaming, setIsStreaming] = useState(false); // For initial content streaming
    
    const clearStudio = () => {
        setCurrentDocument(null);
    }
    
    const openDocument = (doc: GeneratedDocument) => {
        setCurrentDocument(doc);
    }

    const streamDocumentContent = async (docToStream: GeneratedDocument, prompt: string): Promise<void> => {
        setCurrentDocument(docToStream);
        setIsStreaming(true);
        try {
            const stream = await generateTextStream(prompt);
            let textContent = '';
            for await (const chunk of stream) {
                textContent += chunk.text;
                // Update local state IMMEDIATELY for responsive UI
                setCurrentDocument(prev => prev ? { ...prev, content: textContent } : null);
                // Then, notify the parent (App.tsx) to update the master list
                onContentUpdate(docToStream.id, textContent);
            }
        } catch (error) {
            console.error("Failed to stream document content:", error);
            const errorText = "Sorry, an error occurred while generating the content.";
            onContentUpdate(docToStream.id, errorText);
        } finally {
            setIsStreaming(false);
        }
    };

    const generateVisualization = async (docId: string, content: string, canvasTool: CanvasTool, sources: UploadedFile[]) => {
        if (!currentDocument || currentDocument.id !== docId) return;
        
        setIsGenerating(true);
        setCurrentDocument(prevDoc => prevDoc ? { ...prevDoc, generatedHtml: '' } : null);

        try {
            const stream = await generateVisualizationStream(content, canvasTool, sources);
            let htmlContent = '';
            for await (const chunk of stream) {
                htmlContent += chunk.text;
                // Clean the response in real-time before displaying it
                const cleanedChunk = cleanHtmlResponse(htmlContent);
                // Update the document's generatedHtml in real-time locally
                setCurrentDocument(prevDoc => prevDoc ? { ...prevDoc, generatedHtml: cleanedChunk } : null);
            }
            const finalCleanedHtml = cleanHtmlResponse(htmlContent);
            onGenerationComplete(docId, finalCleanedHtml); // Notify App.tsx when done
        } catch (error) {
            console.error("Failed to generate canvas visualization:", error);
            const errorHtml = "<p class='p-4 text-red-500'>Sorry, an error occurred while generating the content.</p>";
            setCurrentDocument(prevDoc => prevDoc ? { ...prevDoc, generatedHtml: errorHtml } : null);
            onGenerationComplete(docId, errorHtml);
        } finally {
            setIsGenerating(false);
        }
    };

    return {
        currentDocument,
        isGenerating,
        isStreaming,
        generateVisualization,
        streamDocumentContent,
        clearStudio,
        openDocument
    };
};