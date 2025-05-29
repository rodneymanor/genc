import { GoogleGenAI, HarmCategory, HarmBlockThreshold, Part } from '@google/genai';
import { fetchVideoDetails } from './videoDetailsService';
import { VideoInfo } from '@/contexts/AppContext';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL_CONFIG_NAME = "gemini-1.5-flash-latest";

export interface VideoAnalysisResult {
  videoDetails: VideoInfo;
  transcript: string;
  analysisReport: string;
}

export async function analyzeVideoFromUrl(videoUrl: string): Promise<VideoAnalysisResult> {
  if (!GEMINI_API_KEY) {
    console.error('[VideoAnalysisService] Gemini API key is not set.');
    throw new Error('Server configuration error: Gemini API key missing.');
  }

  if (!videoUrl) {
    throw new Error('Video URL is required by analyzeVideoFromUrl.');
  }

  console.log(`[VideoAnalysisService] Starting analysis for URL: ${videoUrl}`);

  // 1. Get video details (including audioUrl)
  const videoDetails = await fetchVideoDetails(videoUrl);
  
  if (!videoDetails.audioUrl) {
    console.warn(`[VideoAnalysisService] No audio URL found for ${videoUrl}. Transcription may not be possible.`);
    // We could still proceed with metadata-only analysis, or throw an error
    // For now, let's proceed and handle the missing audio gracefully
  }

  const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  // 2. Transcribe Audio using Google Gemini
  let transcript = "Transcription not available. Report generation will be based on available metadata only.";
  
  if (videoDetails.audioUrl) {
    try {
      console.log(`[VideoAnalysisService] Fetching audio from: ${videoDetails.audioUrl}`);
      const audioResponse = await fetch(videoDetails.audioUrl);
      if (!audioResponse.ok) {
        throw new Error(`Failed to fetch audio file: ${audioResponse.status} ${audioResponse.statusText}`);
      }
      const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());
      const audioBase64 = audioBuffer.toString('base64');
      const audioFileMimeType = 'audio/mp4';

      const audioPart: Part = { inlineData: { data: audioBase64, mimeType: audioFileMimeType } };

      const transcriptionPromptText = "Generate a transcript of the speech in this audio.";
      
      const transConfig = {
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ],
        generationConfig: { 
          temperature: 0.2,
        },
      };

      console.log("[VideoAnalysisService] Requesting transcription from Gemini with inline audio...");
      const transResult = await genAI.models.generateContent({
        model: MODEL_CONFIG_NAME, 
        contents: [{ role: "user", parts: [audioPart, {text: transcriptionPromptText}] }],
        config: transConfig,
      });
      
      if (transResult.promptFeedback && transResult.promptFeedback.blockReason) {
        console.warn(`[VideoAnalysisService] Transcription blocked: ${transResult.promptFeedback.blockReason}. Using default transcript message.`);
        transcript = `Transcription was blocked by the safety filter: ${transResult.promptFeedback.blockReason}. Report will be based on metadata only.`;
      } else {
        transcript = transResult.text ?? "Transcription resulted in no text. Report generation will be based on available metadata only.";
      }
      console.log("[VideoAnalysisService] Transcription step completed.");

    } catch (transcriptionError: any) {
      console.error("[VideoAnalysisService] Error during Gemini transcription process:", transcriptionError.message);
      transcript = `Transcription failed: ${transcriptionError.message}. Report will be based on metadata only.`;
    }
  }

  // 3. Generate Analysis Report using Google Gemini
  let analysisReportText = "Analysis report could not be generated.";
  try {
    console.log("[VideoAnalysisService] Generating analysis report...");
    
    const videoDurationFormatted = videoDetails.duration || 'N/A';

    const reportPrompt = `
You are an expert scriptwriting coach specializing in short-form social media videos (TikTok, Instagram Reels, Facebook Reels, YouTube Shorts).
Analyze the following video script and provide a detailed report with actionable insights for a coaching client.

Video Title: ${videoDetails.title}
Video Author: ${videoDetails.authorUsername || 'Unknown'}
Video Duration: ${videoDurationFormatted}
Platform: ${videoDetails.sourceSite || 'Unknown'}

Transcription:
"""
${transcript}
"""

Please structure your report with the following sections in Markdown format:

1.  **Overall Summary & Key Takeaway:**
    *   Briefly summarize the video's message and purpose.
    *   What is the single most important learning from this script?

2.  **Hook Analysis:**
    *   Identify the hook (the first 3-5 seconds of the script).
    *   Explain why this hook is effective or ineffective (e.g., sparks curiosity, uses a bold statement, asks a question, presents a problem, visual element if known).
    *   Provide 2-3 specific, actionable suggestions for improving the hook or alternative hook ideas.

3.  **Core Message & Value Proposition:**
    *   What is the main message or value delivered to the viewer?
    *   How clearly is this communicated in the script?
    *   Suggestions for enhancing clarity or impact.

4.  **Storytelling & Structure (if applicable):**
    *   Does the script tell a story or follow a clear structure (e.g., problem-solution, tutorial, narrative)?
    *   Analyze the pacing and flow. Are there any parts that drag or feel rushed?
    *   How could the structure or storytelling be improved for better engagement?

5.  **Language & Tone:**
    *   Describe the language used (e.g., conversational, formal, humorous, technical). Is it appropriate for the likely target audience of this platform?
    *   Is the tone consistent and engaging?
    *   Suggestions for optimizing language or tone.

6.  **Call to Action (CTA) Analysis:**
    *   Identify the Call to Action(s) in the script (if any).
    *   How clear and compelling is the CTA? Does it align with the video's content?
    *   Explain why this CTA works or doesn't.
    *   Provide 2-3 specific, actionable suggestions for a stronger or more appropriate CTA.

7.  **Engagement Factors:**
    *   What elements in the script are likely to keep viewers watching (e.g., questions, relatable pain points, surprising information, humor)?
    *   Are there any moments where viewers might drop off? Why?
    *   Suggestions for improving retention throughout the video.

8.  **Platform-Specific Optimization:**
    *   Based on the identified platform (${videoDetails.sourceSite || 'Unknown'}), what specific optimizations could be made?
    *   Consider platform algorithms, audience behavior, and content format preferences.

9.  **Actionable Next Steps:**
    *   Provide 3-5 concrete, specific actions the creator could take to improve their next video script.
    *   Prioritize these suggestions based on potential impact.

Keep your analysis practical, specific, and actionable. Focus on what works and what could be improved, always providing clear reasoning for your recommendations.
`;

    const analysisConfig = {
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ],
      generationConfig: { 
        temperature: 0.7, // Slightly higher for more creative analysis
        maxOutputTokens: 2048,
      },
    };

    const analysisResult = await genAI.models.generateContent({
      model: MODEL_CONFIG_NAME,
      contents: [{ role: "user", parts: [{ text: reportPrompt }] }],
      config: analysisConfig,
    });

    if (analysisResult.promptFeedback && analysisResult.promptFeedback.blockReason) {
      console.warn(`[VideoAnalysisService] Analysis blocked: ${analysisResult.promptFeedback.blockReason}`);
      analysisReportText = `Analysis was blocked by the safety filter: ${analysisResult.promptFeedback.blockReason}. Please try with different content.`;
    } else {
      analysisReportText = analysisResult.text ?? "Analysis generation resulted in no text.";
    }
    console.log("[VideoAnalysisService] Analysis report generation completed.");

  } catch (analysisError: any) {
    console.error("[VideoAnalysisService] Error during analysis generation:", analysisError.message);
    analysisReportText = `Analysis generation failed: ${analysisError.message}`;
  }

  return {
    videoDetails,
    transcript,
    analysisReport: analysisReportText,
  };
} 