import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, GenerationConfig, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { UserSelectedScriptComponents } from '@/lib/types/scriptComponents';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ message: 'Gemini API configuration missing on server' }, { status: 500 });
  }

  try {
    const { videoIdea, selectedComponents } = await req.json() as { videoIdea: string, selectedComponents: UserSelectedScriptComponents };

    if (!videoIdea || !selectedComponents) {
      return NextResponse.json({ message: 'Video idea and selected script components are required' }, { status: 400 });
    }
    if (!selectedComponents.hook || selectedComponents.factsets.length === 0 || !selectedComponents.take || !selectedComponents.outro) {
      return NextResponse.json({ message: 'All script components (hook, at least one factset, take, outro) must be selected to generate a final script.' }, { status: 400 });
    }

    // Construct the prompt for Gemini
    let prompt = `You are an expert AI scriptwriter tasked with assembling a cohesive and engaging short-form video script (e.g., for TikTok, YouTube Shorts, Instagram Reels).

Video Idea: "${videoIdea}"

Assemble the following user-selected components into a flowing script. Ensure smooth transitions between components. The script should be concise and impactful.

Selected Hook:\nTitle: ${selectedComponents.hook.title}\nLines: ${selectedComponents.hook.lines.join('\n')}\n\n`;

    prompt += 'Selected Factset(s):\n';
    selectedComponents.factsets.forEach((factset, index) => {
      prompt += `${index + 1}. Category: ${factset.category}\n   Content: ${factset.content}\n\n`;
    });
    prompt += `Selected Take:\nPerspective: ${selectedComponents.take.perspective}\nContent: ${selectedComponents.take.content}\n\n`;

    prompt += `Selected Outro:\nTitle: ${selectedComponents.outro.title}\nLines: ${selectedComponents.outro.lines.join('\n')}\n\n`;

    prompt += `Please generate the final script text. You can add brief scene directions or narrator cues if it enhances readability (e.g., [VISUAL: ...], NARRATOR:). Focus on a natural flow and engaging delivery. The output should be the script text itself, ready to be used.`;

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    // Using a model suitable for creative text generation. JSON mode not strictly needed here unless we want structured script output.
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro-latest",
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ],
    });

    const generationConfig: GenerationConfig = {
      temperature: 0.7,
      maxOutputTokens: 2048, // Adjust as needed for script length
      // responseMimeType: "text/plain", // If you want plain text output
    };

    const result = await model.generateContent({ contents: [{ role: "user", parts: [{text: prompt}] }] , generationConfig});
    const response = result.response;
    const scriptText = response.text();

    if (scriptText) {
      return NextResponse.json({ script: scriptText }, { status: 200 });
    } else {
      console.error("Gemini final script response was empty or blocked. Candidate:", response.candidates?.[0]);
      const blockReason = response.candidates?.[0]?.finishReason;
      const safetyRatings = response.candidates?.[0]?.safetyRatings;
      return NextResponse.json({ 
        message: "Received no valid response from AI for the final script.", 
        blockReason: blockReason,
        safetyRatings: safetyRatings,
        promptFeedback: response.promptFeedback
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('[API Route Error - generate-final-script]', error);
    return NextResponse.json({ message: 'Failed to generate final script', error: error.message || error.toString() }, { status: 500 });
  }
} 