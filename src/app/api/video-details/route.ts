import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { VideoInfo } from '@/contexts/AppContext';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'social-media-video-downloader.p.rapidapi.com';

// Interface for the links array in RapidAPI's /all endpoint response
interface RapidApiLinkAll {
  link: string;
  quality?: string;       // e.g., "video_hd_original", "audio_0", "720p"
  type?: string;          // e.g., "mp4", "audio", "photo"
  size?: string;          // e.g., "10.5MB"
  itag?: string;          // YouTube specific
  hasAudio?: boolean;     // YouTube specific
  audioQuality?: string;  // YouTube specific
  mimeType?: string;      // e.g., "video/mp4"
  codecs?: string;        // e.g., "avc1.4d401f, mp4a.40.2"
}

// Interface for RapidAPI's /all endpoint response
interface RapidApiAllResponse {
  success: boolean;
  message?: string | null;
  src_url?: string;
  title?: string;
  id?: string;
  author?: {
    id?: string;
    username?: string;
    profile_pic_url?: string;
  };
  stats?: {
    duration?: number;
  };
  meta?: {
    source?: string;
    thumbnail?: string;
    duration?: number; // Sometimes duration is here
    description?: string; // Sometimes description is here
  };
  links?: RapidApiLinkAll[];
  videos?: string[]; // Fallback for some platforms like TikTok if links is empty for video
}

function findBestEmbedUrl(links?: RapidApiLinkAll[]): string | undefined {
    if (!links || links.length === 0) return undefined;
    // Prioritize direct MP4 links if available
    const mp4Link = links.find(l => l.type === 'mp4' && l.mimeType === 'video/mp4' && l.link);
    if (mp4Link) return mp4Link.link;
    // Fallback: any video link or first link if specific types not found
    const videoLink = links.find(l => l.type === 'mp4' || l.type === 'video' || l.mimeType?.startsWith('video/'));
    return videoLink?.link || links[0]?.link;
}

function determineSourceSite(responseData: RapidApiAllResponse, originalUrl: string): VideoInfo['sourceSite'] {
    if (responseData.meta?.source) {
        const source = responseData.meta.source.toLowerCase();
        if (source.includes('instagram')) return 'instagram';
        if (source.includes('tiktok')) return 'tiktok';
        if (source.includes('youtube_shorts') || source.includes('youtube')) return 'youtube';
        if (source.includes('facebook')) return 'facebook';
    }
    // Fallback to URL check if meta.source is not definitive
    if (originalUrl.includes('instagram.com')) return 'instagram';
    if (originalUrl.includes('tiktok.com')) return 'tiktok';
    if (originalUrl.includes('youtube.com/shorts') || originalUrl.includes('youtu.be')) return 'youtube';
    if (originalUrl.includes('facebook.com') || originalUrl.includes('fb.watch')) return 'facebook';
    return 'unknown';
}

export async function POST(request: NextRequest) {
  if (!RAPIDAPI_KEY) {
    console.error('[API /video-details] RapidAPI key is not set.');
    return NextResponse.json({ error: 'Server configuration error: RapidAPI key missing.' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { videoUrl: originalUrl } = body;

    if (!originalUrl) {
      return NextResponse.json({ error: 'Missing videoUrl in request body' }, { status: 400 });
    }
    console.log(`[API /video-details] Received request for URL: ${originalUrl}`);

    const rapidApiUrl = `https://${RAPIDAPI_HOST}/smvd/get/all?url=${encodeURIComponent(originalUrl)}`;
    const response = await axios.get<RapidApiAllResponse>(rapidApiUrl, {
      headers: {
        'X-Rapidapi-Key': RAPIDAPI_KEY,
        'X-Rapidapi-Host': RAPIDAPI_HOST,
      },
      timeout: 15000, 
    });

    if (!response.data || !response.data.success) {
      console.error('[API /video-details] RapidAPI request failed or did not return success.', response.data);
      return NextResponse.json({ error: 'Failed to fetch video information from the source.', detail: response.data?.message || 'RapidAPI request unsuccessful' }, { status: 502 });
    }

    const data = response.data;
    console.log(`[API /video-details] RapidAPI successful response for: ${originalUrl}`);

    const sourceSite = determineSourceSite(data, originalUrl);
    const embedUrl = findBestEmbedUrl(data.links) || (data.videos && data.videos.length > 0 ? data.videos[0] : undefined);
    const thumbnailUrl = data.meta?.thumbnail || data.author?.profile_pic_url;
    let durationSeconds = data.meta?.duration || data.stats?.duration;
    let durationString: string | undefined = undefined;
    if (durationSeconds && !isNaN(durationSeconds)) {
        durationString = `${Math.floor(durationSeconds / 60)}:${('0' + (Math.round(durationSeconds) % 60)).slice(-2)}`;
    }

    if (!embedUrl) {
        console.warn(`[API /video-details] Could not determine a suitable embed URL for ${originalUrl}`, data.links);
    }

    const videoInfo: VideoInfo = {
      id: data.id || originalUrl,
      title: 'Untitled Video', // Changed to generic title
      sourceUrl: originalUrl,
      embedUrl: embedUrl,
      thumbnailUrl: thumbnailUrl,
      description: data.meta?.description || data.title || '', // Keep description for potential later use, but title is generic
      sourceSite: sourceSite,
      duration: durationString,
    };

    return NextResponse.json(videoInfo, { status: 200 });

  } catch (error: any) {
    console.error('[API /video-details] Error in handler:', error.response?.data || error.message || error);
    let errorMessage = 'Error processing video details.';
    if (error.code === 'ECONNABORTED') {
      errorMessage = 'Timeout fetching video details. The source might be slow or unavailable.';
    }
    return NextResponse.json({ error: errorMessage, detail: error.response?.data || error.message }, { status: 500 });
  }
} 