"use client";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import ReactMarkdown from 'react-markdown';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define types for the data we expect
interface VideoStats {
  play_count?: number;
  like_count?: number;
  comment_count?: number;
  video_duration?: number;
  author_username?: string;
  author_followers?: number;
  dimensions?: {
    height?: number;
    width?: number;
  };
  date?: string;
}

interface AnalysisReport {
  title?: string;
  stats?: VideoStats;
  reportText?: string; // This will hold the markdown report from Gemini
}

export default function AnalysisPage() {
  const [videoUrl, setVideoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisReport | null>(null);
  const searchParams = useSearchParams();

  // Extracted core analysis logic into its own function
  const fetchAnalysis = async (urlToAnalyze: string) => {
    if (!urlToAnalyze) {
      setError("Video URL is missing.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisData(null);

    try {
      const response = await fetch('/api/analyze-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: urlToAnalyze }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data: AnalysisReport = await response.json();
      setAnalysisData(data);
    } catch (err: any) {
      setError(err.message || "Failed to analyze video.");
      console.error("Analysis error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect to handle URL from query parameters
  useEffect(() => {
    const urlFromQuery = searchParams?.get('videoUrl');
    if (urlFromQuery) {
      const decodedUrl = decodeURIComponent(urlFromQuery);
      setVideoUrl(decodedUrl); // Update the input field
      fetchAnalysis(decodedUrl); // Trigger analysis automatically
    }
  }, [searchParams]); // Re-run if searchParams change

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    fetchAnalysis(videoUrl); // Use the current state of videoUrl
  };

  const formatCount = (count?: number): string => {
    if (count === undefined) return 'N/A';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };
  
  const formatDuration = (seconds?: number): string => {
    if (seconds === undefined) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };


  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Video Analysis Engine</CardTitle>
          <CardDescription>Enter a video URL (Instagram, TikTok, YouTube Short) to get an AI-powered script analysis and performance insights.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="url"
              placeholder="e.g., https://www.instagram.com/reel/..."
              value={videoUrl}
              onChange={(e) => {
                setVideoUrl(e.target.value);
                if (error) setError(null); // Clear error on new input
                if (analysisData) setAnalysisData(null); // Clear old analysis data on new input
              }}
              disabled={isLoading}
              className="text-base"
            />
            <Button type="submit" disabled={isLoading || !videoUrl.trim()} className="w-full">
              {isLoading ? "Analyzing..." : "Analyze Video"}
            </Button>
          </form>
          {error && <p className="mt-4 text-center text-red-500">{error}</p>}
        </CardContent>
      </Card>

      {isLoading && (
        <div className="mt-8 text-center">
          <p className="text-lg">Processing your video... this may take a moment.</p>
          {/* You could add a more sophisticated loading animation here */}
        </div>
      )}

      {analysisData && !isLoading && (
        <div className="flex flex-col w-full space-y-4 md:space-y-6 pt-8 pb-12">
          <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 md:space-y-8">
            {analysisData.title && (
              <h1 className="font-display text-pretty text-2xl lg:text-4xl font-semibold dark:font-medium text-textMain dark:text-textMainDark text-center">
                {analysisData.title}
              </h1>
            )}
            
            <Tabs defaultValue="report" className="w-full pt-4">
              <TabsList className="w-full p-0 bg-background justify-start border-b rounded-none">
                <TabsTrigger
                  value="report"
                  className="rounded-none bg-background h-full data-[state=active]:shadow-none border-b-4 border-transparent data-[state=active]:border-primary px-4 py-2.5"
                >
                  {/* Placeholder for icon, if desired later */}
                  <code className="text-sm font-poppins">Analysis Report</code>
                </TabsTrigger>
                <TabsTrigger
                  value="stats"
                  className="rounded-none bg-background h-full data-[state=active]:shadow-none border-b-4 border-transparent data-[state=active]:border-primary px-4 py-2.5"
                >
                  {/* Placeholder for icon, if desired later */}
                  <code className="text-sm font-poppins">Video Statistics</code>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="report" className="pt-6">
                {analysisData.reportText ? (
                  <Card>
                    <CardHeader><CardTitle className="text-xl">AI Generated Script Analysis</CardTitle></CardHeader>
                    <CardContent>
                      <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert max-w-none">
                        <ReactMarkdown>{analysisData.reportText}</ReactMarkdown>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <p className="text-center text-muted-foreground py-4">Report data is not available.</p>
                )}
              </TabsContent>
              <TabsContent value="stats" className="pt-6">
                {analysisData.stats ? (
                  <Card>
                    <CardHeader><CardTitle className="text-xl">Detailed Video Statistics</CardTitle></CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <p><strong>Plays:</strong> {formatCount(analysisData.stats.play_count)}</p>
                        <p><strong>Likes:</strong> {formatCount(analysisData.stats.like_count)}</p>
                        <p><strong>Comments:</strong> {formatCount(analysisData.stats.comment_count)}</p>
                        <p><strong>Duration:</strong> {formatDuration(analysisData.stats.video_duration)}</p>
                        <p><strong>Author:</strong> {analysisData.stats.author_username || 'N/A'}</p>
                        <p><strong>Followers:</strong> {formatCount(analysisData.stats.author_followers)}</p>
                        <p><strong>Dimensions:</strong> {analysisData.stats.dimensions ? `${analysisData.stats.dimensions.width}w x ${analysisData.stats.dimensions.height}h` : 'N/A'}</p>
                        <p><strong>Date:</strong> {analysisData.stats.date || 'N/A'}</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <p className="text-center text-muted-foreground py-4">Statistics are not available.</p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  );
} 