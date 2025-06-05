import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, GenerationConfig, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
// Removed: import { Source } from '@/contexts/AiWriterContext';
import { ScriptComponents, ScriptFactset } from '@/lib/types/scriptComponents'; // Import our new types

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Scripting style constants
const scriptingStyleTranscript = `**Core Scripting Style Explanation: My Video Creation Process**

**I. Overall Script Structure & Philosophy (The "Seven Laws of Script Writing"):**
* **Core Components:** Hook, Bridge, Golden Nugget, and Why To Act (WTA).
* **Fundamental Goal:** Hook the audience, speak directly to one person, deliver a clear and valuable message in a conversational tone, use micro-hooks for engagement, and provide a compelling reason to act.

**II. Key Principles for All Script Components:**
* **Speak to ONE Person:**
    * Wording must be crafted as if you are speaking directly to a single individual.
    * **Example:**
        * *Avoid:* "I know many of you have a problem."
        * *Use:* "I know you are struggling with this because many people do."
* **Tone & Delivery:**
    * **Easy to Understand:** Use simple, clear language.
    * **Conversational:** Maintain a natural, chatty style.
    * **Not Presentational:** Avoid a formal or speech-like delivery.
* **Use Micro-Hooks:** Integrate these throughout the script to continually re-engage the viewer.
* **Clear, Valuable Message:** Ensure the core takeaway is obvious and beneficial.
* **Reason to Act (WTA Distinction):** The WTA is not just a call to action; it's about providing the *reason why* the viewer should take that action. Focus on "What's the reason for people to take the action you want to take?"`;

const humanizationPrinciples = `**Humanization Principles: Sentence Transformation Guide**

**Purpose:**
This guide outlines principles for transforming standard short-form video scripts into natural, human-sounding spoken scripts. The goal is to make scripts feel casual, conversational, and engaging, rather than written or presentational.

**Core Objectives (What to Do Well):**
* **Maintain Original Message:** The core idea and intent of the script must remain unchanged.
* **Improve Conversational Flow:** Reword sentences only to make the script sound like natural spoken language.
* **Use Casual, Friendly, Engaging Language:** Avoid robotic or corporate tones.
* **Address One Person:** Use "you" frequently to make the viewer feel personally spoken to.
* **Ensure Clarity & Ease of Understanding:** Avoid complex words or overly formal phrasing.`;

const goldenNuggetExamplesList = `**Golden Nugget Examples List**

1. **Problem-Solution Format:** "The reason your content isn't getting views is because you're posting at the wrong time. Post between 6-9 PM when your audience is most active."

2. **Framework Delivery:** "Use the 3-2-1 method: 3 hooks, 2 bridges, 1 golden nugget. This structure keeps viewers engaged from start to finish."

3. **Actionable Steps:** "Here's exactly what to do: Open your analytics, find your top 3 performing posts, and recreate them with a fresh angle."`;

const wtaTemplatesList = `**WTA (Why To Act) Templates & Engaging Questions List**

**A. WTA Templates - FOLLOW:**
* If you want (SPECIFIC DESIRED OUTCOME) hit the follow.
* For daily (GOLDEN SPINE) hit the follow.
* You can learn a lot about (GOLDEN SPINE) if you hit follow.

**B. WTA Templates - COMMENT:**
* Do you agree 👍 or disagree 👎 let me know below.
* Which one do you prefer A or B let me know below.
* On a 0-10 scale! How helpful was this video? Let me know in the comments!`;

const conversationalPhrasesList = `**Conversational Phrases & Engagement Techniques**

**I. The Power of "YOU" (Making Videos More Natural):**
‼️ You can make your videos sound more natural if you just start using the word 'YOU' more often!

**II. RELATABLE - Phrases to Create a Feeling of Relatability:**
* You know when you…
* You must have seen…
* I don't know about you but whenever I…
* If you're anything like me, you've probably experienced...`;

// Gemini 1.5 Pro pricing (as of 2024) - Update these if pricing changes
const GEMINI_PRICING = {
  inputTokensPerMillion: 1.25, // $1.25 per 1M input tokens
  outputTokensPerMillion: 5.00, // $5.00 per 1M output tokens
};

// Function to estimate token count (rough approximation: 1 token ≈ 4 characters)
function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

// Function to calculate cost
function calculateCost(inputTokens: number, outputTokens: number) {
  const inputCost = (inputTokens / 1000000) * GEMINI_PRICING.inputTokensPerMillion;
  const outputCost = (outputTokens / 1000000) * GEMINI_PRICING.outputTokensPerMillion;
  const totalCost = inputCost + outputCost;
  
  return {
    inputTokens,
    outputTokens,
    inputCost: parseFloat(inputCost.toFixed(6)),
    outputCost: parseFloat(outputCost.toFixed(6)),
    totalCost: parseFloat(totalCost.toFixed(6))
  };
}

