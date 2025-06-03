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
    description?: string;
  };
  video_hd_540p_lowest?: string;
  author?: {
    username?: string;
  };
}

// Helper function to detect platform from URL
function detectPlatform(url: string): 'tiktok' | 'instagram' | 'youtube' | 'facebook' | 'unknown' {
  if (url.includes('tiktok.com')) return 'tiktok';
  if (url.includes('instagram.com')) return 'instagram';
  if (url.includes('youtube.com/shorts') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('facebook.com') || url.includes('fb.watch')) return 'facebook';
  return 'unknown';
}

// Helper function to decode SMVD proxied URLs for TikTok
function decodeSmvdTikTokProxyUrl(proxyUrl: string): string | null {
  try {
    const url = new URL(proxyUrl);
    if (url.hostname.includes('api-edge.smvd.xyz')) {
      const uParam = url.searchParams.get('u');
      if (uParam) {
        const base64Decoded = Buffer.from(uParam, 'base64').toString('utf-8');
        const fullyDecoded = decodeURIComponent(base64Decoded);
        return fullyDecoded;
      }
    }
  } catch (e) {
    console.warn('[API /transcribe-and-generate-script] Failed to decode SMVD proxy URL:', proxyUrl, e);
  }
  return null;
}

// Helper function to clean TikTok URLs
function getCleanTikTokUrl(urlString: string): string {
  try {
    const url = new URL(urlString);
    return url.origin + url.pathname;
  } catch (e) {
    console.warn('[API /transcribe-and-generate-script] Failed to clean TikTok URL:', urlString, e);
    return urlString;
  }
}

// Helper function to find best audio/video URL for transcription
async function getMediaUrl(videoUrl: string): Promise<{ audioUrl: string; videoTitle: string; description: string; platform: string }> {
  console.log(`[API /transcribe-and-generate-script] Fetching media info for: ${videoUrl}`);
  
  const rapidApiUrl = `https://${RAPIDAPI_HOST}/smvd/get/all?url=${encodeURIComponent(videoUrl)}`;
  const rapidApiResponse = await axios.get<RapidApiResponse>(rapidApiUrl, {
    headers: {
      'X-Rapidapi-Key': RAPIDAPI_KEY!,
      'X-Rapidapi-Host': RAPIDAPI_HOST,
    },
    timeout: 15000,
  });

  if (!rapidApiResponse.data || !rapidApiResponse.data.success) {
    throw new Error('Failed to fetch media information from social media URL.');
  }

  const data = rapidApiResponse.data;
  const links = data.links || [];
  const platform = detectPlatform(videoUrl);
  let audioUrl: string | null = null;

  if (platform === 'tiktok') {
    // TikTok-specific logic
    for (const linkObj of links) {
      if (linkObj.link.includes('api-edge.smvd.xyz')) {
        const decodedDirectUrl = decodeSmvdTikTokProxyUrl(linkObj.link);
        if (decodedDirectUrl) {
          audioUrl = getCleanTikTokUrl(decodedDirectUrl);
          break;
        }
      }
    }
    if (!audioUrl && data.video_hd_540p_lowest) {
      audioUrl = getCleanTikTokUrl(data.video_hd_540p_lowest);
    }
    if (!audioUrl) {
      const nonProxyVideo = links.find(l => (l.type === 'mp4' || l.mimeType === 'video/mp4') && l.link && !l.link.includes('api-edge.smvd.xyz'));
      if (nonProxyVideo) {
        audioUrl = getCleanTikTokUrl(nonProxyVideo.link);
      }
    }
  } else if (platform === 'instagram' || platform === 'facebook') {
    // Instagram/Facebook audio logic
    const audioLink = links.find(l => l.quality === 'audio_0' && l.link);
    if (audioLink) {
      audioUrl = audioLink.link;
    }
  } else if (platform === 'youtube') {
    // YouTube Shorts audio logic
    const youtubeAudioLinks = links.filter(l => l.hasAudio && (l.mimeType?.includes('audio/mp4') || l.codecs === 'mp4a.40.2' || l.codecs === 'mp4a.40.5'));
    if (youtubeAudioLinks.length > 0) {
      const mediumQuality = youtubeAudioLinks.find(l => l.audioQuality === 'AUDIO_QUALITY_MEDIUM');
      const lowQuality = youtubeAudioLinks.find(l => l.audioQuality === 'AUDIO_QUALITY_LOW');
      audioUrl = mediumQuality?.link || lowQuality?.link || youtubeAudioLinks[0].link;
    }
  }

  // General fallback
  if (!audioUrl && links.length > 0) {
    const mp4Link = links.find(l => l.link && (l.type === 'mp4' || l.mimeType === 'video/mp4'));
    if (mp4Link) {
      audioUrl = mp4Link.link;
    }
  }

  if (!audioUrl) {
    throw new Error('Could not extract audio URL from the provided social media link.');
  }

  return {
    audioUrl,
    videoTitle: data.title || 'Untitled Video',
    description: data.meta?.description || '',
    platform: platform
  };
}

