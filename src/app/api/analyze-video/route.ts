import { NextResponse } from 'next/server';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold, Part, GenerateContentConfig } from '@google/genai';

// Define interfaces for the expected API responses
interface RapidApiResponseLink {
  quality: string;
  link: string;
  thumb?: string; // Optional based on your example
}

interface RapidApiAuthor {
  id: string;
  username: string;
  is_verified: boolean;
  profile_pic_url: string;
  edge_followed_by?: { // Optional as not all platforms might have it in this exact structure
    count: number;
  };
  // Other author fields from your example can be added if needed
}

interface RapidApiStats {
  play_count?: number;
  like_count?: number;
  comment_count?: number;
  video_duration?: number;
  dimensions?: {
    height: number;
    width: number;
  };
  has_audio?: boolean;
  date_secs?: number;
  date?: string; // This seems to be pre-formatted in your example
  // Other stats fields from your example
}

interface RapidApiResponse {
  success: boolean;
  message: string | null;
  src_url: string;
  title?: string;
  author?: RapidApiAuthor;
  stats?: RapidApiStats;
  links?: RapidApiResponseLink[];
  picture?: string;
  // Other fields from your example
}

// Type for our structured video details for internal use
export interface VideoDetails {
  title: string;
  authorUsername: string;
  authorFollowers?: number;
  playCount?: number;
  likeCount?: number;
  commentCount?: number;
  videoDuration?: number;
  dimensions?: { height: number; width: number };
  uploadDate?: string;
  audioUrl?: string;
  originalVideoUrl: string;
  thumbnailUrl?: string;
}

