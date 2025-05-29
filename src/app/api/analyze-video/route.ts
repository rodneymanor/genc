import { NextResponse } from 'next/server';
import { analyzeVideoFromUrl } from '@/lib/videoAnalysisService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const videoUrl = body.url;

    if (!videoUrl) {
      return NextResponse.json({ message: 'Video URL is required' }, { status: 400 });
    }

    // Input validation for videoUrl
    try {
      new URL(videoUrl);
    } catch (e) {
      return NextResponse.json({ message: 'Invalid video URL format' }, { status: 400 });
    }

    console.log(`[API /analyze-video] Received request for URL: ${videoUrl}`);

    // Use the new service function
    const analysisResult = await analyzeVideoFromUrl(videoUrl);

    // Return the complete analysis result
    return NextResponse.json({
      success: true,
      videoDetails: analysisResult.videoDetails,
      transcript: analysisResult.transcript,
      analysisReport: analysisResult.analysisReport,
    }, { status: 200 });

  } catch (error: any) {
    console.error('[API /analyze-video] Error processing request:', error.message);
    
    // Determine status code based on error message content
    let statusCode = 500;
    if (error.message?.includes('Server configuration error')) {
      statusCode = 500;
    } else if (error.message?.includes('Video URL is required') || error.message?.includes('Invalid')) {
      statusCode = 400;
    } else if (error.message?.includes('Failed to fetch') || error.message?.includes('External service error') || error.message?.includes('Timeout')) {
      statusCode = 502; // Bad Gateway, as it's an issue with upstream services
    }
    
    return NextResponse.json({ 
      success: false,
      message: error.message || 'Error analyzing video.' 
    }, { status: statusCode });
  }
} 