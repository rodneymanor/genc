import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, GenerationConfig, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
// Removed: import { Source } from '@/contexts/AiWriterContext';
import { ScriptComponents, ScriptFactset } from '@/lib/types/scriptComponents'; // Import our new types

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Updated responseSchema
const responseSchema = {
  type: "object",
  properties: {
    hooks: {
      type: "array",
      description: "Generate 3-4 distinct, engaging hooks for a short-form video based on the provided topic and research analysis.",
      items: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "A short, descriptive title for the hook (e.g., 'Intrigue Hook', 'Problem Hook')."
          },
          lines: {
            type: "array",
            description: "2-4 short lines that form the hook.",
            items: { type: "string" }
          }
        },
        required: ["title", "lines"]
      }
    },
    factsets: {
      type: "array",
      description: "Generate a variety of categorized script components based on the research analysis. This includes Bridges, MicroHooks, and GoldenNuggets.",
      items: {
        type: "object",
        properties: {
          category: {
            type: "string",
            description: "The category of the component. Must be one of: 'Bridge', 'MicroHook', 'GoldenNugget'."
          },
          content: {
            type: "string",
            description: "The concise content for the component (1-3 sentences typically). Specific instructions for each category will be provided in the prompt."
          }
        },
        required: ["category", "content"]
      }
    },
    takes: { // Kept 'takes' for general insights, but with lower emphasis if not directly prompted for.
      type: "array",
      description: "Generate 1-2 insightful 'Takes' or perspectives on the topic, derived from the research analysis, if applicable.",
      items: {
        type: "object",
        properties: {
          perspective: {
            type: "string",
            description: "The type of perspective being offered (e.g., 'Underlying Theme', 'Broader Implication')."
          },
          content: {
            type: "string",
            description: "A short paragraph (2-4 sentences) elaborating on this perspective."
          }
        },
        required: ["perspective", "content"]
      }
    },
    outros: {
      type: "array",
      description: "Generate 3-4 distinct 'WTA (Why to Act)' components for the short-form video. These serve as calls to action or concluding thoughts that encourage engagement.",
      items: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "A short, descriptive title for the WTA (e.g., 'WTA - Urgency', 'WTA - Benefit')."
          },
          lines: {
            type: "array",
            description: "1-3 short lines that form the WTA.",
            items: { type: "string" }
          }
        },
        required: ["title", "lines"]
      }
    }
  },
  required: ["hooks", "factsets", "outros"] // 'takes' is now optional if AI doesn't generate it based on prompt focus
};

