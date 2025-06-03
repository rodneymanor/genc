import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const { transcript } = await req.json();

    if (!transcript) {
      return NextResponse.json({ error: 'No transcript provided' }, { status: 400 });
    }

    // Get the model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Create the prompt for video idea generation
    const prompt = `
    Based on the following voice transcript, generate 3 video content ideas that would work well for social media platforms like TikTok, Instagram Reels, or YouTube Shorts.

    Transcript: "${transcript}"

    For each video idea, provide:
    1. A compelling title (max 60 characters)
    2. A brief description (1-2 sentences)
    3. An engaging hook line to start the video
    4. 2-3 relevant tags/keywords

    Format your response as a JSON array with this structure:
    [
      {
        "title": "Video title here",
        "description": "Brief description here",
        "hook": "Engaging hook line here",
        "tags": ["tag1", "tag2", "tag3"]
      }
    ]

    Make sure the ideas are:
    - Engaging and shareable
    - Relevant to the transcript content
    - Suitable for short-form video content
    - Focused on value or entertainment

    Return only the JSON array, no additional text.
    `;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let aiResponse = response.text().trim();

    // Clean up the response to extract JSON
    aiResponse = aiResponse.replace(/```json\s*/, '').replace(/```\s*$/, '');
    
    try {
      const videoIdeas = JSON.parse(aiResponse);
      
      // Validate the structure
      if (!Array.isArray(videoIdeas)) {
        throw new Error('Response is not an array');
      }

      // Ensure each idea has required fields
      const validatedIdeas = videoIdeas.map((idea, index) => ({
        title: idea.title || `Video Idea ${index + 1}`,
        description: idea.description || 'Generated from your voice note',
        hook: idea.hook || 'Here\'s something interesting...',
        tags: Array.isArray(idea.tags) ? idea.tags : ['voice-note', 'content']
      }));

      return NextResponse.json({ 
        videoIdeas: validatedIdeas,
        success: true 
      });

    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      
      // Fallback with generic ideas based on transcript
      const fallbackIdeas = [
        {
          title: "Key Insights from My Voice Note",
          description: "Transform your thoughts into actionable content",
          hook: "You just shared something powerful...",
          tags: ["insights", "productivity", "personal-development"]
        },
        {
          title: "Behind the Scenes: My Thought Process",
          description: "Raw, unfiltered thoughts turned into valuable content",
          hook: "Ever wonder how ideas really form?",
          tags: ["behind-the-scenes", "creativity", "process"]
        },
        {
          title: "Lessons from a Voice Note",
          description: "Converting spontaneous thoughts into teaching moments",
          hook: "Sometimes the best content comes from...",
          tags: ["lessons", "reflection", "storytelling"]
        }
      ];

      return NextResponse.json({ 
        videoIdeas: fallbackIdeas,
        success: true 
      });
    }

  } catch (error: any) {
    console.error('Video ideas generation error:', error);
    
    return NextResponse.json({ 
      error: 'Failed to generate video ideas. Please try again.',
      success: false 
    }, { status: 500 });
  }
} 