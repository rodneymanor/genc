import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'social-media-video-downloader.p.rapidapi.com';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface ApiResponseLink {
  quality?: string;
  link?: string;
  renderLink?: string;
  monitor?: {
    websocket?: string;
    http?: string;
  };
}

interface ApiResponse {
  success: boolean;
  message?: string | null;
  src_url?: string;
  title?: string;
  author?: {
    nickname?: string;
    uniqueId?: string;
  };
  stats?: {
    music?: {
      playUrl?: string;
  duration?: number;
      preciseDuration?: {
        preciseDuration?: number;
        preciseShootDuration?: number;
        preciseAuditionDuration?: number;
        preciseVideoDuration?: number;
      };
    };
  };
  links?: ApiResponseLink[];
  r_id?: string;
  timeTaken?: string;
}

// Helper function to decode SMVD proxied URLs for TikTok
function decodeSmvdTikTokProxyUrl(proxyUrl: string): string | null {
  try {
    const url = new URL(proxyUrl);
    if (url.hostname.includes('api-edge.smvd.xyz')) {
      const uParam = url.searchParams.get('u');
      if (uParam) {
        console.log(`[API /transcribe] uParam from proxy: ${uParam.substring(0, 100)}...`);
        
        // Step 1: Base64 decode
        const base64Decoded = Buffer.from(uParam, 'base64').toString('utf-8');
        console.log(`[API /transcribe] Base64 decoded (still URL-encoded): ${base64Decoded.substring(0, 150)}...`);
        
        // Step 2: URL decode (percent decode)
        const fullyDecoded = decodeURIComponent(base64Decoded);
        console.log(`[API /transcribe] Fully decoded URL: ${fullyDecoded.substring(0, 150)}...`);
        
        return fullyDecoded;
      }
    }
  } catch (e) {
    console.warn('[API /transcribe] Failed to decode SMVD proxy URL:', proxyUrl, e);
  }
  return null;
}

// Helper function to clean TikTok URLs - removes query parameters that can cause issues
function getCleanTikTokUrl(urlString: string): string {
  try {
    const url = new URL(urlString);
    // Keeps only the origin and pathname - removes all query parameters
    return url.origin + url.pathname;
  } catch (e) {
    console.warn('[API /transcribe] Failed to clean TikTok URL:', urlString, e);
    return urlString; // Return original if cleaning fails
  }
}

// Helper function to download video data for Gemini processing
async function downloadVideoData(videoUrl: string): Promise<Buffer> {
    try {
    console.log(`[API /transcribe] Downloading video data from: ${videoUrl}`);
    const response = await axios.get(videoUrl, {
      responseType: 'arraybuffer',
      timeout: 30000, // 30 seconds timeout
        headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      }
    });
    
    console.log(`[API /transcribe] Successfully downloaded ${response.data.byteLength} bytes`);
    return Buffer.from(response.data);
  } catch (error: any) {
    console.error('[API /transcribe] Error downloading video data:', error.message);
    throw new Error(`Failed to download video: ${error.message}`);
              }
            }

// Helper function to download audio data for Gemini processing
async function downloadAudioData(audioUrl: string): Promise<Buffer> {
  try {
    console.log(`[API /transcribe] Downloading audio data from: ${audioUrl}`);
    const response = await axios.get(audioUrl, {
      responseType: 'arraybuffer',
      timeout: 30000, // 30 seconds timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      }
    });
    
    console.log(`[API /transcribe] Successfully downloaded ${response.data.byteLength} bytes`);
    return Buffer.from(response.data);
  } catch (error: any) {
    console.error('[API /transcribe] Error downloading audio data:', error.message);
    throw new Error(`Failed to download audio: ${error.message}`);
          }
}

// Helper function to monitor audio rendering status
async function waitForAudioRender(monitorUrl: string, maxAttempts: number = 30): Promise<boolean> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await axios.get(monitorUrl, { timeout: 5000 });
      const status = response.data;
      
      console.log(`[API /transcribe] Render status check ${attempt}: ${JSON.stringify(status)}`);
      
      if (status.status === 'completed' || status.completed === true) {
        console.log('[API /transcribe] Audio rendering completed');
        return true;
      } else if (status.status === 'failed' || status.failed === true) {
        console.error('[API /transcribe] Audio rendering failed');
        return false;
      }
      
      // Wait 2 seconds before next check
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.warn(`[API /transcribe] Error checking render status (attempt ${attempt}):`, error);
    }
  }
  
  console.warn('[API /transcribe] Audio rendering timeout after maximum attempts');
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Convert the audio file to bytes
    const bytes = await audioFile.arrayBuffer();
    const audioBytes = new Uint8Array(bytes);

    // Convert to base64 for Gemini
    const base64Audio = Buffer.from(audioBytes).toString('base64');

    // Get the model - using gemini-pro for audio analysis
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Create the prompt for transcription
    const prompt = `
    Please transcribe the following audio file. Return only the transcribed text without any additional formatting or explanations.
    If the audio is unclear or cannot be transcribed, return "Unable to transcribe audio clearly."
    `;

    // Generate content with audio data
    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Audio,
          mimeType: audioFile.type || 'audio/webm'
        }
      },
      prompt
    ]);

    const response = await result.response;
    const transcript = response.text();

    return NextResponse.json({ 
      transcript: transcript.trim(),
      success: true 
    });

      } catch (error: any) {
    console.error('Transcription error:', error);
    
    // Handle specific Gemini API errors
    if (error.message?.includes('audio')) {
      return NextResponse.json({ 
        error: 'Audio format not supported. Please try recording again.',
        success: false 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to transcribe audio. Please try again.',
      success: false 
    }, { status: 500 });
  }
} 