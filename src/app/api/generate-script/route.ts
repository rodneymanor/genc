import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

// Allow slightly longer processing time for scripts
export const maxDuration = 45;

// Define script types
type ScriptType = 'standard' | 'educational' | 'promotional' | 'tutorial' | 'shortForm';

export async function POST(req: NextRequest) {
  try {
    const { videoId, videoMetadata, scriptType } = await req.json();

    const promptsByType: Record<ScriptType, string> = {
      standard: `Create a standard video script based on "${videoMetadata.title}". Include introduction, main points, and conclusion.`,
      educational: `Create an educational script for "${videoMetadata.title}". Focus on clear explanations, learning objectives, and key takeaways.`,
      promotional: `Create a promotional script for "${videoMetadata.title}". Highlight benefits, include call-to-actions, and create urgency.`,
      tutorial: `Create a step-by-step tutorial script for "${videoMetadata.title}". Include detailed instructions, prerequisites, and expected outcomes.`,
      shortForm: `Create a short-form video script (60 seconds or less) for "${videoMetadata.title}". Be concise, engaging, and focused on key points.`
    };

    const systemPrompt = `You are a professional video script writer. ${promptsByType[scriptType as ScriptType] || promptsByType.standard} 
    Format the script properly with sections, timing suggestions, and speaking notes.`;

    const result = await streamText({
      model: openai('gpt-4-turbo'),
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Generate a script for the video with the following metadata: ${JSON.stringify(videoMetadata)}`
        }
      ],
    });

    return result.toDataStreamResponse();

  } catch (error: any) {
    console.error("Error in /api/generate-script:", error);
    return new NextResponse(
      JSON.stringify({ error: error.message || 'An unexpected error occurred.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 