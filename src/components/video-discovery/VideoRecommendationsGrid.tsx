'use client';

import React, { useEffect, useState } from 'react';
import VideoCard from './VideoCard';
import { useAppContext } from '@/contexts/AppContext';
import { VideoType } from '@/contexts/AppContext';
import { fetchVideoDetailsFromRapidAPI } from '@/lib/videoApi'; // Import the new API function
import { Skeleton } from "@/components/ui/skeleton"; // For loading state

const VideoRecommendationsGrid = () => {
  const { selectedCategory, searchQuery, setSelectedVideo, setCurrentView } = useAppContext();
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);

  // Mock video data (discovery part is still mocked)
  const MOCK_VIDEO_SOURCES: { pageUrl: string, platform: VideoType['sourcePlatform'] }[] = [
    { pageUrl: 'https://www.tiktok.com/@ib_danfilm/video/7243545417852407045', platform: 'TikTok' },
    { pageUrl: 'https://www.instagram.com/reel/Crbc9rsA_KV/', platform: 'Instagram' },
    // Add more mock source URLs
    {
      pageUrl: 'https://www.tiktok.com/@tiktok/video/7003545391991999749', // Example, replace with real discoverable TikTok
      platform: 'TikTok',
    },
    {
      pageUrl: 'https://www.instagram.com/reel/C0X1Z2aRpfF/', // Example, replace with real discoverable Instagram
      platform: 'Instagram',
    },
  ];

  useEffect(() => {
    const loadInitialVideos = async () => {
      setIsLoading(true);
      setError(null);
      // For Phase 1, we populate the grid with initial details from mock data
      // In a real discovery scenario, this would be a search API call based on category/query
      console.log(`Displaying initial set of videos. Category: ${selectedCategory}, Search: ${searchQuery}`);
      
      // Simulate fetching initial data or using a predefined list
      // For now, we'll use the pageUrls from MOCK_VIDEO_SOURCES to create initial VideoType objects
      // The actual direct videoUrl and richer details would be fetched on click by fetchVideoDetailsFromRapidAPI
      const initialDisplayVideos: VideoType[] = MOCK_VIDEO_SOURCES.map((src, index) => ({
        id: src.pageUrl, // Use pageUrl as ID for the card
        title: `${src.platform} Video ${index + 1} (click to load details)`, // Placeholder title
        thumbnailUrl: '/placeholder-thumbnail.jpg', // Generic placeholder, API will fetch real one on click
        sourcePlatform: src.platform,
        videoUrl: src.pageUrl, // Store the page URL here, to be used by fetchVideoDetailsFromRapidAPI
        // Duration and description will be fetched on click
      }));
      
      // Simulate some delay as if fetching a list
      await new Promise(resolve => setTimeout(resolve, 500));
      setVideos(initialDisplayVideos);
      setIsLoading(false);
    };

    loadInitialVideos();
  }, [selectedCategory, searchQuery]); // Re-run if category or search query changes (though current mock doesn't use them for list generation)

  const handleVideoClick = async (videoSource: { pageUrl: string, platform: VideoType['sourcePlatform'] }) => {
    console.log("Fetching details for:", videoSource.pageUrl);
    // Show some loading state on the card or globally if desired
    const detailedVideo = await fetchVideoDetailsFromRapidAPI(videoSource.pageUrl, videoSource.platform);
    
    if (detailedVideo) {
      setSelectedVideo(detailedVideo);
      setCurrentView('split');
    } else {
      // Handle error: show a toast, log, etc.
      alert(`Failed to fetch details for ${videoSource.platform} video. Please try another one.`);
      console.error("Failed to fetch details for video:", videoSource.pageUrl);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {[...Array(MOCK_VIDEO_SOURCES.length || 3)].map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="w-full aspect-[9/16] rounded-lg" />
            <Skeleton className="h-4 w-5/6 rounded-lg" />
            <Skeleton className="h-4 w-3/6 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    // This error state is for the initial list loading, not individual clicks
    return <div className="p-4 text-red-500">Error loading video list: {error}</div>;
  }

  if (videos.length === 0 && !isLoading) {
    return <div className="p-4 text-center text-muted-foreground">No videos found for this selection.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {videos.map((video) => (
        <VideoCard 
          key={video.id} 
          video={video} 
          onClick={() => handleVideoClick({ pageUrl: video.videoUrl, platform: video.sourcePlatform })} 
        />
      ))}
    </div>
  );
};

export default VideoRecommendationsGrid; 