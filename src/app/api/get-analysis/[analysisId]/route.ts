import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { analysisId: string } }
) {
  try {
    const analysisId = params.analysisId;
    
    if (!analysisId) {
      return NextResponse.json({ error: 'Analysis ID is required' }, { status: 400 });
    }

    // Define the path to store analysis results
    const analysisDir = path.join(process.cwd(), 'tmp', 'analysis');
    const analysisFile = path.join(analysisDir, `${analysisId}.json`);

    // Check if analysis file exists
    if (!fs.existsSync(analysisFile)) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    // Read and parse the analysis data
    const analysisData = JSON.parse(fs.readFileSync(analysisFile, 'utf-8'));

    return NextResponse.json(analysisData, { status: 200 });

  } catch (error: any) {
    console.error('[API /get-analysis] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to retrieve analysis', 
      details: error.message 
    }, { status: 500 });
  }
} 