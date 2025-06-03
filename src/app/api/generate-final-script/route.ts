import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, GenerationConfig, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { UserSelectedScriptComponents } from '@/lib/types/scriptComponents';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ message: 'Gemini API configuration missing on server' }, { status: 500 });
  }

  try {
    const { videoIdea, selectedComponents, voiceProfile } = await req.json() as { 
      videoIdea: string, 
      selectedComponents: UserSelectedScriptComponents,
      voiceProfile?: any // Voice profile data when available
    };

    if (!videoIdea || !selectedComponents) {
      return NextResponse.json({ message: 'Video idea and selected script components are required' }, { status: 400 });
    }
    if (!selectedComponents.hook || !selectedComponents.bridge || !selectedComponents.goldenNugget || !selectedComponents.wta) {
      return NextResponse.json({ message: 'All script components (hook, bridge, golden nugget, wta) must be selected to generate a final script.' }, { status: 400 });
    }

    // Construct the prompt for Gemini with voice profile integration
    let prompt = `You are an expert AI scriptwriter tasked with assembling a cohesive and engaging short-form video script (e.g., for TikTok, YouTube Shorts, Instagram Reels).

Video Idea: "${videoIdea}"`;

    // Add voice profile instructions if available
    if (voiceProfile && voiceProfile.voiceProfile) {
      const coreIdentity = voiceProfile.voiceProfile.coreIdentity;
      const actionableComponents = voiceProfile.voiceProfile.actionableSystemPromptComponents;

      prompt += `\n\nIMPORTANT: You must write this script in the specific voice and style of "${voiceProfile.name}". Follow these voice guidelines carefully:

VOICE IDENTITY:
- Persona: ${coreIdentity.suggestedPersonaName || 'Content Creator'}
- Primary Tones: ${coreIdentity.dominantTones?.join(', ') || 'Conversational'}
- Secondary Tones: ${coreIdentity.secondaryTones?.join(', ') || 'Engaging'}
- Unique Characteristics: ${coreIdentity.uniqueIdentifiersOrQuirks?.join(', ') || 'Authentic and relatable'}

WRITING DIRECTIVES:
${actionableComponents?.voiceDnaSummaryDirectives?.map((directive: string, index: number) => `${index + 1}. ${directive}`).join('\n') || '1. Maintain an authentic, conversational tone\n2. Engage directly with the audience\n3. Deliver clear, valuable insights'}

TONE EXAMPLES:
${coreIdentity.toneExemplars?.map((example: string) => `- "${example}"`).join('\n') || '- Speak directly to the viewer\n- Use relatable examples\n- Be engaging and enthusiastic'}`;

      // Add negative constraints if available
      if (actionableComponents?.consolidatedNegativeConstraints) {
        const constraints = actionableComponents.consolidatedNegativeConstraints;
        if (constraints.wordsToAvoid?.length) {
          prompt += `\n\nAVOID THESE WORDS/PHRASES: ${constraints.wordsToAvoid.join(', ')}`;
        }
        if (constraints.tonesToAvoid?.length) {
          prompt += `\nAVOID THESE TONES: ${constraints.tonesToAvoid.join(', ')}`;
        }
      }

      prompt += `\n\nEnsure the final script authentically captures this creator's voice while delivering the selected components.`;
    }

    prompt += `\n\nAssemble the following user-selected components into a flowing script. Ensure smooth transitions between components. The script should be concise and impactful.

Selected Hook:\nTitle: ${selectedComponents.hook.title}\nLines: ${selectedComponents.hook.lines.join('\n')}\n\n`;

    prompt += `Selected Bridge:\nTitle: ${selectedComponents.bridge.title}\nContent: ${selectedComponents.bridge.content}\n\n`;

    prompt += `Selected Golden Nugget:\nTitle: ${selectedComponents.goldenNugget.title}\nContent: ${selectedComponents.goldenNugget.content}\n\n`;

    prompt += `Selected WTA (Why To Act):\nTitle: ${selectedComponents.wta.title}\nAction Type: ${selectedComponents.wta.actionType}\nLines: ${selectedComponents.wta.lines.join('\n')}\n\n`;

    if (voiceProfile) {
      prompt += `Remember: Write this script exactly as "${voiceProfile.name}" would speak. Maintain their authentic voice, tone, and style throughout the entire script.

`;
    }

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