export async function POST(req: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ message: 'Gemini API configuration missing on server' }, { status: 500 });
  }

  try {
    const { videoIdea, researchAnalysisText } = await req.json() as { videoIdea: string, researchAnalysisText: string };

    if (!videoIdea || !researchAnalysisText) {
      return NextResponse.json({ message: 'Video idea and researchAnalysisText are required' }, { status: 400 });
    }

    const fullPrompt = `You are an expert AI scriptwriting assistant and content strategist. Your task is to use the provided video idea and a research analysis resource to generate a variety of modular script components for a short-form video. These components will allow the user to pick and choose to assemble their final script.\n\nYour output MUST be a valid JSON object adhering to the provided schema.\n\nVideo Idea:\n"${videoIdea}"\n\nResearch Analysis Resource (300-400 word document synthesized from multiple sources):\n"${researchAnalysisText}"\n\nBased on the video idea and the Research Analysis Resource, generate the following script components:\n\n1.  **Hooks (3-4 options):**\n    *   Each hook should be short (2-4 lines), attention-grabbing, and directly relevant to the video idea.\n    *   Provide a short \`title\` for each hook option (e.g., 'Intrigue Hook', 'Problem Hook').\n\n2.  **Categorized Components (as 'factsets' in JSON):** Generate 3-4 options for each of the following categories. The \`category\` field in the JSON for these items MUST be exactly 'Bridge', 'MicroHook', or 'GoldenNugget'.\n    *   **Bridge (3-4 options):** \n        *   Purpose: Explain \"the why\" - why the audience should listen, why they must solve the problem this video addresses.\n        *   Format: 1-2 concise sentences. \n        *   Example category in JSON: \"Bridge\"\n    *   **MicroHook (3-4 options):** \n        *   Purpose: A way to keep the user engaged, following a pattern like: "1. [Statement/Fact]! Why? Because - 2. [Another Statement/Fact]. So why am I telling you this? Because. 3. [Yet another]. So why is this important? Because as you [action/realization]. 4. So what does this mean for you? You [implication/benefit]. 5. So the real question is: [Provocative Question]?" Adapt this pattern; not all 5 parts are always needed, but capture the essence of re-hooking and building intrigue.\n        *   Format: A short, connected multi-part statement. \n        *   Example category in JSON: \"MicroHook\"\n    *   **Golden Nugget (3-4 options):** \n        *   Purpose: The core solution, main value proposition, or the crucial first step the audience can take.\n        *   Format: 1-2 concise, impactful sentences. \n        *   Example category in JSON: \"GoldenNugget\"\n\n3.  **Takes (1-2 options, optional):** \n    *   If there are any overarching themes or profound implications from the Research Analysis Resource not covered above, provide 1-2 insightful 'Takes'.\n    *   Each Take should be a short paragraph (2-4 sentences).\n    *   Assign a \`perspective\` label (e.g., 'Underlying Theme', 'Broader Implication').\n
4.  **WTA - Why to Act (3-4 options, as 'outros' in JSON):**\n    *   Purpose: Serve as compelling calls to action or concluding thoughts that encourage viewer engagement or action based on the video's content.\n    *   Format: 1-3 short lines.\n    *   Provide a short \`title\` for each WTA option (e.g., 'WTA - Urgency', 'WTA - Benefit Focus').\n
Ensure all generated content is creative, insightful, and directly usable for creating a compelling short-form video script. Focus on extracting and synthesizing the essence of the provided Research Analysis Resource into these distinct, modular components. Adhere strictly to the JSON output schema.`;

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro-latest", 
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema as any, // Cast as any to satisfy type, schema structure is validated by Gemini
        temperature: 0.75, // Slightly increased for more varied creative options
      } as GenerationConfig,
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ],
    });

    // console.log("Full prompt for script components:", fullPrompt); // For debugging
    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    
    if (response.text()) {
      try {
        const jsonData: ScriptComponents = JSON.parse(response.text());
        // Validate that all required component arrays exist, even if empty, as per schema (except optional 'takes')
        if (jsonData.hooks === undefined || jsonData.factsets === undefined || jsonData.outros === undefined) {
            throw new Error("Malformed JSON structure: Missing one or more required component arrays (hooks, factsets, outros).");
        }
        // Ensure takes is at least an empty array if not present, to match ScriptComponents type
        if (jsonData.takes === undefined) {
            jsonData.takes = [];
        }
        return NextResponse.json(jsonData, { status: 200 });
      } catch (parseError: any) {
        console.error("Failed to parse Gemini response as JSON:", parseError.message);
        console.error("Gemini raw response text:", response.text());
        return NextResponse.json({ message: "Failed to parse script components from AI response.", rawResponse: response.text(), errorDetails: parseError.message }, { status: 500 });
      }
    } else {
      console.error("Gemini response was empty or blocked. Candidate:", response.candidates?.[0]);
      const blockReason = response.candidates?.[0]?.finishReason;
      const safetyRatings = response.candidates?.[0]?.safetyRatings;
      const promptFeedback = response.promptFeedback;
      return NextResponse.json({ 
        message: "Received no valid response from AI for script components.", 
        blockReason: blockReason,
        safetyRatings: safetyRatings,
        promptFeedback: promptFeedback
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('[API Route Error - generate-script-components]', error);
    return NextResponse.json({ message: 'Failed to generate script components', error: error.message || error.toString() }, { status: 500 });
  }
} 