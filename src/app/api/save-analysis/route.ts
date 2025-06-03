import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { analysis, transcript, metadata, userId } = body;

    if (!analysis) {
      return NextResponse.json({ error: 'Analysis data is required' }, { status: 400 });
    }

    // Generate unique analysis ID
    const analysisId = randomUUID();

    // Define the directory to store analysis results
    const analysisDir = path.join(process.cwd(), 'tmp', 'analysis');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(analysisDir)) {
      fs.mkdirSync(analysisDir, { recursive: true });
    }

    // Prepare data to save
    const analysisData = {
      id: analysisId,
      analysis,
      transcript,
      metadata,
      userId: userId || null, // Store user ID for later retrieval
      createdAt: new Date().toISOString()
    };

    // Save analysis to file
    const analysisFile = path.join(analysisDir, `${analysisId}.json`);
    fs.writeFileSync(analysisFile, JSON.stringify(analysisData, null, 2));

    console.log(`[API /save-analysis] Analysis saved with ID: ${analysisId} for user: ${userId || 'anonymous'}`);

    return NextResponse.json({ 
      analysisId,
      message: 'Analysis saved successfully' 
    }, { status: 200 });

  } catch (error: any) {
    console.error('[API /save-analysis] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to save analysis', 
      details: error.message 
    }, { status: 500 });
  }
} 