// Updated responseSchema
const responseSchema = {
  type: "object",
  properties: {
    hooks: {
      type: "array",
      description: "Generate exactly 5 distinct, engaging hooks for a short-form video based on the provided topic and research analysis.",
      items: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "A short, descriptive title for the hook (e.g., 'Problem Hook', 'Curiosity Hook', 'Benefit Hook')."
          },
          lines: {
            type: "array",
            description: "2-4 short lines that form the hook.",
            items: { type: "string" }
          }
        },
        required: ["title", "lines"]
      },
      minItems: 5,
      maxItems: 5
    },
    bridges: {
      type: "array",
      description: "Generate exactly 5 distinct bridge options that connect with the audience by addressing their frustrations, desires, and objections.",
      items: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "A short, descriptive title for the bridge (e.g., 'Empathy Bridge', 'Problem Bridge', 'Relatability Bridge')."
          },
          content: {
            type: "string",
            description: "1-2 concise sentences that build rapport and make the message relatable."
          }
        },
        required: ["title", "content"]
      },
      minItems: 5,
      maxItems: 5
    },
    goldenNuggets: {
      type: "array",
      description: "Generate exactly 5 distinct golden nugget options that deliver the core value and solution of the video.",
      items: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "A short, descriptive title for the golden nugget (e.g., 'Simple Solution', 'Key Insight', 'Core Method')."
          },
          content: {
            type: "string",
            description: "1-2 concise, highly impactful sentences that present the solution as 'easier than they think'."
          }
        },
        required: ["title", "content"]
      },
      minItems: 5,
      maxItems: 5
    },
    wtas: {
      type: "array",
      description: "Generate exactly 5 distinct 'Why To Act' options that provide compelling reasons for viewers to take specific actions.",
      items: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "A short, descriptive title for the WTA including the action type (e.g., 'Follow - Daily Tips', 'Comment - Share Experience', 'Save - Reference Tool')."
          },
          actionType: {
            type: "string",
            description: "The primary action being requested (e.g., 'follow', 'comment', 'share', 'save', 'like')."
          },
          lines: {
            type: "array",
            description: "1-3 short lines that form the WTA, with action keywords positioned at the end.",
            items: { type: "string" }
          }
        },
        required: ["title", "actionType", "lines"]
      },
      minItems: 5,
      maxItems: 5
    }
  },
  required: ["hooks", "bridges", "goldenNuggets", "wtas"]
};

