
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { UploadedFile, CanvasTool } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

const fileToGenerativePart = (file: UploadedFile) => {
    return {
        inlineData: {
            mimeType: file.type,
            data: file.base64Data,
        },
    };
};

// This acts as the "fast chat LLM" to determine user intent
export async function generateChatDecision(prompt: string, sources: UploadedFile[]): Promise<{ action: 'chat' | 'create_document', responseText: string, documentTitle?: string, summary?: string, citations?: Array<{ sourceIndex: number, sourceText: string }> }> {
    try {
        const decisionSchema = {
            type: Type.OBJECT,
            properties: {
                action: {
                    type: Type.STRING,
                    enum: ['chat', 'create_document'],
                    description: 'Determine if the user wants to have a simple conversation or create a complex document.'
                },
                responseText: {
                    type: Type.STRING,
                    description: 'A brief, conversational response to the user. For "chat", this is the full answer. For "create_document", this text will be displayed as the main text in the document card.'
                },
                documentTitle: {
                    type: Type.STRING,
                    description: 'A concise, relevant title for the document if action is "create_document".'
                },
                summary: {
                    type: Type.STRING,
                    description: 'A very short, one-sentence summary of the document to be created. This will be displayed in the document card in the chat.'
                },
                citations: {
                    type: Type.ARRAY,
                    description: 'A list of direct quotes from the source documents that support the responseText. Only populate this when citation markers like [1] are used.',
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            sourceIndex: {
                                type: Type.INTEGER,
                                description: 'The number used in the citation marker, e.g., for [1], this would be 1.'
                            },
                            sourceText: {
                                type: Type.STRING,
                                description: 'The exact, verbatim quote from the source document that corresponds to the citation marker.'
                            }
                        },
                        required: ['sourceIndex', 'sourceText']
                    }
                }
            },
            required: ['action', 'responseText']
        };

        const parts: any[] = [{ text: prompt }];
        if (sources && sources.length > 0) {
            sources.forEach(file => {
                parts.push(fileToGenerativePart(file));
            });
        }

        const systemInstruction = `You are an AI assistant named Roboki. Your primary role is to determine the user's intent based on their prompt and any provided files (sources).

- **CONTEXT AWARENESS (CRITICAL):** If one or more files (sources) are provided with the prompt, your primary goal is to answer the user's question based on the content of those files. The user is asking about the documents. Actions like "summarize," "what is," "explain," should all relate to the provided files. This should be a "chat" action. **When you use information from the provided files, you MUST add a citation marker like [1], [2] at the end of the relevant sentence to indicate the source of the information. For EACH citation marker you add, you MUST also add a corresponding object to the "citations" array, providing the "sourceIndex" (the number) and the "sourceText" (the exact verbatim quote from the source that justifies your statement). This makes your response more trustworthy and verifiable.**
- **CHAT ACTION:** If the user asks a general question, wants to chat, asks for a simple, short piece of text, OR is asking about the provided source files, set the action to "chat" and provide a direct answer in "responseText".
- **CREATE DOCUMENT ACTION:** If the user explicitly asks to create a *new* document, report, lesson plan, mind map, story, or other complex, structured content that is *separate* from the provided source files, you MUST set the action to "create_document".
- **WHEN action is "create_document":**
  - "documentTitle" MUST be a suitable title for the new document.
  - "summary" MUST be a compelling one-sentence summary of the document's content.
  - "responseText" should be a confirmation message that also includes the title, for example: "Đây là tài liệu bạn yêu cầu: [documentTitle]".
- Respond ONLY in the requested JSON format.`;

        const response: GenerateContentResponse = await ai.models.generateContent({
            model,
            contents: { parts },
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: decisionSchema,
            }
        });

        const jsonString = response.text.trim();
        return JSON.parse(jsonString);

    } catch (error) {
        console.error("Error in generateChatDecision:", error);
        // Fallback to a simple chat response in case of JSON failure
        return {
            action: 'chat',
            responseText: "I'm having a little trouble with that request. Could you try rephrasing it?"
        };
    }
}

// Generates the raw text content for the canvas editor
export async function generateTextStream(prompt: string) {
    const fullPrompt = `Based on the user's request, generate the text content for the document.
User Request: "${prompt}"`;
    return ai.models.generateContentStream({
        model,
        contents: { parts: [{ text: fullPrompt }] },
    });
}

