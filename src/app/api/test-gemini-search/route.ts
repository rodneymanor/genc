import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, SchemaType, FunctionDeclaration } from "@google/generative-ai";
import axios from 'axios';

// --- CONFIGURATION ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const CUSTOM_SEARCH_API_KEY = process.env.CUSTOM_SEARCH_API_KEY;
const SEARCH_ENGINE_ID = process.env.SEARCH_ENGINE_ID;

if (!GEMINI_API_KEY || !CUSTOM_SEARCH_API_KEY || !SEARCH_ENGINE_ID) {
  throw new Error("Missing API keys or Search Engine ID in environment variables.");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// --- 1. Define the External Search Function ---
async function searchRelevantSources(searchQuery: string, numSources = 9, logs: string[]) {
    logs.push(`[External Search] Searching for: \"${searchQuery}\", aiming for ${numSources} sources.`);
    try {
        const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
            params: {
                key: CUSTOM_SEARCH_API_KEY,
                cx: SEARCH_ENGINE_ID,
                q: `${searchQuery} -filetype:pdf`,
                num: numSources > 10 ? 10 : numSources, // API max is 10 per request
            },
        });

        if (response.data.items) {
            const sources = response.data.items.map((item: any) => ({
                title: item.title,
                link: item.link,
                snippet: item.snippet,
            }));
            logs.push(`[External Search] Found ${sources.length} sources.`);
            // Log details of each source
            sources.forEach((source: any, index: number) => {
                logs.push(`  Source ${index + 1}:`);
                logs.push(`    Title: ${source.title}`);
                logs.push(`    Link: ${source.link}`);
                logs.push(`    Snippet: ${source.snippet}`);
            });
            return { sources };
        } else {
            logs.push('[External Search] No sources found.');
            return { sources: [] };
        }
    } catch (error: any) {
        logs.push(`[External Search] Error: ${error.response ? JSON.stringify(error.response.data) : error.message}`);
        return { sources: [], error: "Failed to fetch search results." };
    }
}

// --- 2. Define Function Declaration for Gemini ---
const functionDeclarations: FunctionDeclaration[] = [
    {
        name: "search_relevant_sources",
        description: "Searches the web for relevant sources (articles, studies, reputable blog posts) based on a query. Returns up to a specified number of sources with titles, links, and snippets.",
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                searchQuery: {
                    type: SchemaType.STRING,
                    description: "The specific topic or query to search for."
                },
                numSources: {
                    type: SchemaType.INTEGER,
                    description: "The desired number of relevant sources to find (e.g., up to 9)."
                }
            },
            required: ["searchQuery", "numSources"]
        }
    }
];

const tools = [{ functionDeclarations }];

// --- 3. Initialize the Gemini Model ---
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro-latest",
    tools: tools,
    safetySettings: [ // Example safety settings - adjust as needed
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ],
});

// --- Main handler for GET requests ---
export async function GET(req: NextRequest) {
    const logs: string[] = [];
    let actualSources: any[] = []; // Variable to store sources
    const { searchParams } = new URL(req.url);
    const videoIdea = searchParams.get('videoIdea') || "The surprising benefits of urban beekeeping for local ecosystems."; // Default video idea

    logs.push(`API Route Initialized. Video Idea: \"${videoIdea}\"`);

    try {
        const chat = model.startChat();
        const prompt = `
            I'm creating a short-form video about: \"${videoIdea}\".
            Please help me find up to 9 relevant and diverse sources (like news articles, scientific studies if applicable, reputable blogs, or educational content) that I can use for research.
            Prioritize informative and credible sources.
        `;

        logs.push(`[Gemini] Sending prompt: ${prompt}`);
        let result = await chat.sendMessage(prompt);
        let response = result.response;
        const functionCalls = response.functionCalls();

        if (functionCalls && functionCalls.length > 0) {
            const functionCall = functionCalls[0];
            logs.push(`[Gemini] Requested function call: ${functionCall.name}`);
            logs.push(`[Gemini] Arguments: ${JSON.stringify(functionCall.args)}`);

            if (functionCall.name === "search_relevant_sources") {
                const args = functionCall.args as { searchQuery: string; numSources: number };
                const { searchQuery, numSources } = args;
                const searchResults = await searchRelevantSources(searchQuery, numSources, logs);
                actualSources = searchResults.sources || []; // Store the sources

                logs.push('[Gemini] Sending search results back to the model...');
                result = await chat.sendMessage([
                    {
                        functionResponse: {
                            name: "search_relevant_sources",
                            response: searchResults
                        }
                    }
                ]);
                response = result.response;
            } else {
                logs.push(`[Gemini] Unknown function requested: ${functionCall.name}`);
                return NextResponse.json({ logs, error: `Unknown function requested: ${functionCall.name}` }, { status: 500 });
            }
        }

        if (response.text) {
            logs.push("\\n--- Gemini's Summary of Found Sources ---");
            logs.push(response.text());
        } else {
            logs.push("\\n[Gemini] No final text response. Full response parts:");
            if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
                response.candidates[0].content.parts.forEach((part: any) => logs.push(JSON.stringify(part)));
            } else {
                logs.push("[Gemini] No detailed parts found in the response.");
            }
        }
        
        logs.push("\\nTest completed.");
        // Include actualSources in the response
        return NextResponse.json({ logs, sources: actualSources });

    } catch (error: any) {
        logs.push(`Test failed: ${error.message}`);
        if (error.stack) {
            logs.push(`Stack: ${error.stack}`);
        }
        // Even in case of an error, we can return any logs and empty sources
        return NextResponse.json({ logs, sources: actualSources, error: error.message || "An unknown error occurred" }, { status: 500 });
    }
} 