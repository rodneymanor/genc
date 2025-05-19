import { VideoInfo } from '@/contexts/AppContext';

// This function now calls our internal API route to fetch video details.
// The RapidAPI key is handled server-side in that route.
export const fetchVideoDetailsFromRapidAPI = async (
  originalUrl: string,
  // The platform parameter is kept for now, as SearchInput provides it.
  // Our backend /api/video-details currently determines platform from the URL/response itself,
  // but this could be used as a hint or for more specific logic if needed in the future.
  platformHint?: VideoInfo['sourceSite'] 
): Promise<VideoInfo | null> => {
  console.log(`[fetchVideoDetailsFromRapidAPI] Calling internal API for URL: ${originalUrl}, Hint: ${platformHint}`);
  try {
    const response = await fetch('/api/video-details', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ videoUrl: originalUrl }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null); // Try to parse error, but don't fail if not JSON
      console.error(
        `[fetchVideoDetailsFromRapidAPI] Error fetching video details from /api/video-details for ${originalUrl}:`,
        response.status,
        errorData
      );
      // Propagate a generic error or the error message from the API if available
      throw new Error(errorData?.error || `Failed to fetch video details (status: ${response.status})`);
    }

    const videoDetails: VideoInfo = await response.json();
    console.log(`[fetchVideoDetailsFromRapidAPI] Successfully fetched details for ${originalUrl}:`, videoDetails);
    return videoDetails;

  } catch (error) {
    console.error(`[fetchVideoDetailsFromRapidAPI] Exception when calling /api/video-details for ${originalUrl}:`, error);
    return null;
  }
}; 