// Helper function to transcribe audio using AssemblyAI
async function transcribeAudio(audioUrl: string): Promise<string> {
  console.log(`[API /transcribe-and-generate-script] Submitting to AssemblyAI for transcription: ${audioUrl}`);
  
  const assemblyAiUrl = 'https://api.assemblyai.com/v2/transcript';
  const assemblyAiHeaders = {
    authorization: ASSEMBLYAI_API_KEY!,
    'Content-Type': 'application/json',
  };

  const assemblyAiData = {
    audio_url: audioUrl,
    speaker_labels: false,
    auto_highlights: false,
    sentiment_analysis: false,
    entity_detection: false,
    content_safety: false,
    iab_categories: false,
    language_detection: false
  };

  const transcriptResponse = await axios.post(assemblyAiUrl, assemblyAiData, {
    headers: assemblyAiHeaders,
    timeout: 10000,
  });

  const transcriptId = transcriptResponse.data.id;
  if (!transcriptId) {
    throw new Error('Failed to start transcription process.');
  }

  console.log(`[API /transcribe-and-generate-script] Transcription started with ID: ${transcriptId}`);

  // Poll for completion
  const statusUrl = `https://api.assemblyai.com/v2/transcript/${transcriptId}`;
  let status = 'processing';
  let attempts = 0;
  const maxAttempts = 30; // 5 minutes max

  while (status === 'processing' || status === 'queued') {
    if (attempts >= maxAttempts) {
      throw new Error('Transcription timeout: took longer than expected.');
    }

    await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
    attempts++;

    const statusResponse = await axios.get(statusUrl, {
      headers: { authorization: ASSEMBLYAI_API_KEY! },
    });

    status = statusResponse.data.status;
    console.log(`[API /transcribe-and-generate-script] Transcription status (attempt ${attempts}): ${status}`);

    if (status === 'completed') {
      const transcription = statusResponse.data.text;
      if (!transcription) {
        throw new Error('Transcription completed but no text was returned.');
      }
      return transcription;
    } else if (status === 'error') {
      throw new Error(`Transcription failed: ${statusResponse.data.error || 'Unknown error'}`);
    }
  }

  throw new Error('Transcription did not complete successfully.');
}

// Helper function to generate script components from transcription
async function generateScriptComponents(transcription: string, videoTitle: string, platform: string) {
  console.log(`[API /transcribe-and-generate-script] Generating script components from transcription`);
  
  // Use the existing generate-script-components endpoint
  const scriptComponentsResponse = await axios.post(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/generate-script-components`, {
    videoIdea: `Based on this ${platform} video titled "${videoTitle}", create a script with the following content: ${transcription}`,
    researchAnalysisText: `Original video transcription from ${platform}:\n\nTitle: ${videoTitle}\n\nTranscription:\n${transcription}\n\nThis content should be adapted and enhanced for a new video script while maintaining the core message and insights.`
  });

  if (!scriptComponentsResponse.data) {
    throw new Error('Failed to generate script components from transcription.');
  }

  return scriptComponentsResponse.data;
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

    // Validate URL format
    try {
      new URL(videoUrl);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid videoUrl format' }, { status: 400 });
    }

    // Validate supported platforms
    const platform = detectPlatform(videoUrl);
    if (platform === 'unknown') {
      return NextResponse.json({ 
        error: 'Unsupported platform. Please provide a TikTok, Instagram Reel, YouTube Short, or Facebook Reel URL.' 
      }, { status: 400 });
    }

    console.log(`[API /transcribe-and-generate-script] Processing ${platform} video: ${videoUrl}`);

    // Step 1: Get media URL and video details
    const { audioUrl, videoTitle, description, platform: detectedPlatform } = await getMediaUrl(videoUrl);

    // Step 2: Transcribe the audio
    const transcription = await transcribeAudio(audioUrl);

    // Step 3: Generate script components from transcription
    const scriptComponents = await generateScriptComponents(transcription, videoTitle, detectedPlatform);

    // Return the complete result
    return NextResponse.json({
      success: true,
      videoDetails: {
        title: videoTitle,
        description,
        platform: detectedPlatform,
        originalUrl: videoUrl
      },
      transcription,
      scriptComponents,
      message: 'Successfully transcribed video and generated script components'
    }, { status: 200 });

  } catch (error: any) {
    console.error('[API /transcribe-and-generate-script] Error:', error.message || error);
    
    let statusCode = 500;
    let errorMessage = 'An error occurred while processing the video.';

    if (error.message?.includes('Invalid videoUrl format')) {
      statusCode = 400;
      errorMessage = error.message;
    } else if (error.message?.includes('Unsupported platform')) {
      statusCode = 400;
      errorMessage = error.message;
    } else if (error.message?.includes('Failed to fetch media information')) {
      statusCode = 502;
      errorMessage = 'Unable to fetch video information. The video may be private or the platform may be experiencing issues.';
    } else if (error.message?.includes('Could not extract audio URL')) {
      statusCode = 400;
      errorMessage = 'Unable to extract audio from this video. The video format may not be supported.';
    } else if (error.message?.includes('Transcription')) {
      statusCode = 502;
      errorMessage = `Transcription failed: ${error.message}`;
    } else if (error.message?.includes('Failed to generate script components')) {
      statusCode = 500;
      errorMessage = 'Video was transcribed successfully, but failed to generate script components.';
    }

    return NextResponse.json({ 
      error: errorMessage,
      details: error.message
    }, { status: statusCode });
  }
} 