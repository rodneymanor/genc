import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'social-media-video-downloader.p.rapidapi.com';

interface RapidApiResponseLink {
  link: string;
  quality?: string;
  type?: string;
  size?: string;
  hasAudio?: boolean;
  audioQuality?: string;
  mimeType?: string;
  codecs?: string;
}

interface RapidApiResponse {
  success: boolean;
  title?: string;
  duration?: number;
  links?: RapidApiResponseLink[];
  meta?: {
    source?: string;
  };
  video_hd_540p_lowest?: string;
}

// Helper function to decode SMVD proxied URLs for TikTok
function decodeSmvdTikTokProxyUrl(proxyUrl: string): string | null {
  try {
    const url = new URL(proxyUrl);
    if (url.hostname.includes('api-edge.smvd.xyz')) {
      const uParam = url.searchParams.get('u');
      if (uParam) {
        console.log(`[API /transcribe] uParam from proxy: ${uParam.substring(0, 100)}...`); // Log start of uParam
        
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

export async function POST(request: NextRequest) {
  if (!ASSEMBLYAI_API_KEY) {
    console.error('AssemblyAI API key is not set.');
    return NextResponse.json({ error: 'Server configuration error: AssemblyAI API key missing.' }, { status: 500 });
  }
  if (!RAPIDAPI_KEY) {
    console.error('RapidAPI key is not set.');
    return NextResponse.json({ error: 'Server configuration error: RapidAPI key missing.' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { videoUrl } = body;

    if (!videoUrl) {
      return NextResponse.json({ error: 'Missing videoUrl in request body' }, { status: 400 });
    }

    console.log(`[API /transcribe] Received request for URL: ${videoUrl}`);

    let audioUrlToTranscribe: string | null = null;
    let isTikTok = false;

    try {
      console.log(`[API /transcribe] Fetching media info from RapidAPI for: ${videoUrl}`);
      const rapidApiUrl = `https://${RAPIDAPI_HOST}/smvd/get/all?url=${encodeURIComponent(videoUrl)}`;
      const rapidApiResponse = await axios.get<RapidApiResponse>(rapidApiUrl, {
        headers: {
          'X-Rapidapi-Key': RAPIDAPI_KEY,
          'X-Rapidapi-Host': RAPIDAPI_HOST,
        },
        timeout: 15000, // 15 seconds timeout
      });

      if (rapidApiResponse.data && rapidApiResponse.data.success) {
        const links = rapidApiResponse.data.links || [];
        console.log(`[API /transcribe] RapidAPI response success. Links found: ${links.length}`);
        
        const sourceFromMeta = rapidApiResponse.data.meta?.source?.toLowerCase();
        isTikTok = sourceFromMeta?.includes('tiktok') || videoUrl.includes('tiktok.com');

        if (isTikTok) {
          console.log('[API /transcribe] Detected TikTok URL.');
          // Attempt to find and decode a proxied link first
          for (const linkObj of links) {
            if (linkObj.link.includes('api-edge.smvd.xyz')) {
              const decodedDirectUrl = decodeSmvdTikTokProxyUrl(linkObj.link);
              if (decodedDirectUrl) {
                // Clean the URL by removing query parameters that cause encoding issues
                const cleanTikTokUrl = getCleanTikTokUrl(decodedDirectUrl);
                audioUrlToTranscribe = cleanTikTokUrl;
                console.log(`[API /transcribe] Found, decoded, and cleaned TikTok URL: ${audioUrlToTranscribe}`);
                break;
              }
            }
          }
          // Fallback to other TikTok link finding methods if decoded URL not found
          if (!audioUrlToTranscribe && rapidApiResponse.data.video_hd_540p_lowest) {
            // Clean the video_hd_540p_lowest URL too
            audioUrlToTranscribe = getCleanTikTokUrl(rapidApiResponse.data.video_hd_540p_lowest);
            console.log(`[API /transcribe] Using cleaned TikTok video_hd_540p_lowest: ${audioUrlToTranscribe}`);
          }
          if (!audioUrlToTranscribe) {
            // Generic fallback for TikTok from links array (prefer non-proxy if possible)
            const nonProxyVideo = links.find(l => (l.type === 'mp4' || l.mimeType === 'video/mp4') && l.link && !l.link.includes('api-edge.smvd.xyz'));
            if (nonProxyVideo) {
              // Clean this URL too
              audioUrlToTranscribe = getCleanTikTokUrl(nonProxyVideo.link);
              console.log(`[API /transcribe] Using cleaned non-proxy TikTok MP4 link: ${audioUrlToTranscribe}`);
            }
          }
          
          // If we still have no valid URL, try using the original TikTok URL as a last resort
          if (!audioUrlToTranscribe) {
            console.log(`[API /transcribe] All URL extraction methods failed. Trying original TikTok URL: ${videoUrl}`);
            audioUrlToTranscribe = videoUrl;
          }
        } else {
          // Existing logic for Instagram/Facebook & YouTube Shorts
          let igFbAudioLink = links.find(l => l.quality === 'audio_0' && l.link);
          if (igFbAudioLink) {
            audioUrlToTranscribe = igFbAudioLink.link;
            console.log(`[API /transcribe] Found Instagram/Facebook audio link: ${audioUrlToTranscribe}`);
          }

          if (!audioUrlToTranscribe) { // YouTube Shorts
            const youtubeAudioLinks = links.filter(l => l.hasAudio && (l.mimeType?.includes('audio/mp4') || l.codecs === 'mp4a.40.2' || l.codecs === 'mp4a.40.5'));
            if (youtubeAudioLinks.length > 0) {
              const mediumQuality = youtubeAudioLinks.find(l => l.audioQuality === 'AUDIO_QUALITY_MEDIUM');
              const lowQuality = youtubeAudioLinks.find(l => l.audioQuality === 'AUDIO_QUALITY_LOW');
              audioUrlToTranscribe = mediumQuality?.link || lowQuality?.link || youtubeAudioLinks[0].link;
              console.log(`[API /transcribe] Found YouTube Shorts audio link: ${audioUrlToTranscribe}`);
            }
          }
        }

        // General Fallback if no specific URL found yet
        if (!audioUrlToTranscribe && links.length > 0) {
            const mp4Link = links.find(l => l.link && (l.type === 'mp4' || l.mimeType === 'video/mp4'));
            if (mp4Link) {
                audioUrlToTranscribe = mp4Link.link;
                console.log(`[API /transcribe] General Fallback: Using first MP4 video link for audio extraction: ${audioUrlToTranscribe}`);
            }
        }
        
        if (!audioUrlToTranscribe) {
            console.warn('[API /transcribe] Could not extract a suitable audio/video URL from RapidAPI response.', rapidApiResponse.data);
            return NextResponse.json({ error: 'Could not extract audio URL from the provided social media link via RapidAPI.' }, { status: 400 });
        }

      } else {
        console.error('[API /transcribe] RapidAPI request failed or did not return success.', rapidApiResponse.data);
        return NextResponse.json({ error: 'Failed to fetch media information from social media URL.', detail: rapidApiResponse.data || 'No data from RapidAPI' }, { status: 500 });
      }
    } catch (error: any) {
      console.error('[API /transcribe] Error calling RapidAPI:', error.response?.data || error.message || error);
      let errorMessage = 'Error fetching media information.';
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Timeout fetching media information. The source might be slow or unavailable.';
      } else if (error.response?.data?.error) {
        errorMessage = `Error from media fetcher: ${error.response.data.error}`;
      }
      return NextResponse.json({ error: errorMessage, detail: error.response?.data || error.message }, { status: 502 }); // Bad Gateway or appropriate
    }

    // 2. Transcribe with AssemblyAI
    console.log(`[API /transcribe] Submitting to AssemblyAI for transcription: ${audioUrlToTranscribe}`);
    const assemblyAiUrl = 'https://api.assemblyai.com/v2/transcript';
    const assemblyAiHeaders = {
      authorization: ASSEMBLYAI_API_KEY,
      'Content-Type': 'application/json',
    };
    const assemblyAiData = {
      audio_url: audioUrlToTranscribe,
      speech_model: 'slam-1', // As per user's code
      // Potentially add other parameters like language_code if known, or speaker_labels etc.
    };

    let transcriptId = '';
    try {
      const submissionResponse = await axios.post(assemblyAiUrl, assemblyAiData, { headers: assemblyAiHeaders });
      transcriptId = submissionResponse.data.id;
      console.log(`[API /transcribe] AssemblyAI transcript ID: ${transcriptId}`);
    } catch (error: any) {
      console.error('[API /transcribe] Error submitting to AssemblyAI:', error.response?.data || error.message || error);
      const errorMessage = error.response?.data?.error || 'Failed to submit audio for transcription.';
      return NextResponse.json({ error: `AssemblyAI submission error: ${errorMessage}` }, { status: 500 });
    }

    // 3. Poll for AssemblyAI transcript completion
    const pollingEndpoint = `https://api.assemblyai.com/v2/transcript/${transcriptId}`;
    while (true) {
      try {
        console.log(`[API /transcribe] Polling AssemblyAI for transcript ID: ${transcriptId}`);
        const pollingResponse = await axios.get(pollingEndpoint, { headers: assemblyAiHeaders });
        const transcriptionResult = pollingResponse.data;

        if (transcriptionResult.status === 'completed') {
          console.log(`[API /transcribe] Transcription completed for ID: ${transcriptId}`);
          return NextResponse.json({ transcript: transcriptionResult.text }, { status: 200 });
        } else if (transcriptionResult.status === 'error') {
          console.error(`[API /transcribe] AssemblyAI transcription failed for ID ${transcriptId}: ${transcriptionResult.error}`);
          throw new Error(`Transcription failed: ${transcriptionResult.error}`);
        } else {
          // Statuses: queued, processing
          console.log(`[API /transcribe] Transcription status for ${transcriptId}: ${transcriptionResult.status}. Waiting...`);
          await new Promise((resolve) => setTimeout(resolve, 5000)); // Poll every 5 seconds
        }
      } catch (error: any) {
        console.error(`[API /transcribe] Error polling AssemblyAI for ID ${transcriptId}:`, error.response?.data || error.message || error);
        const errorMessage = error.response?.data?.error || 'Error while waiting for transcription result.';
        return NextResponse.json({ error: `AssemblyAI polling error: ${errorMessage}` }, { status: 500 });
      }
    }

  } catch (error: any) {
    console.error('[API /transcribe] General error in POST handler:', error.message || error);
    return NextResponse.json({ error: 'An unexpected error occurred on the server.' }, { status: 500 });
  }
} 