const MODEL_CONFIG_NAME = "gemini-1.5-flash-latest"; // Renamed to avoid conflict if we use a 'model' variable from a getModel call later

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const videoUrl = body.url;

    if (!videoUrl) {
      return NextResponse.json({ message: 'Video URL is required' }, { status: 400 });
    }

    const rapidApiKey = process.env.RAPIDAPI_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!rapidApiKey || !geminiApiKey) {
      console.error("API keys (RapidAPI or Gemini) are not set.");
      return NextResponse.json({ message: 'API configuration error.' }, { status: 500 });
    }

    // 1. Call Social Media Video Downloader API (RapidAPI)
    const encodedVideoUrl = encodeURIComponent(videoUrl);
    const smvdApiUrl = `https://social-media-video-downloader.p.rapidapi.com/smvd/get/all?url=${encodedVideoUrl}`;

    let smvdResponseData: RapidApiResponse;
    try {
      const smvdResponse = await fetch(smvdApiUrl, {
        method: 'GET',
        headers: {
          'X-Rapidapi-Key': rapidApiKey,
          'X-Rapidapi-Host': 'social-media-video-downloader.p.rapidapi.com'
        }
      });

      if (!smvdResponse.ok) {
        const errorText = await smvdResponse.text();
        console.error(`SMVD API error: ${smvdResponse.status}`, errorText);
        throw new Error(`Failed to fetch video details from SMVD API. Status: ${smvdResponse.status}. Response: ${errorText}`);
      }
      smvdResponseData = await smvdResponse.json() as RapidApiResponse;

      if (!smvdResponseData.success) {
        throw new Error(smvdResponseData.message || 'SMVD API indicated failure without a specific message.');
      }

    } catch (apiError: any) {
      console.error("Error calling SMVD API:", apiError);
      return NextResponse.json({ message: `Error fetching video data: ${apiError.message}` }, { status: 502 }); // Bad Gateway or specific error
    }
    
    // Extract audio URL and other details
    let audioLink: string | undefined = undefined;
    if (smvdResponseData.links && smvdResponseData.links.length > 0) {
      const audioObject = smvdResponseData.links.find(l => l.quality === 'audio_0' || l.quality === 'audio');
      audioLink = audioObject?.link;
    }

    if (!audioLink) {
      console.warn("No audio link found in SMVD API response for URL:", videoUrl, "Response:", JSON.stringify(smvdResponseData.links));
      // Decide if this is a hard error or if we can proceed without audio for some cases (though transcription needs it)
      // For now, let's assume transcription is key, so this is an error.
      return NextResponse.json({ message: 'Could not find an audio track for the provided video.' }, { status: 404 });
    }

    const extractedDetails: VideoDetails = {
      title: smvdResponseData.title || 'Untitled Video',
      authorUsername: smvdResponseData.author?.username || 'Unknown Author',
      authorFollowers: smvdResponseData.author?.edge_followed_by?.count,
      playCount: smvdResponseData.stats?.play_count,
      likeCount: smvdResponseData.stats?.like_count,
      commentCount: smvdResponseData.stats?.comment_count,
      videoDuration: smvdResponseData.stats?.video_duration,
      dimensions: smvdResponseData.stats?.dimensions,
      uploadDate: smvdResponseData.stats?.date,
      audioUrl: audioLink,
      originalVideoUrl: smvdResponseData.src_url,
      thumbnailUrl: smvdResponseData.picture, // Assuming 'picture' is the primary thumbnail
    };

    // 2. Transcribe Audio using Google Gemini
    const genAI = new GoogleGenAI({ apiKey: geminiApiKey });

    let transcript = "Transcription not available. Report generation will be based on available metadata only.";
    try {
      console.log(`Fetching audio from: ${extractedDetails.audioUrl}`);
      const audioResponse = await fetch(extractedDetails.audioUrl!);
      if (!audioResponse.ok) {
        throw new Error(`Failed to fetch audio file: ${audioResponse.status} ${audioResponse.statusText}`);
      }
      const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());
      const audioBase64 = audioBuffer.toString('base64');
      const audioFileMimeType = 'audio/mp4';

      const audioPart: Part = { inlineData: { data: audioBase64, mimeType: audioFileMimeType } };

      const transcriptionPromptText = "Generate a transcript of the speech in this audio.";
      
      // Let TypeScript infer the type of geminiCallConfig
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

      console.log("Requesting transcription from Gemini with inline audio...");
      const transResult = await genAI.models.generateContent({
        model: MODEL_CONFIG_NAME, 
        contents: [{ role: "user", parts: [audioPart, {text: transcriptionPromptText}] }],
        config: transConfig,
      });
      
      if (transResult.promptFeedback && transResult.promptFeedback.blockReason) {
        // Log the block reason but don't throw an error that stops the flow, use the default transcript error message.
        console.warn(`Transcription blocked: ${transResult.promptFeedback.blockReason}. Using default transcript message.`);
        transcript = `Transcription was blocked by the safety filter: ${transResult.promptFeedback.blockReason}. Report will be based on metadata only.`;
      } else {
        transcript = transResult.text ?? "Transcription resulted in no text. Report generation will be based on available metadata only.";
      }
      console.log("Transcription step completed.");

    } catch (transcriptionError: any) {
      console.error("Error during Gemini transcription process:", transcriptionError.message);
      // transcript already has a default error message
    }

    // 3. Generate Report using Google Gemini
    let analysisReportText = "Analysis report could not be generated.";
    try {
        console.log("Generating analysis report...");
        
        const videoDurationFormatted = extractedDetails.videoDuration 
            ? `${Math.floor(extractedDetails.videoDuration / 60)}m ${Math.floor(extractedDetails.videoDuration % 60)}s` 
            : 'N/A';

        const reportPrompt = `
You are an expert scriptwriting coach specializing in short-form social media videos (TikTok, Instagram Reels, Facebook Reels, YouTube Shorts).
Analyze the following video script and provide a detailed report with actionable insights for a coaching client.

Video Title: ${extractedDetails.title}
Video Author: ${extractedDetails.authorUsername}
Video Duration: ${videoDurationFormatted}

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
    *   Are there missed opportunities to increase engagement through the script?

8.  **Actionable Improvement Plan (Top 3-5 Points):**
    *   List the top 3-5 most impactful, actionable steps the client can take to improve this script or future scripts based on this analysis.

Provide the report in a clear, encouraging, and instructive tone. Use bullet points for suggestions to make them easy to digest.
Focus on scriptwriting best practices for short-form video.
Ensure the entire output is a single, well-formatted Markdown block.
        `;

        const reportGenConfig = {
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            ],
            generationConfig: { 
                temperature: 0.7,
                maxOutputTokens: 3072 // Increased token limit for potentially longer reports
            },
        };

        const reportResult = await genAI.models.generateContent({
            model: MODEL_CONFIG_NAME,
            contents: [{ role: "user", parts: [{text: reportPrompt}] }],
            config: reportGenConfig,
        });

        if (reportResult.promptFeedback && reportResult.promptFeedback.blockReason) {
            throw new Error(`Report generation blocked by safety filter: ${reportResult.promptFeedback.blockReason}`);
        }
        analysisReportText = reportResult.text ?? "Report generation resulted in no text.";
        console.log("Analysis report generated successfully.");

    } catch (reportError: any) {
        console.error("Error during Gemini report generation:", reportError.message);
        analysisReportText = `Error during report generation: ${reportError.message}. Defaulting to basic transcript if available: \n\n${transcript}`;
    }

    return NextResponse.json({
      title: extractedDetails.title,
      stats: {
        play_count: extractedDetails.playCount,
        like_count: extractedDetails.likeCount,
        comment_count: extractedDetails.commentCount,
        video_duration: extractedDetails.videoDuration,
        author_username: extractedDetails.authorUsername,
        author_followers: extractedDetails.authorFollowers,
        dimensions: extractedDetails.dimensions,
        date: extractedDetails.uploadDate,
      },
      reportText: analysisReportText,
      debug_audioUrl: extractedDetails.audioUrl,
      debug_transcript: transcript, 
    });

  } catch (error: any) {
    console.error("[API /api/analyze-video] Overall Error:", error.message);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
} 