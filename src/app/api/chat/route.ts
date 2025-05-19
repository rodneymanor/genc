import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { messages, videoId /*, videoMetadata */ } = await req.json();

    // You can use videoId or videoMetadata here to customize the system prompt
    // or add more context to the AI model if needed.
    // For example: if (videoId) { systemPrompt += ` The user is asking about video ID: ${videoId}.`; }

    const systemPrompt = "You are a helpful assistant that specializes in video content analysis. You can analyze video information, suggest improvements, and discuss video content.";

    const result = await streamText({
      model: openai('gpt-4-turbo'), // Or your preferred OpenAI model
      system: systemPrompt,
      messages,
      // You could add other parameters here, like temperature, max_tokens, etc.
    });

    // Respond with the stream
    return result.toDataStreamResponse();

  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    // Ensure you return a Response object for errors
    return new NextResponse(
        JSON.stringify({ error: error.message || 'An unexpected error occurred.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 