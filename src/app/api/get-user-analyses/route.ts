import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Define the path to store analysis results
    const analysisDir = path.join(process.cwd(), 'tmp', 'analysis');
    
    if (!fs.existsSync(analysisDir)) {
      return NextResponse.json({ analyses: [] }, { status: 200 });
    }

    // Read all analysis files and filter by user ID
    const files = fs.readdirSync(analysisDir);
    const userAnalyses = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const filePath = path.join(analysisDir, file);
          const analysisData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          
          // Check if this analysis belongs to the user
          if (analysisData.userId === userId) {
            // Return summary info for listing
            userAnalyses.push({
              id: analysisData.id,
              createdAt: analysisData.createdAt,
              overallScore: analysisData.analysis?.overallScore,
              metadata: {
                title: analysisData.metadata?.title,
                src_url: analysisData.metadata?.src_url,
                author: analysisData.metadata?.author,
                duration: analysisData.metadata?.duration
              }
            });
          }
        } catch (error) {
          console.warn(`[API /get-user-analyses] Failed to parse file ${file}:`, error);
          // Continue to next file
        }
      }
    }

    // Sort by creation date, newest first
    userAnalyses.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ analyses: userAnalyses }, { status: 200 });

  } catch (error: any) {
    console.error('[API /get-user-analyses] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to retrieve user analyses', 
      details: error.message 
    }, { status: 500 });
  }
} 