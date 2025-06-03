import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { originalTranscript, editedComponents, originalAnalysis } = body;

    if (!originalTranscript || !editedComponents) {
      return NextResponse.json({ error: 'Original transcript and edited components are required' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('Gemini API key is not set.');
      return NextResponse.json({ error: 'Server configuration error: Gemini API key missing.' }, { status: 500 });
    }

    console.log('[API /generate-script-variations] Generating script variations...');

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a professional script writer specializing in viral short-form video content. 

ORIGINAL TRANSCRIPT:
"${originalTranscript}"

ORIGINAL ANALYSIS SCORES:
- Hook Score: ${originalAnalysis?.components?.hook?.score || 'N/A'}/10
- Golden Nugget Score: ${originalAnalysis?.components?.goldenNugget?.score || 'N/A'}/10
- Call to Action Score: ${originalAnalysis?.components?.callToAction?.score || 'N/A'}/10
- Bridge Score: ${originalAnalysis?.components?.bridge?.score || 'N/A'}/10
- Overall Score: ${originalAnalysis?.overallScore || 'N/A'}/10

USER'S EDITED COMPONENTS:
- Hook: "${editedComponents.hook || ''}"
- Golden Nugget (Value Content): "${editedComponents.goldenNugget || ''}"
- Call to Action: "${editedComponents.callToAction || ''}"
- Bridge/Transitions: "${editedComponents.bridge || ''}"

TASK: Generate 3 different script variations that incorporate the user's edited components. Each variation should:
1. Use the user's provided hook, golden nugget, call to action, and bridge elements
2. Create smooth, natural transitions between components
3. Maintain viral short-form video best practices
4. Be optimized for engagement and retention
5. Feel natural and conversational, not robotic
6. Be approximately the same length as the original (keep it concise)

For each variation, provide:
- A brief description of the approach/style
- The complete script text

Format your response as a JSON array with this structure:
[
  {
    "description": "Brief description of this variation's approach",
    "script": "Complete script text with natural flow"
  },
  {
    "description": "Brief description of this variation's approach", 
    "script": "Complete script text with natural flow"
  },
  {
    "description": "Brief description of this variation's approach",
    "script": "Complete script text with natural flow"
  }
]

Make sure each script flows naturally and incorporates ALL the user's edited components seamlessly.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    // Try to parse the JSON response
    let variations;
    try {
      // Remove any markdown code block formatting if present
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      variations = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('[API /generate-script-variations] Failed to parse JSON response:', parseError);
      // Fallback: create a single variation from the raw text
      variations = [
        {
          description: "Generated script variation",
          script: text
        }
      ];
    }

    // Ensure we have an array of variations
    if (!Array.isArray(variations)) {
      variations = [variations];
    }

    // Validate each variation has required fields
    variations = variations.map((variation, index) => ({
      description: variation.description || `Variation ${index + 1}`,
      script: variation.script || text
    }));

    console.log(`[API /generate-script-variations] Successfully generated ${variations.length} variations`);

    return NextResponse.json({ variations }, { status: 200 });

  } catch (error: any) {
    console.error('[API /generate-script-variations] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate script variations', 
      details: error.message 
    }, { status: 500 });
  }
} 