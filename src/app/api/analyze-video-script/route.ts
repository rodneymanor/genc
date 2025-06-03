import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  const { transcript, videoUrl } = await req.json();

  if (!transcript) {
    return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const analysisPrompt = `
You are an expert video script analyst. Analyze this video transcript against proven short-form video script structures.

**VIDEO TRANSCRIPT:**
${transcript}

**ANALYSIS FRAMEWORK:**
Evaluate how well this script follows these key components:

1. **HOOK** (First 3-5 seconds): Does it grab attention immediately? Should be surprising, controversial, or promise value.
2. **GOLDEN NUGGET** (Main content): The core valuable information or insight that delivers on the hook's promise.
3. **CALL TO ACTION** (End): Clear instruction for what the viewer should do next (like, comment, follow, etc.).
4. **BRIDGE/TRANSITIONS**: Smooth connections between different parts that maintain engagement.

**SCORING CRITERIA:**
- Score each component 1-10 (10 = excellent, follows best practices perfectly)
- Overall score should be weighted average
- Consider: effectiveness, clarity, engagement, timing, structure

**RESPONSE FORMAT (JSON only):**
{
  "overallScore": 7,
  "overallFeedback": "Brief overall assessment",
  "components": {
    "hook": {
      "score": 8,
      "found": true,
      "content": "Exact quote from transcript if found",
      "feedback": "Specific feedback about the hook",
      "suggestion": "Suggested improvement if score < 8"
    },
    "goldenNugget": {
      "score": 6,
      "found": true,
      "content": "Exact quote from transcript if found",
      "feedback": "Specific feedback about value delivery",
      "suggestion": "Suggested improvement if score < 8"
    },
    "callToAction": {
      "score": 4,
      "found": false,
      "content": null,
      "feedback": "Specific feedback about CTA",
      "suggestion": "Suggested CTA if missing or weak"
    },
    "bridge": {
      "score": 7,
      "found": true,
      "content": "Exact quote showing good transition",
      "feedback": "Feedback about transitions",
      "suggestion": "Suggested improvement if score < 8"
    }
  },
  "improvedScript": "Full rewritten script that follows the structure better (only if overall score < 7)",
  "insights": [
    "Key insight 1 about what works well",
    "Key insight 2 about what could improve"
  ]
}

Analyze the transcript thoroughly and respond with valid JSON only.`;

    const result = await model.generateContent(analysisPrompt);
    const response = await result.response;
    const text = response.text();

    // Clean up the response to ensure it's valid JSON
    let cleanedText = text.trim();
    
    // Remove markdown code blocks if present
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.substring(7);
    }
    if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.substring(3);
    }
    if (cleanedText.endsWith('```')) {
      cleanedText = cleanedText.substring(0, cleanedText.length - 3);
    }
    
    cleanedText = cleanedText.trim();

    try {
      const analysisData = JSON.parse(cleanedText);
      
      // Validate the structure
      if (!analysisData.overallScore || !analysisData.components) {
        throw new Error('Invalid analysis structure');
      }
      
      return NextResponse.json(analysisData);
      
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', parseError);
      console.error('Raw response:', text);
      
      // Fallback response if JSON parsing fails
      return NextResponse.json({
        overallScore: 5,
        overallFeedback: "Analysis completed but with parsing issues. The transcript has been reviewed.",
        components: {
          hook: {
            score: 5,
            found: false,
            content: null,
            feedback: "Unable to fully analyze hook due to processing error",
            suggestion: "Start with a compelling question or surprising statement"
          },
          goldenNugget: {
            score: 5,
            found: false,
            content: null,
            feedback: "Unable to fully analyze main content due to processing error",
            suggestion: "Ensure your main content delivers clear, actionable value"
          },
          callToAction: {
            score: 3,
            found: false,
            content: null,
            feedback: "Unable to fully analyze call to action due to processing error",
            suggestion: "End with a clear call to action like 'Follow for more tips' or 'Comment your thoughts'"
          },
          bridge: {
            score: 5,
            found: false,
            content: null,
            feedback: "Unable to fully analyze transitions due to processing error",
            suggestion: "Use smooth transitions between ideas to maintain flow"
          }
        },
        improvedScript: null,
        insights: [
          "Consider restructuring your script to follow: Hook → Value → Call to Action",
          "Focus on grabbing attention in the first 3 seconds"
        ]
      });
    }

  } catch (error: any) {
    console.error('Error analyzing video script:', error);
    return NextResponse.json({ 
      error: 'Failed to analyze script', 
      details: error.message 
    }, { status: 500 });
  }
} 