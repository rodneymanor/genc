import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// --- CONFIGURATION ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY in environment variables.");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro-latest", // Or your preferred model for text generation
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ],
});

interface SourceContent {
    link: string;
    title: string; // Added title for better context in the prompt
    text: string;  // Extracted text from the source
}

export async function POST(req: NextRequest) {
    const logs: string[] = [];
    try {
        const { videoIdea, sourceContents } = await req.json() as { videoIdea: string, sourceContents: SourceContent[] };

        if (!videoIdea || !sourceContents || !Array.isArray(sourceContents) || sourceContents.length === 0) {
            return NextResponse.json({ error: 'Video idea and a non-empty array of source contents are required' }, { status: 400 });
        }

        logs.push(`[Create Research Analysis] Received video idea: "${videoIdea}"`);
        logs.push(`[Create Research Analysis] Received ${sourceContents.length} source contents.`);

        let promptContent = `Video Idea: "${videoIdea}"\n\nBased on the following source materials, please synthesize a comprehensive research resource or briefing document of 300-400 words. This resource should consolidate the key information, facts, and insights relevant to the video idea. This document will be used as a foundational text to generate various parts of a video script. Focus on clarity, accuracy, and relevance to the video idea.\n\nSource Materials:\n`;

        sourceContents.forEach((source, index) => {
            promptContent += `\n--- Source ${index + 1} ---\n`;
            promptContent += `Title: ${source.title}\n`;
            promptContent += `Link: ${source.link}\n`;
            promptContent += `Extracted Text Snippet (first ~200 chars for context): ${source.text ? source.text.substring(0, 200) + '...' : '[No text extracted]'}\n`;
            // promptContent += `Full Extracted Text: \n${source.text}\n`; // Using full text might exceed token limits quickly for multiple sources
            // For now, focusing on the concept. If full text is needed, a strategy for summarization or chunking might be required first.
            // Let's assume for now the LLM can handle the snippets or we might send more text. For actual implementation, sending full text is better if possible.
            // For the first pass, let's try sending more of the text, up to a certain limit per source, or a total limit.
            const textForPrompt = source.text ? (source.text.length > 2000 ? source.text.substring(0, 2000) + "... (truncated)" : source.text) : '[No text extracted]';
            promptContent += `Content Summary: \n${textForPrompt}\n`;
        });

        logs.push("[Create Research Analysis] Constructed prompt for Gemini.");
        // console.log("Prompt for Gemini:", promptContent); // For debugging

        const result = await model.generateContent(promptContent);
        const response = result.response;
        const researchAnalysisText = response.text();

        if (!researchAnalysisText) {
            logs.push("[Create Research Analysis] Gemini did not return text.");
            // Log candidate information if available for debugging
            if (response.candidates && response.candidates.length > 0) {
                logs.push(`[Create Research Analysis] Finish reason: ${response.candidates[0].finishReason}`);
                if (response.candidates[0].safetyRatings) {
                    logs.push(`[Create Research Analysis] Safety ratings: ${JSON.stringify(response.candidates[0].safetyRatings)}`);
                }
            }
            return NextResponse.json({ logs, error: 'Failed to generate research analysis: No text returned from AI.' }, { status: 500 });
        }

        logs.push(`[Create Research Analysis] Successfully generated research analysis text (length: ${researchAnalysisText.length}).`);

        return NextResponse.json({ logs, researchAnalysisText });

    } catch (error: any) {
        logs.push(`[Create Research Analysis] Error: ${error.message}`);
        if (error.stack) {
            logs.push(`Stack: ${error.stack}`);
        }
        return NextResponse.json({ logs, error: error.message || 'An unknown error occurred' }, { status: 500 });
    }
} 