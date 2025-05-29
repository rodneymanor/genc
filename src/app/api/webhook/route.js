import { NextResponse } from 'next/server';
import { saveAnalyzedVideo } from '@/lib/firestoreService';
import { analyzeVideoFromUrl } from '@/lib/videoAnalysisService';

// Base URL for internal API calls - should be configured for deployed environments
const INTERNAL_API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Helper function to remove undefined values from an object
function cleanUndefinedValues(obj) {
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

async function processVideoWebhook(videoUrl) {
  console.log(`[Webhook] Received video URL: ${videoUrl}`);

  try {
    // Use the new service function to get video details, transcript, and analysis
    console.log(`[Webhook] Starting analysis for: ${videoUrl}`);
    const analysisResult = await analyzeVideoFromUrl(videoUrl);
    
    console.log(`[Webhook] Analysis completed for: ${analysisResult.videoDetails.title}`);

    // Prepare data for Firestore
    const videoData = cleanUndefinedValues({
      // Generate a clean ID or let Firestore auto-generate one
      // Don't use analysisResult.videoDetails.id directly as it might be a URL with invalid characters
      title: analysisResult.videoDetails.title,
      description: analysisResult.videoDetails.description,
      thumbnailUrl: analysisResult.videoDetails.thumbnailUrl,
      duration: analysisResult.videoDetails.duration,
      platform: analysisResult.videoDetails.sourceSite || 'unknown',
      originalUrl: analysisResult.videoDetails.sourceUrl,
      embedUrl: analysisResult.videoDetails.embedUrl,
      authorUsername: analysisResult.videoDetails.authorUsername,
      audioUrl: analysisResult.videoDetails.audioUrl,
      transcript: analysisResult.transcript,
      analysisReport: analysisResult.analysisReport,
      processedAt: new Date().toISOString(),
      source: 'webhook', // To identify how it was added
      // Note: Removed 'id' field to let Firestore auto-generate a valid document ID
    });

    // Save to Firestore
    console.log("[Webhook] Attempting to save to Firestore. Data:", {
      title: videoData.title,
      platform: videoData.platform,
      hasTranscript: !!videoData.transcript,
      hasAnalysis: !!videoData.analysisReport,
    });
    
    const savedVideoId = await saveAnalyzedVideo(videoData);
    console.log("[Webhook] Successfully saved to Firestore with ID:", savedVideoId);

    return {
      success: true,
      message: "Video processed and saved successfully",
      videoId: savedVideoId,
      videoTitle: videoData.title,
      platform: videoData.platform,
      thumbnailUrl: videoData.thumbnailUrl,
      authorUsername: videoData.authorUsername,
      duration: videoData.duration,
      originalUrl: videoData.originalUrl,
      processedAt: videoData.processedAt,
      hasTranscript: !!videoData.transcript,
      hasAnalysis: !!videoData.analysisReport,
    };

  } catch (error) {
    console.error("[Webhook] Error during video processing:", error.message);
    return {
      success: false,
      processingError: error.message || "Unknown error during processing",
    };
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { videoUrl } = body;

    if (!videoUrl) {
      return NextResponse.json({ error: 'Missing videoUrl in request body' }, { status: 400 });
    }

    // Input validation for videoUrl
    try {
      new URL(videoUrl);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid videoUrl format' }, { status: 400 });
    }

    console.log(`[Webhook API] Processing webhook for URL: ${videoUrl}`);

    const result = await processVideoWebhook(videoUrl);

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 207 }); // Multi-Status for partial success
    }

  } catch (error) {
    console.error('[Webhook API] Error processing webhook:', error.message);
    return NextResponse.json({ 
      error: error.message || 'Internal server error during webhook processing' 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Webhook endpoint is active' }, { status: 200 });
} 