// Generates the final HTML visualization from text content
export async function generateVisualizationStream(content: string, canvasTool: CanvasTool, sources: UploadedFile[]) {
    let toolSpecificInstructions = '';

    switch (canvasTool) {
        case CanvasTool.INFOGRAPHIC:
            toolSpecificInstructions = `
                **CRITICAL TASK: Create a MINIMALIST, CONCISE, and SAFE Infographic HTML file.**

                **ABSOLUTE PRIORITY #1: SUMMARIZE.** Your most important task is to first read and understand the provided text, then **distill it into its 3 to 5 most critical key points or steps.** The entire design must serve only to highlight these few key points. Do not visualize secondary details or long paragraphs. Be concise.

                **DESIGN PHILOSOPHY: MINIMALISM & CLARITY.**
                *   Adopt a clean, minimalist design style. Use ample whitespace.
                *   Focus on clear typography (import one Google Font) and a simple, elegant color palette.
                *   Avoid complex shadows, gradients, or unnecessary decorations. The goal is clarity, not complexity.

                **TECHNICAL REQUIREMENTS (MANDATORY):**
                1.  **SAFE & RESPONSIVE CONTAINER (NON-NEGOTIABLE):** The entire infographic MUST be wrapped in a single parent \`<div class="infographic-container">\`. This container MUST have the following CSS properties to prevent breaking the parent layout: \`max-width: 100%; box-sizing: border-box; overflow-x: hidden;\`.
                2.  **MODERN & SAFE LAYOUT:** Use CSS Flexbox or Grid for layout. The design must be responsive.
                3.  **ICON POLICY (CRITICAL SAFETY RULE):**
                    *   Generating complex SVG icons with multi-point \`<path>\` elements is **STRICTLY FORBIDDEN**. This is the most common source of errors.
                    *   For any icon or visual element, you are **ONLY ALLOWED** to use basic, safe SVG geometric shapes: \`<circle>\`, \`<rect>\`, and \`<ellipse>\`.
                    *   **Example of a SAFE icon:** \`<svg><circle cx="25" cy="25" r="20" fill="lightblue" /></svg>\`.
                    *   **Example of a FORBIDDEN icon:** \`<svg><path d="M12 2C6.48... complex data ...Z" /></svg>\`.
                4.  **DATA VISUALIZATION:** If the summarized points contain numbers, create simple bar charts using \`<rect>\` elements, or progress steps using styled \`<div>\` or \`<circle>\` elements. Do not create complex charts.
                5.  **SELF-CONTAINED FILE:** The output MUST be a single HTML file. All CSS in a \`<style>\` tag, all JS (if any, should be minimal) in a \`<script>\` tag.
                6.  **CLEAN OUTPUT:** The response MUST start directly with \`<!DOCTYPE html>\` and contain ONLY the HTML code.
            `;
            break;
        case CanvasTool.MIND_MAP:
            toolSpecificInstructions = `
                **Task: Create a clear and organized Mind Map HTML file.**
                1.  **Structure:** Represent the content's hierarchy using nested HTML elements (divs). Create a central topic node and branch out to main ideas and sub-points.
                2.  **Visual Connections:** Use CSS pseudo-elements (::before, ::after) or inline SVG lines to draw connections between nodes, visually representing the map's structure.
                3.  **Clarity:** Use clear typography, distinct colors for different levels of the hierarchy, and sufficient spacing to ensure readability.
                4.  **Self-Contained:** The output MUST be a single, self-contained HTML file with all CSS in a <style> tag. No JavaScript is necessary unless for simple interactions like highlighting a node on hover. Start the response with <!DOCTYPE html> and output ONLY the HTML code.
            `;
            break;
        default:
             toolSpecificInstructions = `Create a visually appealing, single-file HTML document for a "${canvasTool}" visualization. The HTML file must be self-contained, with all CSS and JavaScript included internally.`;
            break;
    }

    const prompt = `Based on the following text content AND any provided source documents, follow these instructions precisely:\n\n${toolSpecificInstructions}\n\nText content:\n---\n${content}\n---`;
    
    const parts: any[] = [{ text: prompt }];
    if (sources && sources.length > 0) {
        sources.forEach(file => {
            parts.push(fileToGenerativePart(file));
        });
    }

    return ai.models.generateContentStream({
        model,
        contents: { parts },
    });
}