export async function POST(req: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ message: 'Gemini API configuration missing on server' }, { status: 500 });
  }

  try {
    const { 
      videoIdea, 
      researchAnalysisText,
      voiceProfile,
      voiceInfluenceSettings,
      customHooks 
    } = await req.json() as { 
      videoIdea: string; 
      researchAnalysisText: string;
      voiceProfile?: any;
      voiceInfluenceSettings?: {
        hooks?: boolean;
        bridges?: boolean;
        goldenNuggets?: boolean;
        wtas?: boolean;
        languagePatterns?: boolean;
        toneApplication?: boolean;
      };
      customHooks?: Array<{
        id: string;
        title: string;
        template: string;
        example?: string;
        category: string;
        isActive: boolean;
      }>;
    };

    if (!videoIdea || !researchAnalysisText) {
      return NextResponse.json({ message: 'Video idea and research analysis text are required' }, { status: 400 });
    }

    console.log(`[API /generate-script-components] Starting generation for: "${videoIdea.substring(0, 100)}..."`);
    console.log(`[API /generate-script-components] Voice Profile Active:`, !!voiceProfile);
    console.log(`[API /generate-script-components] Voice Influences:`, voiceInfluenceSettings);
    console.log(`[API /generate-script-components] Custom Hooks:`, customHooks?.filter(h => h.isActive).length || 0);

    // Build enhanced prompt with voice integration
    let enhancedPrompt = constructBasePrompt(videoIdea, researchAnalysisText);

    // Add voice profile integration if active and enabled
    if (voiceProfile && voiceInfluenceSettings) {
      enhancedPrompt = integrateVoiceProfile(
        enhancedPrompt, 
        voiceProfile, 
        voiceInfluenceSettings,
        customHooks
      );
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro-latest", 
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema as any,
        temperature: 0.75,
      } as GenerationConfig,
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ],
    });

    console.log(`[API /generate-script-components] Enhanced prompt length: ${enhancedPrompt.length} characters`);
    
    const estimatedInputTokens = estimateTokenCount(enhancedPrompt);
    
    const result = await model.generateContent(enhancedPrompt);
    const response = result.response;
    
    if (response.text()) {
      try {
        const jsonData: ScriptComponents = JSON.parse(response.text());
        if (jsonData.hooks === undefined || jsonData.bridges === undefined || jsonData.goldenNuggets === undefined || jsonData.wtas === undefined) {
            throw new Error("Malformed JSON structure: Missing one or more required component arrays (hooks, bridges, goldenNuggets, wtas).");
        }
        
        const estimatedOutputTokens = estimateTokenCount(response.text());
        const costInfo = calculateCost(estimatedInputTokens, estimatedOutputTokens);
        
        console.log('🔥 Enhanced Script Components Generation Cost:', {
          timestamp: new Date().toISOString(),
          videoIdea: videoIdea.substring(0, 50) + '...',
          voiceProfileUsed: !!voiceProfile,
          activeInfluences: Object.entries(voiceInfluenceSettings || {}).filter(([_, enabled]) => enabled).length,
          customHooksUsed: customHooks?.filter(h => h.isActive).length || 0,
          ...costInfo
        });
        
        return NextResponse.json({
          ...jsonData,
          _metadata: {
            costInfo,
            generatedAt: new Date().toISOString(),
            promptLength: enhancedPrompt.length,
            responseLength: response.text().length,
            voiceEngineUsed: !!voiceProfile,
            voiceInfluences: voiceInfluenceSettings,
            customHooksApplied: customHooks?.filter(h => h.isActive).length || 0
          }
        }, { status: 200 });
      } catch (parseError: any) {
        console.error("Failed to parse Gemini response as JSON:", parseError.message);
        console.error("Gemini raw response text:", response.text());
        return NextResponse.json({ message: "Failed to parse script components from AI response.", rawResponse: response.text(), errorDetails: parseError.message }, { status: 500 });
      }
    }

    console.error("[API /generate-script-components] No text response from Gemini");
    return NextResponse.json({ message: "No response generated from AI model." }, { status: 500 });

  } catch (error: any) {
    console.error("[API /generate-script-components] Error:", error);
    return NextResponse.json({ message: "Internal server error during script component generation.", error: error.message }, { status: 500 });
  }
}

