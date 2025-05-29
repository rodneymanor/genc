import axios from 'axios';
import { VideoInfo } from '@/contexts/AppContext'; // Assuming VideoInfo is here, adjust if not

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'social-media-video-downloader.p.rapidapi.com';

interface RapidApiLinkAll {
  link: string;
  quality?: string;
  type?: string;
  size?: string;
  itag?: string;
  hasAudio?: boolean;
  audioQuality?: string;
  mimeType?: string;
  codecs?: string;
}

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
    duration?: number;
    description?: string;
  };
  links?: RapidApiLinkAll[];
  videos?: string[];
}

function findBestEmbedUrl(links?: RapidApiLinkAll[]): string | undefined {
  if (!links || links.length === 0) return undefined;
  const mp4Link = links.find(l => l.type === 'mp4' && l.mimeType === 'video/mp4' && l.link);
  if (mp4Link) return mp4Link.link;
  const videoLink = links.find(l => l.type === 'mp4' || l.type === 'video' || l.mimeType?.startsWith('video/'));
  return videoLink?.link || links[0]?.link;
}

function findBestAudioUrl(links?: RapidApiLinkAll[]): string | undefined {
  if (!links || links.length === 0) return undefined;
  // Prioritize specific audio quality keys if known (e.g., 'audio_0', 'audio')
  const specificAudio = links.find(l => (l.quality === 'audio_0' || l.quality === 'audio' || l.type === 'audio') && l.link);
  if (specificAudio) return specificAudio.link;
  // Fallback to any link that indicates audio in mimeType
  const genericAudio = links.find(l => l.mimeType?.startsWith('audio/') && l.link);
  return genericAudio?.link;
}

function determineSourceSite(responseData: RapidApiAllResponse, originalUrl: string): VideoInfo['sourceSite'] {
  if (responseData.meta?.source) {
    const source = responseData.meta.source.toLowerCase();
    if (source.includes('instagram')) return 'instagram';
    if (source.includes('tiktok')) return 'tiktok';
    if (source.includes('youtube_shorts') || source.includes('youtube')) return 'youtube';
    if (source.includes('facebook')) return 'facebook';
  }
  if (originalUrl.includes('instagram.com')) return 'instagram';
  if (originalUrl.includes('tiktok.com')) return 'tiktok';
  if (originalUrl.includes('youtube.com/shorts') || originalUrl.includes('youtu.be')) return 'youtube';
  if (originalUrl.includes('facebook.com') || originalUrl.includes('fb.watch')) return 'facebook';
  return 'unknown';
}

export async function fetchVideoDetails(originalUrl: string): Promise<VideoInfo> {
  if (!RAPIDAPI_KEY) {
    console.error('[VideoDetailsService] RapidAPI key is not set.');
    throw new Error('Server configuration error: RapidAPI key missing.');
  }

  if (!originalUrl) {
    throw new Error('Video URL is required by fetchVideoDetails.');
  }

  console.log(`[VideoDetailsService] Fetching details for URL: ${originalUrl}`);

  try {
    const rapidApiUrl = `https://${RAPIDAPI_HOST}/smvd/get/all?url=${encodeURIComponent(originalUrl)}`;
    const response = await axios.get<RapidApiAllResponse>(rapidApiUrl, {
      headers: {
        'X-Rapidapi-Key': RAPIDAPI_KEY,
        'X-Rapidapi-Host': RAPIDAPI_HOST,
      },
      timeout: 15000,
    });

    if (!response.data || !response.data.success) {
      console.error('[VideoDetailsService] RapidAPI request failed.', response.data);
      throw new Error(response.data?.message || 'Failed to fetch video information from RapidAPI.');
    }

    const data = response.data;
    console.log(`[VideoDetailsService] RapidAPI successful response for: ${originalUrl}`);

    const sourceSite = determineSourceSite(data, originalUrl);
    const embedUrl = findBestEmbedUrl(data.links) || (data.videos && data.videos.length > 0 ? data.videos[0] : undefined);
    const audioUrl = findBestAudioUrl(data.links);
    const thumbnailUrl = data.meta?.thumbnail || data.author?.profile_pic_url;
    let durationSeconds = data.meta?.duration || data.stats?.duration;
    let durationString: string | undefined = undefined;
    if (durationSeconds && !isNaN(durationSeconds)) {
      durationString = `${Math.floor(durationSeconds / 60)}:${('0' + (Math.round(durationSeconds) % 60)).slice(-2)}`;
    }

    if (!embedUrl) {
      console.warn(`[VideoDetailsService] Could not determine a suitable embed URL for ${originalUrl}`, data.links);
      // Depending on requirements, this might be an error or just a warning if other info is useful
    }

    const videoInfo: VideoInfo = {
      id: data.id || originalUrl, // Use RapidAPI ID or fall back to originalUrl as an ID
      title: data.title || 'Untitled Video', // Use actual title or fallback
      sourceUrl: originalUrl,
      embedUrl: embedUrl,
      audioUrl: audioUrl,
      thumbnailUrl: thumbnailUrl,
      description: data.meta?.description || data.title || '',
      sourceSite: sourceSite,
      duration: durationString,
      // Populate authorUsername if available from your RapidApiAllResponse structure
      authorUsername: data.author?.username,
    };

    return videoInfo;

  } catch (error: any) {
    console.error('[VideoDetailsService] Error fetching video details:', error.response?.data || error.message || error);
    let errorMessage = 'Error processing video details.';
    if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
      errorMessage = 'Timeout fetching video details from external service.';
    } else if (axios.isAxiosError(error) && error.response) {
      errorMessage = `External service error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`;
    } else if (error instanceof Error) {
      errorMessage = error.message; // Use the error message if it's an Error instance
    }
    throw new Error(errorMessage);
  }
} 