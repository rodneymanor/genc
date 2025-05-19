import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

// Allow enough processing time for script rewriting
export const maxDuration = 45;

export async function POST(req: NextRequest) {
  try {
    const { script, videoMetadata } = await req.json();

    if (!script) {
      return NextResponse.json(
        { error: 'No script provided for rewriting' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a professional video script editor specializing in short-form content. 
    Your task is to rewrite the provided script as a concise, engaging short-form video script that is 60 SECONDS OR LESS in duration. 
    Maintain the core message and key points, but make it punchy, attention-grabbing, and optimized for social media.
    Format the output with clear sections and approximate timing suggestions (keeping total under 60 seconds).`;

    const result = await streamText({
      model: openai('gpt-4-turbo'),
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Rewrite the following script as a short-form video script (60 seconds or less)${
            videoMetadata ? ` for video titled "${videoMetadata.title}"` : ''
          }:\n\n${script}`
        }
      ],
    });

    return result.toDataStreamResponse();

  } catch (error: any) {
    console.error("Error in /api/rewrite-script:", error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
} 