// Helper function to construct base prompt
function constructBasePrompt(videoIdea: string, researchAnalysisText: string): string {
  return `Role:
You are an expert AI Scriptwriting Assistant and Conversational Content Strategist. You specialize in creating highly engaging, human-sounding, and value-driven short-form video script components that meticulously adhere to a specific, proven scripting methodology. Your goal is to empower users to assemble outstanding video scripts.

Instruction:
Your primary task is to generate a comprehensive set of modular video script components following the PRIMARY SCRIPT FLOW structure. This generation MUST be based on the provided "Video Idea" and "Research Analysis Text".

PRIMARY SCRIPT FLOW (Generate exactly 5 options for each component in this order):
1. **Hook** (5 options)
2. **Bridge** (5 options) 
3. **Golden Nugget** (5 options)
4. **Why To Act (WTA)** (5 options)

CRITICAL: You MUST thoroughly study, internalize, and apply ALL principles, styles, and examples detailed in the "Guiding Documents" (provided in the Context section) to EVERY piece of content you generate. This is paramount for success.

Output Requirements:
1.  **JSON Format:** Your entire output MUST be a single, valid JSON object. Strictly adhere to the JSON \`responseSchema\`
2.  **Component Richness & Completeness:**
    * Generate EXACTLY 5 distinct options for each of the 4 primary components.
    * Ensure ALL generated components are substantial, creative, distinct, and directly usable.
    * Avoid empty strings, placeholder content, or incomplete components within any part of the JSON structure.
3.  **Stylistic Adherence (MANDATORY - Refer to Guiding Documents):**
    * **Conversational & Personal Tone:** Write as if speaking directly to ONE person ("you"). Use simple, everyday language. The tone should be friendly, relatable, and empathetic. Avoid formal, academic, presentational, or robotic language. (Directly apply "Humanization Principles" esp. 1, 2, 3, 7, 9).
    * **Value First:** Every component must contribute to delivering clear, tangible value to the viewer. The "Golden Nugget" is central to this, but all parts should support it. (Reference "Scripting Style Explanation" regarding value, 90/10 rule).
    * **Engagement is Key:** Actively use micro-hooks (inspired by the "Micro-Hook Examples List" and relevant sections of the "Scripting Style Explanation") and engaging questions (inspired by "Conversational Phrases List") to maintain viewer interest throughout the script. (Directly apply "Humanization Principle 8").
    * **Clarity and Simplicity:** The message must be exceptionally easy to understand for a broad audience.
    * **Humanization:** Consistently apply all "Humanization Principles" to make the script sound natural, authentic, and relatable.

4.  **Component Generation - Specific Guidelines (Always cross-reference with "Guiding Documents"):**

    * **Hooks (Generate exactly 5 distinct options):**
        * **Purpose:** Instantly grab attention (target the first 3 seconds). Clearly identify who the video is for and the core problem/topic. Spark significant curiosity.
        * **Style:** Place essential keywords as close as possible to the *beginning* of the hook. (Reference "Scripting Style Explanation" for Hook structure and "Humanization Principle 5"). Utilize or adapt phrases from the "Curiosity Phrases" section within the "Conversational Phrases List."
        * **Format:** Each hook should be 2-4 short, impactful lines. Provide a descriptive title for each hook (e.g., "Problem Hook", "Curiosity Hook", "Benefit Hook").

    * **Bridges (Generate exactly 5 distinct options):**
        * **Purpose:** Seamlessly connect the hook to the golden nugget. Build rapport and make the message relatable to the target audience. Address their frustrations, desires, and potential objections.
        * **Style:** Use empathetic language and personal connection phrases from the "Conversational Phrases List." Make the audience feel understood and seen.
        * **Format:** Each bridge should be 1-2 concise, relatable sentences. Provide a descriptive title for each bridge.

    * **Golden Nuggets (Generate exactly 5 distinct options):**
        * **Purpose:** Deliver the core value, insight, or solution. This is the meat of the content that viewers will remember and potentially act upon.
        * **Style:** Be specific, actionable, and easy to follow. Use structured approaches (lists, steps, frameworks) when appropriate. Reference "Golden Nugget Examples List" for inspiration and "Scripting Style Explanation" for value delivery principles.
        * **Format:** Each golden nugget should be substantial and complete. Provide a descriptive title for each.

    * **Why To Act/WTA (Generate exactly 5 distinct options):**
        * **Purpose:** Create urgency and motivate immediate action. Connect the value delivered back to the audience's desired outcome.
        * **Style:** Use action-oriented language and urgency-creating phrases from the "WTA Templates & Engaging Questions List." Make the call to action feel natural and beneficial, not pushy.
        * **Format:** Each WTA should include a clear action type and 2-3 lines that build urgency. Provide descriptive titles and specify the action type.

Context:

    * **Document 1: Scripting Style Explanation:**
        \`\`\`text
        ${scriptingStyleTranscript}
        \`\`\`

    * **Document 2: Humanization Principles:**
        \`\`\`text
        ${humanizationPrinciples}
        \`\`\`

    * **Document 3: Golden Nugget Examples List:**
        \`\`\`text
        ${goldenNuggetExamplesList}
        \`\`\`

    * **Document 4: WTA Templates & Engaging Questions List:**
        \`\`\`text
        ${wtaTemplatesList}
        \`\`\`

    * **Document 5: Conversational Phrases & Curiosity Kickers List:**
        \`\`\`text
        ${conversationalPhrasesList}
        \`\`\`

3.  **User Inputs (These will be specific to each generation request):**
    * **Video Idea:** "${videoIdea}"
    * **Research Analysis Text:** "${researchAnalysisText}"

Generate exactly 5 options for each component following the PRIMARY SCRIPT FLOW order: Hooks → Bridges → Golden Nuggets → WTAs.`;
}

