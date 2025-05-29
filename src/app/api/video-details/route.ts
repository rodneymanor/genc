import { NextRequest, NextResponse } from 'next/server';
import { fetchVideoDetails } from '@/lib/videoDetailsService'; // Updated import
// Remove axios and other direct RapidAPI related imports/constants as they are now in the service
// import { VideoInfo } from '@/contexts/AppContext'; // VideoInfo is handled by the service

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoUrl } = body; // originalUrl is named videoUrl in the request body

    if (!videoUrl) {
      return NextResponse.json({ error: 'Missing videoUrl in request body' }, { status: 400 });
    }
    
    // Input validation for videoUrl (e.g., is it a valid URL format?)
    try {
      new URL(videoUrl);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid videoUrl format' }, { status: 400 });
    }

    console.log(`[API /video-details] Received request for URL: ${videoUrl}`);

    const videoInfo = await fetchVideoDetails(videoUrl);
    
    return NextResponse.json(videoInfo, { status: 200 });

  } catch (error: any) {
    // The fetchVideoDetails service function now throws errors with descriptive messages.
    console.error('[API /video-details] Error processing request:', error.message);
    // Determine status code based on error message content if needed, or use a generic 500/502
    let statusCode = 500;
    if (error.message?.includes('Server configuration error')) {
      statusCode = 500;
    } else if (error.message?.includes('Video URL is required')) {
        statusCode = 400;
    } else if (error.message?.includes('Failed to fetch video information') || error.message?.includes('External service error') || error.message?.includes('Timeout fetching video details')) {
      statusCode = 502; // Bad Gateway, as it's an issue with the upstream RapidAPI service
    }
    
    return NextResponse.json({ error: error.message || 'Error processing video details.' }, { status: statusCode });
  }
} 