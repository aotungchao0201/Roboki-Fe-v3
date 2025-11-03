
import { useState } from 'react';
import { Message, MessageRole, UploadedFile } from '../types';
import { generateChatDecision } from '../services/geminiService';

export const useChat = (onTriggerCanvas: (prompt: string, title: string, summary: string) => Promise<string>, initialMessages: Message[] = []) => {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [isLoading, setIsLoading] = useState(false);
    const [sources, setSources] = useState<UploadedFile[]>([]);

    const addSource = (file: UploadedFile) => {
        setSources(prev => [...prev, file]);
    };
    
    const removeSource = (indexToRemove: number) => {
        setSources(prev => prev.filter((_, index) => index !== indexToRemove));
    };
    
    const addMessage = (message: Message) => {
        setMessages(prev => [...prev, message]);
    }

    const sendMessage = async (prompt: string) => {
        if (!prompt.trim()) return;

        const newUserMessage: Message = {
            role: MessageRole.USER,
            text: prompt,
        };
        addMessage(newUserMessage);
        setIsLoading(true);

        try {
            // Pass the current sources to the decision-making LLM
            const decision = await generateChatDecision(prompt, sources);

            if (decision.action === 'create_document' && decision.documentTitle && decision.summary) {
                // Trigger the canvas view in App.tsx and WAIT for it to complete.
                // The onTriggerCanvas function will now return the new document's ID.
                const newDocId = await onTriggerCanvas(prompt, decision.documentTitle, decision.summary);

                // After streaming is complete, add the SINGLE final document card.
                const modelMessage: Message = {
                    role: MessageRole.MODEL,
                    text: decision.responseText, // The main text for the card
                    summary: decision.summary, // The summary for the card body
                    documentId: newDocId,
                    documentTitle: decision.documentTitle,
                    timestamp: new Date().toISOString(),
                };
                addMessage(modelMessage);

            } else { // 'chat' action
                const modelMessage: Message = {
                    role: MessageRole.MODEL,
                    text: decision.responseText,
                    citations: decision.citations?.map((c: any) => ({
                        index: c.sourceIndex,
                        text: c.sourceText,
                    })) || [],
                };
                addMessage(modelMessage);
            }

        } catch (error) {
            console.error("Failed to send message:", error);
            const errorMessage: Message = {
                role: MessageRole.MODEL,
                text: "I'm sorry, I ran into an issue. Please try again."
            };
            addMessage(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };
    
    const clearChat = () => {
        setMessages([]);
        setSources([]);
    }

    return {
        messages,
        isLoading,
        sources,
        addSource,
        removeSource,
        sendMessage,
        clearChat,
        addMessage,
    };
};