// Helper function to integrate voice profile into prompt
function integrateVoiceProfile(
  basePrompt: string, 
  voiceProfile: any, 
  voiceInfluenceSettings: any,
  customHooks?: any[]
): string {
  let enhancedPrompt = basePrompt;

  // Add voice profile section if any influences are enabled
  const activeInfluences = Object.entries(voiceInfluenceSettings).filter(([_, enabled]) => enabled);
  
  if (activeInfluences.length > 0) {
    enhancedPrompt += `

VOICE ENGINE INTEGRATION - CRITICAL INSTRUCTIONS:

You MUST apply the following voice characteristics from "${voiceProfile.name}" to the specified components:`;

    // Add voice identity information
    if (voiceProfile.voiceProfile?.coreIdentity) {
      const identity = voiceProfile.voiceProfile.coreIdentity;
      enhancedPrompt += `

VOICE IDENTITY TO APPLY:
* Persona: ${identity.suggestedPersonaName || 'Content Creator Voice'}
* Primary Tones: ${identity.dominantTones?.join(', ') || 'Conversational, Engaging'}
* Secondary Tones: ${identity.secondaryTones?.join(', ') || 'Authentic'}
* Signature Characteristics: ${identity.uniqueIdentifiersOrQuirks?.join(', ') || 'Natural and relatable communication'}
* Tone Examples: ${identity.toneExemplars?.slice(0, 3).map((ex: string) => `"${ex}"`).join(', ') || 'Engaging and authentic expressions'}`;
    }

    // Add voice DNA directives if available
    if (voiceProfile.voiceProfile?.actionableSystemPromptComponents?.voiceDnaSummaryDirectives) {
      enhancedPrompt += `

VOICE DNA DIRECTIVES TO IMPLEMENT:
${voiceProfile.voiceProfile.actionableSystemPromptComponents.voiceDnaSummaryDirectives.map((directive: string, index: number) => 
  `${index + 1}. ${directive.replace(/\*\*/g, '')}`
).join('\n')}`;
    }

    // Add component-specific voice influences
    enhancedPrompt += `

COMPONENT-SPECIFIC VOICE APPLICATION:`;

    if (voiceInfluenceSettings.hooks) {
      enhancedPrompt += `
* HOOKS: Apply the voice's hook strategies and opening style. Use their typical question patterns, bold statement approaches, and opening energy level.`;
    }

    if (voiceInfluenceSettings.bridges) {
      enhancedPrompt += `
* BRIDGES: Apply the voice's transition style and audience connection methods. Use their typical empathy phrases and rapport-building language.`;
    }

    if (voiceInfluenceSettings.goldenNuggets) {
      enhancedPrompt += `
* GOLDEN NUGGETS: Apply the voice's content delivery patterns and value presentation style. Use their structural templates and insight delivery methods.`;
    }

    if (voiceInfluenceSettings.wtas) {
      enhancedPrompt += `
* CTAs/WTAs: Apply the voice's call-to-action style and urgency creation methods. Use their typical action phrases and motivational language.`;
    }

    if (voiceInfluenceSettings.languagePatterns) {
      enhancedPrompt += `
* LANGUAGE PATTERNS: Apply the voice's sentence structure preferences, complexity level, vocabulary choices, and grammatical patterns throughout ALL components.`;
    }

    if (voiceInfluenceSettings.toneApplication) {
      enhancedPrompt += `
* TONE APPLICATION: Apply the voice's tonal characteristics, energy levels, and emotional expression patterns throughout ALL components.`;
    }

    // Add negative constraints if available
    if (voiceProfile.voiceProfile?.actionableSystemPromptComponents?.consolidatedNegativeConstraints) {
      const constraints = voiceProfile.voiceProfile.actionableSystemPromptComponents.consolidatedNegativeConstraints;
      if (constraints.wordsToAvoid?.length || constraints.phrasesToAvoid?.length || constraints.tonesToAvoid?.length) {
        enhancedPrompt += `

VOICE CONSTRAINTS TO AVOID:`;
        if (constraints.wordsToAvoid?.length) {
          enhancedPrompt += `
* Avoid these words: ${constraints.wordsToAvoid.join(', ')}`;
        }
        if (constraints.phrasesToAvoid?.length) {
          enhancedPrompt += `
* Avoid these phrases: ${constraints.phrasesToAvoid.join(', ')}`;
        }
        if (constraints.tonesToAvoid?.length) {
          enhancedPrompt += `
* Avoid these tones: ${constraints.tonesToAvoid.join(', ')}`;
        }
      }
    }
  }

  // Add custom hook structures if enabled and available
  const activeCustomHooks = customHooks?.filter(hook => hook.isActive) || [];
  if (voiceInfluenceSettings.hooks && activeCustomHooks.length > 0) {
    enhancedPrompt += `

CUSTOM HOOK STRUCTURE INTEGRATION:

You MUST prioritize these user-defined hook structures when generating hooks:

${activeCustomHooks.map((hook, index) => `
CUSTOM HOOK ${index + 1}: ${hook.title} (${hook.category})
Template: ${hook.template}${hook.example ? `
Example: "${hook.example}"` : ''}
`).join('')}

INTEGRATION RULE: When generating hooks, adapt these custom structures to fit the current video idea and research content. Maintain the structural pattern while customizing the content.`;
  }

  if (activeInfluences.length > 0 || activeCustomHooks.length > 0) {
    enhancedPrompt += `

IMPORTANT: These voice characteristics and custom structures should enhance and guide your generation while still adhering to all base requirements and producing high-quality, engaging content. Balance voice authenticity with effectiveness.`;
  }

  return enhancedPrompt;
} 