import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const { existingHook, transcript, videoIdea } = await req.json();

    if (!existingHook && !transcript) {
      return NextResponse.json({ error: 'Either existing hook or transcript is required' }, { status: 400 });
    }

    // Get the model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Create the prompt for generating additional outline components
    const prompt = `
    Based on the following existing script elements, generate additional script components for a video content creator.

    Video Idea: "${videoIdea || 'Content creation from voice note'}"
    ${existingHook ? `Existing Hook: "${existingHook}"` : ''}
    ${transcript ? `Transcript/Content: "${transcript}"` : ''}

    Generate a comprehensive set of script components in JSON format:

    {
      "hooks": [
        {
          "title": "Hook Title",
          "lines": ["Line 1", "Line 2", "Line 3"]
        }
      ],
      "bridges": [
        {
          "title": "Bridge Title", 
          "content": "Bridge content connecting sections"
        }
      ],
      "goldenNuggets": [
        {
          "title": "Golden Nugget Title",
          "content": "Main value/insight content"
        }
      ],
      "wtas": [
        {
          "title": "Call-to-Action Title",
          "actionType": "subscribe|like|comment|share|visit",
          "lines": ["CTA line 1", "CTA line 2"]
        }
      ]
    }

    Requirements:
    1. Include the existing hook as the FIRST option in the hooks array (if provided)
    2. Generate 2-3 additional alternative hooks
    3. Generate 2-3 bridge options that connect well with the content
    4. Generate 2-3 golden nuggets (main value points) 
    5. Generate 2-3 call-to-action options
    6. All content should be relevant to the original transcript/hook
    7. Make content engaging for social media (TikTok, Instagram Reels, YouTube Shorts)
    8. Keep hooks under 15 seconds when spoken
    9. Make golden nuggets actionable and valuable

    Return ONLY the JSON object, no additional text or formatting.
    `;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let aiResponse = response.text().trim();

    // Clean up the response to extract JSON
    aiResponse = aiResponse.replace(/```json\s*/, '').replace(/```\s*$/, '');
    
    try {
      const scriptComponents = JSON.parse(aiResponse);
      
      // Validate the structure
      const requiredFields = ['hooks', 'bridges', 'goldenNuggets', 'wtas'];
      for (const field of requiredFields) {
        if (!Array.isArray(scriptComponents[field])) {
          throw new Error(`Invalid structure: ${field} should be an array`);
        }
      }

      // If we have an existing hook, ensure it's included as the first option
      if (existingHook && scriptComponents.hooks.length > 0) {
        // Check if existing hook is already in the list
        const existingHookObj = { 
          title: "Your Original Hook", 
          lines: [existingHook] 
        };
        
        // Remove any duplicate and add as first option
        scriptComponents.hooks = scriptComponents.hooks.filter(
          (hook: any) => !hook.lines?.some((line: string) => line.includes(existingHook.substring(0, 20)))
        );
        scriptComponents.hooks.unshift(existingHookObj);
      }

      return NextResponse.json({ 
        scriptComponents,
        success: true 
      });

    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      
      // Fallback with structure based on existing content
      const fallbackComponents = {
        hooks: existingHook ? [
          { title: "Your Original Hook", lines: [existingHook] },
          { title: "Alternative Hook 1", lines: ["Did you know this could change everything?", "Here's what I discovered..."] },
          { title: "Alternative Hook 2", lines: ["Stop scrolling - this is important", "You need to hear this"] }
        ] : [
          { title: "Generated Hook 1", lines: ["This might surprise you...", "Let me share something important"] },
          { title: "Generated Hook 2", lines: ["Here's what most people don't know", "Pay attention to this"] }
        ],
        bridges: [
          { title: "Smooth Transition", content: "But here's the thing that really matters..." },
          { title: "Story Bridge", content: "Let me tell you why this changed my perspective..." },
          { title: "Question Bridge", content: "So you might be wondering..." }
        ],
        goldenNuggets: [
          { title: "Key Insight", content: "The most important takeaway from this is..." },
          { title: "Actionable Tip", content: "Here's exactly what you need to do..." },
          { title: "Valuable Lesson", content: "What I learned that you can apply immediately..." }
        ],
        wtas: [
          { title: "Engagement CTA", actionType: "like", lines: ["If this helped you, hit that like button", "Let me know in the comments below"] },
          { title: "Follow CTA", actionType: "subscribe", lines: ["Follow for more content like this", "Don't miss my next video"] },
          { title: "Share CTA", actionType: "share", lines: ["Share this with someone who needs to see it", "Tag a friend who would benefit"] }
        ]
      };

      return NextResponse.json({ 
        scriptComponents: fallbackComponents,
        success: true 
      });
    }

  } catch (error: any) {
    console.error('Outline generation error:', error);
    
    return NextResponse.json({ 
      error: 'Failed to generate outline components. Please try again.',
      success: false 
    }, { status: 500 });
  }
} 